import { H as Hls } from './video-vendor-dru42stk.js';

function attachHls(video, source) {
    if (!video || !source || video.dataset.ready === 'true') {
        return;
    }

    video.dataset.ready = 'true';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
                return;
            }

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
            } else {
                hls.destroy();
                video.src = source;
            }
        });
    } else {
        video.src = source;
    }
}

function setupPlayers() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    panels.forEach(function (panel) {
        var video = panel.querySelector('video[data-src]');
        var button = panel.querySelector('[data-player-button]');

        if (!video) {
            return;
        }

        function playVideo() {
            attachHls(video, video.getAttribute('data-src'));
            panel.classList.add('is-playing');
            var result = video.play();

            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    panel.classList.remove('is-playing');
                    video.controls = true;
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            panel.classList.add('is-playing');
        });
    });
}

document.addEventListener('DOMContentLoaded', setupPlayers);
