import nodemailer from 'nodemailer';

let gmailTransporter = null;

// Create a transporter with configuration - lazy initialization
const createTransporter = async () => {
  // Only create the transporter once
  if (!gmailTransporter) {
    console.log('📧 Creating Gmail transporter...');
    
    // Check if Gmail credentials are provided
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('📧 Gmail credentials missing. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env file');
      throw new Error('Gmail credentials missing');
    }
    
    // Create Gmail transporter
    gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use app password, not regular Gmail password
      },
    });
    
    // Verify connection
    try {
      await gmailTransporter.verify();
      console.log('📧 Gmail SMTP connection verified successfully');
    } catch (error) {
      console.error('📧 Gmail SMTP connection failed:', error);
      gmailTransporter = null; // Reset for next attempt
      throw error;
    }
  }
  
  return gmailTransporter;
};

/**
 * Send an email
 * @param {Object|string} options - Email options or recipient email address
 * @param {string} subject - Email subject (when first param is email address)
 * @param {string} text - Plain text or HTML content (when first param is email address)
 * @returns {Promise<boolean>} - Success status
 */
export const sendEmail = async (options, subject, text) => {
  try {
    const transporter = await createTransporter();
    
    // Support both function signatures:
    // 1. sendEmail(options) - options is an object
    // 2. sendEmail(to, subject, text) - legacy format
    
    let mailOptions;
    if (typeof options === 'string') {
      // Legacy format: sendEmail(to, subject, text)
      mailOptions = {
        from: process.env.DEFAULT_FROM_EMAIL || process.env.GMAIL_USER,
        to: options,
        subject: subject,
        html: text // Assuming the text is HTML content
      };
    } else {
      // New format: sendEmail(options)
      mailOptions = {
        from: options.from || process.env.DEFAULT_FROM_EMAIL || process.env.GMAIL_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text // Use html if provided, otherwise use text
      };
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('📧 Error sending email:', error);
    return false;
  }
};

/**
 * Initialize mailer by verifying Gmail connection
 * Should be called on app startup to prepare the mailer
 */
export const initializeMailer = async () => {
  try {
    console.log('📧 Initializing mailer...');
    await createTransporter();
    console.log('📧 Mailer initialized successfully');
    return true;
  } catch (error) {
    console.error('📧 Failed to initialize mailer:', error);
    return false;
  }
};

export default { sendEmail, initializeMailer };

