(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.hidden = !panel.hidden;
        });
    }

    function initHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-slide-to")) || 0);
                start();
            });
        });

        start();
    }

    function initPageFilter() {
        var input = document.getElementById("page-search");
        var grid = document.getElementById("movie-grid");
        var empty = document.querySelector(".empty-tip");
        if (!grid) {
            return;
        }
        var items = Array.prototype.slice.call(grid.children);
        var sort = document.getElementById("page-sort");

        function filterItems() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;
            items.forEach(function (item) {
                var text = item.getAttribute("data-search") || "";
                var match = !query || text.indexOf(query) !== -1;
                item.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        function sortItems() {
            if (!sort) {
                return;
            }
            var value = sort.value;
            var sorted = items.slice();
            if (value === "views" || value === "likes") {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute("data-" + value) || 0) - Number(a.getAttribute("data-" + value) || 0);
                });
            } else if (value === "date") {
                sorted.sort(function (a, b) {
                    return String(b.getAttribute("data-date") || "").localeCompare(String(a.getAttribute("data-date") || ""));
                });
            } else {
                sorted.sort(function (a, b) {
                    return items.indexOf(a) - items.indexOf(b);
                });
            }
            sorted.forEach(function (item) {
                grid.appendChild(item);
            });
            items = sorted;
            filterItems();
        }

        if (input) {
            input.addEventListener("input", filterItems);
        }
        if (sort) {
            sort.addEventListener("change", sortItems);
        }
        filterItems();
    }

    function initShareButtons() {
        Array.prototype.slice.call(document.querySelectorAll("[data-share]")).forEach(function (button) {
            button.addEventListener("click", function () {
                navigator.clipboard.writeText(window.location.href).then(function () {
                    button.textContent = "链接已复制";
                });
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initPageFilter();
        initShareButtons();
    });
})();
