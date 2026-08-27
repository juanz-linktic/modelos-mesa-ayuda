# Presentaciones — Mesa de Ayuda LinkTIC

Sitio estático (sin build, sin dependencias) que reúne los modelos de atención y
flujos de servicio de la Mesa de Ayuda. El índice permite elegir qué presentación
mostrar y cada presentación lleva un selector para saltar a otra sin volver atrás.

## Estructura

| Archivo | Descripción |
|---|---|
| `index.html` | Índice: lista todas las presentaciones del catálogo. |
| `assets/decks.js` | **Catálogo.** Una entrada por presentación; alimenta el índice y el selector superior. |
| `assets/core.css` | Estilos compartidos (paleta, slides, tarjetas, diagramas, impresión). |
| `assets/core.js` | Comportamiento compartido: selector, índice lateral, revelado al hacer scroll, progreso, teclado, botón PDF. |
| `p/cpe.html` | Modelo de Atención al Cliente — CPE (Computadores Para Educar). |
| `p/docum.html` | Modelo de atención Zendesk — DOCUM (uso interno). |
| `vercel.json` | Despliegue: URLs limpias, atajos `/cpe` y `/docum`, cabeceras de seguridad. |

## Agregar una presentación nueva

1. **Copiar una existente** como plantilla: `cp p/docum.html p/mi-flujo.html`.
2. Ajustar en el nuevo archivo:
   - `<title>` y los `<meta>` de descripción.
   - `data-deck="mi-flujo"` en el `<body>` (identificador propio; `data-base="../"` no cambia).
   - El contenido de las secciones. Cada `<section class="slide">` con atributo
     `data-nav="Etiqueta"` genera automáticamente un punto en el índice lateral.
3. **Registrarla** en `assets/decks.js`:

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

No hace falta tocar nada más: el índice y el selector superior se arman solos.

## Convenciones

- **Diagramas:** SVG inline dentro de `.figure > .diagram-scroll`. Escalan sin
  pérdida, se editan como texto y en móvil se desplazan en horizontal.
- **Paleta:** variables CSS en `:root` de `assets/core.css`
  (`--violet`, `--blue`, `--teal`, `--amber`, `--red`, `--steel`).
- **Tonos disponibles** para tarjetas y filas: `tone-violet`, `tone-blue`,
  `tone-teal`, `tone-steel`, `tone-amber`, `tone-red`.
- **PDF:** el botón usa la impresión del navegador; `@media print` deja fondo
  blanco y una sección por página.

## Desplegar en Vercel

**Opción A — arrastrar y soltar**

1. Entrar a https://vercel.com/new
2. Arrastrar la carpeta completa sobre el área de carga.
3. Framework Preset: **Other**. Sin build command, sin output directory.
4. Deploy.

**Opción B — desde la terminal**

```bash
vercel --prod
```

**Opción C — desde GitHub**

Importar el repositorio en Vercel (*Add New… → Project*), Framework Preset **Other**.
Cada push a `main` publica automáticamente.

### Rutas publicadas

| Ruta | Contenido |
|---|---|
| `/` | Índice de presentaciones |
| `/p/cpe` — atajo `/cpe` | Modelo CPE |
| `/p/docum` — atajo `/docum` | Modelo DOCUM |

## Dominio

En el proyecto de Vercel: *Settings → Domains* (por ejemplo
`modelos.linktic.com` mediante un registro CNAME).
