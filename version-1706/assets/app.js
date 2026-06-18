(function () {
    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
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
            }, 5000);
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

    function initRows() {
        document.querySelectorAll('[data-scroll-row]').forEach(function (row) {
            var section = row.closest('.content-section');
            if (!section) {
                return;
            }
            var left = section.querySelector('[data-scroll-left]');
            var right = section.querySelector('[data-scroll-right]');
            function move(direction) {
                row.scrollBy({
                    left: direction * Math.min(640, row.clientWidth * 0.85),
                    behavior: 'smooth'
                });
            }
            if (left) {
                left.addEventListener('click', function () {
                    move(-1);
                });
            }
            if (right) {
                right.addEventListener('click', function () {
                    move(1);
                });
            }
        });
    }

    function initSearch() {
        var input = document.querySelector('[data-site-search]');
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-search]');
        var clear = document.querySelector('[data-clear-search]');

        function haystack(card) {
            return [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-tags') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-genre') || ''
            ].join(' ').toLowerCase();
        }

        function apply() {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var matched = !keyword || haystack(card).indexOf(keyword) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        input.addEventListener('input', apply);
        if (clear) {
            clear.addEventListener('click', function () {
                input.value = '';
                apply();
                input.focus();
            });
        }
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (wrap) {
            var video = wrap.querySelector('video');
            var overlay = wrap.querySelector('.player-overlay');
            if (!video) {
                return;
            }
            var src = video.getAttribute('data-stream');
            var ready = false;
            var hls = null;

            function load() {
                if (ready || !src) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
                ready = true;
            }

            function play() {
                load();
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            video.addEventListener('ended', function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
            window.addEventListener('pagehide', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initRows();
        initSearch();
        initPlayers();
    });
})();
