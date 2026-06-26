// Scroll-reveal animations using IntersectionObserver
// Note: script is loaded with `defer` so DOM is already ready — no DOMContentLoaded needed
(function () {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(function (el) {
        // Elements already visible in the viewport (above-the-fold) — activate immediately
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('active');
        } else {
            revealObserver.observe(el);
        }
    });
}());



// Sticky Book CTA — appears after scrolling past the hero
(function () {
    var cta = document.getElementById('sticky-cta');
    if (!cta) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var shown = false;
    window.addEventListener('scroll', function () {
        var heroBottom = hero.getBoundingClientRect().bottom;
        if (heroBottom < 0 && !shown) {
            cta.classList.add('visible');
            shown = true;
        } else if (heroBottom >= 0 && shown) {
            cta.classList.remove('visible');
            shown = false;
        }
    }, { passive: true });
}());

// Navbar shadow on scroll
(function () {
    var nav = document.querySelector('.navbar-glass');
    if (!nav) return;
    window.addEventListener('scroll', function () {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
}());
