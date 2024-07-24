const AWS = require('aws-sdk');
require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

async function readFromS3() {
  const params = {
    Bucket: "lawfirmsecrets",
    Key: "credentials.json",
  };

  try {
    const data = await s3.getObject(params).promise();
    return JSON.parse(data.Body.toString('utf-8'));
  } catch (err) {
    console.error("Reading data from S3 failed.", err);
    return null;
  }
}


// Use an immediately invoked function expression (IIFE) to handle the async call
(async () => {
  const credentials = await readFromS3();
  console.log(credentials);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
