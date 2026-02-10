const nodemailer = require("nodemailer");
const dns = require("dns");
const util = require("util");

// Promisify DNS to allow using await
const resolve4 = util.promisify(dns.resolve4);

const sendEmail = async (options) => {
  let transporter;
  
  // 1. Manually Resolve IPv4 (This prevents the IPv6/ENETUNREACH error)
  let gmailIp = null;
  try {
    const addresses = await resolve4('smtp.gmail.com');
    gmailIp = addresses[0]; 
    console.log(`🔒 Resolved Gmail IP to: ${gmailIp} (IPv4)`);
  } catch (error) {
    console.log("⚠️ DNS Resolution failed, using default hostname");
    gmailIp = 'smtp.gmail.com';
  }

  // 2. Configure Transporter
  // We use Port 465 because it is more stable when connecting to an IP directly
  transporter = nodemailer.createTransport({
    host: gmailIp,          
    port: 465,              // Use Port 465 (SSL)
    secure: true,           // Must be true for Port 465
    auth: {
      user: "shree.k1510@gmail.com", 
      // 🚨 FIX: Remove spaces from the password automatically
      pass: "enpn fbtu gcco rxbv".replace(/\s+/g, ''), 
    },
    tls: {
      servername: 'smtp.gmail.com', // Necessary when using IP
      rejectUnauthorized: false
    },
    // 🚨 INCREASED TIMEOUTS (60 seconds)
    // This gives the slow Render server enough time to connect
    connectionTimeout: 60000, 
    greetingTimeout: 30000,    
    socketTimeout: 60000,     
  });

  const mailOptions = {
    from: "EduNexus LMS <shree.k1510@gmail.com>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 3. Strict Retry Logic
  let attempts = 0;
  const maxAttempts = 3;
  let sent = false;

  while (attempts < maxAttempts && !sent) {
      try {
          await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent to ${options.email}`);
          sent = true; // Mark as sent to stop loop
          return;      // EXIT FUNCTION IMMEDIATELY
      } catch (error) {
          attempts++;
          console.log(`⚠️ Attempt ${attempts} failed for ${options.email}: ${error.message}`);
          
          if (attempts >= maxAttempts) {
              console.log(`❌ Final Failure: Could not send to ${options.email}`);
              return; // EXIT FUNCTION IMMEDIATELY
          } else {
              // Wait 5 seconds before retrying
              await new Promise(resolve => setTimeout(resolve, 5000));
          }
      }
  }
};

module.exports = sendEmail;