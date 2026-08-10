/* Narcos Records — скрипты страницы. Без библиотек. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var hdr  = $('#hdr');
  var dock = $('#dock');

  // шапка плотнеет при скролле, нижняя панель выезжает после первого экрана
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (hdr)  hdr.classList.toggle('is-stuck', y > 24);
    if (dock) dock.classList.toggle('is-on', y > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  // бургер
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
    $$('a', mnav).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    // на десктопе меню прячется через CSS, но состояние надо сбросить
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) setMenu(false);
    });
  }


  // подсветка текущего пункта в навигации
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


  // появление блоков при скролле
  var animated = $$('.js-fade, .js-card, .js-head');

  if (reduce || !('IntersectionObserver' in window)) {
    animated.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var obs = new IntersectionObserver(function (entries, self) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;

        // карточки внутри одной сетки выходят каскадом, но не бесконечно
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

    // первый экран показываем сразу, ждать скролла тут нечего
    $$('.hero .js-fade, .hero .js-head').forEach(function (el) {
      el.classList.add('is-in');
      obs.unobserve(el);
    });
  }


  // цифры в блоке метрик
  function runCount(el) {
    var to = parseFloat(el.getAttribute('data-to'));
    if (isNaN(to)) return;
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var dur = 1100;
    var t0 = null;

    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = $$('.js-count');
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


  // фото ещё не залиты — прячем битую картинку, под ней остаётся заглушка
  $$('.ph img').forEach(function (img) {
    function markEmpty() {
      var box = img.closest('.ph');
      if (box) box.classList.add('is-empty');
    }
    img.addEventListener('error', markEmpty);
    if (img.complete && img.naturalWidth === 0) markEmpty();
  });


  // Скорость бегущей строки считаем по ширине содержимого, иначе на широком
  // экране она еле ползёт. Ждём шрифты: до их загрузки ширина другая.
  function tuneMarquee() {
    var track = $('.marquee-track');
    if (!track || reduce) return;
    var first = track.firstElementChild;
    if (!first) return;
    var w = first.getBoundingClientRect().width;
    track.style.animationDuration = Math.max(20, Math.round(w / 70)) + 's';
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(tuneMarquee);
  } else {
    window.addEventListener('load', tuneMarquee);
  }


  // запасной плавный скролл для браузеров без scroll-behavior
  if (!('scrollBehavior' in document.documentElement.style) && !reduce) {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = $(id);
        if (!target) return;
        e.preventDefault();
        var offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--hdr'), 10) || 64;
        window.scrollTo(0, target.getBoundingClientRect().top + window.pageYOffset - offset - 12);
      });
    });
  }

})();
