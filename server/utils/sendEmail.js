const nodemailer = require('nodemailer');

/**
 * Utility to send emails via SMTP (e.g. Gmail, Outlook, etc.)
 * Enhanced for better deliverability and error reporting.
 */
const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false // Helps with some network issues
      }
    });

    const mailOptions = {
      from: `"EduNexus LMS" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ SMTP Success: ${info.messageId} for ${options.email}`);
    return info;
  } catch (error) {
    console.error(`❌ SMTP Error for ${options.email}:`, error.message);
    throw error; // Re-throw so the caller knows it failed
  }
};

module.exports = sendEmail;