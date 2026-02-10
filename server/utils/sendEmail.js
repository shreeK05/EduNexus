const nodemailer = require("nodemailer");
const dns = require("dns");
const util = require("util");

// Promisify DNS resolution to use async/await
const resolve4 = util.promisify(dns.resolve4);

const sendEmail = async (options) => {
  let transporter;

  try {
    // 1. Manually find the IPv4 address for Gmail
    // This strictly prevents the "ENETUNREACH" IPv6 error
    const addresses = await resolve4('smtp.gmail.com');
    const gmailIp = addresses[0]; 

    console.log(`🔒 Resolved Gmail IP to: ${gmailIp} (IPv4)`);

    // 2. Configure Transporter using the IP + PORT 587
    transporter = nodemailer.createTransport({
      host: gmailIp,          // Connect to the IP directly
      port: 587,              // <--- USE PORT 587 (Best for Cloud Servers)
      secure: false,          // <--- MUST be false for Port 587
      requireTLS: true,       // <--- Force Encryption
      auth: {
        user: "shree.k1510@gmail.com", 
        pass: "afjcdtcihcfoskcy", 
      },
      tls: {
        // Essential because we are connecting to an IP directly
        servername: 'smtp.gmail.com', 
        rejectUnauthorized: false
      },
      // Robust Timeouts
      connectionTimeout: 10000, 
      greetingTimeout: 5000,    
      socketTimeout: 10000,     
    });

  } catch (err) {
    console.log("⚠️ DNS Resolution failed, falling back to standard config");
    // Backup configuration just in case
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "shree.k1510@gmail.com", 
        pass: "afjcdtcihcfoskcy",
      },
    });
  }

  const mailOptions = {
    from: "EduNexus LMS <shree.k1510@gmail.com>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 3. RETRY LOGIC (With Fixed "Success" Message Bug)
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
      try {
          await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent to ${options.email}`);
          return; // <--- STOP HERE. Don't run the rest of the loop.
      } catch (error) {
          attempts++;
          console.log(`⚠️ Attempt ${attempts} failed for ${options.email}: ${error.message}`);
          
          if (attempts >= maxAttempts) {
              console.log(`❌ Final Failure: Could not send to ${options.email}`);
              return; // <--- STOP HERE. Don't print success message.
          } else {
              // Wait 2 seconds before retrying
              await new Promise(resolve => setTimeout(resolve, 2000));
          }
      }
  }
};

module.exports = sendEmail;