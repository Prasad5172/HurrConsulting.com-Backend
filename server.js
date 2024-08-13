var express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
var nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { v4: uuid } = require("uuid");
const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);
const { userRepository, paymentRepository } = require("./repository/index.js");
const { admin } = require("./middleware");
const { paymentService } =require("./service/index.js");




const sendReceiptEmail = async (email, sessionId) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.REACT_APP_USER,
      pass: process.env.REACT_APP_PASSWORD,
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
  console.log("webhook")
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(session);
    const email = session.metadata.email;
    
    // Send receipt email
    await sendReceiptEmail(email, session.id);
  }
  console.log("endOfWebhook");
  res.json({ received: true });
});

const corsOptions = {
  origin: "http://localhost:3000",
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", require("./routes/index.js"));

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

async function mailer(email,sessionId) {
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
    html: emailTemplate(sessionId),
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("error", error);
      return;
    }
    // console.log("info", info);
  });
}

app.post("/create-checkout-session", async (req, res) => {
  const { email, amount } = req.body;
  const user = await userRepository.retrieveOne({email:email});
  console.log(user);
  if(!user){
    return res.status(400).send("register with email")
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Appointment Booking",
          },
          unit_amount: amount *100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:3000",
    cancel_url: "http://localhost:3000/cancel",
    metadata: {
      email: email || "",
      amount:amount || 0,
    },
  });
  console.log(session);
  try {
    await mailer(email,session.id);  
    const payment = await paymentRepository.create({
      payment_id:session.id,
      email: email,
      amount: amount,
      status: "PENDING",
      request_date: new Date(),
      user_id:user.user_id
    });
    console.log(payment);
    res.json({ id: session.id });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(responseHandler(false, 500, "Server Error", null));
  }
});


app.listen(8000, () => {
  console.log("Server listening on port 8000");
});
