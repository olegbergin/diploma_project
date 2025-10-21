/**
 * Reminder Service Module
 * Handles scheduled appointment reminders using cron jobs
 *
 * @module services/reminderService
 */

const cron = require('node-cron');
const db = require('../dbSingleton').getPromise();
const emailService = require('./emailService');
const emailConfig = require('../config/email.config');

class ReminderService {
  constructor() {
    this.cronJob = null;
    this.isRunning = false;
  }

  /**
   * Initialize the reminder scheduler
   * Runs daily to check for upcoming appointments
   */
  start() {
    if (this.isRunning) {
      console.warn('⚠️ Reminder service is already running');
      return;
    }

    const { cronSchedule } = emailConfig.reminders;

    // Schedule cron job
    this.cronJob = cron.schedule(cronSchedule, async () => {
      console.log('🕐 Running appointment reminders check...');
      await this.sendReminders();
    });

    this.isRunning = true;
    console.log(`✅ Reminder service started (Schedule: ${cronSchedule})`);
  }

  /**
   * Stop the reminder scheduler
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      console.log('⏹️ Reminder service stopped');
    }
  }

  /**
   * Get upcoming appointments that need reminders
   * @returns {Promise<Array>} List of appointments
   */
  async getUpcomingAppointments() {
    try {
      const { hoursBeforeAppointment } = emailConfig.reminders;

      // Calculate time range for reminders
      const now = new Date();
      const reminderStart = new Date(now.getTime() + hoursBeforeAppointment * 60 * 60 * 1000);
      const reminderEnd = new Date(reminderStart.getTime() + 60 * 60 * 1000); // 1 hour window

      const sql = `
        SELECT
          a.appointment_id,
          a.appointment_datetime,
          a.notes,
          u.user_id as customer_id,
          u.first_name,
          u.last_name,
          u.email as customer_email,
          b.business_id,
          b.name as business_name,
          b.location as business_address,
          owner.phone as business_phone,
          s.name as service_name,
          s.price
        FROM appointments a
        INNER JOIN users u ON a.customer_id = u.user_id
        INNER JOIN businesses b ON a.business_id = b.business_id
        INNER JOIN services s ON a.service_id = s.service_id
        LEFT JOIN users owner ON b.owner_id = owner.user_id
        WHERE a.status IN ('pending', 'confirmed', 'approved')
          AND a.appointment_datetime BETWEEN ? AND ?
          AND u.email IS NOT NULL
          AND u.email != ''
        ORDER BY a.appointment_datetime ASC
      `;

      const [appointments] = await db.query(sql, [
        reminderStart.toISOString().slice(0, 19).replace('T', ' '),
        reminderEnd.toISOString().slice(0, 19).replace('T', ' ')
      ]);

      return appointments;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      return [];
    }
  }

  /**
   * Format date for display
   * @param {Date|string} date
   * @returns {string}
   */
  formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Format time for display
   * @param {Date|string} date
   * @returns {string}
   */
  formatTime(date) {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Send reminder emails for upcoming appointments
   */
  async sendReminders() {
    try {
      const appointments = await this.getUpcomingAppointments();

      if (appointments.length === 0) {
        console.log('ℹ️ No appointments requiring reminders');
        return;
      }

      console.log(`📧 Sending ${appointments.length} reminder emails...`);

      let successCount = 0;
      let failureCount = 0;

      for (const appointment of appointments) {
        try {
          const reminderData = {
            customerEmail: appointment.customer_email,
            customerName: `${appointment.first_name} ${appointment.last_name}`,
            businessName: appointment.business_name,
            serviceName: appointment.service_name,
            appointmentDate: this.formatDate(appointment.appointment_datetime),
            appointmentTime: this.formatTime(appointment.appointment_datetime),
            businessPhone: appointment.business_phone || 'לא צוין',
            businessAddress: appointment.business_address || 'לא צוין'
          };

          const result = await emailService.sendReminderEmail(reminderData);

          if (result.success) {
            successCount++;
            console.log(`✅ Reminder sent for appointment #${appointment.appointment_id}`);
          } else {
            failureCount++;
            console.error(`❌ Failed to send reminder for appointment #${appointment.appointment_id}`);
          }
        } catch (error) {
          failureCount++;
          console.error(`❌ Error sending reminder for appointment #${appointment.appointment_id}:`, error.message);
        }
      }

      console.log(`📊 Reminder summary: ${successCount} sent, ${failureCount} failed`);
    } catch (error) {
      console.error('Error in sendReminders:', error);
    }
  }

  /**
   * Send a single reminder immediately (for testing)
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise<Object>}
   */
  async sendSingleReminder(appointmentId) {
    try {
      const sql = `
        SELECT
          a.appointment_id,
          a.appointment_datetime,
          u.first_name,
          u.last_name,
          u.email as customer_email,
          b.name as business_name,
          b.location as business_address,
          owner.phone as business_phone,
          s.name as service_name
        FROM appointments a
        INNER JOIN users u ON a.customer_id = u.user_id
        INNER JOIN businesses b ON a.business_id = b.business_id
        INNER JOIN services s ON a.service_id = s.service_id
        LEFT JOIN users owner ON b.owner_id = owner.user_id
        WHERE a.appointment_id = ?
      `;

      const [appointments] = await db.query(sql, [appointmentId]);

      if (appointments.length === 0) {
        return { success: false, message: 'Appointment not found' };
      }

      const appointment = appointments[0];

      const reminderData = {
        customerEmail: appointment.customer_email,
        customerName: `${appointment.first_name} ${appointment.last_name}`,
        businessName: appointment.business_name,
        serviceName: appointment.service_name,
        appointmentDate: this.formatDate(appointment.appointment_datetime),
        appointmentTime: this.formatTime(appointment.appointment_datetime),
        businessPhone: appointment.business_phone || 'לא צוין',
        businessAddress: appointment.business_address || 'לא צוין'
      };

      return await emailService.sendReminderEmail(reminderData);
    } catch (error) {
      console.error('Error sending single reminder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get service status
   * @returns {Object}
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      schedule: emailConfig.reminders.cronSchedule,
      hoursBeforeAppointment: emailConfig.reminders.hoursBeforeAppointment
    };
  }
}

module.exports = new ReminderService();
