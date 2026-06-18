(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav-links]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      function start() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll(".rail-section").forEach(function (section) {
      var rail = section.querySelector("[data-scroll-rail]");
      var left = section.querySelector("[data-scroll-left]");
      var right = section.querySelector("[data-scroll-right]");
      if (!rail) {
        return;
      }
      if (left) {
        left.addEventListener("click", function () {
          rail.scrollBy({ left: -320, behavior: "smooth" });
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          rail.scrollBy({ left: 320, behavior: "smooth" });
        });
      }
    });

    document.querySelectorAll("[data-card-search]").forEach(function (input) {
      var scope = input.closest(".page-shell") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [card.getAttribute("data-title"), card.getAttribute("data-tags"), card.getAttribute("data-region"), card.getAttribute("data-year")].join(" ").toLowerCase();
          card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
        });
      });
    });

    document.querySelectorAll(".movie-player").forEach(function (video) {
      var stream = video.getAttribute("data-stream");
      var frame = video.closest(".video-frame");
      var overlay = frame ? frame.querySelector(".play-overlay") : null;
      var initialized = false;
      var player = null;

      function init() {
        if (initialized || !stream) {
          return;
        }
        initialized = true;
        if (window.Hls && window.Hls.isSupported()) {
          player = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          player.loadSource(stream);
          player.attachMedia(video);
          video._hlsPlayer = player;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }
      }

      function play() {
        init();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      init();

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove("is-hidden");
        }
      });

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    });

    document.querySelectorAll("[data-play-current]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        var video = document.querySelector(".movie-player");
        var overlay = document.querySelector(".play-overlay");
        if (!video) {
          return;
        }
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (overlay) {
          overlay.click();
        } else {
          video.play();
        }
      });
    });
  });
})();
