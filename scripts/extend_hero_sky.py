"""Add the imagegen sky extension to the approved still and lake video.

Only the generated image's upper 20% is used. The original landscape/video
are stacked below it, preserving the approved geometry and water animation.
Run after render_hero_loop.py --write-fallbacks when the base loop changes.
"""
from pathlib import Path
from io import BytesIO
import subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'


def ffmpeg(*args, capture=False):
    result = subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *map(str, args)],
                            check=True, stdout=subprocess.PIPE if capture else None)
    return result.stdout


# Match the added sky's bottom edge to the original sky, with a soft vertical
# blend confined to the new band. None of the existing scenery is repainted.
sky = ASSETS / 'source/hero-sky-extension-3k.png'
weight = 'clip((Y-H+160)/160,0,1)'
ffmpeg('-i', ASSETS / 'source/hero-sky-outpaint.png',
       '-i', ASSETS / 'hero-lake-3072.webp',
       '-filter_complex',
       '[0:v]crop=iw:ih/5:0:0,scale=3072:512:flags=lanczos,format=rgb24[new];'
       '[1:v]crop=iw:32:0:0,gblur=sigma=12:steps=3,scale=3072:512,format=rgb24[edge];'
       f"[new][edge]blend=all_expr='A*(1-{weight})+B*{weight}'[sky]",
       '-map', '[sky]', '-frames:v', '1', sky)

for width in (960, 1536, 3072):
    png = ffmpeg('-i', sky, '-i', ASSETS / 'hero-lake-3072.webp',
           '-filter_complex', f'[0:v][1:v]vstack=inputs=2,scale={width}:-1:flags=lanczos[out]',
           '-map', '[out]', '-frames:v', '1', '-f', 'image2pipe', '-c:v', 'png', 'pipe:1', capture=True)
    # Format conversion only; all composition and resampling are handled above.
    Image.open(BytesIO(png)).save(ASSETS / f'hero-lake-air-{width}.webp', quality=95, method=6)

ffmpeg('-i', ASSETS / 'hero-lake-natural-3k.mp4',
       '-loop', '1', '-framerate', '24', '-i', sky,
       '-filter_complex', '[1:v][0:v]vstack=inputs=2:shortest=1,format=yuv420p[out]',
       '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-qp', '10',
       '-x264-params', 'ipratio=1:pbratio=1', '-tune', 'animation', '-movflags', '+faststart',
       ASSETS / 'hero-lake-air-3k.mp4')
