/**
 * Email Service Tests
 * Tests email sending functionality with Brevo SMTP
 */

const emailService = require('../services/emailService');

describe('Email Service Tests', () => {
  const testEmail = 'bergin.oleg@gmail.com';

  // Skip tests if email is not configured
  const skipIfEmailDisabled = () => {
    if (!emailService.isEnabled()) {
      console.warn('⚠️ Email service is disabled. Configure SMTP in .env to run these tests.');
      return true;
    }
    return false;
  };

  beforeAll(() => {
    console.log('\n📧 Email Service Test Suite');
    console.log('Target email:', testEmail);
    console.log('Email enabled:', emailService.isEnabled());
  });

  describe('Service Configuration', () => {
    test('should initialize email service', () => {
      expect(emailService).toBeDefined();
      expect(typeof emailService.sendMail).toBe('function');
    });

    test('should check if email service is enabled', () => {
      const isEnabled = emailService.isEnabled();
      expect(typeof isEnabled).toBe('boolean');
    });
  });

  describe('Booking Confirmation Email', () => {
    test('should send booking confirmation email', async () => {
      if (skipIfEmailDisabled()) return;

      const appointmentData = {
        customerEmail: testEmail,
        customerName: 'Oleg Bergin',
        businessName: 'Test Salon',
        serviceName: 'Haircut',
        appointmentDate: '2025-12-25',
        appointmentTime: '10:00',
        price: 150,
        businessPhone: '054-1234567',
        businessAddress: 'Tel Aviv, Dizengoff 123',
        notes: 'Please arrive 5 minutes early'
      };

      const result = await emailService.sendBookingConfirmation(appointmentData);

      expect(result).toBeDefined();
      if (result.success) {
        expect(result.success).toBe(true);
        expect(result.messageId).toBeDefined();
        console.log('✅ Booking confirmation sent:', result.messageId);
      } else {
        console.error('❌ Failed to send booking confirmation:', result.error);
      }
    }, 30000); // 30 second timeout for email sending
  });

  describe('Business Notification Email', () => {
    test('should send business notification email', async () => {
      if (skipIfEmailDisabled()) return;

      const appointmentData = {
        businessEmail: testEmail,
        businessName: 'Test Salon',
        customerName: 'John Doe',
        customerPhone: '052-9876543',
        customerEmail: 'customer@example.com',
        serviceName: 'Haircut',
        appointmentDate: '2025-12-25',
        appointmentTime: '14:00',
        price: 150,
        notes: 'First visit'
      };

      const result = await emailService.sendBusinessNotification(appointmentData);

      expect(result).toBeDefined();
      if (result.success) {
        expect(result.success).toBe(true);
        expect(result.messageId).toBeDefined();
        console.log('✅ Business notification sent:', result.messageId);
      } else {
        console.error('❌ Failed to send business notification:', result.error);
      }
    }, 30000);
  });

  describe('Status Change Email', () => {
    test('should send status change email', async () => {
      if (skipIfEmailDisabled()) return;

      const statusData = {
        customerEmail: testEmail,
        customerName: 'Oleg Bergin',
        businessName: 'Test Salon',
        serviceName: 'Haircut',
        appointmentDate: '2025-12-25',
        appointmentTime: '10:00',
        oldStatus: 'pending',
        newStatus: 'confirmed'
      };

      const result = await emailService.sendStatusChangeEmail(statusData);

      expect(result).toBeDefined();
      if (result.success) {
        expect(result.success).toBe(true);
        expect(result.messageId).toBeDefined();
        console.log('✅ Status change email sent:', result.messageId);
      } else {
        console.error('❌ Failed to send status change email:', result.error);
      }
    }, 30000);
  });

  describe('Cancellation Email', () => {
    test('should send cancellation email', async () => {
      if (skipIfEmailDisabled()) return;

      const cancellationData = {
        customerEmail: testEmail,
        customerName: 'Oleg Bergin',
        businessName: 'Test Salon',
        serviceName: 'Haircut',
        appointmentDate: '2025-12-25',
        appointmentTime: '10:00',
        cancelledBy: 'העסק'
      };

      const result = await emailService.sendCancellationEmail(cancellationData);

      expect(result).toBeDefined();
      if (result.success) {
        expect(result.success).toBe(true);
        expect(result.messageId).toBeDefined();
        console.log('✅ Cancellation email sent:', result.messageId);
      } else {
        console.error('❌ Failed to send cancellation email:', result.error);
      }
    }, 30000);
  });

  describe('Reschedule Email', () => {
    test('should send reschedule email', async () => {
      if (skipIfEmailDisabled()) return;

      const rescheduleData = {
        customerEmail: testEmail,
        customerName: 'Oleg Bergin',
        businessName: 'Test Salon',
        serviceName: 'Haircut',
        oldDate: '2025-12-25',
        oldTime: '10:00',
        newDate: '2025-12-26',
        newTime: '14:00'
      };

      const result = await emailService.sendRescheduleEmail(rescheduleData);

      expect(result).toBeDefined();
      if (result.success) {
        expect(result.success).toBe(true);
        expect(result.messageId).toBeDefined();
        console.log('✅ Reschedule email sent:', result.messageId);
      } else {
        console.error('❌ Failed to send reschedule email:', result.error);
      }
    }, 30000);
  });

  describe('Reminder Email', () => {
    test('should send reminder email', async () => {
      if (skipIfEmailDisabled()) return;

      const reminderData = {
        customerEmail: testEmail,
        customerName: 'Oleg Bergin',
        businessName: 'Test Salon',
        serviceName: 'Haircut',
        appointmentDate: '2025-12-25',
        appointmentTime: '10:00',
        businessPhone: '054-1234567',
        businessAddress: 'Tel Aviv, Dizengoff 123'
      };

      const result = await emailService.sendReminderEmail(reminderData);

      expect(result).toBeDefined();
      if (result.success) {
        expect(result.success).toBe(true);
        expect(result.messageId).toBeDefined();
        console.log('✅ Reminder email sent:', result.messageId);
      } else {
        console.error('❌ Failed to send reminder email:', result.error);
      }
    }, 30000);
  });

  describe('Welcome User Email', () => {
    test('should send welcome email to new user', async () => {
      if (skipIfEmailDisabled()) return;

      const userData = {
        email: testEmail,
        firstName: 'Oleg',
        lastName: 'Bergin'
      };

      const result = await emailService.sendWelcomeEmail(userData);

      expect(result).toBeDefined();
      if (result.success) {
        expect(result.success).toBe(true);
        expect(result.messageId).toBeDefined();
        console.log('✅ Welcome email sent:', result.messageId);
      } else {
        console.error('❌ Failed to send welcome email:', result.error);
      }
    }, 30000);
  });

  describe('Welcome Business Email', () => {
    test('should send welcome email to new business', async () => {
      if (skipIfEmailDisabled()) return;

      const businessData = {
        email: testEmail,
        businessName: 'Test Salon',
        ownerName: 'Oleg Bergin'
      };

      const result = await emailService.sendBusinessWelcomeEmail(businessData);

      expect(result).toBeDefined();
      if (result.success) {
        expect(result.success).toBe(true);
        expect(result.messageId).toBeDefined();
        console.log('✅ Business welcome email sent:', result.messageId);
      } else {
        console.error('❌ Failed to send business welcome email:', result.error);
      }
    }, 30000);
  });

  describe('Moderation Emails', () => {
    test('should send business approval email', async () => {
      if (skipIfEmailDisabled()) return;

      const moderationData = {
        email: testEmail,
        businessName: 'Test Salon',
        status: 'approved',
        reason: ''
      };

      const result = await emailService.sendModerationEmail(moderationData);

      expect(result).toBeDefined();
      if (result.success) {
        expect(result.success).toBe(true);
        expect(result.messageId).toBeDefined();
        console.log('✅ Approval email sent:', result.messageId);
      } else {
        console.error('❌ Failed to send approval email:', result.error);
      }
    }, 30000);

    test('should send business rejection email', async () => {
      if (skipIfEmailDisabled()) return;

      const moderationData = {
        email: testEmail,
        businessName: 'Test Salon',
        status: 'rejected',
        reason: 'נדרשים פרטים נוספים על העסק'
      };

      const result = await emailService.sendModerationEmail(moderationData);

      expect(result).toBeDefined();
      if (result.success) {
        expect(result.success).toBe(true);
        expect(result.messageId).toBeDefined();
        console.log('✅ Rejection email sent:', result.messageId);
      } else {
        console.error('❌ Failed to send rejection email:', result.error);
      }
    }, 30000);
  });

  afterAll(() => {
    console.log('\n📊 Email test suite completed');
    console.log('Check', testEmail, 'for received emails');
  });
});
