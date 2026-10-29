#!/usr/bin/env python3
"""Находит внешние картинки в *.html / *.js, переписывает их на локальные пути (img/...)
и пополняет список img/sources.tsv (локальный путь <TAB> исходный URL).
Скачивает картинки GitHub Action (.github/workflows/selfhost.yml)."""
import re, sys, hashlib, pathlib, urllib.parse
root = pathlib.Path(__file__).resolve().parent.parent
man = root / 'img' / 'sources.tsv'
src = {}
if man.exists():
    for ln in man.read_text().splitlines():
        if '\t' in ln:
            a, b = ln.split('\t', 1); src[a] = b

def uns(m):
    pid = m.group(1)
    loc = f'img/u/{pid}.jpg'
    src[loc] = f'https://images.unsplash.com/{pid}?w=900&q=72&fm=jpg&fit=max'
    return loc

def other(m):
    url = m.group(0)
    path = urllib.parse.urlparse(url).path
    ext = pathlib.PurePosixPath(urllib.parse.unquote(path)).suffix.lower() or '.jpg'
    if ext not in ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'): ext = '.jpg'
    loc = f'img/w/{hashlib.md5(url.encode()).hexdigest()[:10]}{ext}'
    src[loc] = url
    return loc

RX_U = re.compile(r'https://images\.unsplash\.com/(photo-[0-9a-f]+-[0-9a-f]+)(?:\?[^"\'\s)<>]*)?')
RX_O = re.compile(r'https://(?:upload\.wikimedia\.org|thumb\.wikimedia\.org|free-png\.ru|m\.dom-eda\.com|cdn2\.botanichka\.ru|helgalost\.github\.io/portfolio)/[^"\'\s)<>]+\.(?:jpe?g|png|gif|webp|JPE?G|PNG)')

for f in sorted(list(root.glob('*.html')) + list(root.glob('*.js'))):
    t = f.read_text()
    n = RX_O.sub(other, RX_U.sub(uns, t))
    if n != t:
        f.write_text(n); print('rewrote', f.name)

for pid in sys.argv[1:]:          # дополнительные id для новых страниц
    uns(re.match(r'(.*)', pid if pid.startswith('photo-') else 'photo-' + pid))

man.parent.mkdir(exist_ok=True)
man.write_text(''.join(f'{k}\t{v}\n' for k, v in sorted(src.items())))
print(len(src), 'images in manifest')
