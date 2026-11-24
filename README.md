# Ekansh Saraswat — Interactive Digital Journal

A six-page personal portfolio built with static HTML, CSS and vanilla JavaScript. It is
deployed as-is to Vercel; the contact form uses a Vercel serverless function, with an
Express equivalent for local development. Both endpoints share the same validation,
CORS and rate-limit logic.

## Pages

| File | Destination | Purpose |
| --- | --- | --- |
| `index.html` | `HOME` | Name reveal, journal contents and working-style introduction |
| `service.html` | `PROJECTS` | Three case-study books that open with a page-turn animation |
| `experience.html` | `ABOUT` | Scroll-rise mountain landscape, scrapbook, education and internships |
| `skills.html` | `SKILLS` | "My Creative Toolkit" — numbered field notes, no fake proficiency bars |
| `work.html` | `WORK` | Polaroid wall split into Selected Work and Experiments |
| `contact.html` | `CONTACT` | Final journal page, email/LinkedIn/GitHub, form and handwritten sign-off |

All pages share the same header, mobile menu, progress rail, footer and page-wipe
transition. The URLs keep their `.html` suffix on Vercel; local `serve` uses clean URLs,
and the shared JS handles both.

## Structure

```
index.html … work.html     page markup
styles.css                 shared visual system, layout, responsive + reduced-motion rules
site.js                    shared interactions (intro, cursor, books, tabs, parallax…)
assets/about/              About-page mountain layers and scroll video
assets/about/photos/       drop-in photo slots for the empty About frames
assets/shared/             hero layers, ridge SVGs and project artwork
assets/vendor/             vendored GSAP + ScrollTrigger (committed so production
                           never depends on `npm install` to regenerate them)
lib/contact.js             shared validation, CORS + rate limiting for the API
api/contact.js             Vercel serverless contact endpoint
backend/server.js          local Express contact endpoint (same behaviour)
backend/.env.example       copy to backend/.env and add RESEND_API_KEY
vercel.json                security headers, font allowlist + API cache policy
```

## Run locally

Requires Node 26+.

```bash
npm run install:all          # installs root + backend dependencies
copy backend\.env.example backend\.env   # Windows (macOS/Linux: cp)
# edit backend/.env and set RESEND_API_KEY

npm start
```

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:5000>

The site is served statically on `:3000`, so the contact form tries
`http://localhost:5000/api/contact` first and falls back to same-origin `/api/contact`.
Without `RESEND_API_KEY`, the form shows **"Email service is not configured."** — this is
expected and means the backend is reachable.

Individual services:

```bash
npm run frontend   # static site only
npm run backend    # Express API only
```

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | `backend/.env` locally, Vercel project settings in production | Sends the contact email |
| `CONTACT_FROM_EMAIL` | same | Verified Resend sender, e.g. `Portfolio <hello@yourdomain.com>` |
| `CONTACT_TO_EMAIL` | same | Inbox that receives direct messages |
| `PORT` | `backend/.env` (optional) | Express port, defaults to `5000` |

## Deploy to Vercel

1. Import the repository in Vercel (framework preset: **Other**).
2. Leave Build Command and Output Directory empty. GSAP and ScrollTrigger are already
   committed in `assets/vendor/`; `postinstall` simply refreshes them from `node_modules`.
3. Add the environment variables above under **Settings → Environment Variables** for
   Production, Preview and Development. At minimum set `RESEND_API_KEY`.
4. Verify a sending domain in Resend and set `CONTACT_FROM_EMAIL` to an address on it.
   Set `CONTACT_TO_EMAIL` to the inbox where you want messages delivered.
5. `api/contact.js` is detected automatically as a serverless function. No rewrite is
   needed; the form posts to the same-origin `/api/contact` endpoint.

`vercel.json` allows the four Google Font families used by the design (Fraunces, Inter,
Caveat and Courier Prime) through `style-src`/`font-src`, allows local `data:` SVG artwork
through `img-src`, disables caching on API responses, and sets a 10 second function timeout.

Notes:

- The `onboarding@resend.dev` default sender only delivers to the Resend account owner's
  address. Use a verified domain for real contact messages.
- `replyTo` is set to the visitor's email, so replying to the notification reaches them
  directly.
- Rate limiting is in-memory and per serverless instance, so it is best-effort burst
  protection rather than a global quota.

## Design system

- **Palette:** deep black `#111111`, charcoal `#222222`, warm off-white `#F4F2ED`,
  paper white `#FAF9F6`, stone grey `#858585`, light grey `#D8D6D0`, with rust `#8B5E45`,
  slate `#6B7A82` and sand `#A89F91` accents.
- **Type:** Fraunces for editorial headings and display, Inter for body copy,
  Courier Prime for monospace technical annotations. Caveat is used only in the
  contact-me sign-off.
- **Texture:** fixed SVG paper grain, photo-border shadows, postage stamps, torn edges,
  tape and organic rotations. Monochrome photographic treatment throughout.
- **Motion:** name decryption, page wipes, magnetic cursor, book lift/page turn,
  scroll-rise mountains with GSAP/ScrollTrigger parallax, Polaroid hovers and
  closing sign-off. All motion respects `prefers-reduced-motion` and heavy pointer
  effects are disabled below 760px. GSAP + ScrollTrigger are committed under
  `assets/vendor/`; the site also degrades gracefully to static HTML if they fail to load.

## Interactions

- **HOME** — logo-to-header intro wipe, then a per-character name scramble; six linked
  chapter cards.
- **PROJECTS** — three books with 3-D hover lift, keyboard arrow navigation and modal
  case studies covering introduction, problem, research, process, solution, reflection,
  stack and real repository/demo links.
- **ABOUT** — three illustrated mountain layers that emerge when scrolled into view, with
  restrained depth-based parallax, clouds, Polaroids, tape and location tags. The original
  education and internship content is preserved in the field-notes section.
- **SKILLS** — six numbered categories in an ARIA tablist with arrow-key/Home/End support;
  cards have a subtle lift, with no invented proficiency scores.
- **WORK** — Polaroid gallery split into Selected Work and Experiments; cards open the
  matching case study or study notes.
- **CONTACT** — copy-email card, validated contact form, FAQ, social links and animated
  handwritten sign-off.
- Shared: scroll progress rail with section ticks, mobile menu with `inert`, next-page
  sentinel flow, click ripple, staggered reveals, copy-to-clipboard and back-to-top.

## Imagery

The site uses the supplied project artwork in `assets/shared/` and generated mountain
layers in `assets/about/` and `assets/shared/`. Unused illustration slots were removed.

## Content integrity

Only projects, education, internships and skills already present in the earlier portfolio
are claimed. Suggested-but-unverified skills (for example Python, Canva, PyTorch,
wireframing) are deliberately **not** presented as qualifications. Work page studies are
explicitly labelled as illustrations, not shipped products or measured outcomes.
