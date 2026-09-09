# HVAC Technical Services - website v3

Full rebuild of hvactechnicalgh.com, built overnight 9 Sep 2026 from the client's
company profile PDF (`../Reference/HVAC company prof_1_updt.pdf`), the live site,
and the earlier competitive research in `../research/`.

## Stack

Plain HTML + CSS + JS. No build step, no dependencies, no `node_modules`.
Open `index.html` in a browser, or drop the folder on any static host
(GitHub Pages, Netlify, cPanel, Vercel). Same deployment shape as Yakuver.

```
site-v3/
  index.html        Home
  about.html        About (Technical Director's letter, overview, vision/mission, values, standards)
  services.html     6 service lines + scope of service areas + FAQ
  work.html         Client logo wall, sector breakdown, on-site photo gallery
  contact.html      Contact details, WhatsApp quote form, Google Maps embed
  assets/css/main.css
  assets/js/main.js
  assets/img/       Team photos extracted from the profile PDF, logo, favicon
  assets/img/clients/  12 client logos cropped from the profile PDF at 300 DPI
```

## Preview locally

```bash
npx -y serve -l 5185 .
```
then open http://localhost:5185. (`serve` strips `.html` from URLs in preview; on a
normal host the `.html` links work as-is.)

## Live

https://gabsno.github.io/hvac-technical/ (repo Gabsno/hvac-technical, deploys from main via GitHub Actions)

## Design (v3.2, dark-first)

- Whole site lives in the brand navy (`#071426` / `#0b1e33`). Light blue `#b9d3ea` carries
  emphasis, orange `#e8782a` is reserved for the primary action. One theme, no inversion.
- Type: Outfit (display, mirrors the rounded geometric "hvac" letterforms) and Manrope
  (body), loaded from Google Fonts.
- Layout families on the home page: kinetic-type hero, logo marquee, offset manifesto,
  accordion services with a sticky image, sticky-heading process, five-cell bento,
  full-bleed photo band, the H-V-A-C acrostic, CTA footer.
- Motion: line-mask hero reveal, CSS scroll-driven parallax and step reveals
  (progressive, `@supports animation-timeline`), IntersectionObserver fallback,
  magnetic primary buttons, cross-page View Transitions. All gated by
  `prefers-reduced-motion`.
- Icons: Phosphor (regular) via unpkg CDN. Fonts: Google Fonts.
- v3.2 energy layer: rotating headline word, light-blue/orange glow and drifting
  particle canvas over the hero, pointer parallax, count-up numbers, the values
  section as a single orange colour block, a scroll-driven horizontal process pan
  (desktop, Chromium/Safari 26+; vertical stack elsewhere), pointer spotlight on
  tiles and cards, clip-path wipe reveals on large images.
- Logo: `assets/img/logo-dark.png` is the wordmark recoloured for navy backgrounds
  (white letters, original orange and light-blue arcs). `logo.png` is the source.
- The wall-mounted outdoor unit and the condenser bank are Unsplash photos; the
  rest of the photography is the client team from the profile PDF.

## Content sources

Everything factual comes from the profile PDF: intro letter (Mohammed Abdulai,
Technical Director), Experience / Integrity / Relationships, vision, mission,
H-V-A-C core values, five service lines, commercial key offerings, the 16 named
clients, phones (0599333103 / 0256701135), email, and address.

The v2 Next.js site's invented projects, stats and brand-partner claims were NOT
carried over.

## Things to confirm with the client before go-live

1. **Opening hours** - the contact page says "Mon to Sat, working hours" because the
   profile does not state hours. Replace with the real ones.
2. **System types list** on the services page (split, multi-split, cassette, ducted,
   VRF) - standard for the trade, but confirm they want all of them named.
3. **Old phone numbers** on the current WordPress site (0507732410, 0240866825) are
   not on the new site because the updated profile lists 0599333103 / 0256701135.
   Confirm which are live.
4. **Founding year** - the profile says "nearly a decade"; the site uses "~10 yrs"
   and avoids a specific year. Add one if they want it.
5. **Client logos** are cropped from the PDF (white backgrounds, ~150-300 px). Ask
   the client for original logo files for a crisper wall.
6. **Quote form** opens WhatsApp with the message pre-filled (no backend needed).
   If they prefer email delivery, point the form at Formspree/Resend.

## Go-live checklist

- Point `hvactechnicalgh.com` DNS at the new host and remove the WordPress site.
- Add a 1200x630 `assets/img/og.jpg` and update the `og:image` tags (they currently
  point at team photos, which work but are not the ideal crop).
- Submit `https://hvactechnicalgh.com/` to Google Search Console. JSON-LD
  `HVACBusiness` schema is already in `index.html`.
