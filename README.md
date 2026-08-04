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

- [ ] **Coach photo** — hero/about action shot (`.coach-media`), ideally defending a player
- [ ] **6 media tiles** — 3 training clips (coach defending), 3 match clips of players (`#proof`)
- [ ] **Phone + email** — `#book` section and the LocalBusiness JSON-LD in `index.html`
- [ ] **Form endpoint** — create a [Formspree](https://formspree.io) form, put the ID in `FORM_ENDPOINT` in `js/main.js`
- [ ] **Brand** — "1V1 Helsinki" is a working name; swap if the coach wants his own name up
- [ ] **Verify claims** — "100% of trial players stayed 3+ months" and "reply within 48 h" are the coach's claims; confirm before launch
- [ ] **Domain** — point the real domain, add `canonical` + `og:image`, and **remove the `noindex` meta tag** in `index.html`
- [ ] Consider a Finnish version (`/fi/`) once content is final

## Notes

- The GitHub Pages preview is intentionally `noindex` so it never competes with the real domain.
- Media placeholders are styled frames — drop `<img>`/`<video>` straight into `.media-ph` containers.
