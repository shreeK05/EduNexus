const nodemailer = require('nodemailer');
// SMTP Utility v1.0.4 - Optimized for Render + Brevo

/**
 * Utility to send emails via SMTP.
 * Optimized for Render.com to bypass network blocks.
 */
const sendEmail = async (options) => {
  try {
    const isBrevo = process.env.EMAIL_SERVICE?.toLowerCase() === 'brevo';
    
    // Render/Cloud Hosting Best Practice: Use Port 2525 for Brevo if 587 is blocked
    const port = isBrevo ? 2525 : 587;
    const host = isBrevo ? 'smtp-relay.brevo.com' : 'smtp.gmail.com';

    console.log(`📡 SMTP: Attempting connection to ${host}:${port} (${isBrevo ? 'Brevo' : 'Gmail'})...`);

    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      family: 4, // Force IPv4
      connectionTimeout: 20000, // Increased timeout
      greetingTimeout: 20000,
      socketTimeout: 25000,
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"EduNexus Support" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ SMTP Success for ${options.email}`);
    return info;
  } catch (error) {
    console.error(`❌ SMTP Error for ${options.email}: ${error.message}`);
    throw error;
  }
};

module.exports = sendEmail;