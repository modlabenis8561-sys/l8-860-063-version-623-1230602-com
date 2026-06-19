(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupNavigation() {
    var button = document.querySelector(".js-mobile-toggle");
    var nav = document.querySelector(".js-mobile-nav");
    if (button && nav) {
      button.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll(".js-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector(".js-hero");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
  }

  function setupCarousel() {
    document.querySelectorAll(".js-carousel").forEach(function (shell) {
      var track = shell.querySelector(".carousel-track");
      var left = shell.querySelector(".carousel-btn.left");
      var right = shell.querySelector(".carousel-btn.right");
      if (!track) {
        return;
      }
      if (left) {
        left.addEventListener("click", function () {
          track.scrollBy({ left: -420, behavior: "smooth" });
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          track.scrollBy({ left: 420, behavior: "smooth" });
        });
      }
    });
  }

  function setupFilters() {
    var filterBar = document.querySelector(".js-filter-bar");
    if (!filterBar) {
      return;
    }
    var input = filterBar.querySelector("input");
    var chips = Array.prototype.slice.call(filterBar.querySelectorAll(".filter-chip"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
    var activeType = "all";

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-genre") || ""
        ].join(" ").toLowerCase();
        var type = card.getAttribute("data-type") || "";
        var typeMatch = activeType === "all" || type === activeType;
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle("hidden-by-filter", !(typeMatch && queryMatch));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeType = chip.getAttribute("data-filter") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        apply();
      });
    });
  }

  function setupSearchPage() {
    var list = document.querySelector(".js-search-results");
    var input = document.querySelector(".js-main-search");
    if (!list || !input || !window.siteSearchData) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function createCard(item) {
      var article = document.createElement("article");
      article.className = "search-card";
      article.innerHTML = "<a href=\"" + item.url + "\"><img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"></a>" +
        "<div><div class=\"card-badges\"><span>" + escapeHtml(item.category) + "</span><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
        "<h3><a href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a></h3>" +
        "<p>" + escapeHtml(item.desc) + "</p><div class=\"card-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.genre) + "</span></div></div>";
      return article;
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var source = window.siteSearchData;
      var results = source.filter(function (item) {
        if (!query) {
          return item.hot;
        }
        return [item.title, item.category, item.year, item.type, item.region, item.genre, item.tags, item.desc].join(" ").toLowerCase().indexOf(query) !== -1;
      }).slice(0, 80);
      list.innerHTML = "";
      if (!results.length) {
        var empty = document.createElement("div");
        empty.className = "info-panel";
        empty.innerHTML = "<h2>暂无匹配内容</h2><p>可以尝试更换片名、类型、地区或标签关键词。</p>";
        list.appendChild(empty);
        return;
      }
      results.forEach(function (item) {
        list.appendChild(createCard(item));
      });
    }

    input.addEventListener("input", render);
    render();
  }

  function setupPlayer() {
    document.querySelectorAll(".js-player-box").forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector(".js-play-cover");
      if (!video || !cover) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var loaded = false;
      var hls = null;

      function loadStream() {
        if (loaded || !stream) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }

      function start() {
        loadStream();
        cover.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            cover.classList.remove("is-hidden");
          });
        }
      }

      cover.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupCarousel();
    setupFilters();
    setupSearchPage();
    setupPlayer();
  });
})();
