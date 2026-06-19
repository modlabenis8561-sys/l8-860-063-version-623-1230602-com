(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-mobile-nav]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      };
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
        });
      });
      if (slides.length > 1) {
        setInterval(function () {
          show(current + 1);
        }, 6200);
      }
    }

    var query = new URLSearchParams(window.location.search).get('q') || '';
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-page-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };
    var applyFilter = function (value) {
      var keyword = normalize(value);
      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.year,
          card.textContent
        ].join(' '));
        card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
      });
      filterInputs.forEach(function (input) {
        if (document.activeElement !== input) {
          input.value = value;
        }
      });
    };
    filterInputs.forEach(function (input) {
      if (query) {
        input.value = query;
      }
      input.addEventListener('input', function () {
        applyFilter(input.value);
      });
    });
    Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]')).forEach(function (chip) {
      chip.addEventListener('click', function () {
        applyFilter(chip.getAttribute('data-filter-chip') || chip.textContent);
      });
    });
    if (query && cards.length) {
      applyFilter(query);
    }
  });
})();
