# Flow Capture — landing

Static site for [flowcap.me](https://flowcap.me), hosted from `main` on GitHub Pages. HTML, CSS and JavaScript; no build step.

## Preview

```sh
python3 -m http.server 8793
```

- `/`: campaign landing (`index.html`, `landing.css`, `landing.js`).
- `/guides/`: article index plus three static guides for recording, voice commentary and AI handoff. Each article has a canonical URL, description, Article/BreadcrumbList JSON-LD, and related links. `sitemap.xml` and `robots.txt` cover all public content routes.
- `/mcp/`: MCP installation guide and versioned source download. Its existing shared `styles.css` is intentionally independent of the landing refresh.

## Product imagery

All six product visuals come from the owner's publication-ready App Store campaign in [Figma](https://www.figma.com/design/CKtXJzKMNosC5uYUHD0b1U/?node-id=1478-14129). No generated device or interface illustrations are used on the landing.

| Asset | Figma node | Placement |
| --- | --- | --- |
| capture | 1357:2739 | Hero |
| map | 1357:2832 | Feature gallery |
| voice | 1357:2900 | Feature gallery |
| versions | 1357:3113 | Feature gallery |
| library | 1357:3168 | Feature gallery |
| handoff | 1357:3280 | Figma / AI handoff |

Exported on 2026-10-14 at their original 1320 × 2868 resolution. The complete approved compositions are encoded as WebP at 440, 880 and 1320 px width (quality 90). Source Figma nodes were not changed. The hero uses a transparent export of the original phone node `1357:2745` (1120 × 2048 RGBA, resized to WebP at 440/880/1120 px). No image generation or reconstructed UI is involved. The hero clips the lower phone at its boundary. The handoff uses a CSS viewport; gallery and handoff buttons open the complete composition. Text outside the images remains semantic HTML. Urbanist is the existing web font; no unlicensed Roobert font files were copied.

`assets/campaign/` contains all live product artwork. The original `hero-calm` landscape is reused behind the hero; other older product illustrations remain unused. The owner’s voice-led hero and How it works copy, plus blue-to-violet heading accents, were restored after the campaign refresh. `srcset`, intrinsic dimensions and lazy loading limit transfer and layout shift; the hero is eager/high priority. Total for all 18 WebP sizes is approximately 1.7 MB, not the per-page download.

## Verification (2026-10-14)

- Local image/script/style references, fragment links, unique IDs, and JavaScript syntax checked.
- Browser checked at 320, 390, 820 and desktop width: document width matches viewport.
- Desktop and mobile gallery navigation, native image dialog open/close/Escape, FAQ, mobile navigation and MCP route checked.
- Keyboard focus is restored from the dialog. Navigation uses two direct internal-page links (MCP Setup and Guides), including on mobile; there is no overlay menu. Reduced Motion disables smooth scrolling.
- Browser console: no errors or warnings during checked paths.

To roll back this visual refresh, revert its Git commit. The MCP guide/download and iOS app are unaffected.

## Guides and header update (2026-10-14)

Transparent edge-to-edge navigation replaces the boxed header and section anchors. Guides content is based on `RecordingGuideView`, `VoiceCommentaryGuideView` and `AIHandoffGuideView` in the current app, with MCP limits matching the existing setup guide. The website articles are separate from the in-app strings.

Verified all six HTML routes for local references, one H1, article metadata/JSON-LD and sitemap XML. Browser review covered home, index, all three article routes and the MCP guide; 320/390 px layout stayed within the viewport. The original device export has an alpha channel; its image extends below the hero and is clipped by the banner.
