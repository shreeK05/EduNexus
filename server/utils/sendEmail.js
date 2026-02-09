const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "shree.k1510@gmail.com", 
      pass: "afjcdtcihcfoskcy", // <--- FIX: REMOVED ALL SPACES
    },
  });

  const mailOptions = {
    from: "EduNexus LMS <noreply@edunexus.com>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${options.email}`);
  } catch (error) {
      console.log(`❌ Email failed for ${options.email}:`, error.message);
  }
};

module.exports = sendEmail;