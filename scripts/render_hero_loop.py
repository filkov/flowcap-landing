"""Render the original lake as a locked-camera cinemagraph.

Offline asset authoring only: Python with Pillow/numpy and ffmpeg.
The website remains static. Movement is masked to the water and gentle
brightness changes are restricted to existing warm shoreline lights;
integer temporal frequencies make the 12-second cycle periodic.
"""
from pathlib import Path
import argparse
import math
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
FPS = 24
DURATION = 12


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=ROOT / 'assets/hero-lake-natural-3k.mp4')
    parser.add_argument('--preview-dir', type=Path)
    parser.add_argument('--preview-only', action='store_true')
    args = parser.parse_args()
    source = Image.open(ROOT / 'assets/source/hero-lake-3k.png').convert('RGB')
    width, height = source.size
    original = np.asarray(source, dtype=np.float32)

    # Trace the real shoreline, excluding the wooded island and foreground trees.
    scale = width / 1536
    mask_image = Image.new('L', (1536, 1024))
    draw = ImageDraw.Draw(mask_image)
    draw.polygon([(0, 269), (102, 271), (215, 263), (345, 250),
                  (405, 255), (535, 250), (600, 241), (757, 244),
                  (842, 250), (957, 251), (1055, 261), (1110, 273),
                  (1060, 288), (949, 303), (864, 320), (820, 331),
                  (773, 347), (754, 369), (677, 390), (605, 400),
                  (536, 393), (444, 370), (390, 345), (296, 334),
                  (280, 322), (212, 326), (190, 309), (134, 301),
                  (95, 297), (72, 286), (0, 291)], fill=255)
    draw.polygon([(391, 280), (416, 268), (445, 266), (460, 260),
                  (480, 265), (498, 269), (513, 269), (534, 278),
                  (515, 287), (449, 290), (411, 286)], fill=0)
    mask_image = mask_image.filter(ImageFilter.GaussianBlur(2)).resize(source.size, Image.Resampling.LANCZOS)
    mask_full = np.asarray(mask_image, dtype=np.float32) / 255
    y_start, y_end = round(235 * scale), round(410 * scale)
    mask = mask_full[y_start:y_end]
    yy, xx = np.mgrid[y_start:y_end, 0:width].astype(np.float32)
    ref_x, ref_y = xx / scale, yy / scale
    depth = np.clip((ref_y - 237) / 165, 0, 1)
    perspective = 60 * np.log1p(4 * depth)
    base = original[y_start:y_end]

    # Existing emissive pixels only: no new lights, painted bloom, or light bands.
    # Restrict this to the actual lit shoreline and its existing reflections.
    light_y_start, light_y_end = round(225 * scale), round(335 * scale)
    light_source = original[light_y_start:light_y_end]
    red, green, blue = (light_source[..., channel] for channel in range(3))
    warm = ((red > 100) & (green > 75) & (red > blue * 1.08) & (green > blue * 1.03))
    light_mask_image = Image.fromarray((warm * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.4 * scale))
    light_mask = np.asarray(light_mask_image, dtype=np.float32) / 255
    luminance = red * .2126 + green * .7152 + blue * .0722
    light_mask *= np.clip((luminance - 45) / 125, 0, 1)
    light_x = np.arange(width, dtype=np.float32)[None, :] / scale
    light_y = np.arange(light_y_start, light_y_end, dtype=np.float32)[:, None] / scale
    light_rate = 1 + (np.floor(light_x / 23).astype(np.int32) % 3)
    light_phase = np.sin(light_x * .19) * 2.4 + np.sin(light_x * .047)
    # Reflections share the nearby lamp's rhythm, at a lower intensity.
    light_strength = np.where(light_y > 270, .6, 1).astype(np.float32)
    changed_mask = mask_full.copy()
    changed_mask[light_y_start:light_y_end] = np.maximum(changed_mask[light_y_start:light_y_end], light_mask)

    def frame(phase):
        phase %= math.tau
        wave_a = np.sin(perspective + ref_x * .014 - phase * 4)
        wave_b = np.sin(perspective * 1.37 - ref_x * .021 + phase * 3)
        wave_c = np.sin(perspective * .63 + ref_x * .008 - phase * 2)
        strength = .25 + depth * .75
        dx = (wave_a * .65 + wave_b * .25) * strength * mask * scale
        dy = (wave_a * .25 + wave_c * .18) * strength * mask * scale
        sx = np.clip(xx + dx, 0, width - 1.001)
        sy = np.clip(yy + dy, 0, height - 1.001)
        x0, y0 = sx.astype(np.int32), sy.astype(np.int32)
        fx, fy = (sx - x0)[..., None], (sy - y0)[..., None]
        warped = ((original[y0, x0] * (1 - fx) + original[y0, x0 + 1] * fx) * (1 - fy)
                  + (original[y0 + 1, x0] * (1 - fx) + original[y0 + 1, x0 + 1] * fx) * fy)

        # Move existing water texture, then modulate existing warm light pixels.
        output = original.copy()
        output[y_start:y_end] = base * (1 - mask[..., None]) + warped * mask[..., None]
        twinkle = (.15 * np.sin(phase * light_rate + light_phase)
                   + .05 * np.sin(phase * 5 + light_x * .083))
        gain = 1 + twinkle * light_mask * light_strength
        output[light_y_start:light_y_end] *= gain[..., None]
        return np.clip(np.rint(output), 0, 255).astype(np.uint8)

    first, closed = frame(0), frame(math.tau)
    assert np.array_equal(first, closed), 'The loop endpoints must match.'
    moving = frame(math.pi / 2)
    outside = changed_mask == 0
    assert np.array_equal(first[outside], moving[outside]), 'Unlit land, sky and camera must remain fixed.'
    delta = np.abs(first.astype(np.int16) - moving.astype(np.int16))
    print(f'Loop endpoints identical; max change outside water/lights: {delta[outside].max()}', flush=True)
    print(f'Water mean/max channel change: {delta[mask_full > .9].mean():.2f}/{delta.max()}', flush=True)

    if args.preview_dir:
        args.preview_dir.mkdir(parents=True, exist_ok=True)
        mask_image.save(args.preview_dir / 'water-mask.png')
        light_mask_image.save(args.preview_dir / 'existing-lights-mask.png')
        for second in (0, 2, 4, 6, 8, 10):
            Image.fromarray(frame(math.tau * second / DURATION)).save(args.preview_dir / f'water-{second:02}.png')

    if args.preview_only:
        return

    args.output.parent.mkdir(parents=True, exist_ok=True)
    command = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
               '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{width}x{height}',
               '-r', str(FPS), '-i', '-', '-an', '-c:v', 'libx264',
               '-preset', 'slow', '-qp', '10', '-x264-params', 'ipratio=1:pbratio=1',
               '-tune', 'animation', '-pix_fmt', 'yuv420p',
               '-movflags', '+faststart', str(args.output)]
    encoder = subprocess.Popen(command, stdin=subprocess.PIPE)
    try:
        for index in range(FPS * DURATION):
            encoder.stdin.write(frame(math.tau * index / (FPS * DURATION)).tobytes())
    finally:
        encoder.stdin.close()
    if encoder.wait():
        raise RuntimeError('Video encoding failed')
    print(f'{args.output}: {args.output.stat().st_size / 1024:.0f} KiB', flush=True)


if __name__ == '__main__':
    main()
