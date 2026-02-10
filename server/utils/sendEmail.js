const nodemailer = require("nodemailer");
const dns = require("dns");
const util = require("util");

const resolve4 = util.promisify(dns.resolve4);

const sendEmail = async (options) => {
  let transporter;

  try {
    // 1. Manually find the IPv4 address for Gmail
    // This bypasses the system DNS which keeps giving us broken IPv6 addresses
    const addresses = await resolve4('smtp.gmail.com');
    const gmailIp = addresses[0]; 

    console.log(`🔒 Resolved Gmail IP to: ${gmailIp} (IPv4)`);

    // 2. Configure Transporter using the specific IP Address
    transporter = nodemailer.createTransport({
      host: gmailIp,          // Connect to the IP directly (e.g., 142.250.x.x)
      port: 465,              // Secure Port
      secure: true,           // SSL
      auth: {
        user: "shree.k1510@gmail.com", 
        pass: "afjcdtcihcfoskcy", // Your App Password
      },
      tls: {
        // We need this because we are connecting to an IP, 
        // but the certificate is for "smtp.gmail.com"
        servername: 'smtp.gmail.com', 
        rejectUnauthorized: false
      },
      connectionTimeout: 10000, 
      greetingTimeout: 5000,    
      socketTimeout: 10000,     
    });

  } catch (err) {
    console.log("⚠️ DNS Resolution failed, falling back to default host");
    // Fallback if the manual lookup fails (rare)
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
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

  // 3. Retry Logic
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