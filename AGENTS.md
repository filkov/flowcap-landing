# Flow Capture landing: working rules

Read `Docs/HANDOFF_2026-10-15.md` before editing the site. This repository is
the source for the public static site at `flowcap.me`; GitHub Pages publishes
the root of `main`. Preview locally with `python3 -m http.server 8793`.

- Keep the site static unless a concrete product requirement needs a build
  system. Preserve working routes, canonical URLs, article metadata and the
  mobile layout.
- Use the approved Flow Capture App Store artwork in `assets/campaign/` and its
  linked Figma source. Do not invent app screens, device mockups, or product
  states. The forest/lake hero image, voice-led copy, restrained gradient
  headings and transparent full-width header are deliberate design choices.
  The hero background has a locked camera: animate water, reflections and gentle brightness changes in existing shore lights only.
  The owner requested light scroll parallax on the background layer (maximum
  32 px desktop / 18 px mobile); the authored video camera still stays fixed.
  Do not add autonomous image panning/zooming or playback controls.
- The homepage header links to internal pages (MCP Setup and Guides), not
  in-page anchors. The first hero action is the App Store badge.
  Keep all homepage App Store actions identical: the owner-requested transparent
  variant in `assets/app-store-badge-transparent.svg`, displayed at 180 × 60 px
  via `.app-store-link`. Keep the white logo/text and thin outline. The original
  official asset is preserved in `assets/app-store-badge.svg`.
- Keep public claims aligned with the product's release state. The app is not
  yet available in the App Store; the public MCP setup is a tested Mac preview.
  The browser OAuth connection remains restricted preview. Do not advertise
  unverified Windows support or a Claude/Codex directory listing.
- `support@flowcap.me` is the public contact. Never commit credentials,
  deployment keys, user data or private recordings.
- Before pushing, check internal links and assets, validate JavaScript, review
  desktop and narrow mobile widths, then run `git diff --check`. Avoid removing
  published downloads or changing their checksums accidentally.
