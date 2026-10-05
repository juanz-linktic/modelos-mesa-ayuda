"""Copia el core compartido a cada sitio, con solo la marca de ese sitio.

    py tools/sync_core.py        (Windows)
    python3 tools/sync_core.py   (macOS / Linux)

Cada carpeta de sites/ se despliega como un proyecto Vercel independiente,
y Vercel solo publica lo que está dentro de esa carpeta. Por eso el core no
se referencia desde fuera: se copia a sites/<sitio>/assets/.

En core/core.css (y core.js, si los tuviera) lo propio de cada marca va
entre marcadores:

    /* @brand tres-t */
    ...reglas solo de 3T...
    /* @end */

Al copiar, cada sitio recibe la base común más los bloques de SU marca; los
bloques de otras marcas se eliminan. Así el código publicado para un cliente
no contiene logos, colores, tipografías ni nombres de otro.

Regla: el core se edita SOLO en core/. Las copias en sites/*/assets/core.*
se regeneran con este script y no se tocan a mano. El catálogo de cada sitio
(sites/<sitio>/assets/decks.js) sí es propio y este script no lo toca.
"""
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CORE = os.path.join(ROOT, 'core')

# marca: bloque @brand que recibe el sitio.
# assets: carpetas de core/ con sus logos y fondos.
SITES = {
    'linktic':  {'marca': 'linktic', 'assets': ['brand']},
    '3t':       {'marca': 'tres-t',  'assets': ['brand-3t']},
    'wimbu':    {'marca': 'neutral', 'assets': []},
    'cymetria': {'marca': 'neutral', 'assets': []},
}
ALL_ASSETS = ['brand', 'brand-3t']

# Palabras que no pueden quedar en el código de un sitio que no es de esa marca.
TRAZAS = {
    'linktic': ['linktic', 'poppins'],
    'tres-t':  ['tres-t', 'tres t capital', 'brand-3t'],
}

BLOQUE = re.compile(r'/\* @brand ([\w-]+) \*/\n(.*?)/\* @end \*/\n?', re.S)


def filtrar(texto, marca):
    salida = BLOQUE.sub(lambda m: m.group(2) if m.group(1) == marca else '', texto)
    if '@brand' in salida or '@end' in salida:
        sys.exit('Marcador @brand mal cerrado en el core.')
    return re.sub(r'\n{3,}', '\n\n', salida)


errores = []
for site, cfg in SITES.items():
    dest = os.path.join(ROOT, 'sites', site, 'assets')
    os.makedirs(dest, exist_ok=True)
    for name in ('core.css', 'core.js'):
        with open(os.path.join(CORE, name), encoding='utf-8') as f:
            texto = filtrar(f.read(), cfg['marca'])
        with open(os.path.join(dest, name), 'w', encoding='utf-8', newline='') as f:
            f.write(texto)
        # control: el código de este sitio no nombra otras marcas
        bajo = texto.lower()
        for marca, palabras in TRAZAS.items():
            if marca == cfg['marca']:
                continue
            for p in palabras:
                if p in bajo:
                    errores.append('%s/assets/%s contiene "%s"' % (site, name, p))
    for b in ALL_ASSETS:
        bdest = os.path.join(dest, b)
        if os.path.isdir(bdest):
            shutil.rmtree(bdest)
        if b in cfg['assets']:
            shutil.copytree(os.path.join(CORE, b), bdest)
    print('%-9s marca %-8s%s' % (site, cfg['marca'], ''.join(' + %s/' % b for b in cfg['assets'])))

if errores:
    print('\nATENCION, quedan referencias de otra marca:')
    for e in errores:
        print('  ' + e)
    sys.exit(1)
print('\nOK: ningún sitio contiene referencias a otra marca.')
