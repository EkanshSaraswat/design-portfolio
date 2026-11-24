# Design System — Ekansh Saraswat Portfolio

## 0. Creative Direction

**Editorial Design × Personal Travel Journal × Interactive Creative Portfolio.**

A sophisticated, eye-friendly experience. Warm but restrained. Never dark-by-default. Dark sections only where they serve a specific visual purpose (e.g. the mountain landscape).

---

## 1. Colour Tokens

| Token | Value | Role |
|---|---|---|
| `--color-ivory` | `#F5F3ED` | Primary background (warm, eye-friendly) |
| `--color-paper` | `#FAF9F5` | Elevated surfaces, cards, polaroids |
| `--color-charcoal` | `#282824` | Primary text, dark sections |
| `--color-graphite` | `#555550` | Secondary text, muted UI |
| `--color-stone` | `#A7A49D` | Tertiary text, dividers, captions |
| `--color-slate` | `#9BAEBB` | Accent (desaturated slate blue) — sparingly |
| `--color-rust` | `#A77D68` | Accent (muted rust) — sparingly |
| `--color-line` | `rgba(40,40,36,.16)` | Fine borders |
| `--color-line-strong` | `rgba(40,40,36,.42)` | Section dividers |
| `--color-line-light` | `rgba(245,243,237,.22)` | Borders on dark sections |

**Rules**
- No bright green, neon, saturated gradients, or excessive beige.
- Dark sections (charcoal bg) only for the mountain landscape and footer.
- Accents (slate, rust) used sparingly — never as large fills.

---

## 2. Typography Tokens

| Token | Family | Use |
|---|---|---|
| `--font-serif` | Fraunces (editorial serif) | Display headings, statements, quotes |
| `--font-sans` | Inter (modern sans) | Body text, UI |
| `--font-cond` | Fraunces (display alias) | Oversized labels, section numbers, hero name |
| `--font-mono` | Courier Prime | Technical annotations, metadata, captions |
| `--font-hand` | Caveat | Contact-me sign-off only |

**Scale (fluid)**
- `--text-display`: `clamp(62px, 12vw, 190px)` — hero name
- `--text-h1`: `clamp(44px, 7vw, 106px)` — page titles
- `--text-h2`: `clamp(38px, 5vw, 76px)` — section headings
- `--text-h3`: `clamp(28px, 3.6vw, 52px)` — sub-headings
- `--text-body`: `15px` — body
- `--text-micro`: `10px` — mono labels (uppercase, letter-spaced .16em)

**Hierarchy rules**
- Dramatic scale differences between display and body.
- Unconventional alignments (left-heavy, asymmetric).
- Intentional line breaks in headings.
- Text interacts with imagery (overlaps, captions).
- Large editorial section numbers as visual anchors.

---

## 3. Spacing & Layout Tokens

- `--gutter`: `clamp(20px, 5vw, 86px)` — page horizontal padding.
- `--section-padding`: `clamp(80px, 10vw, 150px)` vertical.
- `--radius`: `0` — no rounded corners (brutalist).
- Grid: 12-column for editorial compositions; asymmetric spans.

**Principles**
- Asymmetric layouts, intentional whitespace.
- Strong visual hierarchy via scale + weight, not colour.
- Fine 1px borders, subtle SVG grain texture.
- Organic compositions (overlapping polaroids, tilted cards).

---

## 4. Motion Tokens

- `--ease-out`: `cubic-bezier(.16, 1, .3, 1)` — primary easing.
- `--ease-in-out`: `cubic-bezier(.76, 0, .24, 1)` — wipes/transitions.
- `--dur-fast`: `250ms` — micro interactions.
- `--dur-base`: `600ms` — component transitions.
- `--dur-slow`: `1.6s` — scroll-driven emergence.

**Motion rules**
- Character scrambling for hero name.
- Book-opening with realistic page transitions.
- Scroll-driven mountain emergence (layered parallax).
- Photograph reveals, polaroid interactions.
- Respect `prefers-reduced-motion`.

---

## 5. Component Tokens

- **Buttons**: 1px border, mono uppercase label, rust hover fill.
- **Cards/Polaroids**: paper-white bg, 1px border, subtle shadow, no radius.
- **Dividers**: 1px solid `--color-line`.
- **Section numbers**: condensed, faded (opacity .06), positioned absolute top-left.
- **Tape**: 82×25px grey strip, rotated -3deg, on polaroids.

---

## 6. Mountain Art Direction

- Rugged, brutal, rocky, jagged, monumental.
- Palette: graphite, ash grey, stone, slate, snow.
- No green hills, lush forests, or cartoon illustrations.
- Layered SVG ridges (back/mid/front) with mist and parallax.
- Personal photos as monochrome polaroids pinned to peaks.

---

## 7. Section Transition Motifs

- Torn paper edge between hero and contents.
- Faded large numerals as chapter markers.
- Colour shift: ivory → charcoal (mountains) → ivory (skills).
- Typography shift: display serif → condensed labels → mono annotations.

---

## 8. Reusable Components (to be implemented in next phase)

1. `PageShell` — header, footer, progress rail, cursor, page-wipe.
2. `HeroName` — scramble animation.
3. `BookCard` + `BookDialog` — editorial publication.
4. `MountainStage` — layered emergence.
5. `Polaroid` — photo with tape, tilt, caption.
6. `SkillGuide` — numbered categories with divider lines.
7. `SectionMarker` — faded large numeral + micro label.

---

## 9. Implementation Notes

- Preserve existing framework (static HTML/CSS/JS + GSAP vendor).
- Preserve routes: index, service, experience, skills, work, contact.
- Preserve contact form (Resend) and all links.
- No new dependencies.

---

*Report complete. Awaiting approval before page implementation.*