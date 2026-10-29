#!/usr/bin/env python3
"""Скачивает картинки из img/sources.tsv и шрифты Google в репозиторий,
чтобы сайт работал там, где внешние сайты закрыты (например, школьная доска)."""
import pathlib, re, time, urllib.request
root = pathlib.Path(__file__).resolve().parent.parent
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 study-selfhost/1.0 (github.com/helgalost/study)'

def get(url, tries=4):
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8'})
            with urllib.request.urlopen(req, timeout=40) as r:
                return r.read()
        except Exception as e:
            print('  retry', k + 1, url[:90], e); time.sleep(3 * (k + 1))
    return None

bad = []
for ln in (root / 'img' / 'sources.tsv').read_text().splitlines():
    if '\t' not in ln: continue
    loc, url = ln.split('\t', 1)
    p = root / loc
    if p.exists() and p.stat().st_size > 500: continue
    data = get(url)
    if not data or len(data) < 500 or data[:15].lstrip().lower().startswith((b'<!doctype', b'<html')):
        bad.append(url); continue
    p.parent.mkdir(parents=True, exist_ok=True); p.write_bytes(data)
    print('ok', loc, len(data)); time.sleep(0.4)

# ---- шрифты ----
FAM = ('family=Inter:wght@400;500;600;700;800;900&family=Nunito:wght@900&family=Russo+One'
       '&family=Unbounded:wght@700;900&family=Fredoka:wght@500;700;900&display=swap')
fd = root / 'fonts'
if not (fd / 'fonts.css').exists():
    req = urllib.request.Request('https://fonts.googleapis.com/css2?' + FAM, headers={'User-Agent': UA})
    css = urllib.request.urlopen(req, timeout=40).read().decode()
    blocks = re.findall(r'/\* ([\w-]+) \*/\s*(@font-face\s*\{[^}]*\})', css)
    out = []
    for subset, block in blocks:
        if subset not in ('latin', 'cyrillic', 'cyrillic-ext', 'latin-ext'): continue
        url = re.search(r'url\((https://[^)]+)\)', block).group(1)
        fam = re.search(r"font-family: '([^']+)'", block).group(1).replace(' ', '')
        w = re.search(r'font-weight: (\d+)', block).group(1)
        name = f'{fam}-{w}-{subset}.woff2'
        if not (fd / name).exists():
            data = get(url)
            if not data: bad.append(url); continue
            fd.mkdir(exist_ok=True); (fd / name).write_bytes(data)
        out.append(f'/* {subset} */\n' + block.replace(url, name))
    (fd / 'fonts.css').write_text('/* Шрифты Google, сохранённые в репозитории */\n' + '\n'.join(out) + '\n')
    print('fonts:', len(out), 'faces')

if bad:
    print('НЕ СКАЧАЛОСЬ:'); [print(' ', u) for u in bad]
