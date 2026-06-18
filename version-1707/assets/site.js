(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }

    var backTop = document.querySelector('[data-back-top]');
    if (backTop) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 420) {
          backTop.classList.add('show');
        } else {
          backTop.classList.remove('show');
        }
      });
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer;

      function show(target) {
        if (!slides.length) return;
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function restart() {
        window.clearInterval(timer);
        start();
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          restart();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll('[data-search-input]').forEach(function (input) {
      var scope = document.querySelector(input.getAttribute('data-search-input')) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
      var status = document.querySelector(input.getAttribute('data-search-status'));

      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          var matched = !value || haystack.indexOf(value) !== -1;
          card.classList.toggle('hidden-card', !matched);
          if (matched) visible += 1;
        });
        if (status) {
          status.classList.toggle('show', value.length > 0 && visible === 0);
        }
      });
    });
  });
})();
