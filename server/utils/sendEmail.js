const sgMail = require('@sendgrid/mail');

const sendEmail = async (options) => {
  try {
    // Set SendGrid API Key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: options.email,
      from: process.env.EMAIL_FROM || 'noreply@edunexus.com', // Use verified sender
      subject: options.subject,
      html: options.message,
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${options.email}`);
  } catch (error) {
    console.error(`❌ Email failed for ${options.email}:`, error.message);
    if (error.response) {
      console.error('SendGrid Error:', error.response.body);
    }
  }
};

module.exports = sendEmail;