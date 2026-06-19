(function () {
  function initMoviePlayer(options) {
    var video = document.querySelector(options.video);
    var cover = document.querySelector(options.cover);
    if (!video || !options.url) {
      return;
    }

    var loaded = false;
    var start = function () {
      if (!loaded) {
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(options.url);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = options.url;
        } else {
          video.src = options.url;
        }
      }
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    };

    if (cover) {
      cover.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
