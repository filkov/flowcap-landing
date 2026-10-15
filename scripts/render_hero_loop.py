"""Render the original lake as a locked-camera cinemagraph.

Offline asset authoring only: Python with Pillow/numpy and ffmpeg.
The website remains static. Movement is masked to the water and gentle
brightness changes are restricted to selected shoreline lamp cores;
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
    parser.add_argument('--write-fallbacks', action='store_true')
    args = parser.parse_args()
    source = Image.open(ROOT / 'assets/source/hero-lake-3k.png').convert('RGB')
    width, height = source.size
    original = np.asarray(source, dtype=np.float32)

    # Trace the real shoreline, excluding the wooded island and foreground trees.
    scale = width / 1536
    mask_image = Image.new('L', (1536, 1024))
    draw = ImageDraw.Draw(mask_image)
    draw.polygon([(70, 273), (110, 274), (215, 267), (345, 254),
                  (405, 259), (535, 254), (600, 245), (757, 248),
                  (842, 254), (957, 255), (1055, 265), (1065, 271),
                  (1020, 286), (1000, 299), (970, 306), (955, 316),
                  (900, 327), (850, 340), (815, 353), (780, 353),
                  (760, 350), (730, 367), (700, 367), (675, 362),
                  (652, 370), (640, 383), (620, 390), (575, 390),
                  (550, 390), (530, 386), (500, 382), (470, 376),
                  (445, 365), (427, 360), (412, 350), (390, 343),
                  (365, 339), (345, 336), (335, 333), (340, 325),
                  (320, 316), (300, 308), (280, 302), (250, 295),
                  (220, 289), (200, 290), (180, 285), (160, 289),
                  (140, 291), (120, 289), (100, 286), (85, 285)], fill=255)
    # Both islands, their tree canopies, and the left peninsula are excluded.
    draw.polygon([(390, 277), (405, 267), (430, 263), (452, 253),
                  (477, 257), (503, 264), (522, 268), (548, 282),
                  (535, 295), (442, 298), (400, 290)], fill=0)
    draw.polygon([(812, 308), (837, 297), (860, 290), (882, 288),
                  (906, 297), (926, 296), (960, 310), (953, 329),
                  (900, 342), (838, 335)], fill=0)
    # Inset before feathering: no moving pixels leak onto the shore or foliage.
    mask_image = mask_image.filter(ImageFilter.MinFilter(9)).filter(
        ImageFilter.GaussianBlur(1.5)).resize(source.size, Image.Resampling.LANCZOS)
    mask_full = np.asarray(mask_image, dtype=np.float32) / 255
    y_start, y_end = round(235 * scale), round(410 * scale)
    mask = mask_full[y_start:y_end]
    yy, xx = np.mgrid[y_start:y_end, 0:width].astype(np.float32)
    ref_x, ref_y = xx / scale, yy / scale
    depth = np.clip((ref_y - 237) / 165, 0, 1)
    perspective = 60 * np.log1p(4 * depth)

    # Neutralize the amber light pixels once, before rendering. Their colour
    # never oscillates, and dark hillside pixels are not part of this grade.
    light_y_start, light_y_end = round(225 * scale), round(335 * scale)
    light_source = original[light_y_start:light_y_end].copy()
    red, green, blue = (light_source[..., channel] for channel in range(3))
    luminance = red * .2126 + green * .7152 + blue * .0722
    warm = ((red > 100) & (green > 75) & (red > blue * 1.08) & (green > blue * 1.03))
    grade = warm * np.clip((luminance - 90) / 70, 0, 1) * .95
    neutral = np.minimum(luminance[..., None] * np.array([.93, .98, 1.06]), 255)
    original[light_y_start:light_y_end] = light_source * (1 - grade[..., None]) + neutral * grade[..., None]
    base = original[y_start:y_end]

    # Hand-picked real shoreline lamps. Colour thresholding alone also catches
    # distant hillside windows and warm terrain; those must remain static.
    lamp_centres = [(164, 264), (194, 263), (223, 262), (251, 259),
                    (358, 247), (403, 250), (424, 248), (608, 241),
                    (914, 249), (938, 247), (965, 247), (992, 248),
                    (1037, 250), (1065, 248)]
    light_y, light_x = np.mgrid[light_y_start:light_y_end, 0:width].astype(np.float32)
    light_x /= scale
    light_y /= scale
    light_mask = np.zeros(luminance.shape, dtype=np.float32)
    light_phase = np.zeros_like(light_mask)
    light_rate = np.zeros_like(light_mask)
    for index, (cx, cy) in enumerate(lamp_centres):
        core = ((light_x - cx) ** 2 / 4 ** 2 + (light_y - cy) ** 2 / 2.5 ** 2) < 1
        # Reflection is already present in the photo; only its brightest pixels
        # inside the water mask can respond, with much less intensity.
        reflection = ((np.abs(light_x - cx) < 3) & (light_y > cy + 2)
                      & (light_y < cy + 25) & (mask_full[light_y_start:light_y_end] > .98))
        emissive = np.clip((luminance - 150) / 80, 0, 1)
        selected = emissive * (core | reflection) * np.where(core, 1, .3)
        chosen = selected > light_mask
        light_mask = np.maximum(light_mask, selected)
        light_phase[chosen] = index * 1.73
        light_rate[chosen] = 2 + index % 2
    light_mask_image = Image.fromarray(np.rint(light_mask * 255).astype(np.uint8))
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

        # Move existing water texture, then modulate selected neutral lamp cores.
        output = original.copy()
        output[y_start:y_end] = base * (1 - mask[..., None]) + warped * mask[..., None]
        # A shallow, smooth 4–6 second breath. Neutral additive light keeps
        # shadow colour fixed instead of flashing amber pixels into brown.
        pulse = np.sin(phase * light_rate + light_phase)
        output[light_y_start:light_y_end] += (pulse * light_mask * 28)[..., None] * np.array([.93, .98, 1.06])
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

    if args.write_fallbacks:
        still = Image.fromarray(np.clip(np.rint(original), 0, 255).astype(np.uint8))
        for size in (960, 1536, 3072):
            still.resize((size, round(height * size / width)), Image.Resampling.LANCZOS).save(
                ROOT / f'assets/hero-lake-{size}.webp', quality=95, method=6)

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
