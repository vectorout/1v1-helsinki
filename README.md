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

## LAUNCH RUNBOOK (twr.coach)

All page metadata (canonical, hreflang, og:url, schema, sitemap, robots) already
points at twr.coach. Remaining steps, in order:

1. **DNS** at the registrar for `twr.coach`: four A records
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   (+ AAAA `2606:50c0:8000::153` …`8003::153` if IPv6 wanted). Optional
   `www` CNAME → `vectorout.github.io`.
2. **CNAME file**: `echo "twr.coach" > CNAME`, commit, push. (Do this only
   after DNS — earlier and the github.io preview starts redirecting nowhere.)
3. Repo Settings → Pages → verify custom domain shows twr.coach, tick
   **Enforce HTTPS** once the cert issues (~minutes).
4. Remove `<meta name="robots" content="noindex">` from **both**
   `index.html` and `fi/index.html`.
5. **Google Search Console**: add twr.coach (domain property), submit
   `https://twr.coach/sitemap.xml`.
6. Google **Business Profile** for "Train With Riwan" (service-area business,
   Helsinki) — biggest local-pack lever for "jalkapallovalmentaja helsinki".

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
