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
  sizer.html        AC size calculator, the one real tool on the site
  work.html         Client logo wall, sector breakdown, on-site photo gallery
  contact.html      Contact details, WhatsApp quote form, Google Maps embed
  assets/css/main.css
  assets/js/main.js
  assets/img/       The client's 1 Nov 2026 photo shoot, two older frames from the
                    profile PDF, three stock sector interiors, logo, favicon
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
- Layout families on the home page: kinetic-type hero, clients rail, offset manifesto,
  accordion services with a sticky image, sticky-heading process, five-cell bento,
  full-bleed photo band, the H-V-A-C acrostic, CTA footer.
- Motion: line-mask hero reveal, CSS scroll-driven parallax and step reveals
  (progressive, `@supports animation-timeline`), IntersectionObserver fallback,
  magnetic primary buttons, cross-page View Transitions. All gated by
  `prefers-reduced-motion`.
- Icons: the five Phosphor glyphs actually used (arrow-right, whatsapp-logo, plus, x,
  list) are inlined as SVG. No icon CDN, no webfont. They size from the `font-size` of
  their container via `.icon { width: 1em; height: 1em }`.
- Fonts: Outfit and Manrope are self-hosted as variable woff2 in `assets/fonts/`, latin
  and latin-ext subsets, declared over their real weight ranges (500-700 and 400-700) so
  every weight is a true instance rather than synthetic bold. The two latin files are
  preloaded. No Google Fonts request, so no visitor IP reaches Google.
- v3.2 energy layer: rotating headline word, light-blue/orange glow and drifting
  particle canvas over the hero, pointer parallax, count-up numbers, the values
  section as a single orange colour block, a scroll-driven horizontal process pan
  (desktop, Chromium/Safari 26+; vertical stack elsewhere), pointer spotlight on
  tiles and cards, clip-path wipe reveals on large images.
- Logo: `assets/img/logo-dark.png` is the wordmark recoloured for navy backgrounds
  (white letters, original orange and light-blue arcs). `logo.png` is the source.
- Photography: the client sent a professional shoot on 1 Nov 2026 (10 frames, in
  `../New Images/`). It now carries the hero and every service, process and
  gallery slot. Those ten are `hero-crew`, `install-cassette`, `service-condensers`,
  `team-drawings`, `work-panel`, `tech-rooftop`, `work-ladder`, `plant-internals`,
  `panel-testing` and `panel-meter`. `service-fan` and `team-four` are still the
  older frames from the profile PDF, kept because the group portrait and the
  fan-repair shot have no equivalent in the new set.
  The hero is the black-and-white frame of two technicians walking away from
  camera: it is monochrome and has no faces, so it sits under the headline
  without competing with it, and both branded coveralls read clearly.
  Still stock: the three sector interiors (`sector-retail`, `sector-offices`,
  `sector-restaurants`) and `outdoor-unit`. They depict a *kind of space* or a
  bare unit, which no frame in the new set does. Replace them if the client ever
  sends a residential install and interiors of jobs they have done.
  **The new frames arrived over WhatsApp, so they are already recompressed and
  capped at 1600px on the long edge.** That is why the hero tops out at 1600w
  rather than 1920w. Ask the client for the photographer's originals and re-run
  the encode for a sharper hero.
- v3.3 motion pass: section headings arrive a word at a time (JS wraps each word,
  the wrapper is the mask, the existing `.reveal` observer triggers it); the FAQ
  eases open instead of snapping; the bar shrinks 72px to 60px once the page moves
  and a single indicator slides between nav items; a scroll-progress hairline sits
  at the top; bento and process cards lean towards the pointer; the commercial band
  drifts as it passes; a light sweeps the primary button on hover; the form lifts
  towards the focused field.

- The clients strip still drifts on its own, but it is now a native
  `overflow-x` scroller rather than a CSS transform, so the visitor can take
  over at any moment: swipe on touch, two-finger on a trackpad, arrow keys, or
  the two buttons that fade in on hover. It pauses while hovered, focused or
  being touched, and picks the drift back up a couple of seconds later. The
  logo set is duplicated in the markup so the loop has no seam, with the second
  pass `aria-hidden` so screen readers hear 12 clients, not 24. Logos are full
  colour, here and on the about/work grids.
- The sizer has its own page (`sizer.html`, "AC sizer" in the nav) because it is
  a draw in its own right: "what size AC do I need" is a real search, and it is a
  link that can be pasted into WhatsApp on its own. The home page carries a promo
  card to it and the services page ends with a pointer, so there are three ways in
  from anywhere on the site. It was previously buried at the bottom of services,
  where nobody would have found it.
