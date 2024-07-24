require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const AWS = require('aws-sdk');
const readline = require('readline');

const app = express();
app.use(express.json());

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

async function readFromS3(key) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };
  try {
    const data = await s3.getObject(params).promise();
    return JSON.parse(data.Body.toString('utf-8'));
  } catch (err) {
    console.error("Reading data from S3 failed.", err);
    return null;
  }
}

async function writeToS3(key, data) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: JSON.stringify(data),
  };
  try {
    await s3.putObject(params).promise();
  } catch (err) {
    console.error("Writing data to S3 failed.", err);
  }
}

async function loadSavedCredentialsIfExist() {
  try {
    const content = await readFromS3(TOKEN_PATH);
    return google.auth.fromJSON(content);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const payload = {
    type: 'authorized_user',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    refresh_token: client.credentials.refresh_token,
  };
  await writeToS3(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }

  

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      resolve(code);
    });
  });

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  await saveCredentials(oauth2Client);
  return oauth2Client;
}


// Route to handle OAuth2 callback and save credentials
app.get('/oauth2callback', async (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  await saveCredentials(oauth2Client);

  res.send('Authentication successful! You can close this window.');
});

// Example route to use the authorized client
app.get('/events', async (req, res) => {
  const authClient = await authorize();
  const calendar = google.calendar({ version: 'v3', auth: authClient });

  try {
    const events = await calendar.events.list({ calendarId: 'primary' });
    res.json(events.data);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).send('Error fetching events');
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
