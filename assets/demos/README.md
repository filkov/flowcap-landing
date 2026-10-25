# Current feature demo replacements · 25 October 2026

Owner-supplied files from `Flow-Capture-Landing-Latest 2/Master` replace Comments
and Handoff on the homepage. Versions is supplied separately from
`Flow-Capture-Landing-Latest 3/Master`. All three are silent 1080 × 2348 H.264 at 60 fps;
Comments lasts 5.55 s, Handoff 6 s and Versions 5.15 s. Runtime files retain the compressed streams
exactly, remuxed only for fast start. Packet SHA-256 comparison passed for all three.
Posters are the first frame, encoded to quality-88 WebP at full source resolution.

| Supplied file | Current runtime MP4 | Supplied SHA-256 |
| --- | --- | --- |
| 02-Comments.mp4 | comments-20261025.mp4 | 33fe0601d16180f61d0fd4c15102c88571c634cc1c3e60565499139e52229199 |
| 05-Handoff.mp4 | handoff-20261025.mp4 | 3a4f43180f356ad053e4bb5764eba30ef2e10a31887a9d2cd033ad4191cd07e5 |
| 04-Versions.mp4 | versions-20261025.mp4 | 2e6b7e9b80b37b74d5c94fb6d4b2d0e3b7d57a9f2c240ef2291ba091f4f55012 |

Comments and Versions keep the existing white cards. Handoff now plays in the same approved
full-phone frame, with a fixed −7° tilt; the phone itself has no autonomous motion.
This supersedes the earlier static Handoff choice at the owner's new request.
Playback uses the existing lazy loader, muted inline loop, viewport pause and
reduced-motion/data-saving poster fallback. Other demos and the hero are unchanged.
Versioned filenames avoid stale browser caches and preserve the earlier assets.

---

# Original feature demos · 20 October 2026

Original 20 October usage: four clips in the white chapters, with a static Handoff
phone. The Comments/Handoff/Versions usage below is superseded by the 25 October files.
The earlier MP4s, posters and floating-phone artwork remain archived unchanged.

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
