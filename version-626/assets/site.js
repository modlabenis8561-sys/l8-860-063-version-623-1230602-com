document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var links = document.querySelector("[data-nav-links]");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-slide-to]"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function startSlider() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function resetSlider() {
    if (timer) {
      window.clearInterval(timer);
    }

    startSlider();
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-slide-to")) || 0);
      resetSlider();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(current - 1);
      resetSlider();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(current + 1);
      resetSlider();
    });
  }

  showSlide(0);
  startSlider();

  var searchInput = document.querySelector("[data-search-input]");
  var categorySelect = document.querySelector("[data-category-select]");
  var yearSelect = document.querySelector("[data-year-select]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
  var empty = document.querySelector("[data-empty-state]");

  function filterCards() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var category = categorySelect ? categorySelect.value : "";
    var year = yearSelect ? yearSelect.value : "";
    var visibleCount = 0;

    cards.forEach(function (card) {
      var title = (card.getAttribute("data-title") || "").toLowerCase();
      var tags = (card.getAttribute("data-tags") || "").toLowerCase();
      var cardCategory = card.getAttribute("data-category") || "";
      var cardYear = card.getAttribute("data-year") || "";
      var matchedKeyword = !keyword || title.indexOf(keyword) > -1 || tags.indexOf(keyword) > -1;
      var matchedCategory = !category || cardCategory === category;
      var matchedYear = !year || cardYear === year;
      var matched = matchedKeyword && matchedCategory && matchedYear;

      card.style.display = matched ? "" : "none";

      if (matched) {
        visibleCount += 1;
      }
    });

    if (empty) {
      empty.style.display = visibleCount ? "none" : "block";
    }
  }

  [searchInput, categorySelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", filterCards);
      control.addEventListener("change", filterCards);
    }
  });
});
