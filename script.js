/* ============================================================
   NARCOS RECORDS — script.js
   Без зависимостей. Всё опционально и деградирует безопасно.
   Разделы: 1) reduced-motion  2) шапка  3) бургер  4) активный пункт
            5) появление при скролле  6) счётчики  7) битые картинки
            8) мобильная панель  9) бегущая строка
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ==========================================================
     1. ШАПКА: фон и LED-линия при скролле
     ========================================================== */
  var hdr = $('#hdr');
  var dock = $('#dock');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (hdr) hdr.classList.toggle('is-stuck', y > 24);
    // Мобильная панель показывается после первого экрана
    if (dock) dock.classList.toggle('is-on', y > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ==========================================================
     2. БУРГЕР И МОБИЛЬНОЕ МЕНЮ
     ========================================================== */
  var burger = $('#burger');
  var mnav = $('#mnav');

  function setMenu(open) {
    if (!burger || !mnav) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    mnav.hidden = !open;
    document.body.classList.toggle('is-locked', open);
  }

  if (burger && mnav) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    // Закрываем по клику на пункт
    $$('a', mnav).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    // Закрываем по Esc
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    // Закрываем при переходе на десктоп
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) setMenu(false);
    });
  }

  /* ==========================================================
     3. АКТИВНЫЙ ПУНКТ НАВИГАЦИИ
     ========================================================== */
  var navLinks = $$('.nav a');
  var sections = navLinks
    .map(function (a) { return $(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ==========================================================
     4. ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПРИ СКРОЛЛЕ
     ========================================================== */
  var animated = $$('.js-fade, .js-card, .js-head');

  if (reduce || !('IntersectionObserver' in window)) {
    animated.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var obs = new IntersectionObserver(function (entries, self) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        // Карточки внутри одной сетки появляются каскадом
        var delay = 0;
        if (el.classList.contains('js-card') && el.parentElement) {
          var sibs = $$('.js-card', el.parentElement);
          delay = Math.min(sibs.indexOf(el), 5) * 70;
        }
        setTimeout(function () { el.classList.add('is-in'); }, delay);
        self.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    animated.forEach(function (el) { obs.observe(el); });

    // Первый экран показываем сразу, не дожидаясь скролла
    $$('.hero .js-fade, .hero .js-head').forEach(function (el) {
      el.classList.add('is-in');
      obs.unobserve(el);
    });
  }

  /* ==========================================================
     5. СЧЁТЧИКИ В БЛОКЕ МЕТРИК
     ========================================================== */
  var counters = $$('.js-count');

  function runCount(el) {
    var to = parseFloat(el.getAttribute('data-to'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (isNaN(to)) return;
    var dur = 1100, t0 = null;

    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * eased).toFixed(dec).replace('.', dec ? '.' : '');
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = to.toFixed(dec);
    }
    requestAnimationFrame(step);
  }

  if (!reduce && 'IntersectionObserver' in window && counters.length) {
    var cObs = new IntersectionObserver(function (entries, self) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        runCount(en.target);
        self.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cObs.observe(el); });
  }

  /* ==========================================================
     6. НЕЗАГРУЖЕННЫЕ КАРТИНКИ → остаётся аккуратный плейсхолдер
        (пока в assets/ нет реальных фото)
     ========================================================== */
  $$('.ph img').forEach(function (img) {
    function markEmpty() {
      var box = img.closest('.ph');
      if (box) box.classList.add('is-empty');
    }
    img.addEventListener('error', markEmpty);
    // Картинка уже успела упасть до навешивания обработчика
    if (img.complete && img.naturalWidth === 0) markEmpty();
  });

  /* ==========================================================
     7. БЕГУЩАЯ СТРОКА: скорость под ширину контента,
        чтобы на любом экране лента шла ровно
     ========================================================== */
  var track = $('.marquee-track');
  if (track && !reduce) {
    var first = track.firstElementChild;
    if (first) {
      var w = first.getBoundingClientRect().width;
      var speed = 70; // px в секунду
      track.style.animationDuration = Math.max(20, Math.round(w / speed)) + 's';
    }
  }

  /* ==========================================================
     8. ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ
        (запасной вариант для браузеров без scroll-behavior)
     ========================================================== */
  if (!('scrollBehavior' in document.documentElement.style) && !reduce) {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        var target = $(id);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset -
                  (parseInt(getComputedStyle(document.documentElement)
                    .getPropertyValue('--hdr'), 10) || 64) - 12;
        window.scrollTo(0, top);
      });
    });
  }

})();
