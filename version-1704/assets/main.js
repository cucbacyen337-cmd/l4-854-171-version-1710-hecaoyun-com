(function() {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '×' : '☰';
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    start();
  }

  var cardFilter = document.querySelector('.page-filter');
  var yearFilter = document.querySelector('.page-filter-select');

  function applyCardFilter() {
    var query = cardFilter ? cardFilter.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value.trim() : '';
    var cards = document.querySelectorAll('.filter-grid .movie-card');

    cards.forEach(function(card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var yearMatch = !year || haystack.indexOf(year) !== -1;
      var textMatch = !query || haystack.indexOf(query) !== -1;
      card.classList.toggle('is-hidden-card', !(yearMatch && textMatch));
    });
  }

  if (cardFilter) {
    cardFilter.addEventListener('input', applyCardFilter);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyCardFilter);
  }

  var tableFilter = document.querySelector('.table-filter');

  if (tableFilter) {
    tableFilter.addEventListener('input', function() {
      var query = tableFilter.value.trim().toLowerCase();
      document.querySelectorAll('.ranking-table tbody tr').forEach(function(row) {
        var text = (row.getAttribute('data-search') || row.textContent || '').toLowerCase();
        row.classList.toggle('is-hidden-row', query && text.indexOf(query) === -1);
      });
    });
  }
})();
