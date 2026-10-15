"""Render the original lake as a locked-camera cinemagraph.

Offline asset authoring only: Python with Pillow/numpy and ffmpeg.
The website remains static. All movement is masked to the water;
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

        # Move existing texture only. Never paint light, glow, stripes, or mist.
        output = original.copy()
        output[y_start:y_end] = base * (1 - mask[..., None]) + warped * mask[..., None]
        return np.clip(np.rint(output), 0, 255).astype(np.uint8)

    first, closed = frame(0), frame(math.tau)
    assert np.array_equal(first, closed), 'The loop endpoints must match.'
    moving = frame(math.pi / 2)
    outside = mask_full == 0
    assert np.array_equal(first[outside], moving[outside]), 'Land and camera must remain fixed.'
    delta = np.abs(first.astype(np.int16) - moving.astype(np.int16))
    print(f'Loop endpoints identical; max change outside water: {delta[outside].max()}', flush=True)
    print(f'Water mean/max channel change: {delta[mask_full > .9].mean():.2f}/{delta.max()}', flush=True)

    if args.preview_dir:
        args.preview_dir.mkdir(parents=True, exist_ok=True)
        mask_image.save(args.preview_dir / 'water-mask.png')
        for second in (0, 2, 4, 6, 8, 10):
            Image.fromarray(frame(math.tau * second / DURATION)).save(args.preview_dir / f'water-{second:02}.png')

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
