const nodemailer = require('nodemailer');

/**
 * Utility to send emails via SMTP.
 * Automatically detects if using Gmail or Brevo based on EMAIL_SERVICE env var.
 */
const sendEmail = async (options) => {
  try {
    const isBrevo = process.env.EMAIL_SERVICE?.toLowerCase() === 'brevo';
    
    const transporter = nodemailer.createTransport({
      host: isBrevo ? 'smtp-relay.brevo.com' : 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Force IPv4
      family: 4,
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"EduNexus LMS" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.email} via ${isBrevo ? 'Brevo' : 'Gmail'}`);
    return info;
  } catch (error) {
    console.error(`❌ SMTP Error for ${options.email}:`, error.message);
    throw error;
  }
};

module.exports = sendEmail;