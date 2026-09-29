# Train With Riwan — twr.coach

Bilingual site for Coach Riwan's private football training for young players in
Helsinki and Espoo. English: https://twr.coach/ · Finnish: https://twr.coach/fi/.
Website by [Keybridge](https://keybridge.krd/).

## Stack and local preview

Static HTML/CSS/JavaScript with no build step. GSAP 3, ScrollTrigger and Lenis
provide the existing scroll animations. Fonts: Anton and Archivo. Six TikTok
clips use local thumbnails; the selected iframe loads only after a click. Each
player also links directly to the selected TikTok video if embedding is blocked.

```bash
python3 -m http.server 4173
```

## Validation

```bash
python3 scripts/check_site.py
node --check js/main.js
```

The dependency-free check validates all six content pages: shared site identity
and credit, visible FAQ/schema parity, matching EN/FI video selections and source
links, local thumbnails, and readable counters when JavaScript is unavailable.

## Deployment

`wrangler.jsonc` configures the `1v1-helsinki` Cloudflare Worker to serve this
folder as static assets, including the existing 404 page. This replaces the old
README's GitHub Pages proxy instructions. The dashboard's deployment settings
and production routing must be checked there before changing infrastructure.
`.assetsignore` keeps Git/config files, this README, validation scripts and
maintenance review/source notes out of uploaded Worker assets.

## Search and answer-engine content

- FI: jalkapallon yksilövalmennus, yksityinen jalkapallovalmennus and
  jalkapallon taitovalmennus for young players in Helsinki and Espoo.
- EN: private football training and 1-on-1 coaching for ages 6–18.
- Shared `WebSite` and coach identities, localized visible service summaries,
  FAQ schema matching the page, canonical URLs and en/fi/x-default hreflang.
- Four existing guides, six-URL sitemap, robots.txt and llms.txt remain in place.
- The homepage video gallery is an `ItemList` of the visible TikTok sources.
  It is a coaching/booking page, not a dedicated video watch page. No video
  indexing or rich-result eligibility is claimed. TikTok oEmbed verified the
  selected author, titles and thumbnails but did not supply publication dates;
  no upload dates have been invented or carried over from the previous clips.

## Editing rules

Update both homepages when changing service facts or gallery clips. Any FAQ edit
must also update the matching FAQPage block word for word. Keep shared `WebSite`
languages as `["en", "fi"]` and the coach ID as `https://twr.coach/#coach`.

To refresh a gallery clip, verify it belongs to @trainwithriwan, download its
thumbnail from TikTok oEmbed (the remote links expire), and update the source
link, `data-tiktok-id`, image, caption and ItemList on both homepages. Use a new
ID-named asset; the older `t1.jpg`–`t6.jpg` files may still serve social metadata.
Record sources in `docs/`, which is excluded from Worker assets. This public
repository and its legacy GitHub Pages build do not provide private storage.

## Existing operational details

The booking form uses Web3Forms in `js/main.js`; keep the endpoint, form fields
and submission behavior intact. Contact: +358 41 318 5357 ·
trainwithriwan@gmail.com. No live form submission is needed for routine QA.

The existing €400/eight-session offer, free first session, retention claims,
coach biography and 48-hour response commitment remain coach-supplied facts;
this refresh does not independently revalidate them. The social preview image
remains the existing night-session thumbnail until a suitable branded landscape
image is available.

## Optional hero challenge

The English and Finnish homepages include a three-shot football challenge.
`css/hero-game.css` and `js/hero-game.js` are isolated from the existing site
animations and form code. Four native buttons support pointer, touch and
keyboard play. The game starts on request, pauses offscreen or in hidden tabs,
and uses a static goalkeeper with immediate feedback for reduced motion.
Without JavaScript, the illustration and a booking link remain.

The challenge adds no dependencies, sound, network requests, storage or tracking.
It is an engagement feature, not a measure of football ability or a claimed
search-ranking factor. Keep the main booking CTA before the game on mobile.

Validate gameplay state separately:

```bash
node --test scripts/test_hero_game.cjs
node --check js/hero-game.js
```
