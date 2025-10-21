/**
 * Email Service Module
 * Handles all email sending operations using Brevo SMTP
 *
 * @module services/emailService
 */

const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const emailConfig = require('../config/email.config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templatesPath = path.join(__dirname, '../templates/emails');
    this.initializeTransporter();
  }

  /**
   * Initialize SMTP transporter with Brevo configuration
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport(emailConfig.smtp);
      console.log('✅ Email service initialized with Brevo SMTP');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.transporter = null;
    }
  }

  /**
   * Check if email service is enabled and configured
   * @returns {boolean}
   */
  isEnabled() {
    return emailConfig.features.enabled && this.transporter !== null;
  }

  /**
   * Send email with retry logic
   * @param {Object} mailOptions - Email options
   * @returns {Promise<Object>}
   */
  async sendMail(mailOptions) {
    if (!this.isEnabled()) {
      console.warn('⚠️ Email service is disabled or not configured');
      return { success: false, message: 'Email service disabled' };
    }

    const { maxAttempts, delayMs } = emailConfig.retry;
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (error) {
        lastError = error;
        console.error(`❌ Email send attempt ${attempt}/${maxAttempts} failed:`, error.message);

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    console.error('❌ All email send attempts failed:', lastError.message);
    return { success: false, error: lastError.message };
  }

  /**
   * Load and populate email template
   * @param {string} templateName - Name of the template file
   * @param {Object} data - Data to populate template with
   * @returns {Promise<string>} Populated HTML
   */
  async loadTemplate(templateName, data) {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf-8');

      // Replace placeholders with data
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, data[key] || '');
      });

      return template;
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error.message);
      throw new Error(`Failed to load email template: ${templateName}`);
    }
  }

  /**
   * Send booking confirmation email to client
   * @param {Object} appointmentData - Appointment details
   * @returns {Promise<Object>}
   */
  async sendBookingConfirmation(appointmentData) {
    if (!emailConfig.features.bookingConfirmation) return { success: false, message: 'Feature disabled' };

    try {
      const {
        customerEmail,
        customerName,
        businessName,
        serviceName,
        appointmentDate,
        appointmentTime,
        price,
        businessPhone,
        businessAddress,
        notes
      } = appointmentData;

      const html = await this.loadTemplate('booking-confirmation', {
        customerName,
        businessName,
        serviceName,
        appointmentDate,
        appointmentTime,
        price,
        businessPhone,
        businessAddress,
        notes: notes || 'אין הערות מיוחדות',
        currentYear: new Date().getFullYear()
      });

      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
        to: customerEmail,
        subject: `אישור הזמנה - ${businessName}`,
        html
      };

      return await this.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send new booking notification to business owner
   * @param {Object} appointmentData - Appointment details
   * @returns {Promise<Object>}
   */
  async sendBusinessNotification(appointmentData) {
    if (!emailConfig.features.businessNotification) return { success: false, message: 'Feature disabled' };

    try {
      const {
        businessEmail,
        businessName,
        customerName,
        customerPhone,
        customerEmail,
        serviceName,
        appointmentDate,
        appointmentTime,
        price,
        notes
      } = appointmentData;

      const html = await this.loadTemplate('business-notification', {
        businessName,
        customerName,
        customerPhone,
        customerEmail: customerEmail || 'לא צוין',
        serviceName,
        appointmentDate,
        appointmentTime,
        price,
        notes: notes || 'אין הערות',
        currentYear: new Date().getFullYear()
      });

      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
        to: businessEmail,
        subject: `הזמנה חדשה - ${customerName}`,
        html
      };

      return await this.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending business notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send appointment status change email
   * @param {Object} data - Status change details
   * @returns {Promise<Object>}
   */
  async sendStatusChangeEmail(data) {
    if (!emailConfig.features.statusChange) return { success: false, message: 'Feature disabled' };

    try {
      const {
        customerEmail,
        customerName,
        businessName,
        serviceName,
        appointmentDate,
        appointmentTime,
        oldStatus,
        newStatus
      } = data;

      const statusMessages = {
        confirmed: 'אושרה',
        approved: 'אושרה',
        completed: 'הושלמה',
        cancelled_by_business: 'בוטלה על ידי העסק',
        cancelled_by_user: 'בוטלה',
        not_arrived: 'סומנה כלא הגיע'
      };

      const html = await this.loadTemplate('status-change', {
        customerName,
        businessName,
        serviceName,
        appointmentDate,
        appointmentTime,
        oldStatus: statusMessages[oldStatus] || oldStatus,
        newStatus: statusMessages[newStatus] || newStatus,
        currentYear: new Date().getFullYear()
      });

      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
        to: customerEmail,
        subject: `עדכון סטטוס הזמנה - ${businessName}`,
        html
      };

      return await this.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending status change email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send appointment cancellation email
   * @param {Object} data - Cancellation details
   * @returns {Promise<Object>}
   */
  async sendCancellationEmail(data) {
    if (!emailConfig.features.cancellation) return { success: false, message: 'Feature disabled' };

    try {
      const {
        customerEmail,
        customerName,
        businessName,
        serviceName,
        appointmentDate,
        appointmentTime,
        cancelledBy
      } = data;

      const html = await this.loadTemplate('cancellation', {
        customerName,
        businessName,
        serviceName,
        appointmentDate,
        appointmentTime,
        cancelledBy: cancelledBy === 'business' ? 'העסק' : 'הלקוח',
        currentYear: new Date().getFullYear()
      });

      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
        to: customerEmail,
        subject: `ביטול הזמנה - ${businessName}`,
        html
      };

      return await this.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending cancellation email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send appointment reschedule email
   * @param {Object} data - Reschedule details
   * @returns {Promise<Object>}
   */
  async sendRescheduleEmail(data) {
    if (!emailConfig.features.reschedule) return { success: false, message: 'Feature disabled' };

    try {
      const {
        customerEmail,
        customerName,
        businessName,
        serviceName,
        oldDate,
        oldTime,
        newDate,
        newTime
      } = data;

      const html = await this.loadTemplate('reschedule', {
        customerName,
        businessName,
        serviceName,
        oldDate,
        oldTime,
        newDate,
        newTime,
        currentYear: new Date().getFullYear()
      });

      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
        to: customerEmail,
        subject: `עדכון מועד הזמנה - ${businessName}`,
        html
      };

      return await this.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending reschedule email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send appointment reminder email
   * @param {Object} data - Reminder details
   * @returns {Promise<Object>}
   */
  async sendReminderEmail(data) {
    if (!emailConfig.features.reminders) return { success: false, message: 'Feature disabled' };

    try {
      const {
        customerEmail,
        customerName,
        businessName,
        serviceName,
        appointmentDate,
        appointmentTime,
        businessPhone,
        businessAddress
      } = data;

      const html = await this.loadTemplate('reminder', {
        customerName,
        businessName,
        serviceName,
        appointmentDate,
        appointmentTime,
        businessPhone,
        businessAddress,
        currentYear: new Date().getFullYear()
      });

      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
        to: customerEmail,
        subject: `תזכורת להזמנה מחר - ${businessName}`,
        html
      };

      return await this.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending reminder email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to new user
   * @param {Object} data - User details
   * @returns {Promise<Object>}
   */
  async sendWelcomeEmail(data) {
    if (!emailConfig.features.registration) return { success: false, message: 'Feature disabled' };

    try {
      const { email, firstName, lastName } = data;
      const fullName = `${firstName} ${lastName}`;

      const html = await this.loadTemplate('welcome-user', {
        userName: fullName,
        currentYear: new Date().getFullYear()
      });

      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
        to: email,
        subject: 'ברוכים הבאים לפלטפורמת ההזמנות',
        html
      };

      return await this.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to new business
   * @param {Object} data - Business details
   * @returns {Promise<Object>}
   */
  async sendBusinessWelcomeEmail(data) {
    if (!emailConfig.features.registration) return { success: false, message: 'Feature disabled' };

    try {
      const { email, businessName, ownerName } = data;

      const html = await this.loadTemplate('welcome-business', {
        businessName,
        ownerName,
        currentYear: new Date().getFullYear()
      });

      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
        to: email,
        subject: `ברוכים הבאים - ${businessName}`,
        html
      };

      return await this.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending business welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send business moderation result email
   * @param {Object} data - Moderation details
   * @returns {Promise<Object>}
   */
  async sendModerationEmail(data) {
    try {
      const { email, businessName, status, reason } = data;
      const templateName = status === 'approved' ? 'moderation-approved' : 'moderation-rejected';

      const html = await this.loadTemplate(templateName, {
        businessName,
        reason: reason || '',
        currentYear: new Date().getFullYear()
      });

      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
        to: email,
        subject: status === 'approved'
          ? `העסק שלך אושר - ${businessName}`
          : `עדכון לגבי העסק שלך - ${businessName}`,
        html
      };

      return await this.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending moderation email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
