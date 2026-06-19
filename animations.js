document.addEventListener('DOMContentLoaded', function() {
    // 1. Scroll-reveal animations using IntersectionObserver
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    // 2. Pure Vanilla JS Lightbox Gallery
    const galleryImages = document.querySelectorAll('.gallery-img');
    if (galleryImages.length > 0) {
        let currentIndex = 0;
        const imagesList = Array.from(galleryImages).map(img => {
            // Try to find figcaption in the same gallery-item
            const parent = img.closest('.gallery-item') || img.parentElement;
            const figcaption = parent ? parent.querySelector('figcaption') : null;
            return {
                src: img.src,
                alt: img.alt || 'Marbella Beachfront',
                caption: figcaption ? figcaption.textContent : (img.alt || '')
            };
        });

        // Create lightbox modal elements dynamically
        let lightbox = document.getElementById('lightbox-modal');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'lightbox-modal';
            lightbox.className = 'lightbox-modal';
            lightbox.innerHTML = `
                <span class="lightbox-close" aria-label="Close">&times;</span>
                <span class="lightbox-prev" aria-label="Previous">&#10094;</span>
                <span class="lightbox-next" aria-label="Next">&#10095;</span>
                <div class="lightbox-content">
                    <img id="lightbox-img" src="" alt="">
                    <div id="lightbox-caption" class="lightbox-caption"></div>
                </div>
            `;
            document.body.appendChild(lightbox);
        }

        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');

        function openLightbox(index) {
            currentIndex = index;
            const item = imagesList[currentIndex];
            lightboxImg.src = item.src;
            lightboxImg.alt = item.alt;
            lightboxCaption.textContent = item.caption;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden'; // Disable page scrolling
        }

        function closeLightbox() {
            lightbox.classList.remove('show');
            document.body.style.overflow = ''; // Enable page scrolling
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % imagesList.length;
            updateLightbox();
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
            updateLightbox();
        }

        function updateLightbox() {
            const item = imagesList[currentIndex];
            lightboxImg.src = item.src;
            lightboxImg.alt = item.alt;
            lightboxCaption.textContent = item.caption;
        }

        // Attach event listeners to gallery images
        galleryImages.forEach((img, index) => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
                openLightbox(index);
            });
        });

        // Close button click
        closeBtn.addEventListener('click', closeLightbox);

        // Click outside image closes lightbox
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
                closeLightbox();
            }
        });

        // Prev & Next clicks
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPrev();
        });
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showNext();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('show')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        });

        // Touch Swipe Navigation for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50; // min pixels to swipe
            if (touchEndX < touchStartX - swipeThreshold) {
                showNext(); // Swipe left -> next image
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                showPrev(); // Swipe right -> prev image
            }
        }
    }
});
