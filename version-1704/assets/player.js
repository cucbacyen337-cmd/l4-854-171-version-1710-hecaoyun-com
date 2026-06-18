function bindMoviePlayer(videoId, playId, overlayId, sourceUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var play = document.getElementById(playId);
  var hls = null;
  var ready = false;
  var loading = false;
  var callbacks = [];

  if (!video || !overlay || !sourceUrl) {
    return;
  }

  function flush() {
    var queue = callbacks.slice();
    callbacks = [];
    queue.forEach(function(callback) {
      callback();
    });
  }

  function attachSource(callback) {
    callbacks.push(callback);

    if (ready) {
      flush();
      return;
    }

    if (loading) {
      return;
    }

    loading = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      ready = true;
      flush();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
        ready = true;
        flush();
      });

      hls.on(window.Hls.Events.ERROR, function(event, data) {
        if (data && data.fatal) {
          overlay.classList.remove('is-hidden');
        }
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
    ready = true;
    flush();
  }

  function startPlay() {
    attachSource(function() {
      overlay.classList.add('is-hidden');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function() {
          overlay.classList.remove('is-hidden');
        });
      }
    });
  }

  overlay.addEventListener('click', startPlay);

  if (play) {
    play.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      startPlay();
    });
  }

  video.addEventListener('click', function() {
    if (video.paused) {
      startPlay();
    } else {
      video.pause();
    }
  });

  window.addEventListener('beforeunload', function() {
    if (hls) {
      hls.destroy();
    }
  });
}
