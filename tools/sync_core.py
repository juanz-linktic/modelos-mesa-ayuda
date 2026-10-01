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

# brand=True copia también los logos y fondos de LinkTIC.
SITES = {
    'linktic':  {'brand': True},
    '3t':       {'brand': False},
    'wimbu':    {'brand': False},
    'cymetria': {'brand': False},
}

for site, cfg in SITES.items():
    dest = os.path.join(ROOT, 'sites', site, 'assets')
    os.makedirs(dest, exist_ok=True)
    for name in ('core.css', 'core.js'):
        shutil.copyfile(os.path.join(CORE, name), os.path.join(dest, name))
    brand_dest = os.path.join(dest, 'brand')
    if cfg['brand']:
        if os.path.isdir(brand_dest):
            shutil.rmtree(brand_dest)
        shutil.copytree(os.path.join(CORE, 'brand'), brand_dest)
    elif os.path.isdir(brand_dest):
        shutil.rmtree(brand_dest)
    print('%-9s core.css, core.js%s' % (site, ' + brand/' if cfg['brand'] else ''))
