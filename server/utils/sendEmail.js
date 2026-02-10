const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Create Transporter with Manual Configuration
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",   // Manually specify Gmail server
    port: 465,                // Use Secure SSL Port
    secure: true,             // Use SSL
    family: 4,                // <--- 🚨 CRITICAL: FORCE IPv4 (Fixes ENETUNREACH)
    auth: {
      user: "shree.k1510@gmail.com", 
      pass: "afjcdtcihcfoskcy", // Your App Password
    },
    // 2. Add Timeouts to prevent hanging
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,    
    socketTimeout: 10000,     
  });

  const mailOptions = {
    from: "EduNexus LMS <shree.k1510@gmail.com>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 3. Retry Logic (Robustness)
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
      try {
          await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent to ${options.email}`);
          return; // Success! Exit function.
      } catch (error) {
          attempts++;
          console.log(`⚠️ Attempt ${attempts} failed for ${options.email}: ${error.message}`);
          
          if (attempts >= maxAttempts) {
              console.log(`❌ Final Failure: Could not send to ${options.email}`);
              // We don't throw error here to prevent crashing the whole loop for other students
          } else {
              // Wait 2 seconds before retrying
              await new Promise(resolve => setTimeout(resolve, 2000));
          }
      }
  }
};

module.exports = sendEmail;