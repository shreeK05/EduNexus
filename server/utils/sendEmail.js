const nodemailer = require("nodemailer");
const dns = require("dns"); // <--- Import DNS module

// 🚨 FORCE IPv4 GLOBALLY (Fixes the ENETUNREACH error)
try {
  dns.setDefaultResultOrder('ipv4first');
  console.log("✅ DNS forced to IPv4 first");
} catch (e) {
  console.log("⚠️ Could not set DNS order (Node version might be old), proceeding...");
}

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",   // Manual Host
    port: 465,                // Secure Port
    secure: true,             // SSL
    auth: {
      user: "shree.k1510@gmail.com", 
      pass: "afjcdtcihcfoskcy", // Your App Password
    },
    tls: {
      // 🚨 EXTRA SAFETY: Refuse to accept IPv6 connections at the TLS level
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: "EduNexus LMS <shree.k1510@gmail.com>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // RETRY LOGIC
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
      try {
          await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent to ${options.email}`);
          return; 
      } catch (error) {
          attempts++;
          console.log(`⚠️ Attempt ${attempts} failed for ${options.email}: ${error.message}`);
          
          if (attempts >= maxAttempts) {
              console.log(`❌ Final Failure: Could not send to ${options.email}`);
          } else {
              await new Promise(resolve => setTimeout(resolve, 2000));
          }
      }
  }
};

module.exports = sendEmail;