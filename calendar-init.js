document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    // Определяем язык страницы
    var lang = document.documentElement.lang || 'en';
    var reservedText = (lang === 'es') ? 'Reservado' : 'Reserved';

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: lang,
        firstDay: 1,
        headerToolbar: {
            left: 'prev',
            center: 'title',
            right: 'next'
        },
        events: function(info, successCallback, failureCallback) {
           
            const icalUrl = 'https://calendar.google.com/calendar/ical/81d94c0e97baf81fbf0e24dd54fb90c6a559ccca45ba65b2242572a864290a42@group.calendar.google.com/private-d93b1f1a7c77ca3f5d591d38539c7baa/basic.ics';

            fetch('/calendar.ics')
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.text();
                })
                .then(data => {
                    var jcalData = ICAL.parse(data);
                    var comp = new ICAL.Component(jcalData);
                    var vevents = comp.getAllSubcomponents('vevent');

                    var events = vevents.map(function(vevent) {
                        var event = new ICAL.Event(vevent);
                        var endDate = event.endDate.toJSDate();
                        
                        return {
                            title: reservedText,
                            start: event.startDate.toJSDate(),
                            end: endDate,
                            display: 'background',
                            backgroundColor: '#f8d7da',
                            allDay: true
                        };
                    });
                    window.bookedEvents = events;
                    successCallback(events);
                    initBookingForm();
                })
                .catch(error => {
                    console.error('Calendar error:', error);
                    const secondaryProxiedUrl = 'https://corsproxy.io/?' + encodeURIComponent(icalUrl);
                    fetch(secondaryProxiedUrl)
                        .then(response => {
                            if (!response.ok) throw new Error('Secondary proxy failed');
                            return response.text();
                        })
                        .then(data => {
                             var jcalData = ICAL.parse(data);
                             var comp = new ICAL.Component(jcalData);
                             var vevents = comp.getAllSubcomponents('vevent');
                             var events = vevents.map(function(vevent) {
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
                             window.bookedEvents = events;
                             successCallback(events);
                             initBookingForm();
                        })
                        .catch(err => {
                            console.error('All proxies failed', err);
                            failureCallback(err);
                            // Инициализируем форму без событий в случае ошибки загрузки
                            initBookingForm();
                        });
                });
        },
        dayMaxEvents: 0,
        height: 'auto',
        contentHeight: 250,
        aspectRatio: 3.5
    });

    calendar.render();

    function initBookingForm() {
        var form = document.getElementById('booking-inquiry-form');
        if (!form || form.dataset.initialized) return;
        form.dataset.initialized = "true";

        var checkinInput = document.getElementById('checkin');
        var checkoutInput = document.getElementById('checkout');
        var guestsSelect = document.getElementById('guests');
        var statusDiv = document.getElementById('booking-status');
        var whatsappBtn = document.getElementById('whatsapp-inquiry-btn');

        // Set minimum check-in date to today
        var today = new Date();
        var yyyy = today.getFullYear();
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var dd = String(today.getDate()).padStart(2, '0');
        var todayStr = yyyy + '-' + mm + '-' + dd;
        checkinInput.min = todayStr;
        checkoutInput.min = todayStr;

        function validateBooking() {
            var checkinVal = checkinInput.value;
            var checkoutVal = checkoutInput.value;
            var guestsVal = guestsSelect.value;

            if (!checkinVal || !checkoutVal) {
                statusDiv.className = "alert alert-info py-2 px-3 mb-4 text-center small";
                statusDiv.innerText = (lang === 'es') 
                    ? "Selecciona las fechas de entrada y salida." 
                    : "Select check-in and check-out dates.";
                disableSubmit();
                return;
            }

            var start = new Date(checkinVal + "T00:00:00");
            var end = new Date(checkoutVal + "T00:00:00");

            if (end <= start) {
                statusDiv.className = "alert alert-danger py-2 px-3 mb-4 text-center small";
                statusDiv.innerText = (lang === 'es')
                    ? "La fecha de salida debe ser posterior a la de entrada."
                    : "Check-out date must be after check-in date.";
                disableSubmit();
                return;
            }

            // Check overlap with booked dates
            var hasOverlap = false;
            if (window.bookedEvents && window.bookedEvents.length > 0) {
                for (var i = 0; i < window.bookedEvents.length; i++) {
                    var booked = window.bookedEvents[i];
                    var bStart = new Date(booked.start);
                    var bEnd = new Date(booked.end);
                    
                    // Normalize dates to midnight to avoid timezone shift errors
                    bStart.setHours(0,0,0,0);
                    bEnd.setHours(0,0,0,0);
                    
                    // Overlap check
                    if (start < bEnd && end > bStart) {
                        hasOverlap = true;
                        break;
                    }
                }
            }

            if (hasOverlap) {
                statusDiv.className = "alert alert-danger py-2 px-3 mb-4 text-center small";
                statusDiv.innerText = (lang === 'es')
                    ? "Lo sentimos, algunas de las fechas seleccionadas ya están reservadas."
                    : "Sorry, some of the selected dates are already reserved.";
                disableSubmit();
                return;
            }

            // Available!
            statusDiv.className = "alert alert-success py-2 px-3 mb-4 text-center small";
            statusDiv.innerText = (lang === 'es')
                ? "¡Fechas disponibles! Haz clic abajo para reservar."
                : "Dates are available! Click below to request booking.";

            enableSubmit(start, end, guestsVal);
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

            // Format dates for message
            var options = { month: 'short', day: 'numeric', year: 'numeric' };
            var startStr = start.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', options);
            var endStr = end.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', options);

            var message = "";
            if (lang === 'es') {
                message = "¡Hola! Me gustaría preguntar sobre la reserva de Marbella Beachfront del " + startStr + " al " + endStr + " para " + guests + " " + (guests == 1 ? "huésped" : "huéspedes") + ". ¿Están disponibles estas fechas?";
            } else {
                message = "Hello! I would like to inquire about booking Marbella Beachfront from " + startStr + " to " + endStr + " for " + guests + " " + (guests == 1 ? "guest" : "guests") + ". Are these dates available?";
            }

            whatsappBtn.href = "https://wa.me/37061028665?text=" + encodeURIComponent(message);
        }

        checkinInput.addEventListener('change', function() {
            // When checkin changes, set checkout minimum to checkin + 1 day
            if (checkinInput.value) {
                var checkinDate = new Date(checkinInput.value + "T00:00:00");
                checkinDate.setDate(checkinDate.getDate() + 1);
                var yyyy = checkinDate.getFullYear();
                var mm = String(checkinDate.getMonth() + 1).padStart(2, '0');
                var dd = String(checkinDate.getDate()).padStart(2, '0');
                checkoutInput.min = yyyy + '-' + mm + '-' + dd;
            }
            validateBooking();
        });
        checkoutInput.addEventListener('change', validateBooking);
        guestsSelect.addEventListener('change', validateBooking);
    }
});
