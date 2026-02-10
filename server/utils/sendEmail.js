const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    family: 4, // <--- 🚨 CRITICAL FIX: Forces IPv4 to prevent ENETUNREACH errors
    auth: {
      user: "shree.k1510@gmail.com", 
      pass: "afjcdtcihcfoskcy", // Your App Password
    },
    // Timeouts to prevent hanging
    connectionTimeout: 10000, 
    greetingTimeout: 5000,    
    socketTimeout: 10000,     
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
          return; // Success! Exit the function completely.
      } catch (error) {
          attempts++;
          console.log(`⚠️ Attempt ${attempts} failed for ${options.email}: ${error.message}`);
          
          if (attempts >= maxAttempts) {
              console.log(`❌ Final Failure: Could not send to ${options.email}`);
              throw error; // <--- TELLS THE CONTROLLER "WE FAILED"
          } else {
              // Wait 2 seconds before trying again
              await new Promise(resolve => setTimeout(resolve, 2000));
          }
      }
  }
};

module.exports = sendEmail;