var express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
var nodemailer = require("nodemailer");
const { google } = require("googleapis");
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const { v4: uuid } = require("uuid");
const { responseHandler } = require("./helpers/handler.js");
const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);
const { userRepository, paymentRepository } = require("./repository/index.js");
const { admin } = require("./middleware");
const { paymentService } = require("./service/index.js");
const { PaymentModel } = require("./model");
const { DATE } = require("sequelize");

const sendReceiptEmail = async (email, sessionId) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.REACT_APP_USER,
      pass: process.env.REACT_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.REACT_APP_USER,
    to: email,
    subject: "Payment Confirmation from Hurr Consulting",
    html: `<p>Thank you for your payment. Your session ID is ${sessionId}.<br>Best regards,<br>Hurr Consulting</p>`,
  };

  await transporter.sendMail(mailOptions);

  // Optionally, send the receipt to the admin as well
  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: "Payment Received",
    html: `<p>Payment received from ${email}. Session ID: ${sessionId}</p>`,
  };

  await transporter.sendMail(adminMailOptions);
};

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("webhook");
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log("event", event);
    var payment = null;
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const sessionId = session.id;
      const paymentIntentId = session.payment_intent;

      let payment = await PaymentModel.findOne({
        where: { payment_id: sessionId },
      });
      if (payment) {
        payment.status = "PAID";
        payment.payment_date = new Date().toISOString().split("T")[0];
        payment.payment_intent = paymentIntentId; // Store Payment Intent ID
        await payment.save();
      } else {
        console.warn(`Payment record not found for session ID: ${sessionId}`);
      }
    }
    if (event.type === "charge.refund.updated") {
      const refund = event.data.object;
      const refund_id = refund.id;
      const payment_intent = refund.payment_intent;

      let payment = await PaymentModel.findOne({
        where: { payment_intent: payment_intent },
      });
      if (payment) {
        payment.status = "REFUNDED";
        // payment.payment_date = new Date().toISOString().split('T')[0];
        // payment.payment_intent = paymentIntentId; // Store Payment Intent ID
        await payment.save();
      } else {
        console.warn(`Payment record not found for session ID: ${sessionId}`);
      }
    }

    console.log("endOfWebhook");
    res.json({ received: true });
  }
);

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
        .container {
            width: 100%;
            background-color: #f4f4f4;
        }

        .content {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #e0e0e0;
        }

        .header {
            text-align: center;
            padding: 10px;
            background-color: #d2e1de;
            color: white;
        }

        .footer {
            text-align: center;
            padding: 10px;
            background-color: #f1f1f1;
            color: #666;
        }

        .button {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            font-size: 16px;
            color: white;
            background-color: #06ae25;
            text-decoration: none;
            border-radius: 5px;
        }

        .icons:hover {
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">

            <div style="height: 400px; overflow: hidden; margin-bottom: 2px;">
               <img src="https://media.istockphoto.com/id/1821049147/photo/couple-kayaking-down-florida-springs-florida-freshwater-river-springs-wide-angle.jpg?s=1024x1024&w=is&k=20&c=uFFxvLMpzJiapOATIveMGwydM4zAlYGJYPf--KePdmA=" alt="logo" width="100%">
               <img src="https://vtm.ai/about-1.jpg" alt="logo" width="100%">
            </div>
            <div class="header">
                <h1 style="color: #343434;">Welcome to Hurr Consulting</h1>
            </div>
            <h1>Payment Request</h1>
            <p>Please click the button below to complete your payment.</p>
            <a href="http://localhost:3000/redirect-to-checkout/${sessionId}" class="button" style="color: white;">Pay Now</a>
            <p>Thanks,<br> Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 HurrConsulting. All rights reserved.</p>
            <p style="color: #666;">Follow Us</p>
            <div class="social-icons">
                <img src="https://ci3.googleusercontent.com/meips/ADKq_NY9q-6UhdOTQdgdrF-3jH3MzwaQMIQFBXHd8kFqpS1Ds2GATCAHHI7e8X8EvBTN0MFz0MV_wSZwL-Dw7Ems7xPe3kJuCLB2UrPZ2m7-EGVod05RDK-dZBexdbhWBOIuXA=s0-d-e1-ft#http://www.mailmktg.makemytrip.com/images/footer/instagram_mail_footer.png"
                    alt="Instagram" width="16" style="width:16px; margin-right: 10px;" class="CToWUd" data-bit="iit">
                <img src="https://ci3.googleusercontent.com/meips/ADKq_NZg7t62ijRodKMvU2Zf08hyWHujLFRPxGJx3VujB9LAlO_7fO-SPtDbskoJ5fK4xSrZmEbWaeCYmyG-iQk-PiAKaawgd9u0m4On6pq7IUbIGrPxdUdXu-hsMgpqQPk=s0-d-e1-ft#http://www.mailmktg.makemytrip.com/images/footer/twitter_mail_footer.png"
                    width="20" style="width:20px;" alt="Twitter" class="CToWUd" data-bit="iit">
            </div>
            <div>
                <a style="font-size: small;color: #638df8;" target="_blank" href="http://localhost:3000/contact">Contact
                    Us</a>
                <span style="margin-inline: 5px;">|</span>
                <a style="font-size: small; color: #638df8;" target="_blank" href="http://localhost:3000/about">About
                    Us</a>
            </div>
        </div>
    </div>
</body>

</html>
`;

async function mailer(email, sessionId) {
  const imageAttachment = await readFileAsync('hurrconsulting.svg');
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
    html: emailTemplate(sessionId)
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("error", error);
      return;
    }
    // console.log("info", info);
  });
}

app.post("/create-checkout-session", admin, async (req, res) => {
  const { email, amount } = req.body;
  const user = await userRepository.retrieveOne({ email: email });
  console.log(user);
  if (!user) {
    return res.status(400).send("register with email");
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
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:3000",
    cancel_url: "http://localhost:3000/cancel",
    metadata: {
      email: email || "",
      amount: amount || 0,
    },
  });
  console.log(session);
  try {
    await mailer(email, session.id);
    const payment = await paymentRepository.create({
      payment_id: session.id,
      email: email,
      amount: amount,
      status: "PENDING",
      user_id: user.user_id,
    });
    // console.log(payment);
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
