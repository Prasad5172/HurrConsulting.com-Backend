var express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
var nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { v4: uuid } = require("uuid");
const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);
const bodyParser = require("body-parser");
const { userRepository } = require("./repository/index.js");
const { admin } = require("./middleware");

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
  process.env.ATTORNEY_MAIL
);

const sendReceiptEmail = async (email, sessionId) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Payment Confirmation from Hurr Consulting',
    html: `<p>Thank you for your payment. Your session ID is ${sessionId}.<br>Best regards,<br>Hurr Consulting</p>`,
  };

  await transporter.sendMail(mailOptions);

  // Optionally, send the receipt to the admin as well
  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'Payment Received',
    html: `<p>Payment received from ${email}. Session ID: ${sessionId}</p>`,
  };

  await transporter.sendMail(adminMailOptions);
};


app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.metadata.email;
    
    // Send receipt email
    await sendReceiptEmail(email, session.id);
  }

  res.json({ received: true });
});

const corsOptions = {
  origin: "http://localhost:3000",
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", require("./routes/index.js"));

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
  return response.data;
}

app.get("/events/:id", async (req, res) => {
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

app.post("/event", async (req, res) => {
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

app.put("/event/:eventId", admin, async (req, res) => {
  console.log("admin put");
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

app.delete("/event/:eventId", admin, async (req, res) => {
  console.log("admin delete");
  try {
    await deleteEvent(auth, req.params.eventId);
    res.send({ msg: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event", error);
    res.status(500).send("Error deleting event");
  }
});

app.get("/events", admin, async (req, res) => {
  console.log("admin get");
  try {
    const events = await listEvents(auth);
    res.send(events);
  } catch (error) {
    console.error("Error listing events", error);
    res.status(500).send("Error listing events");
  }
});

app.get("/users", admin, async (req, res) => {
  await userRepository.retrieveAll((err, data) => {
    if (err) {
      return res
        .status(err.code)
        .json(responseHandler(false, err.code, err.message, null));
    }
    return res.status(200).json(data);
  });
});
const emailTemplate = (sessionId) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { width: 100%; background-color: #f4f4f4; }
        .content { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; }
        .header { text-align: center; padding: 10px; background-color: #007bff; color: white; }
        .footer { text-align: center; padding: 10px; background-color: #f1f1f1; color: #666; }
        .button { display: inline-block; padding: 10px 20px; margin: 20px 0; font-size: 16px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px; }
        .icons:hover { cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <div class="header">
                <h1>Welcome to Hurr Consulting</h1>
            </div>
            <h1>Payment Request</h1>
            <p>Please click the button below to complete your payment.</p>
            <a href="http://localhost:3000/redirect-to-checkout/${sessionId}" class="button">Pay Now</a>
            <p>Thanks,<br> Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 lawfirm. All rights reserved.</p>
            <p style="color: #666;">Follow Us</p>
        </div>
    </div>
</body>
</html>
`;


app.post("/create-checkout-session",admin, async (req, res) => {
  const { email, amount } = req.body;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Appointment Booking",
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:3000",
    cancel_url: "http://localhost:3000/cancel",
    metadata: {
      email: email || "",
    },
  });
  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.REACT_APP_USER,
      pass: process.env.REACT_APP_PASSWORD,
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.REACT_APP_USER,
    to: email,
    subject: "Payment Request from Hurr Consulting",
    html: emailTemplate(session.id),
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("error", error);
      return;
    }
    console.log("info", info);
  });
  res.json({ id: session.id });
});


app.listen(8000, () => {
  console.log("Server listening on port 8000");
});
