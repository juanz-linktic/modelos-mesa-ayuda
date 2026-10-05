"""Copia el core compartido a cada sitio.

    py tools/sync_core.py        (Windows)
    python3 tools/sync_core.py   (macOS / Linux)

Cada carpeta de sites/ se despliega como un proyecto Vercel independiente,
y Vercel solo publica lo que está dentro de esa carpeta. Por eso el core no
se referencia desde fuera: se copia a sites/<sitio>/assets/.

Regla: el core se edita SOLO en core/. Las copias en sites/*/assets/core.*
se regeneran con este script y no se tocan a mano. El catálogo de cada sitio
(sites/<sitio>/assets/decks.js) sí es propio y este script no lo toca.
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CORE = os.path.join(ROOT, 'core')

# brand: carpetas de marca de core/ que se copian al sitio.
SITES = {
    'linktic':  {'brand': ['brand']},
    '3t':       {'brand': ['brand-3t']},
    'wimbu':    {'brand': []},
    'cymetria': {'brand': []},
}
ALL_BRANDS = ['brand', 'brand-3t']

for site, cfg in SITES.items():
    dest = os.path.join(ROOT, 'sites', site, 'assets')
    os.makedirs(dest, exist_ok=True)
    for name in ('core.css', 'core.js'):
        shutil.copyfile(os.path.join(CORE, name), os.path.join(dest, name))
    for b in ALL_BRANDS:
        bdest = os.path.join(dest, b)
        if os.path.isdir(bdest):
            shutil.rmtree(bdest)
        if b in cfg['brand']:
            shutil.copytree(os.path.join(CORE, b), bdest)
    print('%-9s core.css, core.js%s' % (site, ''.join(' + %s/' % b for b in cfg['brand'])))
