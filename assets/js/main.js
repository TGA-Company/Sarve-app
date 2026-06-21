/* =========================================================
   SARV — Proposal Site interactions
   ========================================================= */
(function () {
  'use strict';

  /* ---- Persian digit helpers ---- */
  var FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  function toFa(s) { return String(s).replace(/\d/g, function (d) { return FA[d]; }); }
  function group(n) { return toFa(Math.round(n).toLocaleString('en-US')); }

  /* ---- Scroll progress + sticky nav ---- */
  var progress = document.getElementById('scrollProgress');
  var nav = document.getElementById('nav');
  function onScroll() {
    var st = window.scrollY || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('is-scrolled', st > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Active nav link on scroll (scrollspy) ---- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  function spy() {
    var pos = (window.scrollY || 0) + 120;
    var current = '';
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) current = sec.id;
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Animated counters ---- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = (String(target).split('.')[1] || '').length;
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = toFa(val.toFixed(decimals)) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = toFa(target.toFixed(decimals)) + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---- Pricing tabs ---- */
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var panelId = tab.getAttribute('data-panel');
      tabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
      document.querySelectorAll('.panel').forEach(function (p) {
        var on = p.id === panelId;
        p.classList.toggle('is-active', on);
        if (on) { p.hidden = false; } else { p.hidden = true; }
      });
    });
  });

  /* ---- 3 questions interactive summary ---- */
  var answers = {};
  var labels = { q1: 'حالت اجرا', q2: 'روش هوش مصنوعی', q3: 'نسخه موبایل' };
  var summary = document.getElementById('qaSummary');
  var summaryList = document.getElementById('qaSummaryList');

  document.querySelectorAll('.opts').forEach(function (group) {
    var key = group.getAttribute('data-group');
    group.querySelectorAll('.opt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        group.querySelectorAll('.opt').forEach(function (o) { o.classList.toggle('is-selected', o === opt); });
        answers[key] = opt.getAttribute('data-val');
        renderSummary();
      });
    });
  });

  function renderSummary() {
    if (!summary || !summaryList) return;
    var keys = Object.keys(answers);
    if (!keys.length) { summary.hidden = true; return; }
    summaryList.innerHTML = '';
    ['q1', 'q2', 'q3'].forEach(function (k) {
      if (!answers[k]) return;
      var li = document.createElement('li');
      li.innerHTML = '<span>' + labels[k] + ': <b style="color:var(--text)">' + answers[k] + '</b></span>';
      summaryList.appendChild(li);
    });
    summary.hidden = false;
  }

  /* ---- Send selection (builds a prefilled message) ---- */
  var sendBtn = document.getElementById('qaSend');
  if (sendBtn) {
    sendBtn.addEventListener('click', function (e) {
      var lines = ['سلام، انتخاب‌های من برای پروژه سرو:'];
      ['q1', 'q2', 'q3'].forEach(function (k) {
        if (answers[k]) lines.push('• ' + labels[k] + ': ' + answers[k]);
      });
      var text = encodeURIComponent(lines.join('\n'));
      // Replace 989000000000 with the real WhatsApp number.
      sendBtn.setAttribute('href', 'https://wa.me/989000000000?text=' + text);
    });
  }

  /* ---- Footer year (Gregorian -> keep static Persian label, but stamp if needed) ---- */
  // Static '۱۴۰۵' kept in markup; no Date() needed.
})();
