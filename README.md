# Flow Capture — landing

Static site for [flowcap.me](https://flowcap.me), hosted from `main` on GitHub Pages. HTML, CSS and JavaScript; no build step.

For work on another computer or in a new Codex session, start with
[`Docs/HANDOFF_2026-10-15.md`](Docs/HANDOFF_2026-10-15.md) and [`AGENTS.md`](AGENTS.md).

## Preview

```sh
python3 -m http.server 8793
```

- `/`: campaign landing (`index.html`, `landing.css`, `homepage.css`, `landing.js`).
- `/guides/`: article index plus three static guides for recording, voice commentary and AI handoff. Each article has a canonical URL, description, Article/BreadcrumbList JSON-LD, and related links. `sitemap.xml` and `robots.txt` cover all public content routes.
- `/mcp/`: MCP installation guide and versioned source download. It shares the landing typography, palette and navigation through `landing.css`, with isolated setup layouts in `mcp/mcp.css`.

## Current homepage (20 October 2026)

The owner-approved [Figma redesign](https://www.figma.com/design/CKtXJzKMNosC5uYUHD0b1U/?node-id=1751-26160)
is implemented in semantic HTML and scoped `homepage.css`: lake hero with the real
app demo, four white feature chapters, navy handoff, native FAQ, and centered
App Store closing action. Text, grid and spacing adapt to narrow screens.
The four white feature cards use the owner-supplied screen recordings inside the
approved phone frame. They load on viewport entry and pause offscreen; see
[`assets/demos/README.md`](assets/demos/README.md) for mapping and provenance.
The navy handoff restores the static floating phone and explains the owner’s four
export destinations—Claude, Figma, ZIP and PDF—with large headings and icons.
The white feature chapters were further refined against the owner’s Anchor
reference: compact 4:5 stages, smaller phones, larger headings and distinct
benefit icons. This updates the original Figma row dimensions.
Initial approved artwork exports and provenance are in
[`assets/design-20261020/README.md`](assets/design-20261020/README.md).
Both App Store badges use the same transparent 180 × 60 asset. Existing demo
startup, reduced-motion/data-saving fallbacks and fixed-camera lake loop remain.
The full visible phone replaces its earlier bottom crop/fade. Older sections below
record previous iterations; the current Figma implementation supersedes those
homepage layouts. MCP, Guides, auth, legal pages and downloads are unchanged.

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

Exported on 2026-10-14 at their original 1320 × 2868 resolution. The complete approved compositions are encoded as WebP at 440, 880 and 1320 px width (quality 90). Source Figma nodes were not changed. The hero uses a transparent export of the original phone node `1357:2745` (1120 × 2048 RGBA, resized to WebP at 440/880/1120 px). No image generation or reconstructed UI is involved. The hero clips the lower phone at its boundary. The product chapters use isolated exports from the same approved nodes; image buttons open the complete campaign composition. Text outside the images remains semantic HTML. Urbanist is the existing web font; no unlicensed Roobert font files were copied.

`assets/campaign/` contains the complete campaign compositions. `assets/product/` contains the isolated product layers used by the current homepage. The original `hero-calm` landscape is the composition reference for the detailed `hero-lake-*` background; other older product illustrations remain unused. The owner’s voice-led hero and How it works copy, plus blue-to-violet heading accents, were restored after the campaign refresh. `srcset`, intrinsic dimensions and lazy loading limit transfer and layout shift; the hero is eager/high priority. Total for all 18 WebP sizes is approximately 1.7 MB, not the per-page download.

The hero uses `assets/hero-lake-air-3k.mp4`, a silent 3072 × 2560, 12-second
loop with a fixed camera. It moves existing water texture and gently modulates selected real shoreline
lamp cores and their reflections. Light colours stay neutral; land and hillside
windows stay still. It paints no light bands, glow, or fog. The detailed still is the fallback for
reduced motion, data saving, blocked autoplay, or media errors. There are no
playback controls. Re-render the asset offline with
`python3 scripts/render_hero_loop.py --write-fallbacks` then
`python3 scripts/extend_hero_sky.py` (Pillow, numpy, and ffmpeg); the site
itself still needs no build step. The image master and generation prompts are
documented in `Docs/HERO_ARTWORK.md`.

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

## Product story refresh (2026-10-15)

The homepage presents the map and voice comments as two full-width cards with
their copy inside: map illustration left / copy right, then copy left / voice
illustration right. Two smaller library and version cards follow in equal
columns. All cards share the 1280 px outer container and 24 px gaps (20 px on
mobile), including the space below the final row. The product heading occupies
one line on desktop and wraps naturally on narrow screens. The Library &
Versions group label and the separators between cards have been removed at the
owner's request. Mobile cards place copy above artwork within the same surface.
Homepage heading weight is 600; shared Guides and MCP typography is unchanged.

The additional transparent WebP artwork in `assets/product/` comes from these
existing Figma nodes, exported in isolation without modifying the source file:

| Asset | Source node | Export bounds |
| --- | --- | --- |
| map-phone | 1357:2838 | 1122 × 2048 |
| voice-phone (archived crop) | 1357:2906 | 1207 × 2061 |
| voice-phone-complete (current) | 1357:2908 | 1090 × 2228 |
| voice-comment | 1357:3068 | 1320 × 767 |
| library-phone | 1357:3174 | 1080 × 2048 |
| versions | 1357:3119 | 1320 × 2018 |

Assets retain their original content, transparency and proportions, with 480
and 960 px responsive encodings. The enlarged comment uses 960 px directly for
legibility. The original full campaign exports remain available in the dialog.

The handoff section shows the verified export contents and accessible tabs for
Claude & Codex, Figma and ZIP. The review request is explicitly labeled as an
example, not represented as an actual generated export. MCP is labeled as a Mac
preview and the Figma plugin as coming soon. All tab content remains accessible
without JavaScript. Privacy uses the same three existing claims in a clearer
three-column layout. The two App Store actions retain the identical official
180 × 60 badge, in the hero and closing sections.

Decorative loops emphasize the two existing map steps, the enlarged comment and
voice waveform, and the export contents. IntersectionObserver stops them when
out of view; reduced motion, data saving and background tabs get static content.
The authored hero lake loop and fixed camera are unchanged.

Validation: all 10 HTML routes passed local resource, link, fragment, duplicate-ID
and H1 checks; all three public scripts passed syntax checks. Browser checks at
320, 390, 820 and 1440 px found no document or text overflow. Tabs worked with
clicks and Arrow/Home keys, retained the panel height, and updated selection and
focus. The image dialog, Escape/focus return and FAQ worked; the browser console
reported no warnings or errors on those paths.

## Section rhythm review (2026-10-15)

An independent design critique and a second visual pass checked section
boundaries on desktop and mobile. Privacy now has its own full-width surface
and an inner container, separating it from the FAQ. A fine divider and balanced
spacing distinguish the map and voice chapters; a shared Library & Versions
label groups the smaller cards. The two export-board halves have an internal
separator. Introductory spacing was reduced to offset the stronger chapter
breaks. Hero placement, product art and App Store badges are unchanged.

Validated homepage HTML nesting, local resources, unique IDs and one H1; all
three scripts passed syntax checks. Desktop, 390 px, 320 px and tablet widths
were checked for overflow; mobile export tabs retain equal heights.

Owner-directed card layout follow-up: the full-width card surfaces replace the
earlier separate illustration panels and chapter dividers. Browser review at
1440, 820, 390 and 320 px found no horizontal overflow. The image dialog and
Escape/focus return still work.

## Feature close-ups — 15 October 2026

The Anchor reference informed the visual hierarchy: larger real interface details,
short icon-led benefits, distinct feature accents and concrete example requests.
The first two feature cards remain full width with opposite text placement;
24 px desktop / 20 px mobile card gaps remain uniform. Map connections are shown
without the phone frame, the comment stays readable throughout the waveform loop,
and the library uses isolated native app tiles rather than a cropped phone.
The export board includes actual screen previews and three manually selectable
example requests. These are examples, not a live AI session.

Additional isolated Figma exports in `assets/product/`:

| Asset | Approved source node |
| --- | --- |
| `map-canvas.webp` | `1357:2856` — original map cards and connectors |
| `library-airbnb.webp` | `1357:3192` |
| `library-spotify.webp` | `1357:3205` |
| `library-duolingo.webp` | `1357:3216` |
| `library-notion.webp` | `1357:3227` |
| `screen-explore.webp` | `1357:2868` — original preview crop |
| `screen-dates.webp` | `1357:2870` — original preview crop |

These are isolated PNG exports converted to WebP; their product content is
unchanged. CSS crops the map to the two connected flow cards.

## Current motion and composition — 15 October 2026

The voice illustration has three separate areas: the approved phone header,
a readable HTML quote of the existing Choose dates comment, and a dedicated
voice-signal area with clear space above it. The original long phone screenshot
is clipped before its comment list, so text is not repeated behind the quote.
Circular enlargement arrows and the image dialog have been removed; illustrations
are noninteractive figures. Desktop privacy heading and introduction each fit one
line. The closing block has one centered official App Store badge.

Motion uses short one-time entrances and a single pass through the real map
connection. Library tiles, version artwork and export previews stay still.
The compact voice waveform alternates one phrase with a long rest. Map and comment
entrances pause offscreen instead of replaying on every visit; the voice loop
stops offscreen or when the document is hidden. `landing.js` respects reduced
motion and save-data, and content is never pre-hidden. The hero phone's final
24 px downward offset and the lake's fixed camera are preserved.

## Shoreline light shimmer — 15 October 2026

The owner requested gentle blinking of the existing hero lights. The authored
12-second lake loop varies only existing lamp cores and their warm edges along
the shore, plus their existing reflections. Clipped white cores are included so
the effect remains visible after the hero overlay and scaling. Nearby lamps have
different smooth 2.4–4 second rhythms, with short bright peaks and longer dim intervals;
reflection changes are weaker. No new light sources, glow, beams or bands are
painted. The 3072 × 2048 camera, scene detail and water movement are unchanged.
`render_hero_loop.py --preview-dir /tmp/hero-preview --preview-only` exports
inspection frames and the light-selection mask. The renderer asserts identical
loop endpoints and no pixel changes outside water and selected existing lights.
The video URL is versioned to refresh the cached background after publication.

## Whole-page design critique (2026-10-15)

An independent desktop/mobile critique informed a quieter hierarchy: plain
subject labels replace tilted stickers; section, feature and supporting-card
headings use distinct scales. The voice example now groups its readable quote
and continuous waveform on one surface, without repeating the same benefits.
The complete approved phone remains visible. The export introduction uses a
horizontal editorial layout; privacy and FAQ have quieter colours and borders.
Library tiles are smaller, with more room around them. Floating amplitudes are
4 px for map/tiles and 5 px for phones; three slower waveform rhythms keep the
voice active without a silent hold. Existing hero artwork, parallax, transparent
App Store badges, 24/20 px card gaps and 80/56 px section-bottom spacing remain.

Reviewed at 320, 390, 820 and 1440 px; local links/assets, HTML nesting, unique
IDs and JavaScript syntax checked. Export tabs retain keyboard navigation and
stable board height, native FAQ disclosure works, and decorative motion pauses
offscreen.

## Typography consolidation and complete voice phone (2026-10-15)

The homepage now has one shared Urbanist type system in `homepage.css`: display,
section, feature, card, short title, body, supporting text and label. All main
paragraphs use 16 px / 1.6; all section headings share the same size and weight.
Responsive heading sizes are controlled by four variables instead of per-section
overrides. Controls use 500, headings 600 and body 400. The unused 700 webfont
weight was removed from the homepage request. Product screenshots and App Store
badges retain their original artwork typography.

The original Comments phone was cut by campaign frame `1357:2907`. Its full
child `1357:2908` contains the complete rounded bottom. Exported a temporary
copy outside that crop, saved the original PNG and responsive WebP assets as
`voice-phone-complete-*`, then removed the copy. No UI or device parts were
reconstructed. The full phone fits its stage on desktop and mobile.


### Simplified launch homepage — 15 October 2026

The homepage now contains the hero, three workflow points, FAQ and closing App Store action. At the owner's request, the complete feature section (“Every detail. In its place.”), handoff section (“Your flow. In your next tool.”), and recordings section (“Your recordings. In your hands.”) were removed from the HTML. Related feature motion and export-tab JavaScript was removed; approved product assets remain archived. FAQ shares the hero fade's #0e1025 background. Earlier design notes above describe the previous full page.
