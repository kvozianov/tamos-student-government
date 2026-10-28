# Design system

The portal follows the editorial structure of a national government website (wide serif headlines, filter tabs, large photography, a calm official tone) rendered in the white-and-blue identity of TAMOS Education. Colours are sampled from the school's public site; no texts or images are reused.

All tokens live in `src/app/(frontend)/globals.css` (`@theme`) and are used through Tailwind classes such as `bg-navy-700` or `text-muted`. Never hard-code a hex value in a component.

## Colour

| Role | Token | Hex | Use |
|---|---|---|---|
| Primary | `navy-700` | `#0345BF` | TAMOS royal blue: links, active tabs, eyebrows, key buttons |
| Primary, deep | `navy-900` / `navy-950` | `#0C2A6B` / `#0B1B42` | Active filter tab, overlays on photos, dark bands |
| Secondary | `sky-600` | `#0178BC` | TAMOS sky blue: secondary accents, calendar markers, progress bars |
| Secondary, tint | `navy-100` / `sky-100` | `#E9EFFB` / `#E5F2FA` | Selected rows, today in the calendar, info notes |
| Accent | `brand-red` | `#E1251B` | One accent per screen at most: hover underline on tiles, "live" marker, errors |
| Background | `paper` | `#FFFFFF` | Page background |
| Background, alt | `mist` | `#F5F6F8` | Alternating sections, footer, placeholders |
| Rule | `rule` | `#DFE2E8` | Hairlines and card borders |
| Text | `ink` | `#111827` | Body text and headlines |
| Text, secondary | `muted` | `#4F5666` | Leads, excerpts, metadata (7.4:1 on white) |
| Text, tertiary | `subtle` | `#5F6673` | Captions and section labels (5.8:1 on white, 5.3:1 on mist) |

The `brass` tone (`#7A5F2E`, 5.5:1 on mist) is reserved for the "Demo" badge on sample content.

Status colours (`tone-*`) are reserved for status badges of events and programme items: neutral, review, approved, progress, soon, done, partial, negative. Each one passes WCAG AA as text on white.

Contrast rules: body text at least 4.5:1, large headlines at least 3:1, focus outline always visible (2 px `navy-600`, white on dark bands).

## Typography

All three families have native Cyrillic and are loaded through `next/font` with `display: swap`.

| Role | Family | Size (mobile → desktop) | Notes |
|---|---|---|---|
| Display / H1 | Oranienbaum | 52 → 96 px, line-height 0.98 | Page heroes, the president's name |
| H2 section | Oranienbaum | 40 → 56 px | Section titles on the home page |
| H3 card | Oranienbaum | 24 → 34 px, line-height 1.1 | News and event cards |
| Body | Golos Text | 17 px, line-height 1.6 | Paragraphs, forms, admin previews |
| Lead | Golos Text | 18 → 20 px | One paragraph under the H1 |
| Label | Unbounded 500 | 10–11 px, caps, tracking 0.14–0.16em | Eyebrows, tabs, metadata, buttons (`label-wide`, `label-wide-sm`) |

Headlines use `text-wrap: balance`, paragraphs `text-wrap: pretty`. Long-form text sits in `container-text` (760 px measure).

## Grid and spacing

- `container-site`: max width 1320 px, side padding 20 / 32 / 48 px at mobile / tablet / desktop.
- Breakpoints: Tailwind defaults plus `xl` at 1200 px, where the full navigation row appears.
- Section rhythm: `py-16 md:py-24`; sections are separated by a 1 px `rule` line or by alternating `paper` / `mist` backgrounds, never both.
- Card grids: 1 column on phones, 2 on tablets, 3 on desktop (team: 2 / 3 / 4). Gaps `gap-x-10 gap-y-16`.

## Components

**Header.** White bar with a ticker line on top, the TAMOS seal and wordmark in the centre, Menu on the left, Search on the right. From 1200 px a row of primary sections appears under a hairline and collapses on scroll. The menu opens as a full-width panel with four groups and two featured items (latest news, next event).

**Hero (home).** Two columns: the president's name in display serif with eyebrow, slogan and animated signature; a 4:5 portrait on the right offset by a thin blue frame. Under it, a `mist` strip with the next event and a live countdown (only when the date is officially confirmed).

**Page hero.** Breadcrumbs, centred H1, one-line lead, optional filter tabs below.

**Filter tabs.** Caps labels in Unbounded with counts; the active tab is a solid `navy-900` block. They are plain links so filters work without JavaScript and every filter state has its own cached URL.

**News card.** Black top rule, 3:2 cover, metadata line (category · date · demo badge), serif title; the whole card is clickable through a stretched link. The large variant adds the excerpt.

**Event card.** Black top rule, 3:2 cover, date block (day + month, dashed border while the date is tentative), status badge, serif title, three-line summary, date line and place at the bottom.

**Calendar.** Month grid with weekday headers, today tinted `sky-100`, days with events marked by a `sky-600` dot and listed under the grid; previous / next month buttons. Toggle between list and calendar on `/events`.

**Programme timeline.** Statistic bar (done / in progress / planned) followed by rows: title, theme, status badge and a dated history of changes. Each status change shows its date and reason.

**Team card.** 4:5 portrait (placeholder hatch if missing), serif name, caps position, responsibility area.

**Footer.** `mist` background, seal and description, contact email, four link groups mirroring the menu, socials, copyright line.

## Photography

- Covers are 3:2, portraits 4:5, Open Graph images 1200 × 630. Upload at least 1600 px on the long side; the CMS generates responsive sizes and AVIF / WebP.
- Real school life only: events, students at work, the team. No stock photos, no images taken from other websites.
- Natural colour, no heavy filters or text baked into the image. Faces should not be cropped at the eyes.
- Every image needs alt text in the CMS; decorative images get an empty alt.
- When a photo is missing, the component shows a hatched placeholder with a caption instead of a broken frame.

## Motion

Subtle and functional: 0.3–0.6 s ease `cubic-bezier(0.22, 0.61, 0.36, 1)`, fade-and-rise on scroll, underline drawing on hover. Everything is disabled under `prefers-reduced-motion`.
