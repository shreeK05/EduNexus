const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Configure for PORT 587 (More reliable on Cloud Servers)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,                // <--- CHANGE: Use Port 587 instead of 465
    secure: false,            // <--- CHANGE: Must be false for Port 587
    requireTLS: true,         // <--- CHANGE: Force encryption (STARTTLS)
    family: 4,                // Force IPv4
    auth: {
      user: "shree.k1510@gmail.com", 
      pass: "afjcdtcihcfoskcy", // Your App Password
    },
    // timeouts
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

  // 2. RETRY LOGIC (With fixed error reporting)
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
      try {
          await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent to ${options.email}`);
          return; // <--- SUCCESS: Stops the function here.
      } catch (error) {
          attempts++;
          console.log(`⚠️ Attempt ${attempts} failed for ${options.email}: ${error.message}`);
          
          if (attempts >= maxAttempts) {
              console.log(`❌ Final Failure: Could not send to ${options.email}`);
              // We return here so we don't accidentally print "success" later
              return; 
          } else {
              // Wait 2 seconds before trying again
              await new Promise(resolve => setTimeout(resolve, 2000));
          }
      }
  }
};

module.exports = sendEmail;