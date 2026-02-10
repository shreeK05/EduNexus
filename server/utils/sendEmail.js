const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    // 1. Manually configure the Gmail Server
    host: "smtp.gmail.com", 
    port: 465,               // Use Port 465 (SSL) instead of 587
    secure: true,            // Use Secure SSL connection
    
    // 2. FORCE IPv4 (This is the magic fix for ENETUNREACH)
    family: 4,               
    
    auth: {
      user: "shree.k1510@gmail.com",
      pass: "afjcdtcihcfoskcy", // Your App Password updated
    },
    
    // 3. Timeouts (Keep these high to prevent "Connection Timeout")
    connectionTimeout: 20000, // 20 seconds
    greetingTimeout: 10000,   // 10 seconds
    socketTimeout: 20000,     // 20 seconds
  });

  const mailOptions = {
    from: "EduNexus LMS <shree.k1510@gmail.com>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // RETRY LOGIC (Tries 3 times)
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
              throw error; 
          } else {
              await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
          }
      }
  }
};

module.exports = sendEmail;