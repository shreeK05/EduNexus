const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "shree.k1510@gmail.com", // <--- REPLACE THIS
      pass: "nzgo yzwm gexz hqll",    // <--- REPLACE THIS (Remove spaces)
    },
  });
  
  const mailOptions = {
    from: "EduNexus LMS <noreply@edunexus.com>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;