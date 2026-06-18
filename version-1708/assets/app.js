(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function toggleMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function mountHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
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

    if (slides.length === 0) {
      return;
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

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

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function mountScrollers() {
    document.querySelectorAll(".scroller-wrap").forEach(function (wrap) {
      var area = wrap.querySelector("[data-scroll-area]");
      var left = wrap.querySelector("[data-scroll-left]");
      var right = wrap.querySelector("[data-scroll-right]");
      if (!area) {
        return;
      }
      function scroll(direction) {
        var amount = Math.max(280, Math.floor(area.clientWidth * 0.82));
        area.scrollBy({
          left: direction * amount,
          behavior: "smooth"
        });
      }
      if (left) {
        left.addEventListener("click", function () {
          scroll(-1);
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          scroll(1);
        });
      }
    });
  }

  function uniqueValues(cards, key) {
    var set = new Set();
    cards.forEach(function (card) {
      var value = card.getAttribute(key);
      if (value) {
        set.add(value);
      }
    });
    return Array.from(set).sort(function (a, b) {
      return b.localeCompare(a, "zh-CN", { numeric: true });
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function mountFilters() {
    document.querySelectorAll(".filter-scope").forEach(function (scope) {
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var input = scope.querySelector("[data-filter-input]");
      var region = scope.querySelector("[data-filter-region]");
      var year = scope.querySelector("[data-filter-year]");
      var category = scope.querySelector("[data-filter-category]");
      var empty = scope.querySelector("[data-filter-empty]");
      fillSelect(region, uniqueValues(cards, "data-region"));
      fillSelect(year, uniqueValues(cards, "data-year"));
      fillSelect(category, uniqueValues(cards, "data-category"));

      function filter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        var categoryValue = category ? category.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-category") || "",
            card.getAttribute("data-tags") || ""
          ].join(" ").toLowerCase();
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (regionValue && card.getAttribute("data-region") !== regionValue) {
            matched = false;
          }
          if (yearValue && card.getAttribute("data-year") !== yearValue) {
            matched = false;
          }
          if (categoryValue && card.getAttribute("data-category") !== categoryValue) {
            matched = false;
          }
          card.classList.toggle("is-hidden-by-filter", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, region, year, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filter);
          control.addEventListener("change", filter);
        }
      });
    });
  }

  window.MoviePlayer = {
    mount: function (streamUrl) {
      var root = document.querySelector("[data-player]");
      if (!root) {
        return;
      }
      var video = root.querySelector("video");
      var overlay = root.querySelector(".player-overlay");
      var prepared = false;
      var hls = null;

      function prepare() {
        if (prepared || !video) {
          return;
        }
        var mediaType = "application/vnd.apple.mpegurl";
        if (video.canPlayType(mediaType)) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        prepared = true;
      }

      function begin() {
        prepare();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (!video) {
        return;
      }

      if (overlay) {
        overlay.addEventListener("click", begin);
      }

      video.addEventListener("click", function () {
        if (!prepared || video.paused) {
          begin();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      video.addEventListener("ended", function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  };

  ready(function () {
    toggleMenu();
    mountHero();
    mountScrollers();
    mountFilters();
  });
})();
