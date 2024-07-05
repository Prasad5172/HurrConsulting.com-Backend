const {google} = require('googleapis');
const calendar = google.calendar('v3');

// Example for fetching available time slots
app.get('/api/time-slots', (req, res) => {
    const timeSlots = [
      { id: 1, time: '10:00 AM' },
      { id: 2, time: '11:00 AM' },
      { id: 3, time: '02:00 PM' },
    ];
    res.json(timeSlots);
  });