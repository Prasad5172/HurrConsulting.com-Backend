const { google } = require("googleapis");
const { v4: uuid } = require("uuid");
const { responseHandler, asyncHandler, getJwtToken } = require("../helpers");

const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
// Google Calendar API settings
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

const auth = new google.auth.JWT(
  CREDENTIALS.client_email,
  null,
  CREDENTIALS.private_key,
  SCOPES,
  process.env.REACT_APP_USER
);

async function addEvent(auth, eventData) {
  const calendar = google.calendar({ version: "v3", auth });
  const response = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.start,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: eventData.end,
        timeZone: "Asia/Kolkata",
      },
      conferenceData: {
        createRequest: {
          requestId: uuid(),
        },
      },
      attendees: [{ email: eventData.email }],
    },
  });
  return response.data; // Return the event details including the event ID
}

async function updateEvent(auth, eventId, eventData) {
  console.log("i am in updateEvent");
  const calendar = google.calendar({ version: "v3", auth });
  const response = await calendar.events.update({
    calendarId: "primary",
    eventId: eventId,
    sendUpdates: "all",
    requestBody: {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.start,
        timeZone: eventData.timeZone || "Asia/Kolkata",
      },
      end: {
        dateTime: eventData.end,
        timeZone: eventData.timeZone || "Asia/Kolkata",
      },
      attendees: eventData.attendees,
    },
  });
  return response.data; // Return the updated event details
}

async function deleteEvent(auth, eventId) {
  console.log("i am in deleteEvent");
  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.delete({
    calendarId: "primary",
    eventId: eventId,
    sendUpdates: "all",
  });
}

async function listEvents(auth) {
  console.log("i am in listEvents");
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });
  const events = res.data.items;
  return events;
}

async function getEventById(auth, eventId) {
  //  Calendar API to fetch an event by its ID
  const calendar = google.calendar({ version: "v3", auth });
  const response = await calendar.events.get({
    calendarId: "primary", // or the specific calendar ID you're working with
    eventId: eventId,
  });
  events;
  return response.data;
}

exports.getEvent = asyncHandler(async (req, res) => {
    const eventId = req.params.id;
    console.log(`Fetching event with ID: ${eventId}`);
    try {
      const event = await getEventById(auth, eventId);
      if (event) {
        res.send(event);
      } else {
        res.status(404).send("Event not found");
      }
    } catch (error) {
      console.error("Error fetching event", error);
      res.status(500).send("Error fetching event");
    }
  }); 

exports.createEvent = asyncHandler(async (req, res) => {
    console.log("admin post");
    const { event } = req.body;
    console.log(event);
    try {
      const createdEvent = await addEvent(auth, event);
      console.log(createdEvent);
      res.status(200).send({
        msg: "Event created successfully",
        eventId: createdEvent.id, // Send back the event ID
      });
    } catch (error) {
      console.error("Error creating event", error);
      res.status(500).send("Error creating event");
    }
  });

exports.updateEvent = asyncHandler(async (req, res) => {
    console.log("admin put");
    console.log(req.params);
    try {
      const eventId = req.params.eventId;
      const event = await updateEvent(auth, eventId, req.body);
      console.log(event);
      res.send({
        msg: "Event updated successfully",
        eventId: event.id,
      });
    } catch (error) {
      console.error("Error updating event", error);
      res.status(500).send("Error updating event");
    }
  });

exports.deleteEvent = asyncHandler( async (req, res) => {
    console.log("admin delete");
    try {
      await deleteEvent(auth, req.params.eventId);
      res.send({ msg: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event", error);
      res.status(500).send("Error deleting event");
    }
  });

exports.getEvents = asyncHandler(async (req, res) => {
    console.log("admin get");
    try {
      const events = await listEvents(auth);
      res.send(events);
    } catch (error) {
      console.error("Error listing events", error);
      res.status(500).send("Error listing events");
    }
  }); 
