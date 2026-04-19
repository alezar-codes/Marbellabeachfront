events: function(info, successCallback, failureCallback) {
    // Чистая ссылка без лишнего кодирования
    const icalUrl = 'https://calendar.google.com/calendar/ical/81d94c0e97baf81fbf0e24dd54fb90c6a559ccca45ba65b2242572a864290a42@group.calendar.google.com/private-d93b1f1a7c77ca3f5d591d38539c7baa/basic.ics';
    
    // Используем проверенный AllOrigins в формате прямого вызова
    const proxiedUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(icalUrl);

    fetch(proxiedUrl)
        .then(response => {
            if (!response.ok) throw new Error('Google blocking access');
            return response.text();
        })
        .then(data => {
            const jcalData = ICAL.parse(data);
            const comp = new ICAL.Component(jcalData);
            const vevents = comp.getAllSubcomponents('vevent');

            const events = vevents.map(vevent => {
                const event = new ICAL.Event(vevent);
                return {
                    title: 'Reserved',
                    start: event.startDate.toJSDate(),
                    end: event.endDate.toJSDate(),
                    display: 'background',
                    backgroundColor: '#f8d7da',
                    allDay: true
                };
            });
            successCallback(events);
        })
        .catch(error => {
            console.error('Calendar Error:', error);
            failureCallback(error);
        });
}