# Presentaciones — Mesa de Ayuda

Sitios estáticos (sin build, sin dependencias) con los modelos de atención y flujos
de servicio de la Mesa de Ayuda, **segmentados por cliente**: cada cliente tiene su
propio sitio, su propio dominio y solo ve sus presentaciones.

## Estructura

```
core/                 Lo compartido. Se edita SOLO aquí.
  core.css            Estilos (paleta, slides, tarjetas, diagramas, impresión)
  core.js             Selector, índice lateral, filtros de diagramas, PDF
  brand/              Logos y fondos de LinkTIC
sites/
  linktic/            Modelo general · CPE · La Equidad  (Balu, pendiente)
  3t/                 DOCUM
  wimbu/              Vacío, listo para CRM Agora
  cymetria/           Página web de Cymetria
tools/sync_core.py    Copia el core a cada sitio
```

Cada carpeta de `sites/` es un sitio completo e independiente:

| Archivo | Descripción |
|---|---|
| `index.html` | Índice del sitio. |
| `assets/decks.js` | **Catálogo del sitio.** Una entrada por presentación; alimenta el índice y el selector. Es propio de cada sitio. |
| `assets/core.css`, `assets/core.js` | Copias del core. **No se editan a mano**: se regeneran con `tools/sync_core.py`. |
| `assets/brand/` | Solo en `linktic`. |
| `p/*.html` | Las presentaciones. |
| `vercel.json` | URLs limpias, atajos de cada presentación y cabeceras de seguridad. |

### Por qué el core se copia y no se referencia

Vercel publica únicamente lo que está dentro de la carpeta raíz de cada proyecto, así
que un sitio no puede apuntar a `../../core`. Por eso cada sitio lleva su copia del core,
generada por el script. Flujo de trabajo:

1. Editar `core/core.css` o `core/core.js`.
2. Correr `py tools/sync_core.py` (Windows) o `python3 tools/sync_core.py`.
3. Hacer commit de `core/` **y** de las copias en `sites/`.

## Agregar una presentación nueva

1. **Copiar una existente** dentro del sitio del cliente: `cp sites/3t/p/docum.html sites/3t/p/mi-flujo.html`.
2. Ajustar en el nuevo archivo:
   - `<title>` y los `<meta>` de descripción.
   - `data-deck="mi-flujo"` en el `<body>` (identificador propio; `data-base="../"` no cambia).
   - El contenido de las secciones. Cada `<section class="slide">` con atributo
     `data-nav="Etiqueta"` genera automáticamente un punto en el índice lateral.
3. **Registrarla** en el catálogo de ese sitio, `sites/<sitio>/assets/decks.js`:

```js
{
  id: 'mi-flujo',
  file: 'p/mi-flujo.html',
  title: 'Nombre de la presentación',
  client: 'Cliente o área',
  summary: 'Una frase que explique de qué trata.',
  tag: 'Cliente',          // etiqueta del índice
  tone: 'blue',            // teal | violet | blue | steel
  updated: '2026-08'
}
```

4. Agregar su atajo en `sites/<sitio>/vercel.json` si se quiere una URL corta.

El índice y el selector superior se arman solos. Un cliente nuevo es una carpeta
nueva en `sites/` más su entrada en `SITES` de `tools/sync_core.py`.

## Diagramas interactivos

El core trae un componente de flujo (`.flow`) donde los nodos son HTML y las
conexiones van en una capa SVG con el mismo sistema de coordenadas: una rejilla
de **1400 unidades de ancho**. Todo escala junto con el contenedor.

```html
<div class="flow">
  <div class="flow-controls">…botones data-route / data-layer-toggle…</div>
  <div class="flow-stage"><div class="diagram-scroll">
    <div class="flowbox">
      <svg class="flow-edges" viewBox="0 0 1400 620">…paths .fedge…</svg>
      <button class="fnode n-blue" data-node="n1" data-routes="all n1"
              style="--x:410;--y:300;--w:150;--h:100">…</button>
    </div>
  </div></div>
  <div class="flow-detail">…bloques .fdetail[data-detail]…</div>
</div>
```

- `--x/--y/--w/--h` son unidades de la rejilla (no píxeles ni porcentajes).
- La rejilla mide **1400 unidades de ancho por defecto**. Si un diagrama necesita
  otro ancho, hay que declararlo en los dos sitios o los nodos quedarán corridos
  respecto a las líneas: `style="--grid:1500;aspect-ratio:1500/800"` en el
  `.flowbox` y `viewBox="0 0 1500 800"` en el SVG.
- `data-routes="all n1 n2"` declara a qué rutas pertenece cada nodo, etiqueta o
  arista; los botones `data-route` atenúan lo que no pertenece a la ruta elegida
  y animan sus conexiones.
