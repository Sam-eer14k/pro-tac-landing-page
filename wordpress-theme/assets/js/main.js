/* ProTac Security front page. Vanilla JS, no dependencies.
   header · menu · scrolling · hero counters · about list · services · map · timeline ·
   quote selector · reviews · leadership · form · FAQ · reveals · cursor, magnetic, tilt */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* ---- One cancellable scroll tween for every anchor and the top button ---- */
  var jump = 0;
  function scrollToY(y, done) {
    var id = ++jump;
    var from = window.scrollY;
    var dist = y - from;
    if (reduce || Math.abs(dist) < 2) { window.scrollTo({ top: y, behavior: 'instant' }); if (done) done(); return; }
    var dur = clamp(Math.abs(dist) * 0.32, 320, 800);
    var t0 = performance.now();
    (function step(now) {
      if (id !== jump) return;
      var p = clamp((now - t0) / dur, 0, 1);
      window.scrollTo({ top: from + dist * (1 - Math.pow(1 - p, 3)), behavior: 'instant' });
      if (p < 1) requestAnimationFrame(step); else if (done) done();
    })(t0);
  }
  ['wheel', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, function () { jump++; }, { passive: true });
  });
  function goTo(hash) {
    var t = hash === '#home' ? null : $(hash);
    var y = t ? t.getBoundingClientRect().top + window.scrollY - 76 : 0;
    scrollToY(Math.max(0, y), function () {
      if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
    if (history.replaceState) history.replaceState(null, '', hash);
  }

  /* ---- Mobile menu ---- */
  var toggle = $('#nav-toggle');
  var mnav = $('#mnav');
  function setMenu(open) {
    mnav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    mnav.inert = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('use', toggle).setAttribute('href', open ? '#i-close' : '#i-menu');
  }
  toggle.addEventListener('click', function () { setMenu(!mnav.classList.contains('is-open')); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mnav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1140 && mnav.classList.contains('is-open')) setMenu(false);
  });

  /* ---- Anchors, plus the data-* shortcuts they can carry ---- */
  var SERVICES = ['Armed or unarmed guards', 'Mobile patrol', 'Event security', 'Fire watch', 'Access control'];
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (h.length < 2) return;
    e.preventDefault();
    if (mnav.classList.contains('is-open')) setMenu(false);
    if (a.hasAttribute('data-prefill') && window.__rq) {
      var v = a.getAttribute('data-prefill');
      if (SERVICES.indexOf(v) > -1) window.__rq({ service: v });
      else window.__rq({ service: SERVICES[0], message: 'Site type: ' + v + '.' });
    }
    if (a.hasAttribute('data-svc') && window.__svc) window.__svc(a.getAttribute('data-svc'));
    goTo(h);
    if (a.classList.contains('mega__i')) a.blur();
  });

  /* ---- Tabs helper ---- */
  function tabs(root, tabSel, vertical, onUser) {
    var list = $$(tabSel, root);
    function show(tab, focus) {
      list.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        $('#' + t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    }
    list.forEach(function (t, i) {
      t.addEventListener('click', function () { show(t); if (onUser) onUser(); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, next = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') next = list[(i + 1) % list.length];
        else if (k === 'ArrowUp' || k === 'ArrowLeft') next = list[(i - 1 + list.length) % list.length];
        else if (k === 'Home') next = list[0];
        else if (k === 'End') next = list[list.length - 1];
        if (next) { e.preventDefault(); show(next, true); if (onUser) onUser(); }
      });
    });
    return { list: list, show: show };
  }

  /* ---- Services: auto-cycle until someone interacts ---- */
  (function () {
    var root = $('#svc');
    var timer = null;
    var manual = reduce;
    var inView = false;
    var hovering = false;
    var stop = function () { manual = true; clearInterval(timer); root.classList.remove('is-auto'); };
    var t = tabs(root, '.svc__t', true, stop);
    var active = function () { return t.list.findIndex(function (b) { return b.classList.contains('is-active'); }); };
    function start() {
      clearInterval(timer);
      if (manual || !inView || hovering) { root.classList.add('is-paused'); return; }
      root.classList.remove('is-paused');
      root.classList.add('is-auto');
      timer = setInterval(function () { t.show(t.list[(active() + 1) % t.list.length]); }, 7000);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; start(); }, { threshold: 0.3 }).observe(root);
    }
    root.addEventListener('pointerenter', function () { hovering = true; start(); });
    root.addEventListener('pointerleave', function () { hovering = false; start(); });
    root.addEventListener('focusin', function (e) { if (e.target.matches('.svc__t:focus-visible')) stop(); });
    window.__svc = function (name) {
      var b = t.list.filter(function (x) { return x.getAttribute('data-svc') === name; })[0];
      if (b) { t.show(b); stop(); }
    };
  })();

  /* ---- About list and FAQ: open one at a time ---- */
  function accordion(items, btnSel, panelTest, hover) {
    function set(item) {
      items.forEach(function (x) {
        var on = x === item;
        x.classList.toggle('is-open', on);
        $(btnSel, x).setAttribute('aria-expanded', on ? 'true' : 'false');
      });
    }
    items.forEach(function (x) {
      $(btnSel, x).addEventListener('click', function () {
        set(x.classList.contains('is-open') && !hover ? null : x);
      });
      if (hover && finePointer) x.addEventListener('pointerenter', function () { set(x); });
    });
  }
  accordion($$('#pts .pt'), '.pt__b', null, true);
  accordion($$('#acc .q'), 'button', null, false);

  /* ---- Map tooltips ---- */
  (function () {
    var map = $('#map');
    var tip = $('#map-tip');
    var towns = $$('.town', map);
    var svg = $('svg', map);
    function show(t) {
      towns.forEach(function (x) { x.classList.toggle('is-on', x === t); });
      tip.innerHTML = '';
      var b = document.createElement('b');
      b.textContent = t.getAttribute('data-town');
      tip.appendChild(b);
      tip.appendChild(document.createTextNode(t.getAttribute('data-info')));
      var box = svg.getBoundingClientRect();
      var s = box.width / 636;
      var x = +t.getAttribute('data-x') * s;
      var y = +t.getAttribute('data-y') * s;
      var w = tip.offsetWidth;
      var h = tip.offsetHeight;
      var left = clamp(x - w / 2, 8, box.width - w - 8);
      var top = y - h - 26 * s - 6;
      if (top < 8) top = y + 34 * s;
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
      tip.classList.add('is-on');
    }
    function hide() { towns.forEach(function (x) { x.classList.remove('is-on'); }); tip.classList.remove('is-on'); }
    towns.forEach(function (t) {
      t.addEventListener('pointerenter', function () { show(t); });
      t.addEventListener('focus', function () { show(t); });
      t.addEventListener('click', function () { show(t); });
      t.addEventListener('blur', hide);
      t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(t); } });
    });
    svg.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hide(); });
  })();

  /* ---- Reviews: drag, swipe, arrows, autoplay ---- */
  (function () {
    var vp = $('#rev-vp');
    var track = $('#rev-t');
    var slides = $$('.rv', track);
    var cur = 0;
    var timer = null;
    var hover = false;
    var seen = false;
    function go(i) {
      cur = (i + slides.length) % slides.length;
      track.style.transform = 'translate3d(' + (-cur * 100) + '%,0,0)';
      $('#rev-count').textContent = (cur + 1) + ' / ' + slides.length;
      slides.forEach(function (s, n) { s.setAttribute('aria-hidden', n === cur ? 'false' : 'true'); });
    }
    function play() {
      clearInterval(timer);
      if (reduce || hover || !seen) return;
      timer = setInterval(function () { go(cur + 1); }, 8000);
    }
    $('#rev-prev').addEventListener('click', function () { go(cur - 1); play(); });
    $('#rev-next').addEventListener('click', function () { go(cur + 1); play(); });
    vp.addEventListener('pointerenter', function () { hover = true; play(); });
    vp.addEventListener('pointerleave', function () { hover = false; play(); });
    var startX = null, startW = 0, dx = 0;
    vp.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      startX = e.clientX; startW = vp.offsetWidth; dx = 0;
      vp.classList.add('is-drag');
      vp.setPointerCapture(e.pointerId);
    });
    vp.addEventListener('pointermove', function (e) {
      if (startX === null) return;
      dx = e.clientX - startX;
      track.style.transform = 'translate3d(' + (-cur * startW + dx) + 'px,0,0)';
    });
    function end() {
      if (startX === null) return;
      startX = null;
      vp.classList.remove('is-drag');
      if (Math.abs(dx) > startW * 0.15) go(cur + (dx < 0 ? 1 : -1)); else go(cur);
      play();
    }
    vp.addEventListener('pointerup', end);
    vp.addEventListener('pointercancel', end);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) play(); else clearInterval(timer); }, { threshold: 0.3 }).observe(vp);
    }
    go(0);
  })();

  /* ---- Leadership cards: tap to flip on touch ---- */
  $$('.flip').forEach(function (f) {
    if (!finePointer) f.addEventListener('click', function () { f.classList.toggle('is-flipped'); });
    f.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f.classList.toggle('is-flipped'); }
    });
  });

  /* ---- Counters ---- */
  function tween(el, from, to, dur) {
    if (reduce) return;
    var t0 = performance.now();
    var done = false;
    el.textContent = from;
    (function step(now) {
      if (done) return;
      var p = clamp((now - t0) / dur, 0, 1);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
    setTimeout(function () { done = true; el.textContent = to; }, dur + 200);
  }
  window.addEventListener('load', function () {
    $$('[data-hero-count]').forEach(function (el, i) {
      setTimeout(function () { tween(el, +el.getAttribute('data-from'), +el.getAttribute('data-to'), 1300); }, 1100 + i * 120);
    });
    var g = $('#grade');
    if (g && !reduce) {
      ['C', 'B', 'A', 'A+'].forEach(function (s, i) { setTimeout(function () { g.textContent = s; }, 1450 + i * 240); });
    }
  });

  /* ---- Video: stop decoding while the hero is off screen ---- */
  (function () {
    var v = $('.hero__video');
    if (!v) return;
    v.muted = true;
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    play();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { if (es[0].isIntersecting) play(); else v.pause(); }).observe(v);
    }
  })();

  /* ---- Multi-step request form ---- */
  (function () {
    var form = $('#quote-form');
    var status = $('#form-status');
    var send = $('#send');
    var back = $('#rq-back');
    var next = $('#rq-next');
    var done = $('#rq-done');
    var steps = $$('.rq__s', form);
    var dots = $$('#rq-p li:not(.rq__bar)');
    var cards = $('.rq__cards', form);
    var mode = form.getAttribute('data-mode');
    /* index.html?formpreview=1 shows the success screen on the static build without sending. */
    var preview = /[?&]formpreview=1/.test(window.location.search);
    var CALL = 'please call <a href="tel:+18059389100">(805) 938-9100</a>. We pick up at any hour.';
    var cur = 0;

    function show(i, focus) {
      var dir = i >= cur ? 'from-r' : 'from-l';
      cur = i;
      steps.forEach(function (s, n) {
        s.hidden = n !== i;
        s.classList.remove('from-r', 'from-l');
        if (n === i) s.classList.add(dir);
      });
      dots.forEach(function (d, n) { d.classList.toggle('is-on', n <= i); if (n === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
      $('#rq-bar').style.transform = 'scaleX(' + (i + 1) / 3 + ')';
      back.hidden = i === 0;
      next.hidden = i === 2;
      send.hidden = i !== 2;
      status.textContent = '';
      if (focus) { var f = $('input:not([type=radio]), textarea', steps[i]) || $('input', steps[i]); if (f) f.focus({ preventScroll: true }); }
    }

    function setErr(el, msg) {
      var e = $('#' + el.id + '-e');
      e.textContent = msg;
      if (msg) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', el.id + '-e'); }
      else { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); }
    }
    var rules = {
      'f-town': function (v) { return v.length < 2 ? 'Tell us the town or address of the site.' : ''; },
      'f-name': function (v) { return v.length < 2 ? 'Enter your name so we know who to ask for.' : ''; },
      'f-phone': function (v) { return v.replace(/\D/g, '').length < 10 ? 'Enter a 10-digit phone number, including the area code.' : ''; },
      'f-email': function (v) { return v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Check the email address, or leave it blank.' : ''; }
    };
    function check(id) { var el = $('#' + id); var m = rules[id](el.value.trim()); setErr(el, m); return !m; }
    Object.keys(rules).forEach(function (id) {
      var el = $('#' + id);
      el.addEventListener('blur', function () { if (el.value.trim()) check(id); });
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid')) check(id); });
    });
    function chosen() { var c = $('input[name=service]:checked', form); return c ? c.value : ''; }
    function validStep(i) {
      if (i === 0) {
        var ok = !!chosen();
        $('#f-service-e').textContent = ok ? '' : 'Pick one to keep going, or choose Not sure yet.';
        if (!ok) $('input[name=service]', form).focus();
        return ok;
      }
      var ids = i === 1 ? ['f-town'] : ['f-name', 'f-phone', 'f-email'];
      var bad = ids.filter(function (id) { return !check(id); });
      if (bad.length) $('#' + bad[0]).focus();
      return !bad.length;
    }
    next.addEventListener('click', function () { if (validStep(cur)) show(cur + 1, true); });
    back.addEventListener('click', function () { show(cur - 1, true); });
    form.addEventListener('change', function (e) { if (e.target.name === 'service') $('#f-service-e').textContent = ''; });
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && cur < 2 && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') { e.preventDefault(); next.click(); }
    });

    function summary() {
      return ['Name: ' + form.name.value.trim(), 'Phone: ' + form.phone.value.trim(), 'Email: ' + (form.email.value.trim() || 'Not given'), 'Needs: ' + chosen(), 'Site: ' + form.town.value.trim(), 'Dates: ' + (form.dates.value.trim() || 'Not given'), 'Hours: ' + (form.hours.value.trim() || 'Not given'), '', form.message.value.trim()].join('\n');
    }
    function state(s) { send.setAttribute('data-state', s); send.disabled = s === 'loading'; }
    function success() { state('idle'); form.hidden = true; $('#rq-p').hidden = true; done.hidden = false; done.focus({ preventScroll: true }); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (cur < 2) { next.click(); return; }
      if (!validStep(2)) return;
      status.classList.remove('is-ok');
      status.textContent = '';
      state('loading');
      if (preview) { setTimeout(success, 700); return; }
      if (mode === 'wp') {
        var data = new FormData(form);
        data.append('ajax', '1');
        fetch(form.action, { method: 'POST', body: data, credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) {
          if (j.status === 'sent') { success(); return; }
          state('idle');
          status.innerHTML = j.status === 'invalid' ? 'Some details were missing. Check the form and send again.' : 'That did not go through, so ' + CALL;
        }).catch(function () { state('idle'); status.innerHTML = 'That did not go through, so ' + CALL; });
        return;
      }
      if (mode === 'mailto') {
        window.location.href = form.getAttribute('action') + '?subject=' + encodeURIComponent('Security quote request: ' + form.name.value.trim()) + '&body=' + encodeURIComponent(summary());
        state('idle');
        status.textContent = 'Your email app should open with your details filled in. Press send there to finish.';
        return;
      }
      /* No inbox is configured on the static build, so nothing is sent: never claim otherwise. */
      var finish = function (copied) { state('idle'); status.innerHTML = (copied ? 'Your details are copied. ' : '') + 'Online requests aren\'t switched on yet, so ' + CALL; };
      setTimeout(function () {
        finish(false);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(summary()).then(function () { finish(true); }, function () {});
        }
      }, 500);
    });
    $('#rq-again').addEventListener('click', function () {
      form.reset(); form.hidden = false; $('#rq-p').hidden = false; done.hidden = true; show(0, false);
      $('input[name=service]', form).focus();
    });

    /* Called by the planner, quick check and service links. */
    window.__rq = function (o) {
      if (form.hidden) $('#rq-again').click();
      if (o.service) {
        var r = $('input[name=service][value="' + o.service + '"]', form);
        if (r) r.checked = true;
        $('#f-service-e').textContent = '';
      }
      if (o.message) form.message.value = o.message;
      if (o.hours) form.hours.value = o.hours;
      if (o.dates) form.dates.value = o.dates;
      show(o.service ? 1 : 0, false);
      var c = o.message ? $('#f-message').closest('.fl') : cards;
      c.classList.remove('is-flash');
      void c.offsetWidth;
      c.classList.add('is-flash');
    };
    show(0, false);
  })();

  /* ---- Hero panel: site diagram ---- */
  (function () {
    var root = $('#cov');
    var nodes = $$('.hn', root);
    var arcs = $$('.cv-arc', root);
    var cap = $('#cov-cap');
    var DEF = 'Hover or tap a part of the site.';
    var timer = null, delay = null, step = -1, capT = null, auto = !reduce;
    function caption(text) {
      if (reduce) { cap.textContent = text; return; }
      clearTimeout(capT);
      cap.classList.add('is-out');
      capT = setTimeout(function () { cap.textContent = text; cap.classList.remove('is-out'); }, 170);
    }
    function pick(i) {
      root.classList.toggle('has-on', i >= 0);
      nodes.forEach(function (n, k) { n.classList.toggle('is-on', k === i); });
      arcs.forEach(function (a, k) { a.classList.toggle('is-on', k === i); });
      caption(i < 0 ? DEF : nodes[i].getAttribute('data-cap'));
    }
    function halt() { clearInterval(timer); clearTimeout(delay); timer = delay = null; }
    function user() { if (auto) { auto = false; halt(); } cap.setAttribute('aria-live', 'polite'); }
    function run() {
      if (!auto || timer || delay) return;
      delay = setTimeout(function () {
        delay = null;
        var tick = function () { step = (step + 1) % nodes.length; pick(step); };
        tick();
        timer = setInterval(tick, 3600);
      }, 3600);
    }
    nodes.forEach(function (n, i) {
      n.addEventListener('pointerenter', function () { user(); pick(i); });
      n.addEventListener('focus', function () { user(); pick(i); });
      n.addEventListener('click', function () { user(); pick(i); });
      n.addEventListener('keydown', function (e) {
        var to = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (i + 1) % nodes.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = (i - 1 + nodes.length) % nodes.length;
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); user(); pick(i); return; }
        if (to === null) return;
        e.preventDefault();
        nodes.forEach(function (x, k) { x.tabIndex = k === to ? 0 : -1; });
        nodes[to].focus();
      });
    });
    var svg = $('svg', root);
    svg.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !auto) pick(-1); });
    svg.addEventListener('focusout', function (e) { if (!auto && !svg.contains(e.relatedTarget)) pick(-1); });
    /* Only cycle while the panel is on screen. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { if (es[0].isIntersecting) run(); else halt(); }, { threshold: 0.3 }).observe(root);
    } else { run(); }
  })();/* ---- Service finder ---- */
  (function () {
    var root = $('#fnd');
    var qs = $$('.fnd__q', root);
    var res = $('#fnd-r');
    var bar = $('#fnd-bar');
    var ans = {};
    var CARDS = {
      guards: ['i-shield', 'Armed or unarmed guards', 'An officer on your site for the whole shift.', 'guards'],
      patrol: ['i-car', 'Mobile patrol', 'Patrol officers check the property by vehicle, so you\'re not paying for someone to stand in one spot all shift.', 'patrol'],
      event: ['i-event', 'Event security', 'Officers for your date, planned around the venue and the crowd.', 'event'],
      fire: ['i-flame', 'Fire watch', 'A dedicated officer keeps watch until your fire protection is back.', 'fire'],
      access: ['i-gate', 'Access control', 'A person on the gate, checking who comes in.', 'access']
    };
    function pickService() {
      if (ans.what === 'fire') return 'fire';
      if (ans.what === 'event' || ans.when === 'once') return 'event';
      if (ans.what === 'homes') return ans.doors === 'open' ? 'patrol' : 'access';
      if (ans.when === 'all') return 'guards';
      if (ans.doors === 'open' || ans.what === 'farm') return ans.when === 'day' ? 'guards' : 'patrol';
      if (ans.doors === 'one' && ans.when === 'day') return 'access';
      return 'guards';
    }
    function bars(i) { bar.style.transform = 'scaleX(' + i / 3 + ')'; }
    function ask(i, focus) {
      res.hidden = true;
      qs.forEach(function (q, k) { q.hidden = k !== i; });
      bars(i);
      if (focus) $('h3', qs[i]).focus({ preventScroll: true });
    }
    qs.forEach(function (q, i) {
      $$('.fnd__o', q).forEach(function (o) {
        o.addEventListener('click', function () {
          ans[q.getAttribute('data-q')] = o.getAttribute('data-v');
          if (i < qs.length - 1) { ask(i + 1, true); return; }
          var c = CARDS[pickService()];
          $('#fnd-icon').setAttribute('href', '#' + c[0]);
          $('#fnd-title').textContent = c[1];
          $('#fnd-why').textContent = c[2];
          $('#fnd-go').setAttribute('data-svc', c[3]);
          qs.forEach(function (x) { x.hidden = true; });
          res.hidden = false;
          bars(3);
          $('#fnd-title').focus({ preventScroll: true });
        });
      });
    });
    $('#fnd-reset').addEventListener('click', function () { ans = {}; ask(0, true); });
  })();

  /* ---- Posted vs patrol table ---- */
  (function () {
    var rows = $$('#cmp tbody tr');
    var out = $('#cmp-x');
    function pick(r) {
      rows.forEach(function (x) { x.classList.toggle('is-on', x === r); });
      out.textContent = r.getAttribute('data-x');
    }
    rows.forEach(function (r) {
      r.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') pick(r); });
      r.addEventListener('click', function () { pick(r); });
      $('button', r).addEventListener('focus', function () { pick(r); });
    });
  })();

  /* ---- Quick check ---- */
  (function () {
    var form = $('#xc');
    var ring = $('#xc-ring');
    var go = $('#xc-go');
    var lvl = $('#xc-lvl');
    var txt = $('#xc-txt');
    var RISK = {
      x1: ['yes', 'empty at night'], x2: ['yes', 'equipment stored outside'], x3: ['no', 'cameras or lights not working'],
      x4: ['yes', 'things gone missing in the last year'], x5: ['yes', 'people not checked at the door'], x6: ['yes', 'fire protection offline at times']
    };
    var plan = null;
    function val(k) { var c = $('input[name=' + k + ']:checked', form); return c ? c.value : ''; }
    function update() {
      var answered = 0, hits = [];
      Object.keys(RISK).forEach(function (k) {
        var v = val(k);
        if (!v) return;
        answered++;
        if (v === RISK[k][0]) hits.push(k);
      });
      ring.style.strokeDashoffset = 1 - answered / 6;
      $('#xc-n').textContent = answered;
      if (!answered) return;
      var n = hits.length;
      var name = n >= 4 ? 'High exposure' : n >= 2 ? 'Some exposure' : 'Low exposure';
      lvl.textContent = name + (answered < 6 ? ' so far' : '');
      lvl.className = 'xc__lvl ' + (n >= 4 ? 'is-high' : n >= 2 ? 'is-some' : 'is-low');
      var svc, why;
      if (val('x6') === 'yes') { svc = 'Fire watch'; why = 'Start with fire watch for the times your system is down.'; }
      else if (val('x5') === 'yes') { svc = 'Access control'; why = 'Start with access control, so someone checks who comes in.'; }
      else if (n >= 4) { svc = 'Armed or unarmed guards'; why = 'With this many gaps, start with an officer on site.'; }
      else if (n >= 1) { svc = 'Mobile patrol'; why = 'Mobile patrol is a sensible first step, with regular checks when nobody is there.'; }
      else { svc = 'Not sure yet'; why = 'Nothing stands out so far. If something still worries you, ask us.'; }
      txt.textContent = why;
      plan = { service: svc, message: 'Quick check: ' + name + '.' + (n ? ' ' + hits.map(function (k) { return RISK[k][1]; }).join(', ').replace(/^./, function (c) { return c.toUpperCase(); }) + '.' : '') };
      go.hidden = answered < 6;
    }
    form.addEventListener('change', update);
    go.addEventListener('click', function () { if (plan) window.__rq(plan); });
  })();

  /* ---- Coverage planner: hours only, never prices ---- */
  (function () {
    var root = $('#pl');
    var off = $('#pl-off'), hrs = $('#pl-hrs');
    var grid = $('#pl-grid');
    var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    var night = true;
    var cells = [];
    var numA = $('#pl-a'), numB = $('#pl-b');
    var tok = { a: 0, b: 0 }, shown = { a: 120, b: 520 };
    var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };

    var head = '<span></span><em>12a</em><em>6a</em><em>12p</em><em>6p</em>';
    var rows = DAYS.map(function (d, r) {
      var s = '<b>' + d.slice(0, 3) + '</b>';
      for (var h = 0; h < 24; h++) s += '<i data-c="' + r + '-' + h + '"></i>';
      return s;
    }).join('');
    grid.innerHTML = head + rows;
    $$('i', grid).forEach(function (c) { cells[c.getAttribute('data-c')] = c; });

    function get(n) { return $('input[name=' + n + ']:checked', root).value; }
    function dayBoxes() { return $$('input[name=pl-day]', root); }
    function picked() { return dayBoxes().filter(function (b) { return b.checked; }).map(function (b) { return +b.value; }); }
    function fill(r) { r.style.setProperty('--p', (r.value - r.min) / (r.max - r.min) * 100 + '%'); }

    function animate(key, el, to) {
      var from = shown[key];
      var id = ++tok[key];
      shown[key] = to;
      if (reduce || from === to) { el.textContent = fmt(to); return; }
      var t0 = performance.now();
      (function step(now) {
        if (id !== tok[key]) return;
        var p = Math.min(1, Math.max(0, (now - t0) / 380));
        el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
      setTimeout(function () { if (id === tok[key]) el.textContent = fmt(to); }, 480);
    }
    function dayPhrase(list) {
      if (list.length === 7) return 'every day';
      if (list.length > 1 && list[list.length - 1] - list[0] === list.length - 1) return DAYS[list[0]] + ' to ' + DAYS[list[list.length - 1]];
      var names = list.map(function (i) { return DAYS[i]; });
      return names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0];
    }
    var plan = {};
    function render() {
      var n = +off.value, h = +hrs.value, dur = get('pl-dur'), site = get('pl-site'), cov = get('pl-cov'), arm = get('pl-arm');
      var list = picked();
      var eff = dur === 'day' ? list.slice(0, 1) : list;
      $('#pl-off-o').textContent = n;
      $('#pl-hrs-o').textContent = h;
      off.setAttribute('aria-valuetext', n + (n === 1 ? ' officer' : ' officers'));
      hrs.setAttribute('aria-valuetext', h + (h === 1 ? ' hour' : ' hours') + ' a day');
      fill(off); fill(hrs);
      $('#pl-hint').hidden = dur !== 'day';
      $('#pl-night').classList.toggle('is-on', night && h === 12);
      $('#pl-247').classList.toggle('is-on', h === 24 && list.length === 7);
      $('#pl-every').classList.toggle('is-on', list.length === 7);

      var week = n * h * eff.length;
      var month = Math.round(week * 52 / 12);
      var short = dur === 'day' || dur === 'week';
      $('#pl-a-l').textContent = dur === 'day' ? 'Officer-hours that day' : 'Officer-hours per week';
      $('#pl-b-l').textContent = short ? 'Total officer-hours' : 'Officer-hours per month';
      animate('a', numA, week);
      animate('b', numB, short ? week : month);

      Object.keys(cells).forEach(function (k) { cells[k].classList.remove('is-on'); });
      var start = h === 24 ? 0 : night ? 18 : 6;
      eff.forEach(function (d) {
        for (var i = 0; i < h; i++) {
          var hr = start + i;
          var c = cells[(hr >= 24 ? (d + 1) % 7 : d) + '-' + (hr % 24)];
          if (c) c.classList.add('is-on');
        }
      });

      var s = n === 1 ? '' : 's';
      var who = cov === 'patrol' ? n + ' ' + arm + ' patrol officer' + s + ' covering your ' + site
        : cov === 'fire' ? n + ' ' + arm + ' fire watch officer' + s + ' at your ' + site
        : cov === 'access' ? n + ' ' + arm + ' access control officer' + s + ' at your ' + site
        : n + ' ' + arm + ' officer' + s + ' posted at your ' + site;
      var when = h === 24 ? 'around the clock' : night && h === 12 ? '12 hours overnight' : h + (h === 1 ? ' hour' : ' hours') + ' a day';
      var days = dayPhrase(list);
      var long = { day: 'for one day', week: 'for 1 week', month: 'for 1 month', ongoing: 'ongoing' }[dur];
      var say = dur === 'day' ? who + ', ' + when + ', for one day.' : who + ', ' + when + ', ' + days + ', ' + long + '.';
      $('#pl-say').textContent = say.charAt(0).toUpperCase() + say.slice(1);
      var service = cov === 'patrol' ? 'Mobile patrol' : cov === 'fire' ? 'Fire watch' : cov === 'access' ? 'Access control' : site === 'event' ? 'Event security' : 'Armed or unarmed guards';
      plan = {
        service: service,
        message: 'Coverage plan: ' + say + ' That adds up to ' + fmt(week) + ' officer-hours ' + (dur === 'day' ? 'in total.' : 'a week.'),
        hours: when,
        dates: dur === 'day' ? 'One day' : days + ', ' + long
      };
    }
    root.addEventListener('change', function (e) {
      /* Always keep at least one day selected. */
      if (e.target.name === 'pl-day' && !picked().length) e.target.checked = true;
      render();
    });
    off.addEventListener('input', render);
    hrs.addEventListener('input', function () { night = false; render(); });
    $('#pl-night').addEventListener('click', function () { night = true; hrs.value = 12; render(); });
    $('#pl-247').addEventListener('click', function () { night = false; hrs.value = 24; dayBoxes().forEach(function (b) { b.checked = true; }); render(); });
    $('#pl-every').addEventListener('click', function () { dayBoxes().forEach(function (b) { b.checked = true; }); render(); });
    $('#pl-send').addEventListener('click', function () { window.__rq(plan); });
    render();
  })();

  /* ---- Scroll work: header, progress ring, scroll-spy, reveals ---- */
  var hdr = $('#navigation');
  var toTop = $('#to-top');
  var ring = $('#to-top-ring');
  var links = $$('.nav > li > a');
  var spots = links.map(function (a) { return $(a.getAttribute('href')); });
  var rvs = $$('[data-rv]');
  var rvOn = false;

  function mark(el) {
    el.classList.add('is-in');
    setTimeout(function () { el.classList.add('is-done'); }, 1500);
  }
  function revealPast() {
    if (!rvOn) return;
    var line = window.innerHeight * 0.94;
    rvs = rvs.filter(function (r) {
      if (r.getBoundingClientRect().top < line) { mark(r); return false; }
      return true;
    });
  }
  function onScroll() {
    var y = window.scrollY;
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    hdr.classList.toggle('is-stuck', y > 40);
    toTop.classList.toggle('is-on', y > 400);
    ring.style.strokeDashoffset = 1 - clamp(y / max, 0, 1);
    var at = y + 160, cur = 0;
    spots.forEach(function (s, i) { if (s && s.getBoundingClientRect().top + y <= at) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-current', i === cur); });
    revealPast();
  }
  var queued = false;
  function queue() {
    if (queued) return;
    queued = true;
    var run = function () { if (!queued) return; queued = false; onScroll(); };
    requestAnimationFrame(run);
    setTimeout(run, 120);
  }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  toTop.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); scrollToY(0); });

  if (!reduce && 'IntersectionObserver' in window) {
    doc.classList.add('rv-on');
    rvOn = true;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { mark(e.target); io.unobserve(e.target); rvs = rvs.filter(function (r) { return r !== e.target; }); }
      });
    }, { threshold: 0.12 });
    rvs.forEach(function (r) { io.observe(r); });
  }
  onScroll();

  /* ---- Count-ups once in view ---- */
  (function () {
    var els = $$('[data-count]');
    if ('IntersectionObserver' in window && !reduce) {
      var c = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          c.unobserve(e.target);
          var to = +e.target.getAttribute('data-to');
          if (to > 0) tween(e.target, 0, to, 1000);
        });
      }, { threshold: 0.4 });
      els.forEach(function (e) { c.observe(e); });
    }
  })();

  /* ---- Pointer effects: desktop mouse only, never with reduced motion ---- */
  if (!finePointer || reduce) return;

  /* Cursor */
  (function () {
    var ringEl = $('#cur');
    var dot = $('#cur-d');
    var label = $('#cur-l');
    var mx = -100, my = -100, rx = -100, ry = -100, on = false;
    var hotSel = 'a, button, label, .bc, .flip, .unit, .town, .st, .svc__t, .q, .hn, .pl__r, .cmp tbody tr, .xc__q';
    doc.classList.add('has-cur');
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!on) { on = true; rx = mx; ry = my; ringEl.classList.remove('is-gone'); }
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      var t = e.target && e.target.closest ? e.target : null;
      var labelled = t ? t.closest('[data-cursor]') : null;
      var hot = t ? t.closest(hotSel) : null;
      ringEl.classList.toggle('is-label', !!labelled);
      ringEl.classList.toggle('is-hot', !!hot && !labelled);
      if (labelled) label.textContent = labelled.getAttribute('data-cursor');
    }, { passive: true });
    document.addEventListener('mouseleave', function () { on = false; ringEl.classList.add('is-gone'); });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ringEl.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  })();

  /* Magnetic buttons */
  $$('[data-magnetic]').forEach(function (b) {
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) * 0.22;
      var y = (e.clientY - r.top - r.height / 2) * 0.32;
      b.style.transform = 'translate(' + clamp(x, -12, 12) + 'px,' + clamp(y, -9, 9) + 'px)';
    });
    b.addEventListener('pointerleave', function () { b.style.transform = ''; });
  });

  /* Van photo tilt (only present once the photo is added) */
  $$('.van').forEach(function (v) {
    var f = $('.van__frame', v);
    v.addEventListener('pointermove', function (e) {
      var r = v.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      f.style.transform = 'rotateY(' + (px * 9).toFixed(2) + 'deg) rotateX(' + (-py * 7).toFixed(2) + 'deg)';
    });
    v.addEventListener('pointerleave', function () { f.style.transform = ''; });
  });
})();
