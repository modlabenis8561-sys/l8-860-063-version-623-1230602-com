(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    ready(function () {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                menu.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    restart();
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    restart();
                });
            });

            show(0);
            restart();
        });

        document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
            var input = panel.querySelector('[data-filter-input]');
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
            var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
            var currentChip = '';

            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : '';
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.textContent
                    ].join(' ').toLowerCase();
                    var matchedQuery = !query || haystack.indexOf(query) !== -1;
                    var matchedChip = !currentChip || haystack.indexOf(currentChip.toLowerCase()) !== -1;
                    card.classList.toggle('is-hidden-by-search', !(matchedQuery && matchedChip));
                });
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                if (params.get('q')) {
                    input.value = params.get('q');
                }
                input.addEventListener('input', applyFilter);
            }

            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    currentChip = button.getAttribute('data-filter-value') || '';
                    buttons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    applyFilter();
                });
            });

            applyFilter();
        });

        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('[data-player-overlay]');
            var button = player.querySelector('[data-play-button]');
            var source = player.getAttribute('data-source');
            var started = false;
            var hlsInstance = null;

            function begin() {
                if (!video || !source) {
                    return;
                }
                if (!started) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls();
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                    video.controls = true;
                    started = true;
                }
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    begin();
                });
            }

            if (overlay) {
                overlay.addEventListener('click', function (event) {
                    event.preventDefault();
                    begin();
                });
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (!started) {
                        begin();
                    }
                });
                video.addEventListener('ended', function () {
                    if (hlsInstance && hlsInstance.destroy) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                });
            }
        });
    });
})();
