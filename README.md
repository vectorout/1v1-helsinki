# 1v1 Helsinki

Scroll-animated one-page site for a private 1v1 football coach in Helsinki.
Free-first-session funnel: hero promise → method → proof → booking form.

Built by [RMR Agency](https://rmr.agency).

## Stack

Static site, no build step. GSAP 3 + ScrollTrigger (pinned horizontal "method"
section, scrubbed word reveal, counters) and Lenis smooth scroll, all via CDN.
Fonts: Anton + Archivo (Google Fonts). Deploys anywhere — built for GitHub Pages.

## Run locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173

## Launch checklist (all placeholders are marked on-page with a volt "ADD …" tag)

- [x] **Media** — 6 TikTok clips from [@trainwithriwan](https://www.tiktok.com/@trainwithriwan) as click-to-play facades (self-hosted thumbs in `assets/tiktok/`, lightbox player). The TikTok iframe loads **only on click** — fast page and no third-party trackers before user action (EU-friendly, no consent banner needed for passive visits). To swap a clip: change the link + `data-tiktok-id` in BOTH html files, fetch the new thumb via `https://www.tiktok.com/oembed?url=<video url>` (thumbnail links expire — always download, never hotlink), compress to ~720px wide, and update the matching VideoObject in both schema blocks.
- [ ] **Coach photo** — portrait placeholder removed by request; the coach section is text-only. Re-add a figure if he ever gets a proper action shot.
- [ ] **Phone + email** — `#book` section and the LocalBusiness JSON-LD in `index.html`
- [ ] **Form endpoint** — create a [Formspree](https://formspree.io) form, put the ID in `FORM_ENDPOINT` in `js/main.js`
- [ ] **Brand** — "1V1 Helsinki" is a working name; swap if the coach wants his own name up
- [ ] **Verify claims** — "100% of trial players stayed 3+ months" and "reply within 48 h" are the coach's claims; confirm before launch
- [ ] **Domain** — point the real domain, then in `index.html`: **remove `noindex`**, add `<link rel="canonical">`, `og:url`, and an `og:image` (1200×630 action shot)
- [ ] **SEO swaps at launch** — real domain in `sitemap.xml` + `robots.txt`, home link in `404.html` (`/1v1-helsinki/` → `/`), phone/email in the JSON-LD
- [ ] **Media alt text** — every clip/photo that replaces a placeholder ships with descriptive `alt`/`aria-label` (e.g. "Coach defending a 1v1 drill in Helsinki")
- [ ] **Finnish version** — live at `/fi/`, hreflang-paired both ways (x-default → EN). Have the coach read the Finnish copy once; headlines use spoken register ("Anna mulle", "Susta tulee") on purpose. Any copy change must be made in BOTH `index.html` and `fi/index.html` (and their FAQ schema blocks, which must mirror on-page text exactly)

## Notes

- The GitHub Pages preview is intentionally `noindex` so it never competes with the real domain.
- Media placeholders are styled frames — drop `<img>`/`<video>` straight into `.media-ph` containers.
