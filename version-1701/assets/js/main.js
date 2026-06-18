(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = $('[data-menu-toggle]');
        var menu = $('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var scope = $('[data-filter-scope]');
        if (!scope) {
            return;
        }
        var search = $('[data-page-search]', scope);
        var reset = $('[data-filter-reset]', scope);
        var chips = $all('[data-filter-value]', scope);
        var cards = $all('[data-movie-card]');
        var empty = $('[data-no-results]');
        var keyword = '';
        var chipValue = '';

        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = card.getAttribute('data-search') || '';
                var region = card.getAttribute('data-region') || '';
                var year = card.getAttribute('data-year') || '';
                var chipPass = !chipValue || region.indexOf(chipValue) !== -1 || year.indexOf(chipValue) !== -1 || haystack.indexOf(chipValue.toLowerCase()) !== -1;
                var wordPass = !keyword || haystack.indexOf(keyword) !== -1;
                var show = chipPass && wordPass;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (search) {
            search.addEventListener('input', function () {
                keyword = search.value.trim().toLowerCase();
                apply();
            });
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                search.value = q;
                keyword = q.trim().toLowerCase();
            }
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                chip.classList.add('is-active');
                chipValue = chip.getAttribute('data-filter-value') || '';
                apply();
            });
        });

        if (reset) {
            reset.addEventListener('click', function () {
                keyword = '';
                chipValue = '';
                if (search) {
                    search.value = '';
                }
                chips.forEach(function (item, i) {
                    item.classList.toggle('is-active', i === 0);
                });
                apply();
            });
        }
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
