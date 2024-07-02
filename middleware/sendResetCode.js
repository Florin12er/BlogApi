const nodemailer = require("nodemailer");

async function sendResetCode(email, code) {
  let transporter = nodemailer.createTransport({
    service: "Gmail", // Adjust as per your email service provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Code",
    html: `
      <div style="text-align: center;">
         <h1>Your Password Reset Code:</h1>
        <p style="font-size: 80px; font-weight: bold;">${code}</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendResetCode;
