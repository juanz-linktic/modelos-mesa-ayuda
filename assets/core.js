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

  /* ---------- botón imprimir ---------- */
  document.querySelectorAll('[data-print]').forEach(function (b) {
    b.addEventListener('click', function () { window.print(); });
  });
})();
