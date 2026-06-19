import { H as Hls } from "./hls.js";

function initPlayer(shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var status = shell.querySelector(".player-status");
    var source = shell.getAttribute("data-video-src");

    if (!video || !source) {
        return;
    }

    function setStatus(text, hidden) {
        if (!status) {
            return;
        }
        status.textContent = text;
        status.hidden = Boolean(hidden);
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源已就绪", true);
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
                return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                setStatus("网络波动，正在重新加载", false);
                hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                setStatus("媒体解码恢复中", false);
                hls.recoverMediaError();
            } else {
                setStatus("播放源暂时无法加载", false);
                hls.destroy();
            }
        });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
            setStatus("播放源已就绪", true);
        });
    } else {
        setStatus("当前浏览器需要支持 HLS 播放", false);
    }

    function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                setStatus("请再次点击播放按钮", false);
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
        shell.classList.add("is-playing");
        setStatus("播放中", true);
    });

    video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
    });
}

document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(initPlayer);
});
