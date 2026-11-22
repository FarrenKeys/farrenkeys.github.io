# Farren Keys — Player File

A GTA-style personal portfolio site for Farren Keys. Static HTML, CSS and JavaScript — no build step, no dependencies.

## GTA-style touches

- **Scene backdrop:** an SVG skyline in the hero that shifts between day, dusk and night based on the visitor's real clock.
- **HUD:** live local time and a five-star "wanted level" that fills as you scroll down the page.
- **XP counter:** the hero stat numbers count up on load, and the XP figure ticks like a cash total.
- **Mission-passed toasts:** a small popup appears the first time you reach each main section.
- **Minimap:** the fixed radar in the bottom-left corner (hidden on phones).
- **Pause-menu intro:** the "Player File" loading screen.

## Files

```
public/index.html   All page content (edit text here)
public/styles.css   Colours, layout and typography
public/app.js       Loading intro, mission accordions, skill bars, copy buttons
wrangler.jsonc      Cloudflare Worker config that serves public/
package.json        Dev and deploy scripts
```

## Running it locally

Open `public/index.html` directly in a browser, or run a local server:

```bash
npx serve public
```

To use Wrangler (matches the deployed setup):

```bash
npm install
npm run dev
```

## Changing the look

Most of the theme lives in a handful of values at the top of `public/styles.css`:

```css
--ink:#0a0b0b;      /* background */
--lime:#c4ea3f;     /* accent colour */
--paper:#f3f0e7;    /* text */
--display:Impact, …; /* headings font */
--sans:system-ui, …; /* body font */
```

Change `--lime` for a different accent. Swap `--display` for a webfont to soften or sharpen the headings.

## Common edits

- **Text and sections:** everything is in `public/index.html`, in order: hero card, ticker, profile, education ("mission log"), skills, work, awards, contact.
- **Skill bar lengths:** each `.stat` has `data-value="8"` — a number out of 10.
- **The portrait:** an inline SVG in the hero section of `index.html`. Replace the whole `<svg class="portrait">` block with an `<img src="photo.jpg" alt="…">` to use a real photo.
- **Mission log entries:** each `<article class="mission">` is one qualification. The first one is open by default; add `is-open` to another to change that.
- **Remove the intro animation:** delete the `<div class="loader">` block from `index.html`.

## Closer to the reel

The reel leans on hand-art-directed keyframes rather than one generated image. This build is intentionally made of vector art so it loads instantly and you can recolour it. To take it further:

1. **Replace the skyline** with real or AI-generated scene images. Drop them in `public/` as `day.jpg`, `dusk.jpg` and `night.jpg`, then in `styles.css` add a background-image to `.scene__sky` inside the `.scene.is-day`, `.scene.is-dusk` and `.scene.is-night` rules, and delete the `.scene__city` SVG wrapper from `index.html`.
2. **Keep one character block.** If you generate scene images, describe Farren the same way every time (pose, outfit, lighting) so the frames look like one shoot.
3. **Force a dark shadow in bright frames** — the reel's trick for keeping art style consistent in daylight. That's what `.scene__shade` does; keep it over any photo you add.
4. **Add more screens.** Each new full-bleed frame is just a `section` with a `.scene` block inside it. Copy the hero's markup and swap the background.

## Deploying

The site is set up for Cloudflare Workers static assets:

```bash
npm run deploy
```

Any static host works too (Netlify, Vercel, GitHub Pages) — just publish the `public/` folder.

## Notes

- Colour contrast and keyboard focus styles are in place. Please keep the `:focus-visible` rule if you restyle buttons.
- The `prefers-reduced-motion` block at the bottom of the CSS turns off the animations for visitors who ask for that.
- The footer says the site is not affiliated with Rockstar Games. Keep a similar disclaimer if you lean further into the GTA look.
