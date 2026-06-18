(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var trigger = player.querySelector('.player-start');
      var url = player.getAttribute('data-m3u8');
      var attached = false;
      var hls;

      function attach() {
        if (attached || !video || !url) return;
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        video.load();
      }

      function play() {
        attach();
        player.classList.add('is-playing');
        video.controls = true;
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      if (trigger) {
        trigger.addEventListener('click', function (event) {
          event.preventDefault();
          play();
        });
      }

      player.addEventListener('click', function (event) {
        if (event.target === player || event.target.classList.contains('player-layer')) {
          play();
        }
      });

      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  });
})();
