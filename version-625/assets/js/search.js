(function () {
    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get("q") || "").trim();
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (ch) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[ch];
        });
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"movie-card-link\" href=\"" + escapeHtml(movie.url) + "\">" +
            "<div class=\"movie-cover\">" +
            "<img class=\"movie-cover-img\" src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"movie-badge\">" + escapeHtml(movie.category) + "</span>" +
            "</div>" +
            "<div class=\"movie-card-body\">" +
            "<h3>" + escapeHtml(movie.title) + "</h3>" +
            "<p>" + escapeHtml(movie.one_line) + "</p>" +
            "<div class=\"movie-tags\">" + tags + "</div>" +
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "</div></a></article>";
    }

    document.addEventListener("DOMContentLoaded", function () {
        var data = window.MOVIE_SEARCH_DATA || [];
        var query = getQuery();
        var input = document.getElementById("search-page-input");
        var summary = document.getElementById("search-summary");
        var results = document.getElementById("search-results");

        if (input) {
            input.value = query;
        }
        if (!summary || !results) {
            return;
        }
        if (!query) {
            summary.textContent = "请输入关键词开始搜索。";
            return;
        }
        var lower = query.toLowerCase();
        var matched = data.filter(function (movie) {
            var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, movie.one_line, (movie.tags || []).join(" ")].join(" ").toLowerCase();
            return text.indexOf(lower) !== -1;
        });
        summary.textContent = "关键词“" + query + "”共找到 " + matched.length + " 部影片。";
        results.innerHTML = matched.slice(0, 240).map(card).join("");
        if (matched.length > 240) {
            summary.textContent += " 当前展示前 240 条，可继续输入更精确的关键词。";
        }
    });
})();
