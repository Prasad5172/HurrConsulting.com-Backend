const { google } = require("googleapis");
require("dotenv").config();
const { v4: uuid } = require('uuid');

const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const calendarId = process.env.CALENDAR_ID;

// Google Calendar API settings
const SCOPES = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"];

const auth = new google.auth.JWT(
  CREDENTIALS.client_email,
  null,
  CREDENTIALS.private_key,
  SCOPES,
  process.env.ATTORNEY_MAIL // Replace with the email address of the user you want to impersonate
);

const calendar = google.calendar({ version: "v3", auth });

// Get date-time string for calendar
const dateTimeForCalendar = () => {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  if (month < 10) month = `0${month}`;
  let day = date.getDate();
  if (day < 10) day = `0${day}`;
  let hour = date.getHours();
  if (hour < 10) hour = `0${hour}`;
  let minute = date.getMinutes();
  if (minute < 10) minute = `0${minute}`;

  let newDateTime = `${year}-${month}-${day}T${hour}:${minute}:00.000+05:30`;

  let startDate = new Date(Date.parse(newDateTime));
  let endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour

  return { start: startDate, end: endDate };
};


console.log(dateTimeForCalendar());

const insertEvent = async (event) => {
  try {
    let response = await calendar.events.insert({
      calendarId: calendarId,
      conferenceDataVersion: 1, // Required for creating conference data
      resource: event
    });

    if (response.status === 200 && response.statusText === "OK") {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    console.error(`Error at insertEvent --> ${error}`);
    return 0;
  }
};

const dateTime = dateTimeForCalendar();

const event = {
  summary: "This is the summary.",
  description: "This is the description.",
  start: {
    dateTime: dateTime.start.toISOString(),
    timeZone: 'Asia/Kolkata'
  },
  end: {
    dateTime: dateTime.end.toISOString(),
    timeZone: 'Asia/Kolkata'
  },
  conferenceData: {
    createRequest: {
      requestId: uuid(), // Unique identifier for the conference request
      conferenceSolutionKey: {
        type: "hangoutsMeet"
      }
    }
  },
  attendees: [
    { email: "prasadpadala2005@gmail.com" } // List of attendees
  ]
};

insertEvent(event)
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

// Additional functions for getting and deleting events
const getEvents = async (dateTimeStart, dateTimeEnd) => {
  try {
    let response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: dateTimeStart,
      timeMax: dateTimeEnd,
      timeZone: "Asia/Kolkata"
    });

    return response.data.items;
  } catch (error) {
    console.error(`Error at getEvents --> ${error}`);
    return 0;
  }
};

let start = "2024-07-20T00:00:00.000Z";
let end = "2024-08-23T00:00:00.000Z";

getEvents(start, end)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });

const deleteEvent = async (eventId) => {
  try {
    await calendar.events.delete({
      calendarId: calendarId,
      eventId: eventId
    });
    return 1;
  } catch (error) {
    console.error(`Error at deleteEvent --> ${error}`);
    return 0;
  }
};
let eventId = "p73gv4n6jbolrb9bd8jm34eupk";

deleteEvent(eventId)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
