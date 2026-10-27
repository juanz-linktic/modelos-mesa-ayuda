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
  var SITE = window.CORE_SITE || {};
  var GROUPS = [
    { id: 'principal', label: SITE.label || 'Flujos disponibles' },
    { id: 'externo', label: 'Externos' }
  ];
  function groupOf(d) { return d.group || 'principal'; }
  function eachGroup(fn) {
    var used = GROUPS.filter(function (g) {
      return DECKS.some(function (d) { return groupOf(d) === g.id; });
    });
    used.forEach(function (g) {
      fn(g, DECKS.filter(function (d) { return groupOf(d) === g.id; }), used.length);
    });
  }

  /* ---------- favicon (lo declara cada sitio en CORE_SITE.favicon) ---------- */
  if (SITE.favicon && !document.querySelector('link[rel="icon"]')) {
    var fav = document.createElement('link');
    fav.rel = 'icon'; fav.type = 'image/png';
    fav.href = BASE + SITE.favicon;
    document.head.appendChild(fav);
  }

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

    eachGroup(function (g, items) {
      var head = document.createElement('div');
      head.className = 'head';
      head.textContent = g.label;
      menu.appendChild(head);
      items.forEach(function (d) {
        var a = document.createElement('a');
        a.className = 'picker-item tone-' + (d.tone || 'steel') + (d.id === CURRENT ? ' current' : '');
        a.href = BASE + d.file;
        a.setAttribute('role', 'menuitem');
        a.innerHTML = '<i></i><span><b></b><em></em></span>';
        a.querySelector('b').textContent = d.title;
        a.querySelector('em').textContent = d.client;
        menu.appendChild(a);
      });
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
    if (!DECKS.length) {
      var empty = document.createElement('li');
      empty.className = 'deck-empty reveal';
      empty.textContent = SITE.empty || 'Todavía no hay presentaciones publicadas.';
      list.appendChild(empty);
      return;
    }
    eachGroup(function (g, items, total) {
      if (total > 1) {
        var gh = document.createElement('li');
        gh.className = 'deck-group reveal';
        gh.textContent = g.label;
        list.appendChild(gh);
      }
      items.forEach(function (d) { list.appendChild(deckItem(d)); });
    });
  }

  function deckItem(d) {
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
      return li;
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

  /* ---------- gráficas: barras, línea o ambas en paneles con el mismo eje de meses ----------
     <figure class="vchart" data-chart="bar|line|combo" data-labels="a,b"
             data-values="1,2" data-approx="0,1" data-min="0" data-max="100" data-step="25"
             data-unit="tickets" data-fmt="int|pct" data-name="Serie">
     Con data-chart="combo" (paneles apilados) o "dual" (superpuestos, eje derecho para la segunda serie) el segundo panel usa los mismos atributos con sufijo -2
     (data-values-2, data-min-2, …) y data-type / data-type-2 indican bar o line. */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS(SVGNS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }
  function setupChart(fig) {
    var kind = fig.getAttribute('data-chart');
    var labels = fig.getAttribute('data-labels').split(',');
    function attr(name, sfx, def) { var v = fig.getAttribute('data-' + name + sfx); return v === null ? def : v; }
    function readPanel(sfx, type) {
      var pct = attr('fmt', sfx, '') === 'pct';
      var p = {
        type: type,
        name: attr('name', sfx, ''),
        values: attr('values', sfx, '').split(',').map(function (v) { return v === '' ? null : parseFloat(v); }),
        approx: attr('approx', sfx, '').split(',').map(function (v) { return v === '1'; }),
        min: parseFloat(attr('min', sfx, '0')),
        max: parseFloat(attr('max', sfx, '100')),
        step: parseFloat(attr('step', sfx, '25')),
        unit: attr('unit', sfx, ''),
        pct: pct
      };
      p.fmt = function (v) { return v.toLocaleString('es-CO', { maximumFractionDigits: 2 }) + (pct ? ' %' : ''); };
      p.full = function (i) {
        return (p.approx[i] ? '≈ ' : '') + p.fmt(p.values[i]) + (p.unit ? ' ' + p.unit : '') + (p.approx[i] ? ' (estimado)' : '');
      };
      return p;
    }
    var dual = kind === 'dual';
    var panels = kind === 'combo' || dual
      ? [readPanel('', attr('type', '', 'bar')), readPanel('-2', attr('type', '-2', 'line'))]
      : [readPanel('', kind)];

    var W = 1000, L = dual ? 84 : 64, R = dual ? 70 : 14, B = 34, n = labels.length;
    var pw = W - L - R, col = pw / n;
    var y0 = panels.length > 1 ? 54 : 26;
    panels.forEach(function (p, k) {
      if (dual) { p.top = 40; p.h = 330; p.y = function (v) { return p.top + p.h - (v - p.min) / (p.max - p.min) * p.h; }; return; }
      p.top = y0;
      p.h = panels.length > 1 ? (k === 0 ? 200 : 150) : 210;
      y0 += p.h + (panels.length > 1 ? 70 : 0);
      p.y = function (v) { return p.top + p.h - (v - p.min) / (p.max - p.min) * p.h; };
    });
    var last = panels[panels.length - 1];
    if (dual) fig.classList.add('is-dual');
    var H = last.top + last.h + B;
    function cx(i) { return L + col * i + col / 2; }

    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': fig.getAttribute('aria-label') || '' });
    var cross = svgEl('line', { y1: panels[0].top, y2: last.top + last.h, 'class': 'vc-cross' }, svg);

    panels.forEach(function (p, k) {
      if (dual) {
        var ax = k === 0 ? 18 : W - 14, ay = p.top + p.h / 2;
        svgEl('text', { x: ax, y: ay, 'class': 'vc-axis', 'text-anchor': 'middle', transform: 'rotate(-90 ' + ax + ' ' + ay + ')' }, svg).textContent = p.name;
      } else if (panels.length > 1 && p.name) {
        svgEl('text', { x: L, y: p.top - 34, 'class': 'vc-name' }, svg).textContent = p.name;
      }
      for (var g = p.min; g <= p.max + 1e-9; g += p.step) {
        var right = dual && k === 1;
        if (!right) svgEl('line', { x1: L, x2: W - R, y1: p.y(g), y2: p.y(g), 'class': g === p.min ? 'vc-base' : 'vc-grid' }, svg);
        svgEl('text', { x: right ? W - R + 10 : L - 10, y: p.y(g) + 4, 'class': 'vc-tick', 'text-anchor': right ? 'start' : 'end' }, svg).textContent = p.fmt(g).replace(' %', '');
      }
      if (p === last) {
        labels.forEach(function (lb, i) {
          svgEl('text', { x: cx(i), y: H - 10, 'class': 'vc-tick', 'text-anchor': 'middle' }, svg).textContent = lb;
        });
      }

      var idx = p.values.map(function (v, i) { return v === null ? -1 : i; }).filter(function (i) { return i >= 0; });
      var hi = idx.reduce(function (a, i) { return p.values[i] > p.values[a] ? i : a; }, idx[0]);
      var lo = idx.reduce(function (a, i) { return p.values[i] < p.values[a] ? i : a; }, idx[0]);
      p.marks = [];
      if (p.type === 'bar') {
        var bw = Math.min(col * 0.62, 46), r = 4;
        idx.forEach(function (i) {
          var x = cx(i) - bw / 2, top = p.y(p.values[i]), base = p.y(p.min), rr = Math.min(r, base - top);
          var d = 'M' + x + ',' + base + ' V' + (top + rr) + ' Q' + x + ',' + top + ' ' + (x + rr) + ',' + top +
                  ' H' + (x + bw - rr) + ' Q' + (x + bw) + ',' + top + ' ' + (x + bw) + ',' + (top + rr) + ' V' + base + ' Z';
          p.marks[i] = svgEl('path', { d: d, 'class': 'vc-bar' + (p.approx[i] ? ' is-approx' : '') }, svg);
        });
      } else {
        svgEl('polyline', { points: idx.map(function (i) { return cx(i) + ',' + p.y(p.values[i]); }).join(' '), 'class': 'vc-line' }, svg);
        idx.forEach(function (i) {
          p.marks[i] = svgEl('circle', { cx: cx(i), cy: p.y(p.values[i]), r: 5, 'class': 'vc-dot' }, svg);
        });
      }
      var tagged = dual ? (p.type === 'line' ? idx : []) : [hi, lo, idx[idx.length - 1]];
      tagged.filter(function (v, j, a) { return a.indexOf(v) === j; }).forEach(function (i) {
        var dy = dual ? -14 : p.type === 'bar' ? -8 : (i === lo && i !== hi ? 22 : -12);
        svgEl('text', { x: cx(i), y: p.y(p.values[i]) + dy, 'class': 'vc-val', 'text-anchor': 'middle' }, svg)
          .textContent = (p.approx[i] ? '≈ ' : '') + p.fmt(p.values[i]);
      });
    });

    var tip = document.createElement('div');
    tip.className = 'vchart-tip';
    if (dual) {
      var leg = document.createElement('div');
      leg.className = 'vchart-legend';
      leg.innerHTML = panels.map(function (p) { return '<span class="lg-' + p.type + '"><i></i>' + p.name + '</span>'; }).join('');
      fig.appendChild(leg);
    }
    fig.appendChild(svg);
    fig.appendChild(tip);
    labels.forEach(function (lb, i) {
      var hit = svgEl('rect', { x: L + col * i, y: panels[0].top, width: col, height: last.top + last.h - panels[0].top, 'class': 'vc-hit' }, svg);
      hit.addEventListener('mouseenter', function () {
        var shown = panels.filter(function (p) { return p.values[i] !== null; });
        if (!shown.length) return;
        panels.forEach(function (p) { p.marks.forEach(function (m, j) { if (m) m.classList.toggle('is-hover', j === i); }); });
        cross.setAttribute('x1', cx(i)); cross.setAttribute('x2', cx(i));
        cross.classList.toggle('on', panels.length > 1 || panels[0].type === 'line');
        tip.innerHTML = '<b>' + lb + '</b>' + shown.map(function (p) {
          return '<span>' + (panels.length > 1 && p.name ? '<small>' + p.name + '</small> ' : '') + p.full(i) + '</span>';
        }).join('');
        var box = svg.getBoundingClientRect(), k = box.width / W;
        tip.style.left = Math.min(Math.max(cx(i) * k, 90), box.width - 90) + 'px';
        tip.style.top = (svg.offsetTop + shown[0].y(shown[0].values[i]) * k - 10) + 'px';
        tip.classList.add('on');
      });
    });
    svg.addEventListener('mouseleave', function () {
      tip.classList.remove('on'); cross.classList.remove('on');
      panels.forEach(function (p) { p.marks.forEach(function (m) { if (m) m.classList.remove('is-hover'); }); });
    });

    var det = document.createElement('details');
    det.className = 'vchart-data';
    var head = panels.length > 1
      ? '<thead><tr><th>Mes</th>' + panels.map(function (p) { return '<th>' + p.name + '</th>'; }).join('') + '</tr></thead>' : '';
    var rows = labels.map(function (lb, i) {
      return '<tr><td>' + lb + '</td>' + panels.map(function (p) { return '<td>' + (p.values[i] === null ? '—' : p.full(i)) + '</td>'; }).join('') + '</tr>';
    }).join('');
    det.innerHTML = '<summary>Ver datos en tabla</summary><div class="tbl-wrap"><table class="tbl">' + head + '<tbody>' + rows + '</tbody></table></div>';
    fig.appendChild(det);
  }
  document.querySelectorAll('[data-chart]').forEach(setupChart);

  /* ---------- botón imprimir ---------- */
  document.querySelectorAll('[data-print]').forEach(function (b) {
    b.addEventListener('click', function () { window.print(); });
  });
})();
