document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    // Определяем язык страницы
    var lang = document.documentElement.lang || 'en';
    var reservedText = (lang === 'es') ? 'Reserved' : 'Reserved'; // В v2 везде 'Reserved'

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
            const icalUrl = 'https://calendar.google.com/calendar/ical/81d94c0e97baf81fbf0e24dd54fb90c6a559ccca45ba65b2242572a864290a42%40group.calendar.google.com/private-d93b1f1a7c77ca3f5d591d38539c7baa/basic.ics';
            const proxiedUrl = 'https://corsproxy.io/?' + encodeURIComponent(icalUrl);

            fetch(proxiedUrl)
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
                    successCallback(events);
                })
                .catch(error => {
                    console.error('Calendar error, trying backup proxy:', error);
                    fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(icalUrl))
                        .then(resp => resp.json())
                        .then(json => {
                             const data = json.contents;
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
                             successCallback(events);
                        });
                });
        },
        dayMaxEvents: 0,
        height: 'auto',
        contentHeight: 250,
        aspectRatio: 3.5
    });

    calendar.render();
});
