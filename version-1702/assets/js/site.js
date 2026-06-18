(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", menu.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var previous = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
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

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll("[data-header-search]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        form.action = "./search.html";
      });
    });
  }

  function setupMovieFilter() {
    var root = document.querySelector("[data-filter-root]");
    if (!root) {
      return;
    }
    var keyword = root.querySelector("[data-filter-keyword]");
    var region = root.querySelector("[data-filter-region]");
    var year = root.querySelector("[data-filter-year]");
    var type = root.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
    var empty = root.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);

    if (keyword && params.get("q")) {
      keyword.value = params.get("q");
    }

    function valueOf(input) {
      return input ? input.value.trim().toLowerCase() : "";
    }

    function apply() {
      var query = valueOf(keyword);
      var regionValue = valueOf(region);
      var yearValue = valueOf(year);
      var typeValue = valueOf(type);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-line"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (regionValue && String(card.getAttribute("data-region")).toLowerCase() !== regionValue) {
          ok = false;
        }
        if (yearValue && String(card.getAttribute("data-year")).toLowerCase() !== yearValue) {
          ok = false;
        }
        if (typeValue && String(card.getAttribute("data-type")).toLowerCase() !== typeValue) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [keyword, region, year, type].forEach(function (input) {
      if (!input) {
        return;
      }
      input.addEventListener("input", apply);
      input.addEventListener("change", apply);
    });

    apply();
  }

  function setupPlayers() {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-player-start]");
      var source = player.getAttribute("data-src");
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (player.getAttribute("data-attached") === "true") {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          player.setAttribute("data-attached", "true");
          return;
        }
        video.src = source;
        player.setAttribute("data-attached", "true");
      }

      function playVideo() {
        attachSource();
        var result = video.play();
        if (result && typeof result.then === "function") {
          result.then(function () {
            player.classList.add("is-playing");
          }).catch(function () {
            player.classList.remove("is-playing");
          });
          return;
        }
        player.classList.add("is-playing");
      }

      attachSource();

      if (button) {
        button.addEventListener("click", playVideo);
      }

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
          player.classList.remove("is-playing");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupSearchForms();
    setupMovieFilter();
    setupPlayers();
  });
})();
