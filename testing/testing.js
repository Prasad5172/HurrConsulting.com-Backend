require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const express = require('express');
const dayjs = require('dayjs');
const { v4: uuid } = require('uuid');
const dotenv = require('dotenv');
const app = express();
app.use(express.json());


dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(process.cwd(), 'token1.json');

// Create an OAuth2 client with the specified client ID and client secret
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL // Your redirect URI
);

async function loadSavedCredentialsIfExist() {
  try {
    const content = fs.readFileSync(TOKEN_PATH);
    const credentials = JSON.parse(content);
    oauth2Client.setCredentials(credentials);
    return oauth2Client;
  } catch (err) {
    return null;
  }
}

function saveTokens(tokens) {
  // Save tokens in your database or any other secure storage
  // Example: using a file for demonstration
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
}


app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens securely, e.g., in a database
    saveTokens(tokens);

    res.send('Authentication successful! You can close this window.');
  } catch (error) {
    console.error('Error during token exchange:', error);
    res.status(500).send('Authentication failed.');
  }
});

app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }

  // If not authenticated, get new tokens
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  
  // You'll need to manually get the authorization code from the URL
  // For production, use a redirect URI and handle the callback to get the code
  const code = 'YOUR_AUTHORIZATION_CODE_HERE'; // Replace with your actual authorization code
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  await saveCredentials(tokens);
  return oauth2Client;
}


const calendarId = 'primary'; // Use the shared calendar ID here

app.post('/event', async (req, res) => {
  const { summary, description, start, end, attendees } = req.body;
  
  // Load saved tokens
  const tokens = JSON.parse(fs.readFileSync(path.join(__dirname, 'tokens.json')));
  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  const event = {
    summary,
    description,
    start: { dateTime: start, timeZone: 'Asia/Kolkata' },
    end: { dateTime: end, timeZone: 'Asia/Kolkata' },
    attendees: attendees,
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    res.status(200).send({
      msg: 'Event created successfully',
      eventId: response.data.id,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).send('Error creating event');
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
