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
  accordion services with a sticky image, numbered four-step process grid (no
  photography, by design - see the repeats note below), five-cell
  bento, full-bleed photo band, the H-V-A-C acrostic, CTA footer.
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
  section as a single orange colour block, pointer spotlight on tiles and cards,
  clip-path wipe reveals on large images.
- The process section used to be a scroll-driven horizontal pan: `.pan` was 320vh
  tall with a sticky inner, so the page stopped moving for better than two screens
  of scrolling while a row of four cards slid sideways. It was removed on
  1 Nov 2026 because it took the visitor's scrolling away from them for no gain —
  there are only four steps, and a 2x2 grid shows all of them at once. The classes
  are now `.process` / `.process__pad` / `.process__inner` / `.process__cards`, and
  each card is numbered by a CSS counter, since the row order was the only thing
  that used to carry the sequence. **Do not reintroduce a scroll pin here.**
- Logo: `assets/img/logo-dark.png` is the wordmark recoloured for navy backgrounds
  (white letters, original orange and light-blue arcs). `logo.png` is the source.
- Photography: the client sent a professional shoot on 1 Nov 2026 (10 frames, in
  `../New Images/`). It now carries the hero and every service, process and
  gallery slot. Those ten are `hero-crew`, `install-cassette`, `service-condensers`,
  `team-drawings`, `work-panel`, `tech-rooftop`, `work-ladder`, `plant-internals`,
  `panel-testing` and `panel-meter`. `service-fan` and `team-four` are still the
  older frames from the profile PDF, kept because the group portrait and the
  fan-repair shot have no equivalent in the new set.
  A second batch arrived the same evening: five candid phone photos from live
  jobs — `retail-ahu`, `retail-hoist`, `vrf-service`, `steel-frame`,
  `roof-channel`. They are lower quality than the commissioned shoot (960px or
  597px wide, some motion blur) so they stay in the work gallery, which now runs
  to 8 frames plus one photo per sector, rather than carrying a hero or a feature slot. What they add is
  what the shoot does not have: evidence of real jobs in a customer's building,
  including an air handling unit being swapped out inside a trading clothes shop.
  `steel-frame` looks at first glance like a mirrored image because the logo on
  the technician's back reads upside down — it is not mirrored, he is bent double.
  Do not "fix" it by flipping; that would reverse the letterforms.
  The hero is the black-and-white frame of two technicians walking away from
  camera: it is monochrome and has no faces, so it sits under the headline
  without competing with it, and both branded coveralls read clearly.
  Still stock: two sector interiors (`sector-offices`, `sector-restaurants`) and
  `outdoor-unit`. They depict a *kind of space* or a bare unit, which no frame in
  the client's sets does. Replace them if the client ever sends a residential
  install and interiors of finished jobs.
- **A sector link shows that sector, not all six.** The home page's tiles link
  here with a hash, and every one of them used to land on a page listing all six
  sectors — clicking "Apartments and homes" opened something showing offices,
  restaurants and the rest, so the destination never matched what was clicked.
  `main.js` now builds a filter row above the list and, when the page is reached
  with a sector hash, shows that sector on its own with the matching chip
  pressed. Choosing a chip swaps the sector and rewrites the hash through
  `replaceState`, so a filtered view can be linked to; arriving with no hash
  shows everything and leaves the URL alone. `hashchange` is handled, so the
  browser's back button works through the filters.
  The row is built in JavaScript on purpose: with scripting off, the markup is
  untouched and all six sectors are simply readable as before.
  Two traps in here. `.sector { display: grid }` outranks the user-agent
  stylesheet's `[hidden] { display: none }`, so setting the attribute changed
  nothing until `.sector[hidden] { display: none }` was added — and a test that
  reads the `hidden` *property* will report success while the page still shows
  everything, so check `getComputedStyle(el).display` instead. And the browser
  performs its own fragment jump after the document loads, which lands past the
  heading and undoes any scrolling done earlier; the scroll that puts the
  heading and the filter row on screen has to run on `load`, inside a
  `requestAnimationFrame`, to come last.
