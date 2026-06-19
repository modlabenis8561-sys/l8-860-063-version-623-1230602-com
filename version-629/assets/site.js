(function () {
    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');

        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var nextButton = slider.querySelector('[data-hero-next]');
        var prevButton = slider.querySelector('[data-hero-prev]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startAutoPlay() {
            stopAutoPlay();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 6000);
        }

        function stopAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')));
                startAutoPlay();
            });
        });

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showSlide(current + 1);
                startAutoPlay();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                showSlide(current - 1);
                startAutoPlay();
            });
        }

        slider.addEventListener('mouseenter', stopAutoPlay);
        slider.addEventListener('mouseleave', startAutoPlay);
        showSlide(0);
        startAutoPlay();
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }

        values.sort(function (a, b) {
            return a.localeCompare(b, 'zh-CN');
        });

        values.forEach(function (value) {
            if (!value) {
                return;
            }
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

        panels.forEach(function (panel) {
            var container = panel.parentElement.querySelector('[data-card-container]');

            if (!container) {
                return;
            }

            var cards = Array.prototype.slice.call(container.querySelectorAll('[data-search-text]'));
            var searchInput = panel.querySelector('[data-search-input]');
            var regionSelect = panel.querySelector('[data-region-filter]');
            var typeSelect = panel.querySelector('[data-type-filter]');
            var categorySelect = panel.querySelector('[data-category-filter]');
            var resetButton = panel.querySelector('[data-reset-filters]');
            var stats = panel.querySelector('[data-filter-stats]');
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q') || '';

            var regions = [];
            var types = [];

            cards.forEach(function (card) {
                var region = card.getAttribute('data-region') || '';
                var type = card.getAttribute('data-type') || '';

                if (region && regions.indexOf(region) === -1) {
                    regions.push(region);
                }

                if (type && types.indexOf(type) === -1) {
                    types.push(type);
                }
            });

            fillSelect(regionSelect, regions);
            fillSelect(typeSelect, types);

            if (searchInput && initialQuery) {
                searchInput.value = initialQuery;
            }

            function applyFilters() {
                var query = normalize(searchInput ? searchInput.value : '');
                var region = normalize(regionSelect ? regionSelect.value : '');
                var type = normalize(typeSelect ? typeSelect.value : '');
                var category = normalize(categorySelect ? categorySelect.value : '');
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search-text'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardCategory = normalize(card.getAttribute('data-category'));
                    var matches = true;

                    if (query && text.indexOf(query) === -1) {
                        matches = false;
                    }

                    if (region && cardRegion !== region) {
                        matches = false;
                    }

                    if (type && cardType !== type) {
                        matches = false;
                    }

                    if (category && cardCategory !== category) {
                        matches = false;
                    }

                    card.classList.toggle('is-hidden-by-filter', !matches);
                    if (matches) {
                        visibleCount += 1;
                    }
                });

                if (stats) {
                    stats.textContent = '显示 ' + visibleCount + ' / ' + cards.length + ' 部';
                }
            }

            [searchInput, regionSelect, typeSelect, categorySelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilters);
                    control.addEventListener('change', applyFilters);
                }
            });

            if (resetButton) {
                resetButton.addEventListener('click', function () {
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    if (regionSelect) {
                        regionSelect.value = '';
                    }
                    if (typeSelect) {
                        typeSelect.value = '';
                    }
                    if (categorySelect) {
                        categorySelect.value = '';
                    }
                    applyFilters();
                });
            }

            applyFilters();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
    });
})();
