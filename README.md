# Flow Capture — landing

Static site for [flowcap.me](https://flowcap.me), hosted from `main` on GitHub Pages. HTML, CSS and JavaScript; no build step.

For work on another computer or in a new Codex session, start with
[`Docs/HANDOFF_2026-10-15.md`](Docs/HANDOFF_2026-10-15.md) and [`AGENTS.md`](AGENTS.md).

## Preview

```sh
python3 -m http.server 8793
```

- `/`: campaign landing (`index.html`, `landing.css`, `landing.js`).
- `/guides/`: article index plus three static guides for recording, voice commentary and AI handoff. Each article has a canonical URL, description, Article/BreadcrumbList JSON-LD, and related links. `sitemap.xml` and `robots.txt` cover all public content routes.
- `/mcp/`: MCP installation guide and versioned source download. It shares the landing typography, palette and navigation through `landing.css`, with isolated setup layouts in `mcp/mcp.css`.

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

## Homepage design critique and refinement (2026-10-14)

Preserved the approved voice-led copy, forest/lake artwork, transparent full-width navigation, gradient headings and authentic Figma screenshots. The review identified oversized vertical pauses, a gallery taller than a typical viewport, delayed product visibility on mobile, and an ambiguous first action.

`homepage.css` scopes the refinement to the homepage: a shorter hero, compact numbered steps, four visible campaign boards on wide screens, a scrollable gallery on smaller screens, and balanced handoff/FAQ/closing spacing. The primary action leads directly to the recording guide. Gallery controls disappear when all four boards fit, and the mobile counter identifies the current board. Native dialog and details behavior is retained.

Validated local links/assets, unique IDs, one H1, JavaScript syntax and clean diff. Browser checks covered 320, 390, 820 and 1280 px without document overflow; gallery navigation, native dialog/escape/focus restoration, FAQ expansion and the recording-guide link worked. No browser console errors or warnings on these paths. White primary-button text contrast is 5.46:1 normally and 5.00:1 on hover. This is a focused visual/interaction review, not a complete accessibility certification.


## MCP design alignment and overflow fix (2026-10-14)

Removed the legacy landing stylesheet from MCP Setup. Its `.steps` rule imposed a three-column grid with a 64 px middle column on the installation instructions. The page now uses the current site's shared base and namespaced `.setup-steps` lists. Installation is one panel with divided rows; pairing and delivery remain sequential lists. The page shares Urbanist, blue/violet headings, full-width transparent navigation, buttons and footer with the homepage. Long code wraps without changing copied commands.

Browser checks at 320, 390, 820 and 1280 px found no document or card/code overflow. Section navigation, native FAQ disclosure and copy feedback worked; the copy handler's exact payload and repeated-click label reset were checked separately. Original command and pairing payloads match the previous version byte for byte. HTML nesting, local links/downloads, unique IDs and JavaScript syntax validated; no browser console warnings/errors on tested paths.

## App Store CTA, typography and public information (2026-10-14)

The hero now uses Apple's unmodified official English App Store SVG (`https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg`) linked to app ID `6811913058`, already referenced by the iOS app. The owner requested the real badge before public release. The product page may remain unavailable until launch; availability is not asserted by this change. The hero-only Coming soon line was removed. The phone is 340 px wide on desktop, with approximately 95% visible inside the landscape; mobile retains a similar bottom crop.

Reduced heading weight and relaxed negative tracking across the current landing, MCP and Guides styles. Added a shared footer with Guides, MCP Setup, Support, Privacy Policy and Terms of Use. `/privacy/` derives from the existing app privacy source including MCP. `/terms/` links the same standard Apple EULA as the app. `/support/` contains real help paths, with a truthful preview notice until a public contact exists. No email address, provider identity, backend policy update or App Store Connect configuration was invented or changed.

The owner's requested next task—create and verify a public support/privacy mailbox—is tracked in `Docs/LAUNCH_CHECKLIST.md`, along with contact publication and App Store metadata checks. All nine HTML routes were checked for balanced markup, local links/assets, unique IDs and one H1; sitemap and official badge XML parsed successfully. Browser checks covered the hero, footer and new information pages at desktop and 320/390 px without horizontal overflow. Store badge destination was checked against the app source; an App Store download is not testable before publication.
