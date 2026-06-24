// calendar-init.js — FullCalendar + ICS booking form
// Loaded with `defer`, so DOM is ready — no DOMContentLoaded wrapper needed
(function () {
    var calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    // Detect page language
    var lang = document.documentElement.lang || 'en';
    var isEs = lang === 'es';
    var reservedText = isEs ? 'Reservado' : 'Reserved';

    // Shared state (module-scoped, not window-global)
    var bookedEvents = [];
    var validateBookingFunc = null;

    // Init form immediately so inputs are interactive before calendar loads
    initBookingForm();

    // Lazy-load calendar when it approaches the viewport
    var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                initCalendar();
                obs.unobserve(calendarEl);
            }
        });
    }, {
        rootMargin: '400px 0px',
        threshold: 0.01
    });
    observer.observe(calendarEl);

    // ─── Helpers ─────────────────────────────────────────────────────────────

    function parseIcsToEvents(icsText) {
        var jcalData = ICAL.parse(icsText);
        var comp = new ICAL.Component(jcalData);
        return comp.getAllSubcomponents('vevent').map(function (vevent) {
            var event = new ICAL.Event(vevent);
            return {
                title: reservedText,
                start: event.startDate.toJSDate(),
                end: event.endDate.toJSDate(),
                display: 'background',
                backgroundColor: '#f8d7da',
                allDay: true
            };
        });
    }

    function todayString() {
        return new Date().toISOString().slice(0, 10);
    }

    // ─── Calendar ────────────────────────────────────────────────────────────

    function initCalendar() {
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: lang,
            firstDay: 1,
            headerToolbar: {
                left: 'prev',
                center: 'title',
                right: 'next'
            },
            events: function (info, successCallback, failureCallback) {
                fetch('/calendar.ics')
                    .then(function (response) {
                        if (!response.ok) throw new Error('Network response was not ok');
                        return response.text();
                    })
                    .then(function (data) {
                        var events = parseIcsToEvents(data);
                        bookedEvents = events;
                        successCallback(events);
                        if (validateBookingFunc) validateBookingFunc();
                    })
                    .catch(function (error) {
                        console.warn('Primary ICS failed, trying fallback proxy:', error);
                        var fallbackUrl = 'https://corsproxy.io/?' + encodeURIComponent(
                            'https://calendar.google.com/calendar/ical/81d94c0e97baf81fbf0e24dd54fb90c6a559ccca45ba65b2242572a864290a42@group.calendar.google.com/private-d93b1f1a7c77ca3f5d591d38539c7baa/basic.ics'
                        );
                        fetch(fallbackUrl)
                            .then(function (response) {
                                if (!response.ok) throw new Error('Fallback proxy failed');
                                return response.text();
                            })
                            .then(function (data) {
                                var events = parseIcsToEvents(data);
                                bookedEvents = events;
                                successCallback(events);
                                if (validateBookingFunc) validateBookingFunc();
                            })
                            .catch(function (err) {
                                console.error('All calendar sources failed:', err);
                                failureCallback(err);
                                if (validateBookingFunc) validateBookingFunc();
                            });
                    });
            },
            dayMaxEvents: 0,
            height: 'auto',
            contentHeight: 250,
            aspectRatio: 3.5
        });

        calendar.render();
    }

    // ─── Booking Form ─────────────────────────────────────────────────────────

    function initBookingForm() {
        var form = document.getElementById('booking-inquiry-form');
        if (!form || form.dataset.initialized) return;
        form.dataset.initialized = 'true';

        var checkinInput  = document.getElementById('checkin');
        var checkoutInput = document.getElementById('checkout');
        var guestsSelect  = document.getElementById('guests');
        var statusDiv     = document.getElementById('booking-status');
        var whatsappBtn   = document.getElementById('whatsapp-inquiry-btn');

        // Set minimum check-in date to today
        var today = todayString();
        checkinInput.min  = today;
        checkoutInput.min = today;

        function validateBooking() {
            var checkinVal  = checkinInput.value;
            var checkoutVal = checkoutInput.value;
            var guestsVal   = guestsSelect.value;

            if (!checkinVal || !checkoutVal) {
                setStatus('info', isEs
                    ? 'Selecciona las fechas de entrada y salida.'
                    : 'Select check-in and check-out dates.');
                disableSubmit();
                return;
            }

            var start = new Date(checkinVal + 'T00:00:00');
            var end   = new Date(checkoutVal + 'T00:00:00');

            if (end <= start) {
                setStatus('danger', isEs
                    ? 'La fecha de salida debe ser posterior a la de entrada.'
                    : 'Check-out date must be after check-in date.');
                disableSubmit();
                return;
            }

            // Check overlap with booked dates
            var hasOverlap = bookedEvents.some(function (booked) {
                var bStart = new Date(booked.start);
                var bEnd   = new Date(booked.end);
                bStart.setHours(0, 0, 0, 0);
                bEnd.setHours(0, 0, 0, 0);
                return start < bEnd && end > bStart;
            });

            if (hasOverlap) {
                setStatus('danger', isEs
                    ? 'Lo sentimos, algunas de las fechas seleccionadas ya están reservadas.'
                    : 'Sorry, some of the selected dates are already reserved.');
                disableSubmit();
                return;
            }

            setStatus('success', isEs
                ? '¡Fechas disponibles! Haz clic abajo para reservar.'
                : 'Dates are available! Click below to request booking.');
            enableSubmit(start, end, guestsVal);
        }

        validateBookingFunc = validateBooking;

        function setStatus(type, message) {
            statusDiv.className = 'alert alert-' + type + ' py-2 px-3 mb-4 text-center small';
            statusDiv.innerText = message;
        }

        function disableSubmit() {
            whatsappBtn.classList.add('disabled');
            whatsappBtn.style.opacity = '0.6';
            whatsappBtn.style.pointerEvents = 'none';
        }

        function enableSubmit(start, end, guests) {
            whatsappBtn.classList.remove('disabled');
            whatsappBtn.style.opacity = '1';
            whatsappBtn.style.pointerEvents = 'auto';

            var locale  = isEs ? 'es-ES' : 'en-US';
            var options = { month: 'short', day: 'numeric', year: 'numeric' };
            var startStr = start.toLocaleDateString(locale, options);
            var endStr   = end.toLocaleDateString(locale, options);
            var gNum = parseInt(guests);

            var message = isEs
                ? '¡Hola! Me gustaría preguntar sobre la reserva de Marbella Beachfront del ' + startStr + ' al ' + endStr + ' para ' + gNum + ' ' + (gNum === 1 ? 'huésped' : 'huéspedes') + '. ¿Están disponibles estas fechas?'
                : 'Hello! I would like to inquire about booking Marbella Beachfront from ' + startStr + ' to ' + endStr + ' for ' + gNum + ' ' + (gNum === 1 ? 'guest' : 'guests') + '. Are these dates available?';

            whatsappBtn.href = 'https://wa.me/37061028665?text=' + encodeURIComponent(message);
        }

        checkinInput.addEventListener('change', function () {
            if (checkinInput.value) {
                // Set checkout minimum to checkin + 1 day
                var nextDay = new Date(checkinInput.value + 'T00:00:00');
                nextDay.setDate(nextDay.getDate() + 1);
                checkoutInput.min = nextDay.toISOString().slice(0, 10);
            }
            validateBooking();
        });
        checkoutInput.addEventListener('change', validateBooking);
        guestsSelect.addEventListener('change', validateBooking);
    }
}());
