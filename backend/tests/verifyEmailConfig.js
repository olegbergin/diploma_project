/**
 * Email Configuration Verification Script
 * Run this to check if your .env file is configured correctly
 *
 * Usage: node tests/verifyEmailConfig.js
 */

require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`\n${colors.cyan}${'='.repeat(60)}`);
console.log('📧 Email Configuration Verification');
console.log(`${'='.repeat(60)}${colors.reset}\n`);

const checks = {
  total: 0,
  passed: 0,
  failed: 0
};

function checkEnvVar(name, required = true) {
  checks.total++;
  const value = process.env[name];

  if (!value || value === '') {
    if (required) {
      console.log(`${colors.red}❌ ${name}: NOT SET (required)${colors.reset}`);
      checks.failed++;
    } else {
      console.log(`${colors.yellow}⚠️  ${name}: NOT SET (optional)${colors.reset}`);
      checks.passed++;
    }
  } else {
    // Mask sensitive values
    let displayValue = value;
    if (name.includes('PASSWORD') || name.includes('SECRET')) {
      displayValue = '*'.repeat(Math.min(value.length, 20));
    }
    console.log(`${colors.green}✅ ${name}: ${displayValue}${colors.reset}`);
    checks.passed++;
  }

  return value;
}

// Check all required email environment variables
console.log(`${colors.blue}Required Configuration:${colors.reset}`);
const emailEnabled = checkEnvVar('EMAIL_ENABLED', true);
const smtpHost = checkEnvVar('SMTP_HOST', true);
const smtpPort = checkEnvVar('SMTP_PORT', true);
const smtpUser = checkEnvVar('SMTP_USER', true);
const smtpPassword = checkEnvVar('SMTP_PASSWORD', true);
const fromName = checkEnvVar('EMAIL_FROM_NAME', true);
const fromAddress = checkEnvVar('EMAIL_FROM_ADDRESS', true);

console.log(`\n${colors.blue}Optional Configuration:${colors.reset}`);
checkEnvVar('ADMIN_EMAIL', false);
checkEnvVar('REMINDER_HOURS_BEFORE', false);
checkEnvVar('REMINDER_CRON_SCHEDULE', false);

// Test email service initialization
console.log(`\n${colors.blue}Service Status:${colors.reset}`);
try {
  const emailService = require('../services/emailService');
  const isEnabled = emailService.isEnabled();

  if (isEnabled) {
    console.log(`${colors.green}✅ Email Service: ENABLED${colors.reset}`);
    checks.passed++;
  } else {
    console.log(`${colors.red}❌ Email Service: DISABLED${colors.reset}`);
    checks.failed++;
  }
  checks.total++;
} catch (error) {
  console.log(`${colors.red}❌ Email Service: ERROR - ${error.message}${colors.reset}`);
  checks.failed++;
  checks.total++;
}

try {
  const reminderService = require('../services/reminderService');
  const status = reminderService.getStatus();
  console.log(`${colors.green}✅ Reminder Service: ${status.isRunning ? 'READY' : 'NOT STARTED'}${colors.reset}`);
  if (status.schedule) {
    console.log(`   Schedule: ${status.schedule}`);
    console.log(`   Hours before: ${status.hoursBeforeAppointment}`);
  }
  checks.passed++;
  checks.total++;
} catch (error) {
  console.log(`${colors.red}❌ Reminder Service: ERROR - ${error.message}${colors.reset}`);
  checks.failed++;
  checks.total++;
}

// Show summary
console.log(`\n${colors.cyan}${'='.repeat(60)}`);
console.log('Summary');
console.log(`${'='.repeat(60)}${colors.reset}`);
console.log(`Total checks: ${checks.total}`);
console.log(`${colors.green}Passed: ${checks.passed}${colors.reset}`);
if (checks.failed > 0) {
  console.log(`${colors.red}Failed: ${checks.failed}${colors.reset}`);
}

// Provide recommendations
console.log(`\n${colors.cyan}${'='.repeat(60)}`);
console.log('Recommendations');
console.log(`${'='.repeat(60)}${colors.reset}`);

if (checks.failed > 0) {
  console.log(`\n${colors.red}⚠️  Configuration issues detected!${colors.reset}\n`);

  if (emailEnabled !== 'true') {
    console.log(`${colors.yellow}1. Set EMAIL_ENABLED=true in .env${colors.reset}`);
  }

  if (!smtpUser || !smtpPassword) {
    console.log(`${colors.yellow}2. Configure Brevo SMTP credentials:${colors.reset}`);
    console.log('   - Sign up at https://www.brevo.com/');
    console.log('   - Go to Settings → SMTP & API');
    console.log('   - Get your SMTP credentials');
    console.log('   - Add to .env file');
  }

  if (!fromAddress || fromAddress === 'noreply@yourdomain.com') {
    console.log(`${colors.yellow}3. Update EMAIL_FROM_ADDRESS with verified email${colors.reset}`);
    console.log('   - Use email verified in Brevo dashboard');
  }

  console.log(`\n${colors.blue}For detailed setup instructions:${colors.reset}`);
  console.log('   See: docs/EMAIL_FEATURES_SETUP.md');
} else {
  console.log(`\n${colors.green}✅ All configuration checks passed!${colors.reset}\n`);
  console.log(`${colors.blue}Next steps:${colors.reset}`);
  console.log('   1. Run tests: npm run test:send-emails');
  console.log('   2. Check bergin.oleg@gmail.com for emails');
  console.log('   3. Verify emails display correctly');
}

console.log('');
