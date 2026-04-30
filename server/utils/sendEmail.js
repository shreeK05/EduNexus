const nodemailer = require('nodemailer');

/**
 * Utility to send emails via SMTP (e.g. Gmail, Outlook, etc.)
 * Configured specifically for cloud hosting compatibility.
 */
const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Must be false for port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Force IPv4 to avoid ENETUNREACH errors on cloud providers
      // which often have issues routing SMTP over IPv6
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      dns_update: true,
      family: 4, 
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      }
    });

    const mailOptions = {
      from: `"EduNexus LMS" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ SMTP Success for ${options.email}`);
    return info;
  } catch (error) {
    console.error(`❌ SMTP Error for ${options.email}:`, error.message);
    throw error;
  }
};

module.exports = sendEmail;