document.addEventListener("DOMContentLoaded", function () {
  var box = document.querySelector("[data-player]");

  if (!box) {
    return;
  }

  var video = box.querySelector("video");
  var overlay = box.querySelector("[data-play-overlay]");
  var button = box.querySelector("[data-play-button]");

  if (!video || !overlay || !button) {
    return;
  }

  var source = video.getAttribute("data-play-url");
  var loaded = false;
  var hlsInstance = null;

  function loadVideo() {
    if (loaded || !source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }

    loaded = true;
  }

  function startVideo() {
    loadVideo();
    overlay.hidden = true;
    video.controls = true;

    var playResult = video.play();

    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {
        overlay.hidden = false;
      });
    }
  }

  overlay.addEventListener("click", startVideo);
  button.addEventListener("click", startVideo);

  video.addEventListener("click", function () {
    if (video.paused) {
      startVideo();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
});
