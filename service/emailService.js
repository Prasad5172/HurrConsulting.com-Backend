const dotenv = require("dotenv");
dotenv.config();
const otpGenerator = require("otp-generator");
var nodemailer = require("nodemailer");
const otpService = require("./otpService");
const { responseHandler } = require("../helpers/handler.js");

const emailTemplate = (otp) => {
  return ( 
    `
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
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
        }
        .icons:hover {
            cursor: pointer;
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
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
            <h1>Verification code</h1>
            <p>Please use the verification code below to sign in.</p>
            <h3>Code:${otp}</h3>
            <p>Thanks,<br> Masumah</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 HurrConsulting. All rights reserved.</p>
            <p style="color: #666;">Follow Us</p>
            <div class="social-icons">
                    <img src="https://ci3.googleusercontent.com/meips/ADKq_NY9q-6UhdOTQdgdrF-3jH3MzwaQMIQFBXHd8kFqpS1Ds2GATCAHHI7e8X8EvBTN0MFz0MV_wSZwL-Dw7Ems7xPe3kJuCLB2UrPZ2m7-EGVod05RDK-dZBexdbhWBOIuXA=s0-d-e1-ft#http://www.mailmktg.makemytrip.com/images/footer/instagram_mail_footer.png" alt="Instagram" width="16" style="width:16px; margin-right: 10px;" class="CToWUd" data-bit="iit">
                    <img src="https://ci3.googleusercontent.com/meips/ADKq_NZg7t62ijRodKMvU2Zf08hyWHujLFRPxGJx3VujB9LAlO_7fO-SPtDbskoJ5fK4xSrZmEbWaeCYmyG-iQk-PiAKaawgd9u0m4On6pq7IUbIGrPxdUdXu-hsMgpqQPk=s0-d-e1-ft#http://www.mailmktg.makemytrip.com/images/footer/twitter_mail_footer.png" width="20" style="width:20px;" alt="Twitter" class="CToWUd" data-bit="iit">
            </div>
            <div>
                <a style="font-size: small;color: #638df8;" target="_blank" href="http://localhost:3000/contact">Contact Us</a>
                <span style="margin-inline: 5px;">|</span>
                <a style="font-size: small; color: #638df8;" target="_blank" href="http://localhost:3000/about">About Us</a>
            </div>
        </div>
    </div>
</body>
</html>
    `
  );
} 


const mailTransporter = async (isFormData,data,otp,result) => {
    console.log("mailTransporter")
    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.REACT_APP_USER,
            pass: process.env.REACT_APP_PASSWORD
        }
    });
    // console.log(data.email);
    var mailOptions = {
        from: process.env.REACT_APP_USER,
        to: isFormData ? process.env.REACT_APP_USER : data.email,
        subject: isFormData ?  `${data.subject}`:"Verify Otp",
        text: isFormData ?  ` Email:${data.email} \n Phone:${data.phone} \n message:${data.message}`:` Verify OTP: ${otp}`,
        ...(!isFormData && { html: emailTemplate(otp) }) 
    };
   transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("error" ,error)
            return result(responseHandler(false,error.statusCode,error.message,null),null)
        }
        return result(null,responseHandler(true,200,isFormData ? "data sent":"otp sent",null))
    });
    console.log("end of mailTransporter")
}


const sendOtpToEmail = async (data,userId,result) => {
    console.log("sendOtpToMail")
        const otp = otpGenerator.generate(6, {
            digits: true,
            specialChars: false,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            alphabets: false,
        });
        await otpService.create({sms: otp,user_id:userId});
        await mailTransporter(false,data, otp,result);
        console.log(otp)
        return otp;
};

const sendData = async (contactData,result) => {
        await mailTransporter(true,contactData,0,result);
};

module.exports = {mailTransporter,sendOtpToEmail,sendData}