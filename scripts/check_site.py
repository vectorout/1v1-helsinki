#!/usr/bin/env python3
"""Validate public page metadata, FAQ parity and click-to-load video facades."""
import json
import re
import sys
from html import unescape
from pathlib import Path

ROOT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]
ERRORS = []

def check(condition, message):
    if not condition:
        ERRORS.append(message)

def plain(value):
    return ' '.join(unescape(re.sub(r'<[^>]+>', '', value)).split())

pages = [ROOT / 'index.html', ROOT / 'fi/index.html', *sorted((ROOT / 'guides').glob('*/index.html')), *sorted((ROOT / 'fi/oppaat').glob('*/index.html'))]
check(len(pages) == 6, 'Expected six canonical content pages')
video_sets = []
for path in pages:
    label = str(path.relative_to(ROOT))
    html = path.read_text()
    graphs = [json.loads(s) for s in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)]
    nodes = [n for g in graphs for n in g.get('@graph', [g])]
    websites = [n for n in nodes if n.get('@type') == 'WebSite']
    check(len(websites) == 1, f'{label}: one WebSite required')
    for site in websites:
        check(site.get('inLanguage') == ['en', 'fi'], f'{label}: shared WebSite languages')
        check(site['creator']['url'] == 'https://keybridge.krd/', f'{label}: creator URL')
        check(site['publisher']['@id'] == 'https://twr.coach/#coach', f'{label}: publisher identity')
    check('bond.krd' not in html, f'{label}: obsolete credit')
    check('https://twr.coach/fi/#coach' not in html, f'{label}: duplicate coach identity')
    faqs = [n for n in nodes if n.get('@type') == 'FAQPage']
    questions = [plain(q) for q in re.findall(r'<button class="faq-q"[^>]*>(.*?)</button>', html, re.S)]
    answers = [plain(a) for a in re.findall(r'<div class="faq-a"[^>]*>(.*?)</div>', html, re.S)]
    structured = [(q['name'], q['acceptedAnswer']['text']) for f in faqs for q in f['mainEntity']]
    check(list(zip(questions, answers)) == structured, f'{label}: visible FAQ differs from schema')
    for value, text in re.findall(r'class="stat-num" data-count="(\d+)">(.*?)</span>', html):
        check(value == text, f'{label}: no-JS counter is not its final value')
    tiles = re.findall(r'<a class="tile-media" href="([^"]+)" data-tiktok-id="(\d+)"[^>]*>\s*<img src="([^"]+)"', html)
    check(not any(n.get('@type') == 'VideoObject' for n in nodes), f'{label}: watch-page video markup is not appropriate for this gallery')
    videos = [v for n in nodes if n.get('@type') == 'ItemList' for v in n['itemListElement']]
    check(len(videos) == len(tiles), f'{label}: video schema/facade count mismatch')
    if tiles:
        check(len(tiles) == 6, f'{label}: expected six video tiles')
        check('class="tt-source"' in html, f'{label}: missing visible source fallback')
        check('<iframe' not in html and 'tiktok.com/embed.js' not in html, f'{label}: video loaded before click')
        video_sets.append([i for _, i, _ in tiles])
        for (url, ident, thumbnail), video in zip(tiles, videos):
            check(url == f'https://www.tiktok.com/@trainwithriwan/video/{ident}', f'{label}: wrong source link for {ident}')
            check(video['url'] == url and video['position'] == tiles.index((url, ident, thumbnail)) + 1, f'{label}: wrong schema video {ident}')
            check((path.parent / thumbnail).is_file(), f'{label}: missing thumbnail {thumbnail}')
            check(video['name'] in unescape(html), f'{label}: video title absent from visible content {ident}')
        check(len(set(video_sets[-1])) == 6, f'{label}: duplicate video')
check(len(video_sets) == 2 and video_sets[0] == video_sets[1], 'EN/FI video selection mismatch')
ignore = (ROOT / '.assetsignore').read_text().splitlines()
check('scripts' in ignore and 'docs' in ignore, 'Validation scripts and maintenance docs must be excluded from Worker assets')
if ERRORS:
    print('\n'.join('FAIL: ' + e for e in ERRORS))
    sys.exit(1)
print(f'PASS: {len(pages)} pages; FAQ/schema parity; shared entities; six matching video facades per language; assets; no-JS counters')