- **Every sector on the work page carries its own photograph**, and the bento
  tiles that link to them do too. Before this, all six sector anchors landed on
  a short text block with the same undifferentiated gallery filling the screen
  below, so `work.html#retail` and `work.html#offices` looked identical. The
  frames were *moved out of* the gallery rather than added on top of it, so the
  photo count did not change and nothing appears twice: `retail-hoist` to
  retail, `panel-testing` to offices, `steel-frame` to public bodies,
  `vrf-service` to hospitality, `roof-channel` to industrial, `work-ladder` to
  residential. The gallery went 14 frames to 8.
  Only retail has photography that genuinely shows its *kind of building* (both
  frames are inside a trading clothes shop). The other five show the crew doing
  the work the copy describes, and their alt text says so rather than claiming a
  venue. Real photographs of a bank, a restaurant and a residential install are
  the gap worth closing.
- **Each of the five sector tiles owns its photo outright** — `retail-ahu`,
  `sector-offices`, `sector-restaurants`, `plant-internals` and `outdoor-unit`
  each appear exactly once on the whole site, on their own tile. Two of them used
  to double as service imagery, which made the tiles feel like reruns of pictures
  you had already scrolled past: the home accordion's Supply row took
  `vrf-service` instead of `outdoor-unit`, the services page's Supply figure took
  `retail-hoist` instead of `plant-internals`, and the work gallery dropped
  `retail-ahu` and `plant-internals`. If you add a tile photo somewhere else
  later, pick a different frame instead.
- **No photograph appears twice on the same page.** Not once, anywhere. An
  earlier pass settled for "no more than twice per page" and that was the wrong
  bar — a visitor notices the second showing immediately.
  The arithmetic is why it kept coming back: the home page had **18 image slots
  and there are 17 photographs**, three of them too small (597px and 709px wide)
  to fill a large slot without going soft. Something always had to repeat. The
  four process cards gave up their background photographs to close the gap —
  they already carry the orange 01–04 numerals, and a quieter typographic step
  list reads better between a photo-led accordion and a photo-led bento anyway.
  The commercial band moved to `panel-meter`, which the accordion does not use.
  Home page: 14 slots, 14 different photographs.
  If the client sends more photography, the process cards are the obvious place
  to put it back — the markup only needs an `<img>` returning to each `.pcard`.
  One pair is deliberately the same file and is *not* a repeat: the accordion's
  inline panel image and its sticky frame image. `.svc__panel img` is
  `display: none` above 959px and `.svc__media` is hidden below it, so exactly
  one of the two ever renders. Count what is rendered, not what is in the
  markup — `scratchpad/dupes.js` does this by walking `document.images`,
  skipping anything with no `offsetParent`, and resolving `currentSrc`.
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

A grid trap worth knowing about, because it hid most of a section for weeks.
`.bento` only defines `grid-template-areas` above 720px, but the five
`.tile--*` rules that set `grid-area: retail` and friends were written outside
that query. Below 720px those area names do not exist, so `grid-area: retail`
resolved to line names that were never defined, all five tiles landed in the
same implicit cell, and the bento collapsed to a single 254px tile — four of the
five sectors were invisible on every phone, with only the last one painted on
top. Nothing errored and every tile still reported a sensible
`getBoundingClientRect()`; they simply all reported the *same* one, which is why
sorting them by position looked correct. `document.elementFromPoint` on the
middle of a tile is what caught it. The `grid-area` rules now live inside the
same `@media (min-width: 720px)` block as the areas they reference — keep them
together.

## Mobile audit, 1 Nov 2026

A sweep of all six pages at 390px after the bento bug, looking for faults of the
same kind: things that do not throw, do not overflow and do not show up in a
screenshot you are not staring at. What it found and what was done:

