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
const  userRepository  = require("./repository/userRepository.js");
const  paymentRepository  = require("./repository/paymentRepository.js");
const  admin  = require("./middleware/admin.js");
const { PaymentModel } = require("./model/Payment.js")
const { DATE } = require("sequelize");
const emailController = require("./controller/emailController.js");
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
  "/api/webhook",
  express.raw({ type: 'application/json' }),
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
  origin: ["http://localhost:3000","https://hurrconsulting.com"]
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/auth",require("./routes/auth.js"))
app.use("/api/users",require("./routes/users.js"))
app.use("/api/payment",require("./routes/payment.js"))
app.use("/api/event",require("./routes/calender.js"))

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
               <img src="https://hurrconsulting.com/hurrconsulting.svg" alt="logo" width="100%">
            </div>
            <div class="header">
                <h1 style="color: #343434;">Welcome to Hurr Consulting</h1>
            </div>
            <h1>Payment Request</h1>
            <p>Please click the button below to complete your payment.</p>
            <a href="https://hurrconsulting.com/redirect-to-checkout/${sessionId}" class="button" style="color: white;">Pay Now</a>
            <p>Thanks,<br> Masumah</p>
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
                <a style="font-size: small;color: #638df8;" target="_blank" href="https://hurrconsulting.com/contact">Contact
                    Us</a>
                <span style="margin-inline: 5px;">|</span>
                <a style="font-size: small; color: #638df8;" target="_blank" href="https://hurrconsulting.com/about">About
                    Us</a>
            </div>
        </div>
    </div>
</body>

</html>
`;

async function mailer(email, sessionId) {
  console.log("mailer", email, sessionId);
  try {
    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,  // or 587 for TLS
      secure: true, // true for SSL on port 465
      auth: {
        user: process.env.REACT_APP_USER,
        pass: process.env.REACT_APP_PASSWORD,
      },
    });
    console.log(transporter);

    // Email options
    const mailOptions = {
      from: process.env.REACT_APP_USER,
      to: email,
      subject: "Payment Request from Hurr Consulting",
      html: emailTemplate(sessionId),
    };

    // Send email
    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("error", error);
          return reject(error);
        }
        console.log("info", info);
        resolve(info);
      });
    });
  } catch (error) {
    console.log("Mailer function error:", error);
    throw new Error("Failed to send email");
  }
}
app.post("/api/contact",emailController.sendContactData);
app.post("/api/create-checkout-session", admin, async (req, res) => {
  console.log("create checkout session");
  const { email, amount } = req.body;
  
  try {
    const user = await userRepository.retrieveOne({ email: email });
    if (!user) {
      return res.status(400).send("Please register with email");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Appointment Booking",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://hurrconsulting.com",
      cancel_url: "https://hurrconsulting.com",
      metadata: {
        email: email || "",
        amount: amount || 0,
      },
    });

    // Send email using mailer function
    await mailer(email, session.id);

    // Create payment record
    const payment = await paymentRepository.create({
      payment_id: session.id,
      email: email,
      amount: amount,
      status: "PENDING",
      user_id: user.user_id,
    });

    console.log(payment);
    res.json({ id: session.id });

  } catch (error) {
    console.log("Error in create-checkout-session:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
});


app.get("/api", async (req, res) => {
  return res.status(200).json("working");
});

app.all("*",(req,res,next) => {
  const error = new Error(`Can't find ${req.originalUrl} on the server!`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err)
})

app.use((error,req,res,next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';
 res.status(error.statusCode).json(error);
})

app.listen(8000, () => {
  console.log("Server listening on port 8000");
});
