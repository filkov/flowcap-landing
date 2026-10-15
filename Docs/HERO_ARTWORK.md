# Hero background artwork

The composition reference is `assets/hero-calm.webp` (1536 × 1024).
The detailed master is `assets/source/hero-lake-3k.png` (3072 × 2048).
The source was restored with built-in image_gen, then four overlapping regions
were independently detailed and feathered into the final master. No external
stock image, device mockup, or product screen was substituted.

The 3072/1536/960 WebP versions are static exports. The video is
`assets/hero-lake-natural-3k.mp4` (3072 × 2048, H.264, 24 fps, 12 seconds).
`scripts/render_hero_loop.py` moves existing pixels inside a lake mask only.
It does not add brightness, light bands, glow, or fog. The original rejected
light-painting loop is removed. The page has no playback controls or camera motion.

## Restoration prompt

Edit target: the supplied twilight lake landscape used as a website hero background. Produce a high-detail restored version at 3456 x 2304 pixels, same 3:2 framing. Preserve the exact camera angle, horizon height, shoreline, small island, forested rolling foreground hills, distant town positions, original deep navy and muted violet blue-hour palette. Change only detail fidelity and naturalness: crisp fine tree silhouettes and grassy slopes, nuanced clean shadow detail, realistic calm water with irregular small capillary ripples. Existing distant town lights should remain very small, soft, warm points with faint short fragmented reflections. Remove the appearance of ruler-straight light bars or bright repetitive stripes on the water; no added glow, no luminous wave lines, no fog overlay. The result should resemble a clean premium landscape photograph at dusk, restrained and quiet, with natural optical detail rather than sharpening halos, plastic texture, or oversmoothing. Do not add objects, buildings, boats, people, text, devices, UI, logos or watermarks. The landscape geometry and composition must remain as close as possible to the supplied image. Output the maximum requested resolution as a single image.

## Regional detail prompt

Use case: precise-object-edit. This is one tightly cropped tile of an existing landscape photograph, not a new composition. Restore and upscale this EXACT tile to 1536 x 1024. Preserve all spatial geometry, existing objects and crop boundaries exactly, especially shoreline, hills, trees, pathways, point lights and stars. Restore only natural fine photographic surface detail: crisp irregular grass, foliage and water texture. Keep exposure and dark navy/blue-hour colors identical to the input. Do not change lighting, add any elements, add trees, invent light streaks, brighten shadows, crop, reframe or redesign the scene. No sharpening halos, no plastic texture, no painted repetitive patterns. It will be stitched back into the original photograph so matching the input geometry and color is essential.
