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

The €400/eight-session offer, free first session and academy/injury biography
remain client-supplied information. The September copy update removed unsupported
retention statistics, fixed progress promises, regional price comparisons and the
48-hour response commitment. The social preview image
remains the existing night-session thumbnail until a suitable branded landscape
image is available.

## Optional hero games

The English and Finnish homepages include three optional football games. Shooting
is selected first. The accessible tab selector adds Dribbling and Reactions;
arrow keys, Home and End move between tabs. Every game starts only after Play.
`css/hero-game.css`, `js/hero-game.js` and `js/hero-games.js` are isolated from the existing site
animations and form code. On desktop, move the pointer to aim and click the pitch
to shoot. On touchscreens, pull back from the ball and release, or tap the goal
to aim and use Shoot. Keyboard users can focus the pitch, aim with arrow keys
and shoot with Enter or Space. Three progressively smaller targets are scored
against their position when the ball arrives, 650ms after launch. The game starts
on request and pauses offscreen or in hidden tabs. Reduced motion uses a static
target, the same accuracy radius, and immediate feedback. Only the 64px ball
handle captures touch gestures; the rest of the page scrolls normally.
Shooting targets shrink from 14 to 12 to 10 SVG units. Each new round has a
randomized, smooth movement path; target display and arrival scoring use the
same seed.

All three games include a Full screen control. Supported browsers use native
fullscreen; other browsers use a screen-filling modal with a visible exit.
Escape exits, focus returns to the opener, and booking links exit before
scrolling to the booking form. No game resets on entering or leaving.

Dribbling and Reactions are continuous score challenges. Select Easy, Normal or
Hard before Play or after game over. Modes stay locked while playing or paused.
Every ten correct points increases the level; three misses end a run. Scores can
continue beyond 100 with no fixed round limit. Try again resets score, level and
lives while retaining the selected mode.

Dribbling shows a continuous queue of cone gates, spaced 120 SVG units apart.
Drag the 64px ball handle horizontally, tap the pitch to position it, or use
left/right arrow keys. Each gate is scored once when it crosses the ball at
SVG y=280, then travels offscreen and is removed. The full 19-unit ball radius
must clear the gap. Two to four gate objects stay in memory, with at most an
84-unit lateral shift between consecutive gates. Normal starts at 115 units/sec
and a 185-unit gap. At 100 points it reaches about 301 units/sec and an 85-unit
gap. Easy starts at 90 units/sec and a 210-unit gap; Hard at 145 and 160.
Speed approaches a bounded maximum of 290/340/390 units/sec and gaps approach
78/64/58 units for Easy/Normal/Hard. This preserves preview time and ball clearance.

Reactions presents six stationary football targets. Tap the highlighted ball in
time; a wrong tap or timeout costs one life. Easy/Normal/Hard start with
1700/1400/1100ms deadlines and approach floors of 550/440/360ms. Normal is about
608ms at 100 points. A 160/140/120ms neutral interval prevents duplicate scoring.
Both games use a smooth exponential difficulty curve, updated at each ten-point
milestone, and continue increasing gradually beyond 100 points.
Keyboard start places focus in the game. Arrow keys move between reaction
buttons, and Enter/Space releases a response for the same turn. Pointer gestures
are bound to their starting turn, so held or secondary touches cannot consume a
later turn. The highlighted target has an
additional chevron as well as a lime outline. Only end/status text is announced,
not a rapidly changing countdown. Reduced motion removes decorative animation;
essential gate travel and reaction timing remain, with Pause always available.

All three games support Pause/Resume. Switching games immediately pauses the
outgoing round and cancels its frame request; returning offers Resume with the
same progress. Offscreen, hidden-document and page lifecycle events freeze active
time. Completed rounds require Try again and never restart automatically. No
hidden game schedules animation frames or timers. Touch scrolling remains
available outside each ball handle. Without JavaScript, only the original
shooting illustration and a booking link remain; the selector stays hidden.

The challenge adds no dependencies, sound, network requests, storage or tracking.
It is an engagement feature, not a measure of football ability or a claimed
search-ranking factor. Keep the main booking CTA before the game on mobile.

Validate gameplay state separately:

```bash
node --test scripts/test_hero_game.cjs scripts/test_hero_games.cjs
node --check js/hero-game.js
node --check js/hero-games.js
```
