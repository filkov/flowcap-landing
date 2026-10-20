# Owner-supplied feature demos · 20 October 2026

The owner supplied five screen recordings for the homepage cards. All are silent
720 × 1566 H.264 at 60 fps. They replace the earlier static campaign screens in
Capture, Comments, Flow Map, Versions and Handoff respectively. The existing
approved full phone artwork provides the device frame; each screen is fitted
without cropping at its native aspect ratio.

MP4s are remuxed with stream copy and fast-start metadata. The compressed video
streams match the supplied files exactly; no frame, timing or quality changes.
Posters are the first video frame encoded as quality-88 WebP. The supplied
originals remain in the owner's Downloads/Web folder.

| Supplied file | Runtime MP4 | Supplied SHA-256 |
| --- | --- | --- |
| 01-Capture.mp4 | capture.mp4 | 0a221235388f7c3e0401f5af5da2dacb23792370c572537c9f23b019b603769c |
| 02-Comments.mp4 | comments.mp4 | 86483931ce587ba70dc694ad9a70ab0497b2bc6f850f5008feb1b32953a3c74c |
| 03-Flow-Map.mp4 | flow-map.mp4 | 19dc632f538fcdd271772e78172c5a51622fcfb2838f62a0a2852edd1760f3ea |
| 04-Versions.mp4 | versions.mp4 | 8d5debf056edcf5d51266b639cb3584a6b8ba993fac18f0f7766aece010b77b3 |
| 05-Handoff.mp4 | handoff.mp4 | 19db4c0c013fce60211fe3764a377fd6632517ac153cf51b33ec332295f2b38a |

`landing.js` requests each card's video only when its figure enters the viewport.
Playback loops muted and inline, pauses outside the viewport or in a hidden tab,
and retains the poster for reduced motion, data saving, blocked playback or errors.
The screen layer appears only after a decoded frame. No additional player controls
or homepage copy changes are introduced. The separate hero demo is unchanged.
