# HANDOFF.md — Home Page Rebuild (Page 1 of 2)

## 1. Goal and Key Requirements
Rebuild `index.html` (Home page) with an award-winning, restrained editorial aesthetic while preserving existing design tokens (`#F5F3ED`, `#FAF9F5`, `#282824`, `#222222`, `#A7A49D`, `#A77D68`, `#8B5E45`, `#9BAEBB`, `#B8AD9E`), legacy variable aliases, and other pages (`service.html`, `experience.html`, `skills.html`, `work.html`, `contact.html`).

## 2. Done
- **Assets (`assets/shared/`):**
  - `assets/shared/sky.webp` (1024×572, 2 KB): Deep moody slate sky, watermark removed.
  - `assets/shared/distant.webp` (1024×572, 19 KB): Darker atmospheric distant ridge cutout.
  - `assets/shared/dominant.webp` (1024×572, 85 KB): Darker moody graphite & snow peak cutout.
  - `assets/shared/closest.webp` (1024×572, 74 KB): Deep charcoal & snow rocky ridge cutout.
  - `assets/shared/mist.webp` (1600×600, 70 KB): Soft cool slate mist layer.
- **Hero (`index.html`, `styles.css`, `site.js`):**
  - Portrait removed per user request.
  - On reload: only the dark sky, restrained top nav (`Work`, `About`) in ivory, headline (`"Hi! I'm Ekansh Saraswat,"`), subline, and scroll arrow appear — no automatic mountain animation on load.
  - On scroll (pinned `homeHeroPin`, scrubbed with GSAP `ScrollTrigger`): mountain layers rise in pasted order (`distant` → `dominant` → `closest` → `mist`) with multi-speed parallax, headline swaps to `"I build full-stack products for the web, with an eye for how they feel."`, and scene transitions softly into `#work`.
- **Selected Projects (`#work`), Short Path & Footer:**
  - Warm ivory `#work` section with 52 muted drifting particles (`#workParticles`, paused off-screen).
  - Wide staggered cards for **SampadaSuraksha**, **Adaptive Escrow System**, and **BlockLance** with empty screenshot/tag slots.
  - Centered narrow Short Path paragraph + single-accent (`#282824`) footer with LinkedIn, GitHub, email icons, and `About →`.

## 3. Not Done
- Live Chrome DevTools visual inspection (Chrome remote debugging was not active).
- Page 2 of 2 (`about.html` / `experience.html`) — separate future task.

## 4. Current State
- Local frontend server running at `http://localhost:60317`.

## 5. Next 3 Steps
1. Preview `http://localhost:60317` and scroll through the hero to verify the darker mood and scroll-only mountain rise.
2. Add project screenshots and tech-stack tags in `index.html` when ready.
3. Proceed to Page 2 when requested.
