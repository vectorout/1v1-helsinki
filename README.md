# Train With Riwan — twr.coach

Scroll-animated bilingual one-pager for Coach Riwan's private 1v1 football
coaching in Helsinki ([@trainwithriwan](https://www.tiktok.com/@trainwithriwan)).
Free-first-session funnel: hero promise → method → TikTok proof → booking form.

Built by [RMR Agency](https://rmr.agency). Preview: https://vectorout.github.io/1v1-helsinki/ (EN) · [/fi/](https://vectorout.github.io/1v1-helsinki/fi/) (FI).

## Stack

Static site, no build step. GSAP 3 + ScrollTrigger (pinned horizontal "method"
section, scrubbed word reveal, counters, TikTok tile cascade) and Lenis smooth
scroll, all via CDN. Fonts: Anton + Archivo. TikTok clips are click-to-play
facades — self-hosted thumbs in `assets/tiktok/`, iframe loads only on click.

## Run locally

```bash
python3 -m http.server 4173
```

## SEO targeting

- **FI (primary):** yksityinen jalkapallovalmentaja · jalkapallon taitovalmennus ·
  jalkapallovalmennus nuorille / junioreille · Helsinki. Carried by the FI title,
  description, FAQ (incl. the ages question), schema `knowsAbout`, footer line.
- **EN (expat parents):** private football coach Helsinki · 1-on-1 football
  coaching for young players.
- Entity wiring: `LocalBusiness`+`SportsActivityLocation` with founder Person
  "Coach Riwan", `sameAs` → TikTok, 6 `VideoObject`s per language, FAQ schema
  mirroring on-page text exactly, hreflang en/fi/x-default, canonical → twr.coach.

## DOMAIN STATUS (launched 2026-08-04)

twr.coach is live via a **Cloudflare proxy** in front of the GitHub Pages
origin (Pages itself has no custom domain configured — the proxy rewrites
host/path). All paths verified serving: `/`, `/fi/`, assets, robots, sitemap,
404s. `noindex` removed from both pages the same day.

Caveats of the proxy setup:
- Content updates pass through Cloudflare's cache (`max-age=0, must-revalidate`
  → normally instant; if a deploy looks stale, purge cache in Cloudflare).
- Optional cleaner alternative: set the custom domain in GitHub Pages
  (creates CNAME file) + Cloudflare DNS-only CNAME → `vectorout.github.io`.
  Only do this deliberately — it changes how the proxy must be configured.

## POST-LAUNCH SEO

1. **Google Search Console**: add twr.coach (domain property), submit
   `https://twr.coach/sitemap.xml`.
2. Google **Business Profile** for "Train With Riwan" (service-area business,
   Helsinki) — biggest local-pack lever for "jalkapallovalmentaja helsinki".
3. Link twr.coach in the TikTok bio (entity loop: site ⇄ TikTok).

## Remaining checklist

- [ ] **Form endpoint** — create a [Formspree](https://formspree.io) form (use
  trainwithriwan@gmail.com), put the ID in `FORM_ENDPOINT` in `js/main.js`
- [ ] **Coach reviews FI copy** — headlines use spoken register ("Anna mulle",
  "Susta tulee") on purpose
- [ ] **Verify claims** — "100% of trial players stayed 3+ months" and "reply
  within 48 h" are the coach's claims; confirm before indexing
- [ ] **og:image** — currently the night-session TikTok thumb (vertical); replace
  with a 1200×630 action shot when one exists
- [x] Media — 6 TikTok facades; to swap a clip: link + `data-tiktok-id` in BOTH
  html files, fresh thumb via `https://www.tiktok.com/oembed?url=<video url>`
  (thumb links expire — download, never hotlink), update both VideoObject blocks
- [x] Phone/email wired: +358 41 318 5357 · trainwithriwan@gmail.com

## Editing rule

Copy changes go in **both** `index.html` and `fi/index.html`, and any FAQ change
must also update the matching FAQPage schema block in the same file — schema and
on-page text must stay word-for-word identical.
