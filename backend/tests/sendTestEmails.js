/**
 * Manual Email Test Script
 * Run this script to send all types of test emails to bergin.oleg@gmail.com
 *
 * Usage: node tests/sendTestEmails.js
 */

require('dotenv').config();
const emailService = require('../services/emailService');
const reminderService = require('../services/reminderService');

const TEST_EMAIL = 'bergin.oleg@gmail.com';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`),
  subsection: (msg) => console.log(`\n${colors.magenta}📧 ${msg}${colors.reset}`)
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendAllTestEmails() {
  log.section('📧 Email Testing Script');
  log.info(`Target email: ${TEST_EMAIL}`);
  log.info(`Email service enabled: ${emailService.isEnabled()}`);

  if (!emailService.isEnabled()) {
    log.error('Email service is not enabled!');
    log.warning('Please configure SMTP settings in .env file');
    log.info('Check backend/.env.example for configuration instructions');
    process.exit(1);
  }

  const results = {
    total: 0,
    success: 0,
    failed: 0
  };

  // Test 1: Booking Confirmation
  log.subsection('Test 1: Booking Confirmation Email');
  try {
    const result = await emailService.sendBookingConfirmation({
      customerEmail: TEST_EMAIL,
      customerName: 'Oleg Bergin',
      businessName: 'מספרת מירי - Test Salon',
      serviceName: 'תספורת נשים',
      appointmentDate: '25/12/2025',
      appointmentTime: '10:00',
      price: 150,
      businessPhone: '054-1234567',
      businessAddress: 'תל אביב, דיזנגוף 123',
      notes: 'Please arrive 5 minutes early'
    });
    results.total++;
    if (result.success) {
      log.success(`Booking confirmation sent! Message ID: ${result.messageId}`);
      results.success++;
    } else {
      log.error(`Failed to send: ${result.error || result.message}`);
      results.failed++;
    }
  } catch (error) {
    log.error(`Exception: ${error.message}`);
    results.total++;
    results.failed++;
  }
  await sleep(2000);

  // Test 2: Business Notification
  log.subsection('Test 2: Business Notification Email');
  try {
    const result = await emailService.sendBusinessNotification({
      businessEmail: TEST_EMAIL,
      businessName: 'מספרת מירי - Test Salon',
      customerName: 'John Doe',
      customerPhone: '052-9876543',
      customerEmail: 'customer@example.com',
      serviceName: 'תספורת נשים',
      appointmentDate: '25/12/2025',
      appointmentTime: '14:00',
      price: 150,
      notes: 'First visit to the salon'
    });
    results.total++;
    if (result.success) {
      log.success(`Business notification sent! Message ID: ${result.messageId}`);
      results.success++;
    } else {
      log.error(`Failed to send: ${result.error || result.message}`);
      results.failed++;
    }
  } catch (error) {
    log.error(`Exception: ${error.message}`);
    results.total++;
    results.failed++;
  }
  await sleep(2000);

  // Test 3: Status Change
  log.subsection('Test 3: Status Change Email');
  try {
    const result = await emailService.sendStatusChangeEmail({
      customerEmail: TEST_EMAIL,
      customerName: 'Oleg Bergin',
      businessName: 'מספרת מירי - Test Salon',
      serviceName: 'תספורת נשים',
      appointmentDate: '25/12/2025',
      appointmentTime: '10:00',
      oldStatus: 'pending',
      newStatus: 'confirmed'
    });
    results.total++;
    if (result.success) {
      log.success(`Status change email sent! Message ID: ${result.messageId}`);
      results.success++;
    } else {
      log.error(`Failed to send: ${result.error || result.message}`);
      results.failed++;
    }
  } catch (error) {
    log.error(`Exception: ${error.message}`);
    results.total++;
    results.failed++;
  }
  await sleep(2000);

  // Test 4: Cancellation
  log.subsection('Test 4: Cancellation Email');
  try {
    const result = await emailService.sendCancellationEmail({
      customerEmail: TEST_EMAIL,
      customerName: 'Oleg Bergin',
      businessName: 'מספרת מירי - Test Salon',
      serviceName: 'תספורת נשים',
      appointmentDate: '25/12/2025',
      appointmentTime: '10:00',
      cancelledBy: 'העסק'
    });
    results.total++;
    if (result.success) {
      log.success(`Cancellation email sent! Message ID: ${result.messageId}`);
      results.success++;
    } else {
      log.error(`Failed to send: ${result.error || result.message}`);
      results.failed++;
    }
  } catch (error) {
    log.error(`Exception: ${error.message}`);
    results.total++;
    results.failed++;
  }
  await sleep(2000);

  // Test 5: Reschedule
  log.subsection('Test 5: Reschedule Email');
  try {
    const result = await emailService.sendRescheduleEmail({
      customerEmail: TEST_EMAIL,
      customerName: 'Oleg Bergin',
      businessName: 'מספרת מירי - Test Salon',
      serviceName: 'תספורת נשים',
      oldDate: '25/12/2025',
      oldTime: '10:00',
      newDate: '26/12/2025',
      newTime: '14:00'
    });
    results.total++;
    if (result.success) {
      log.success(`Reschedule email sent! Message ID: ${result.messageId}`);
      results.success++;
    } else {
      log.error(`Failed to send: ${result.error || result.message}`);
      results.failed++;
    }
  } catch (error) {
    log.error(`Exception: ${error.message}`);
    results.total++;
    results.failed++;
  }
  await sleep(2000);

  // Test 6: Reminder
  log.subsection('Test 6: Reminder Email');
  try {
    const result = await emailService.sendReminderEmail({
      customerEmail: TEST_EMAIL,
      customerName: 'Oleg Bergin',
      businessName: 'מספרת מירי - Test Salon',
      serviceName: 'תספורת נשים',
      appointmentDate: '25/12/2025',
      appointmentTime: '10:00',
      businessPhone: '054-1234567',
      businessAddress: 'תל אביב, דיזנגוף 123'
    });
    results.total++;
    if (result.success) {
      log.success(`Reminder email sent! Message ID: ${result.messageId}`);
      results.success++;
    } else {
      log.error(`Failed to send: ${result.error || result.message}`);
      results.failed++;
    }
  } catch (error) {
    log.error(`Exception: ${error.message}`);
    results.total++;
    results.failed++;
  }
  await sleep(2000);

  // Test 7: Welcome User
  log.subsection('Test 7: Welcome User Email');
  try {
    const result = await emailService.sendWelcomeEmail({
      email: TEST_EMAIL,
      firstName: 'Oleg',
      lastName: 'Bergin'
    });
    results.total++;
    if (result.success) {
      log.success(`Welcome email sent! Message ID: ${result.messageId}`);
      results.success++;
    } else {
      log.error(`Failed to send: ${result.error || result.message}`);
      results.failed++;
    }
  } catch (error) {
    log.error(`Exception: ${error.message}`);
    results.total++;
    results.failed++;
  }
  await sleep(2000);

  // Test 8: Welcome Business
  log.subsection('Test 8: Welcome Business Email');
  try {
    const result = await emailService.sendBusinessWelcomeEmail({
      email: TEST_EMAIL,
      businessName: 'מספרת מירי - Test Salon',
      ownerName: 'Oleg Bergin'
    });
    results.total++;
    if (result.success) {
      log.success(`Business welcome email sent! Message ID: ${result.messageId}`);
      results.success++;
    } else {
      log.error(`Failed to send: ${result.error || result.message}`);
      results.failed++;
    }
  } catch (error) {
    log.error(`Exception: ${error.message}`);
    results.total++;
    results.failed++;
  }
  await sleep(2000);

  // Test 9: Moderation Approved
  log.subsection('Test 9: Business Approved Email');
  try {
    const result = await emailService.sendModerationEmail({
      email: TEST_EMAIL,
      businessName: 'מספרת מירי - Test Salon',
      status: 'approved',
      reason: ''
    });
    results.total++;
    if (result.success) {
      log.success(`Approval email sent! Message ID: ${result.messageId}`);
      results.success++;
    } else {
      log.error(`Failed to send: ${result.error || result.message}`);
      results.failed++;
    }
  } catch (error) {
    log.error(`Exception: ${error.message}`);
    results.total++;
    results.failed++;
  }
  await sleep(2000);

  // Test 10: Moderation Rejected
  log.subsection('Test 10: Business Rejected Email');
  try {
    const result = await emailService.sendModerationEmail({
      email: TEST_EMAIL,
      businessName: 'מספרת מירי - Test Salon',
      status: 'rejected',
      reason: 'נדרשים פרטים נוספים על העסק והשירותים המוצעים'
    });
    results.total++;
    if (result.success) {
      log.success(`Rejection email sent! Message ID: ${result.messageId}`);
      results.success++;
    } else {
      log.error(`Failed to send: ${result.error || result.message}`);
      results.failed++;
    }
  } catch (error) {
    log.error(`Exception: ${error.message}`);
    results.total++;
    results.failed++;
  }

  // Display summary
  log.section('📊 Test Results Summary');
  console.log(`Total emails attempted: ${results.total}`);
  log.success(`Successful: ${results.success}`);
  if (results.failed > 0) {
    log.error(`Failed: ${results.failed}`);
  }

  const successRate = ((results.success / results.total) * 100).toFixed(1);
  console.log(`Success rate: ${successRate}%`);

  log.info(`\nCheck your inbox at: ${TEST_EMAIL}`);
  log.warning('Note: Emails may take a few moments to arrive');
  log.warning('Check spam folder if emails are not in inbox');

  console.log(''); // Empty line for spacing
}

// Run the test
sendAllTestEmails()
  .then(() => {
    log.success('Email testing completed!');
    process.exit(0);
  })
  .catch((error) => {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
