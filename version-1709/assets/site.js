(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var sliders = document.querySelectorAll("[data-hero-slider]");
    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
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
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    });
  }

  function uniqueValues(cards, attr) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(attr) || "";
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-Hans-CN");
    });
  }

  function setupSearch() {
    var scopes = document.querySelectorAll("[data-search-scope]");
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));

      if (!input || !cards.length) {
        return;
      }

      selects.forEach(function (select) {
        var attr = "data-" + select.getAttribute("data-filter");
        uniqueValues(cards, attr).forEach(function (value) {
          var option = document.createElement("option");
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
      });

      function apply() {
        var query = input.value.trim().toLowerCase();
        var filters = {};
        selects.forEach(function (select) {
          filters[select.getAttribute("data-filter")] = select.value;
        });
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-category")
          ].join(" ").toLowerCase();
          var matched = !query || text.indexOf(query) !== -1;
          Object.keys(filters).forEach(function (key) {
            var value = filters[key];
            if (value && card.getAttribute("data-" + key) !== value) {
              matched = false;
            }
          });
          card.classList.toggle("is-hidden", !matched);
        });
      }

      input.addEventListener("input", apply);
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();

function initMoviePlayer(url) {
  var video = document.querySelector(".movie-video");
  var overlay = document.querySelector(".play-overlay");
  var started = false;
  var hlsInstance = null;

  if (!video || !overlay || !url) {
    return;
  }

  function startVideo() {
    overlay.classList.add("is-hidden");
    if (!started) {
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = url;
        video.play().catch(function () {});
      }
    } else {
      video.play().catch(function () {});
    }
  }

  overlay.addEventListener("click", startVideo);
  video.addEventListener("click", function () {
    if (video.paused) {
      startVideo();
    } else {
      video.pause();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
