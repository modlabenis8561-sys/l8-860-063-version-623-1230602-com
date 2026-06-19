(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-live-search]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
        if (!inputs.length || !cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        function apply(value) {
            var query = value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-keywords') || card.textContent || '').toLowerCase();
                var matched = !query || haystack.indexOf(query) !== -1;
                card.classList.toggle('hidden-by-search', !matched);
            });
        }

        inputs.forEach(function (input) {
            if (initial && !input.value) {
                input.value = initial;
            }
            input.addEventListener('input', function () {
                inputs.forEach(function (other) {
                    if (other !== input) {
                        other.value = input.value;
                    }
                });
                apply(input.value);
            });
        });

        apply(initial);
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('[data-play-button]');
            var cover = shell.querySelector('[data-player-cover]');
            if (!video) {
                return;
            }
            var url = video.getAttribute('data-stream') || '';
            var hlsInstance = null;

            function attachStream() {
                if (!url || video.getAttribute('data-ready') === '1') {
                    return;
                }
                if (window.Hls && window.Hls.isSupported() && url.indexOf('.m3u8') !== -1) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }
                video.setAttribute('data-ready', '1');
                shell.classList.add('is-ready');
            }

            function play() {
                attachStream();
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    play();
                });
            }

            if (cover) {
                cover.addEventListener('click', function (event) {
                    if (event.target !== button) {
                        play();
                    }
                });
            }

            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });

            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayers();
    });
}());
