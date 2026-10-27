# Static language versions

English remains at the original URLs. Seven additional languages use stable prefixes:
`/ru/`, `/es/`, `/de/`, `/fr/`, `/pt-br/`, `/ja/`, `/zh-cn/`.
Each language includes the homepage, MCP setup, Guides and all three articles,
Support, Privacy, Terms, and the noindex phone-approval page.

The header's native `details` disclosure links to the equivalent page in each
language. Normal links work without JavaScript. A small shared script closes the
picker on Escape/outside clicks and preserves the current query and article anchor.
Internal links stay within the chosen language. There is no automatic language
redirect, cookie, tracking or online translation at runtime.

## Editing

1. Edit the original English HTML pages.
2. Update the corresponding English-HTML → localized-HTML entries in the seven
   JSON catalogues here. Keep URLs, product names and quoted app commands intact.
3. Run `python3 scripts/localize.py` from the repository root.
4. Run `python3 scripts/check_locales.py`, JavaScript syntax checks and
   `git diff --check`, then visually review desktop and narrow mobile layouts.
5. Commit the generated pages and catalogues together. Pages serves the saved HTML;
   no build system, dependency installation or translation service is needed.

The generator preserves approved screenshots/videos, code examples, section IDs,
app commands, canonical URLs, translated metadata and reciprocal `hreflang` links.
It regenerates the sitemap and the small translated runtime message dictionaries.
Missing catalogue entries fail generation rather than silently mixing languages.
The App Store badge remains the approved original artwork in every language.

Homepage headings, feature descriptions, benefits, FAQ labels and guide-hub copy
were edited for each language. Technical instructions retain the actual English
menu commands used by the app. Russian navigation uses **Справка**, per the owner.
Translated legal pages link visibly to the authoritative English original;
the English legal body and published downloads remain unchanged.

The initial translation pass used Google's translation endpoint on public website
copy, followed by terminology and copy edits in the committed catalogues. There
is no translation API credential, endpoint or dependency in the published runtime.

## Editorial conventions

Use clear, task-based instructions. Translate common nouns and feature descriptions
(including microphone and voice comments); do not preserve English merely because
it resembles an interface label. Keep exact app menu commands only where readers
need to locate the matching control, and explain their purpose in the local language.
Preserve product names, file names (especially START_HERE.txt and Screens), code,
links, limits and release-state facts. In Russian, use «сценарий», «расшифровка»,
«подключение» and «передача материалов» consistently. Handoff never means transfer
of control; transcription never means recording new audio.

27 October editorial pass: revised Russian copy across every route, corrected
common-noun localization and mistranslations in the other six catalogues, restored
exact app command/file names where translations had obscured them, and simplified
the English microphone instructions. English legal source text is unchanged.
