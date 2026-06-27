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

// Lightweight replacements for Bootstrap collapse (Navbar and FAQ accordion)
(function () {
    // Navbar toggler collapse/expand
    var toggler = document.querySelector('.navbar-toggler');
    var menu = document.getElementById('navbarNav');
    if (toggler && menu) {
        toggler.addEventListener('click', function () {
            var expanded = toggler.getAttribute('aria-expanded') === 'true';
            toggler.setAttribute('aria-expanded', !expanded);
            menu.classList.toggle('show');
        });
    }

    // FAQ Accordion
    var accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var targetId = btn.getAttribute('data-bs-target');
            if (!targetId) return;
            var target = document.querySelector(targetId);
            if (!target) return;

            var isExpanded = btn.getAttribute('aria-expanded') === 'true';

            // Collapse other items in the same accordion
            var parent = btn.closest('.accordion');
            if (parent) {
                var openBtns = parent.querySelectorAll('.accordion-button[aria-expanded="true"]');
                openBtns.forEach(function (openBtn) {
                    if (openBtn !== btn) {
                        openBtn.setAttribute('aria-expanded', 'false');
                        openBtn.classList.add('collapsed');
                        var openTargetId = openBtn.getAttribute('data-bs-target');
                        var openTarget = document.querySelector(openTargetId);
                        if (openTarget) {
                            openTarget.classList.remove('show');
                        }
                    }
                });
            }

            // Toggle current element states
            btn.setAttribute('aria-expanded', !isExpanded);
            btn.classList.toggle('collapsed', isExpanded);
            target.classList.toggle('show');
        });
    });
}());
