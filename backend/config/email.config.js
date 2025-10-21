/**
 * Email Configuration Module
 * Configures SMTP settings for Brevo (Sendinblue) email service
 *
 * @module config/email
 */

module.exports = {
  /**
   * SMTP Configuration for Brevo
   */
  smtp: {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || ''
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  },

  /**
   * Email sender details
   */
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Booking Platform',
    email: process.env.EMAIL_FROM_ADDRESS || 'noreply@bookingplatform.com'
  },

  /**
   * Email feature flags
   */
  features: {
    enabled: process.env.EMAIL_ENABLED !== 'false', // Enable/disable all emails
    bookingConfirmation: true,
    businessNotification: true,
    statusChange: true,
    cancellation: true,
    reschedule: true,
    reminders: true,
    registration: true,
    verification: false // Set to true if you want email verification
  },

  /**
   * Reminder settings
   */
  reminders: {
    hoursBeforeAppointment: parseInt(process.env.REMINDER_HOURS_BEFORE) || 24,
    cronSchedule: process.env.REMINDER_CRON_SCHEDULE || '0 9 * * *' // Every day at 9 AM
  },

  /**
   * Admin notification email
   */
  adminEmail: process.env.ADMIN_EMAIL || 'admin@bookingplatform.com',

  /**
   * Email retry configuration
   */
  retry: {
    maxAttempts: 3,
    delayMs: 2000
  }
};
