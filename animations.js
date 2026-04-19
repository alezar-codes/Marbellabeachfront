document.addEventListener('DOMContentLoaded', function() {
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Перестаем наблюдать за элементом после того, как он появился
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15 // Элемент появится, когда 15% его площади будет в зоне видимости
    });

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });
});
