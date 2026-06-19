document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
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
    }

    function restartHero() {
        if (!slides.length) {
            return;
        }

        if (timer) {
            clearInterval(timer);
        }

        timer = setInterval(function () {
            showSlide(current + 1);
        }, 5000);
    }

    if (slides.length) {
        restartHero();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            restartHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            restartHero();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            restartHero();
        });
    });

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            var value = input.value.trim().toLowerCase();
            var items = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));
            items.forEach(function (item) {
                var keywords = (item.getAttribute('data-keywords') || '').toLowerCase();
                item.classList.toggle('is-hidden', value.length > 0 && keywords.indexOf(value) === -1);
            });
        });
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.player-start');
        var streamUrl = player.getAttribute('data-stream');
        var loaded = false;
        var hlsInstance = null;

        function attachStream() {
            if (!video || !streamUrl || loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function startPlay() {
            attachStream();

            if (button) {
                button.classList.add('is-hidden');
            }

            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button && video) {
            button.addEventListener('click', startPlay);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlay();
                }
            });

            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });

            video.addEventListener('pause', function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    });
});
