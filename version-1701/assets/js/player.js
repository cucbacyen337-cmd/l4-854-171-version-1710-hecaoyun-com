(function () {
    window.initMoviePlayer = function (source) {
        var video = document.getElementById('moviePlayer');
        var cover = document.querySelector('[data-player-cover]');
        var trigger = document.querySelector('[data-play-trigger]');
        var attached = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function hideCover() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        }

        function attachMedia() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            attachMedia();
            hideCover();
            var playAction = video.play();
            if (playAction && typeof playAction.catch === 'function') {
                playAction.catch(function () {
                    if (cover) {
                        cover.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }
        if (trigger) {
            trigger.addEventListener('click', function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener('play', hideCover);
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
