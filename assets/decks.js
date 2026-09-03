/* ------------------------------------------------------------------
   Catálogo de presentaciones.
   Para publicar un flujo nuevo: crear el HTML en /p y añadir una
   entrada aquí. El índice y el selector superior se arman solos.
   ------------------------------------------------------------------ */
window.CORE_DECKS = [
  {
    id: 'cpe',
    file: 'p/cpe.html',
    title: 'Modelo de atención — Operación interna',
    client: 'Computadores Para Educar (CPE)',
    summary: 'Estructura de niveles, responsables por etapa, doble validación de Calidad y gestión de problemas sobre la causa raíz.',
    tag: 'Uso interno',
    tone: 'teal',
    updated: '2026-08'
  },
  {
    id: 'docum',
    file: 'p/docum.html',
    title: 'Modelo de atención Zendesk — DOCUM',
    client: 'DOCUM · Mesa de Ayuda N2',
    summary: 'Cierre en el nivel de resolución, validación de Calidad, cola interna en Azure DevOps y gestión de problemas sobre la causa raíz.',
    tag: 'Uso interno',
    tone: 'violet',
    updated: '2026-08'
  },
  {
    id: 'equidad',
    file: 'p/equidad.html',
    title: 'Modelo de atención — La Equidad',
    client: 'La Equidad',
    summary: 'Radicación por el analista N1 de La Equidad, entrada directa a Nivel 2 sin triage, soporte externo gestionado por N2 y trazabilidad en el portal.',
    tag: 'Cliente',
    tone: 'blue',
    updated: '2026-09'
  }
];