- `data-node="x"` en un `.fnode` lo enlaza con el bloque `.fdetail[data-detail="x"]`
  del panel inferior. Siempre debe existir un `data-detail="intro"`.
- `data-layer="azure"` + un botón `data-layer-toggle="azure"` permiten ocultar
  una capa completa (por ejemplo, para mostrar la vista que percibe el cliente).
- Colores de nodo: `n-blue`, `n-red`, `n-amber`, `n-green`, `n-violet`, `n-gray`.
- También hay un componente de pestañas: contenedor `[data-tabs]` con botones
  `[data-tab="id"]` y paneles `[data-panel="id"]`.

## Marca LinkTIC

Los valores de marca salen de la plantilla corporativa **GCM-DOC-002 v2** y viven
en el core, así que aplican a todas las presentaciones sin tocar su HTML.

| Elemento | Valor |
|---|---|
| Azul de marca | `#3F8CF5` (`--blue`) |
| Degradado | `#02E0FF → #0096FF → #2709CD` (`--brand-grad`) |
| Violeta | `#2709CD` (`--violet`) |
| Texto secundario | `#516276` (`--muted`) |
| Tipografía de títulos | Poppins (`--font-marca`) |
| Activos | `core/brand/`: logo a color, logo blanco, isotipo (favicon), fondo azul y fondo claro |

- La sección con `id="portada"` recibe automáticamente el fondo azul y el logo blanco.
- El índice usa el fondo claro y el logo a color.
- La marca solo se ve en el sitio `linktic`. Los sitios de 3T, Wimbu y Cymetria
  llevan `data-brand="neutral"` en el `<body>` de todas sus páginas: portada clara,
  sin logo y con la paleta y tipografía originales. El script de sincronización
  tampoco les copia `brand/`.
- Los colores semánticos de los diagramas (niveles, calidad, alertas) se mantienen
  a propósito: codifican significado, no identidad.

## Convenciones

- **Diagramas estáticos:** SVG inline dentro de `.figure > .diagram-scroll`.
  Escalan sin pérdida, se editan como texto y en móvil se desplazan en horizontal.
- **Paleta:** variables CSS en `:root` de `assets/core.css`
  (`--violet`, `--blue`, `--teal`, `--amber`, `--red`, `--steel`).
- **Tonos disponibles** para tarjetas y filas: `tone-violet`, `tone-blue`,
  `tone-teal`, `tone-steel`, `tone-amber`, `tone-red`.
- **PDF:** el botón usa la impresión del navegador; `@media print` deja fondo
  blanco y una sección por página.

## Desplegar en Vercel

Un repositorio, **cuatro proyectos Vercel**, uno por sitio. Todos se crean igual:

1. Vercel → *Add New… → Project* → importar este repositorio.
2. **Root Directory:** la carpeta del sitio (`sites/linktic`, `sites/3t`, `sites/wimbu` o `sites/cymetria`).
3. Framework Preset: **Other**. Sin build command, sin output directory.
4. Deploy. Cada push a `main` vuelve a publicar los cuatro.

| Proyecto | Root Directory | Presentaciones |
|---|---|---|
| LinkTIC | `sites/linktic` | `/mesa` · `/cpe` · `/equidad` |
| 3T | `sites/3t` | `/docum` |
| Wimbu | `sites/wimbu` | — (CRM Agora, pendiente) |
| Cymetria | `sites/cymetria` | `/cymetria` |

> El proyecto Vercel que ya existe apunta a la raíz del repo, que ya no tiene sitio.
> Hay que entrar a *Settings → General → Root Directory* y ponerle `sites/linktic`
> (pasa a ser el proyecto de LinkTIC), y crear los otros tres.

Para que un push que solo toca un cliente no redespliegue los demás, cada proyecto
puede usar *Settings → Git → Ignored Build Step* con
`git diff --quiet HEAD^ HEAD -- .` (se evalúa dentro de su Root Directory).

## Repositorio y dominio

- **Repositorio:** `github.com/juanz-linktic/modelos-mesa-ayuda`
- **Dominios:** uno por proyecto Vercel (por ejemplo `linktic-modelos.vercel.app`,
  `3t-modelos.vercel.app`, `wimbu-modelos.vercel.app`, `cymetria-modelos.vercel.app`).

Para cambiar el subdominio de Vercel: *Settings → Domains* del proyecto, `Add`
con el nuevo `<nombre>.vercel.app` y luego eliminar el anterior. Si más adelante
se quiere un dominio propio (por ejemplo `modelos.linktic.com`), se agrega en la
misma pantalla y se crea el registro CNAME correspondiente en el DNS de LinkTIC.

> Renombrar el repositorio en GitHub no rompe el despliegue: Vercel sigue
> conectado al mismo repositorio por id, y GitHub mantiene una redirección desde
> el nombre anterior.