- **The floating WhatsApp button sat on top of form controls.** It is fixed to
  the bottom-right corner, and on a phone that corner lands on a text input, a
  select and the textarea on *both* the sizer and the contact form — tapping the
  right-hand edge of one of those opened WhatsApp instead of the field. `main.js`
  now hides it while a `form` or `.builder` is on screen. Nothing is lost: both
  forms end in their own WhatsApp action. Verified by hit-testing three points on
  the button every 300px down each page: sizer went from 8 covered elements
  (4 interactive) to 0, contact from 6 (3 interactive) to 1 non-interactive.
  It still clips the corner of a bento tile and of one accordion row's plus icon
  on the pages that have no form; those are large targets and the rest of each
  one still works, so it was left alone.
- **Fragment links landed under the fixed bar.** `#main` — the "Skip to content"
  link, on all six pages — put the top of `<main>` 60px beneath the bar, and
  `sizer#quote` was 72px under, i.e. completely hidden. A `:target` rule now
  carries a default `scroll-margin-top`, declared before the per-component rules
  so `.entry`, `.sector` and `.form` keep their own.
- **Tap targets.** The sizer's room checkboxes were 16px, and the contact page's
  phone and email links — the whole point of that page on a phone — were 30px
  tall. Checkbox rows are now 44px with the whole label as the target, the delete
  button went 34px to 40px, contact rows are 44px, and standalone text links get
  44px under `@media (pointer: coarse)` only, so desktop spacing is untouched.
  Flagged elements per page went 10/3/2/2/7/7 down to 1/1/1/1/4/1.

Checked and found to be fine, so do not go chasing them again: the `.hero` and
`.band` sections report `scrollHeight > clientHeight`, but that is the oversized
parallax photo layer and the lowest line of text sits 43px and 111px clear of the
bottom; the zero-height `div`s inside `.svc__panel` are the five closed accordion
rows; `a.sr-only` reporting as clipped is the screen-reader skip link, which is
meant to be 1px; and the footer legal line is not cut off, that was a frame
boundary in the filmstrip the audit screenshots were composed into.

One trap worth repeating, because it wasted a cycle here. If you hit-test the
floating button with `elementsFromPoint` to prove it covers nothing, handle the
case where it is *hidden*: it drops out of hit-testing, `indexOf` returns -1, and
`slice(-1 + 1)` hands back the whole stack, so every field underneath gets
reported as covered and the fix looks like it did nothing.

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
does not actually have, or the browser picks the wrong tier. The five candid job
photos also carry a 450w tier, because a gallery tile is only 47vw on a phone and two
of those frames are 597px wide, so without it mobile pulled the whole file for a
thumbnail; a tier within 10% of the file's own width is skipped instead, since a
950w beside a 960w original is the same picture twice. The five closed rows of
the services accordion carry `data-src` and are fetched only when their row is opened.
Originals live in `assets/img/_original/` and are not served.

Measured in headless Edge, cold cache, counting every response body including
third-party. Home page on mobile (390px, DPR2):

| | initial load | full read |
|---|---|---|
| Start of the first session | 1626 KB | 3409 KB |
| After the optimisation pass | 310 KB | 888 KB |
| With the client's new photos | **212 KB** | **937 KB** |
| | -87% | -73% |

The new photography made the *initial* load lighter, not heavier: the monochrome
hero compresses to 10 KB at 700w where the old colour hero cost about 100 KB. The
full read went up slightly against the previous pass only because fixing the
bento grid bug means a phone now actually renders all five sector tiles instead
of collapsing them into one.

Third-party origins went from four (unpkg, fonts.googleapis, fonts.gstatic,
images.unsplash) to none. The only remaining external request anywhere on the site is the
Google Maps iframe on the contact page.

| | initial load | full read |
|---|---|---|
| Home, mobile 390px DPR2 | **218 KB** | **943 KB** |
| Home, desktop 1440px | **310 KB** | **887 KB** |
| Work (6 sector photos + 8-photo gallery), mobile | 350 KB | 1155 KB |
| Services, mobile | 368 KB | 522 KB |
| About, mobile | 222 KB | 386 KB |
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
