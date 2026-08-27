/* ==================================================================
   CORE — comportamiento compartido
   - Selector de presentaciones (se arma desde assets/decks.js)
   - Índice lateral generado desde las secciones con [data-nav]
   - Revelado al hacer scroll, barra de progreso y navegación por teclado
   ================================================================== */
(function () {
  var BASE = document.body.getAttribute('data-base') || '';
  var CURRENT = document.body.getAttribute('data-deck') || '';
  var DECKS = window.CORE_DECKS || [];

  /* ---------- selector de presentaciones ---------- */
  function buildPicker() {
    var host = document.getElementById('picker');
    if (!host || !DECKS.length) return;

    var btn = document.createElement('button');
    btn.className = 'tbtn';
    btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>' +
      '<span>Presentaciones</span>';

    var menu = document.createElement('div');
    menu.className = 'picker-menu';
    menu.setAttribute('role', 'menu');

    var head = document.createElement('div');
    head.className = 'head';
    head.textContent = 'Flujos disponibles';
    menu.appendChild(head);

    DECKS.forEach(function (d) {
      var a = document.createElement('a');
      a.className = 'picker-item tone-' + (d.tone || 'steel') + (d.id === CURRENT ? ' current' : '');
      a.href = BASE + d.file;
      a.setAttribute('role', 'menuitem');
      a.innerHTML = '<i></i><span><b></b><em></em></span>';
      a.querySelector('b').textContent = d.title;
      a.querySelector('em').textContent = d.client;
      menu.appendChild(a);
    });

    var sep = document.createElement('a');
    sep.className = 'picker-item';
    sep.href = BASE + 'index.html';
    sep.innerHTML = '<i></i><span><b>Ver el índice completo</b><em>Todas las presentaciones</em></span>';
    menu.appendChild(sep);

    host.appendChild(btn);
    host.appendChild(menu);

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = host.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function () {
      host.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') host.classList.remove('open');
    });
    menu.addEventListener('click', function (e) { e.stopPropagation(); });
  }

  /* ---------- índice del hub ---------- */
  function buildHub() {
    var list = document.getElementById('deck-list');
    if (!list) return;
    DECKS.forEach(function (d) {
      var a = document.createElement('a');
      a.className = 'deck reveal tone-' + (d.tone || 'steel');
      a.href = BASE + d.file;
      a.innerHTML =
        '<span class="deck-mark"></span>' +
        '<span class="deck-body"><h3></h3><p class="who"></p><p class="desc"></p></span>' +
        '<span class="deck-meta"><span class="badge"></span><span class="deck-go">Abrir →</span></span>';
      a.querySelector('h3').textContent = d.title;
      a.querySelector('.who').textContent = d.client;
      a.querySelector('.desc').textContent = d.summary;
      a.querySelector('.badge').textContent = d.tag || '';
      var li = document.createElement('li');
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  /* ---------- navegación lateral ---------- */
  function buildNav() {
    var nav = document.getElementById('sidenav');
    var slides = Array.prototype.slice.call(document.querySelectorAll('.slide[data-nav]'));
    if (!nav || !slides.length) return slides;
    slides.forEach(function (s, i) {
      var label = s.getAttribute('data-nav');
      var b = document.createElement('button');
      b.className = 'dot';
      b.type = 'button';
      b.setAttribute('aria-label', 'Ir a ' + label);
      b.innerHTML = '<span></span><em></em>';
      b.querySelector('em').textContent = label;
      b.addEventListener('click', function () {
        s.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      nav.appendChild(b);
    });
    return slides;
  }

  var slides = buildNav() || [];
  buildPicker();
  buildHub();

  /* ---------- revelado ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i % 6, 5) * 55 + 'ms';
    io.observe(el);
  });

  /* ---------- sección activa + progreso ---------- */
  var dots = Array.prototype.slice.call(document.querySelectorAll('.dot'));
  if (slides.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = slides.indexOf(e.target);
        dots.forEach(function (d, j) { d.classList.toggle('active', j === i); });
      });
    }, { threshold: .5 });
    slides.forEach(function (s) { spy.observe(s); });
  }

  var bar = document.getElementById('progress');
  function progress() {
    if (!bar) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', progress, { passive: true });
  progress();

  /* ---------- teclado ---------- */
  document.addEventListener('keydown', function (e) {
    if (!slides.length) return;
    if (['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].indexOf(e.key) === -1) return;
    var cur = 0, best = Infinity;
    slides.forEach(function (s, i) {
      var d = Math.abs(s.getBoundingClientRect().top);
      if (d < best) { best = d; cur = i; }
    });
    var next = (e.key === 'ArrowDown' || e.key === 'PageDown') ? cur + 1 : cur - 1;
    if (slides[next]) { e.preventDefault(); slides[next].scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });

  /* ---------- diagrama interactivo ---------- */
  function setupFlow(flow) {
    var box = flow.querySelector('.flowbox');
    var marked = Array.prototype.slice.call(flow.querySelectorAll('[data-routes]'));
    var routeChips = Array.prototype.slice.call(flow.querySelectorAll('[data-route]'));
    var layerChips = Array.prototype.slice.call(flow.querySelectorAll('[data-layer-toggle]'));
    var nodes = Array.prototype.slice.call(flow.querySelectorAll('.fnode[data-node]'));
    var details = Array.prototype.slice.call(flow.querySelectorAll('.fdetail'));
    var route = 'all';

    function routesOf(el) { return (el.getAttribute('data-routes') || '').split(/\s+/); }

    function applyRoute() {
      marked.forEach(function (el) {
        var inRoute = route === 'all' || routesOf(el).indexOf(route) !== -1;
        el.classList.toggle('is-dim', !inRoute);
        var live = inRoute && route !== 'all' && el.classList.contains('fedge');
        el.classList.toggle('is-live', live);
      });
      routeChips.forEach(function (c) {
        c.setAttribute('aria-pressed', c.getAttribute('data-route') === route ? 'true' : 'false');
      });
      // si el nodo abierto quedó fuera de la ruta, se vuelve a la introducción
      var open = flow.querySelector('.fnode.is-active');
      if (open && open.classList.contains('is-dim')) showDetail('intro');
    }

    function showDetail(id) {
      var found = false;
      details.forEach(function (d) {
        var match = d.getAttribute('data-detail') === id;
        d.hidden = !match;
        if (match) found = true;
      });
      if (!found) details.forEach(function (d) { d.hidden = d.getAttribute('data-detail') !== 'intro'; });
      nodes.forEach(function (n) {
        n.classList.toggle('is-active', n.getAttribute('data-node') === id);
        n.setAttribute('aria-pressed', n.getAttribute('data-node') === id ? 'true' : 'false');
      });
    }

    routeChips.forEach(function (c) {
      c.addEventListener('click', function () {
        route = c.getAttribute('data-route');
        applyRoute();
      });
    });

    layerChips.forEach(function (c) {
      c.addEventListener('click', function () {
        var layer = c.getAttribute('data-layer-toggle');
        var off = c.classList.toggle('is-off');
        c.setAttribute('aria-pressed', off ? 'false' : 'true');
        flow.querySelectorAll('[data-layer~="' + layer + '"]').forEach(function (el) {
          el.style.opacity = off ? '0' : '';
          el.style.pointerEvents = off ? 'none' : '';
        });
      });
    });

    nodes.forEach(function (n) {
      n.setAttribute('aria-pressed', 'false');
      n.addEventListener('click', function () {
        var id = n.getAttribute('data-node');
        showDetail(n.classList.contains('is-active') ? 'intro' : id);
      });
    });

    if (box) {
      box.addEventListener('click', function (e) {
        if (e.target === box) showDetail('intro');
      });
    }

    showDetail('intro');
    applyRoute();
  }
  document.querySelectorAll('.flow').forEach(setupFlow);

  /* ---------- pestañas ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (host) {
    var tabs = Array.prototype.slice.call(host.querySelectorAll('[data-tab]'));
    var panels = Array.prototype.slice.call(host.querySelectorAll('[data-panel]'));
    function select(id) {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', t.getAttribute('data-tab') === id ? 'true' : 'false'); });
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== id; });
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { select(t.getAttribute('data-tab')); });
    });
    if (tabs.length) select(tabs[0].getAttribute('data-tab'));
  });

  /* ---------- botón imprimir ---------- */
  document.querySelectorAll('[data-print]').forEach(function (b) {
    b.addEventListener('click', function () { window.print(); });
  });
})();