- The sizer is a room-by-room quotation builder, not a single-shot calculator.
  Add up to twelve rooms, each with its own name and figures and its own result;
  the panel beside it keeps a running total, a tally of units ("2 x 1.5 HP,
  1 x 6 HP") and a suggested approach. Then name, phone and the rest go in and
  the whole thing leaves as one itemised WhatsApp message, or the same body as
  an email. Name and phone are required before it will send. Past 30,000 BTU a
  room reports its figure as capacity rather than a single unit, because nobody
  hangs one 6 HP box on a shop wall.
- The sizing maths: floor area, use, sun, occupancy and two
  checkboxes give an indicative BTU/hr and the nearest HP, ending in a WhatsApp
  message with the figures already written out. 600 BTU/hr per square metre is
  the tropical starting point, adjusted for use, sun, glazing, roof above and
  bodies in the room, then matched to the capacities actually sold in Ghana
  (1 HP = 9,000 BTU up to 6 HP = 60,000). Above 30,000 it stops recommending a
  wall split. It is deliberately framed as a guide, not a specification, because
  a real figure needs a heat-load calculation on site.

Three things to know if you touch the motion.

`scrollLeft` stores whole pixels only. The rail's drift keeps its real position
in a float alongside the element and writes that in; read the value back off the
element and add to it instead, and on a fast display each sub-pixel step rounds
straight off again and the strip sits still.

 The FAQ panel lives inside
`<details>`, which is not rendered while closed, so the height has no computed
value to ease from: `main.js` forces a layout flush (`void body.offsetHeight`)
between the start and end values. Remove it and the panel jumps. And a closed
`<details>` keeps a remembered box size, so `getBoundingClientRect()` cannot tell
open from closed; hit-test with `elementFromPoint` instead.

## Performance

All photography is WebP, sized to its actual display context, with a 700 / 950 / full
ladder in `srcset` and a `sizes` attribute measured from the real rendered width at
1440px and 390px. The top tier's `w` descriptor is the file's real width (1600 for
landscape frames, 1068 for portrait) — do not leave it at a round number the file
does not actually have, or the browser picks the wrong tier. The five closed rows of
the services accordion carry `data-src` and are fetched only when their row is opened.
Originals live in `assets/img/_original/` and are not served.

Measured in headless Edge, cold cache, counting every response body including
third-party. Home page on mobile (390px, DPR2):

| | initial load | full read |
|---|---|---|
| Start of the first session | 1626 KB | 3409 KB |
| After the optimisation pass | 310 KB | 888 KB |
| With the client's new photos | **211 KB** | **881 KB** |
| | -87% | -74% |

The new photography made the page *lighter*, not heavier: the monochrome hero
compresses to 10 KB at 700w where the old colour hero cost ~100 KB.

Third-party origins went from four (unpkg, fonts.googleapis, fonts.gstatic,
images.unsplash) to none. The only remaining external request anywhere on the site is the
Google Maps iframe on the contact page.

| | initial load | full read |
|---|---|---|
| Home, mobile 390px DPR2 | **211 KB** | **881 KB** |
| Home, desktop 1440px | **371 KB** | **821 KB** |
| Work (11-photo gallery), mobile | 358 KB | 752 KB |
| Services, mobile | 368 KB | 523 KB |
| About, mobile | 222 KB | 385 KB |
| Sizer, mobile | 164 KB | 164 KB |
| Contact, mobile | **1938 KB** | 1977 KB |

**The contact page is the one outlier, and it is entirely the Google Maps iframe**
(~1.8 MB of Google's own JS and tiles). It already carries `loading="lazy"`, but the
map sits inside Chromium's lazy-load threshold on a phone, so it loads anyway. If that
matters, swap the iframe for a click-to-load placeholder — the street address and an
"Open in Google Maps" link are already on the page, so nothing is lost.

The unpkg icon webfont was 220 KB for five glyphs. Self-hosting the fonts saved only about
13 KB of bytes, but removed two third-party origins from the critical path: the browser no
longer does DNS and TLS to fonts.googleapis.com, waits for a stylesheet, then does DNS and
TLS again to fonts.gstatic.com before a single glyph arrives.

Regenerate with the scripts in the scratchpad (`optimize.js`, `responsive.js`), which drive
Chromium's canvas encoder: neither ImageMagick nor sharp is installed on this machine.

## Content sources

Everything factual comes from the profile PDF: intro letter (Mohammed Abdulai,
Technical Director), Experience / Integrity / Relationships, vision, mission,
H-V-A-C core values, five service lines, commercial key offerings, the 16 named
clients, phones (0599333103 / 0256701135), email, and address.

The v2 Next.js site's invented projects, stats and brand-partner claims were NOT
carried over.

## Search and sharing

`sitemap.xml`, `robots.txt`, `favicon.ico`, `apple-touch-icon.png` and a 1200x630
`assets/img/og.jpg` share card are in place. The card is generated from the real logo and
crew photo by `brandassets.js`. Sitemap and canonical URLs point at hvactechnicalgh.com,
so they are correct the moment DNS moves.

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
5. **Client logos** are cropped from the PDF. Ask the client for original logo files for a
   crisper wall.
5b. **Photographer's originals** of the 1 Nov shoot — what we have came through
   WhatsApp at 1600px and is already recompressed. The hero is the frame that would
   benefit most.
5c. **A residential install and some finished interiors.** The three sector tiles and
   the `outdoor-unit` frame are the last stock images on the site; one afternoon with
   a camera at a finished job would retire them.
6. **Quote form** opens WhatsApp with the message pre-filled (no backend needed).
   If they prefer email delivery, point the form at Formspree/Resend.

## Go-live checklist

- Point `hvactechnicalgh.com` DNS at the new host and remove the WordPress site.
- Add a 1200x630 `assets/img/og.jpg` and update the `og:image` tags (they currently
  point at team photos, which work but are not the ideal crop).
- Submit `https://hvactechnicalgh.com/` to Google Search Console. JSON-LD
  `HVACBusiness` schema is already in `index.html`.
