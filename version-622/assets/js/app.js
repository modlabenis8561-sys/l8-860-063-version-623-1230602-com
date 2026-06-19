(function () {
    var ready = function (callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    };

    ready(function () {
        var navButton = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-site-nav]');

        if (navButton && nav) {
            navButton.addEventListener('click', function () {
                nav.classList.toggle('open');
            });
        }

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var current = 0;
            var timer;

            var show = function (index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === current);
                });
            };

            var start = function () {
                clearInterval(timer);
                timer = setInterval(function () {
                    show(current + 1);
                }, 5600);
            };

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
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

            show(0);
            start();
        });

        document.querySelectorAll('[data-filter-group]').forEach(function (group) {
            var section = group.closest('section') || document;
            var grid = section.querySelector('[data-filter-grid]');
            if (!grid) {
                return;
            }

            var input = group.querySelector('[data-filter-input]');
            var year = group.querySelector('[data-filter-year]');
            var type = group.querySelector('[data-filter-type]');
            var region = group.querySelector('[data-filter-region]');
            var cards = Array.prototype.slice.call(grid.children);

            var apply = function () {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var yearValue = year ? year.value : '';
                var typeValue = type ? type.value : '';
                var regionValue = region ? region.value : '';

                cards.forEach(function (card) {
                    var search = (card.getAttribute('data-search') || '').toLowerCase();
                    var matched = true;

                    if (keyword && search.indexOf(keyword) === -1) {
                        matched = false;
                    }

                    if (yearValue && card.getAttribute('data-year') !== yearValue) {
                        matched = false;
                    }

                    if (typeValue && card.getAttribute('data-type') !== typeValue) {
                        matched = false;
                    }

                    if (regionValue && card.getAttribute('data-region') !== regionValue) {
                        matched = false;
                    }

                    card.hidden = !matched;
                });
            };

            [input, year, type, region].forEach(function (field) {
                if (field) {
                    field.addEventListener('input', apply);
                    field.addEventListener('change', apply);
                }
            });
        });

        document.querySelectorAll('.player-shell').forEach(function (shell) {
            var video = shell.querySelector('.js-player');
            var button = shell.querySelector('.js-play');
            var hlsInstance = null;

            if (!video || !button) {
                return;
            }

            var sourceUrl = video.getAttribute('data-hls');

            var ensureSource = function () {
                if (video.getAttribute('data-ready') === 'true') {
                    return;
                }

                video.setAttribute('data-ready', 'true');

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(sourceUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = sourceUrl;
                }
            };

            var startPlay = function () {
                ensureSource();
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        button.classList.remove('is-hidden');
                    });
                }
            };

            button.addEventListener('click', function () {
                startPlay();
            });

            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlay();
                } else {
                    video.pause();
                }
            });

            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
            });

            video.addEventListener('pause', function () {
                if (!video.ended) {
                    button.classList.remove('is-hidden');
                }
            });

            video.addEventListener('ended', function () {
                button.classList.remove('is-hidden');
            });
        });
    });
})();
