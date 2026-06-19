(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = !document.body.classList.contains("nav-open");
            document.body.classList.toggle("nav-open", open);
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
        document.querySelectorAll(".main-nav a").forEach(function (link) {
            link.addEventListener("click", function () {
                document.body.classList.remove("nav-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    function setupHero() {
        document.querySelectorAll(".hero-slider").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
            var prev = slider.querySelector(".hero-prev");
            var next = slider.querySelector(".hero-next");
            if (!slides.length) {
                return;
            }
            var index = slides.findIndex(function (slide) {
                return slide.classList.contains("active");
            });
            if (index < 0) {
                index = 0;
            }
            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === index);
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                });
            }
            var timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
            slider.addEventListener("mouseenter", function () {
                window.clearInterval(timer);
            });
            slider.addEventListener("mouseleave", function () {
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5600);
            });
        });
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        document.querySelectorAll(".filter-scope").forEach(function (scope) {
            var search = scope.querySelector(".js-search");
            var filters = Array.prototype.slice.call(scope.querySelectorAll(".js-filter"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector(".empty-state");
            function apply() {
                var query = normalize(search ? search.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var ok = !query || haystack.indexOf(query) !== -1;
                    filters.forEach(function (filter) {
                        var value = normalize(filter.value);
                        var field = filter.getAttribute("data-field");
                        var target = normalize(card.getAttribute("data-" + field));
                        if (value && target.indexOf(value) === -1) {
                            ok = false;
                        }
                    });
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            if (search) {
                search.addEventListener("input", apply);
            }
            filters.forEach(function (filter) {
                filter.addEventListener("change", apply);
            });
        });
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector("script[data-hls-lib='1']");
        if (existing) {
            existing.addEventListener("load", callback, { once: true });
            return;
        }
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
        script.setAttribute("data-hls-lib", "1");
        script.onload = callback;
        document.head.appendChild(script);
    }

    window.initMoviePlayer = function (videoId, streamUrl) {
        var video = document.getElementById(videoId);
        if (!video || !streamUrl) {
            return;
        }
        var shell = video.closest(".player-shell");
        var cover = shell ? shell.querySelector(".player-cover") : null;
        var started = false;
        var instance = null;
        function playVideo() {
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        function start() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
            if (started) {
                playVideo();
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                playVideo();
                return;
            }
            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    instance = new window.Hls({ maxBufferLength: 30 });
                    instance.loadSource(streamUrl);
                    instance.attachMedia(video);
                    instance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                } else {
                    video.src = streamUrl;
                    video.addEventListener("loadedmetadata", playVideo, { once: true });
                    playVideo();
                }
            });
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (instance) {
                instance.destroy();
                instance = null;
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
