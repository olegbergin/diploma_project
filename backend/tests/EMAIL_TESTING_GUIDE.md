# Email Testing Guide

Complete guide for testing email functionality in the booking platform.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Test Types](#test-types)
4. [Running Tests](#running-tests)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Configure SMTP Settings

Before running any tests, you must configure Brevo SMTP in your `.env` file:

```env
# Required SMTP Configuration
EMAIL_ENABLED=true
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_brevo_smtp_key
EMAIL_FROM_NAME=Booking Platform
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

See [../docs/EMAIL_FEATURES_SETUP.md](../../docs/EMAIL_FEATURES_SETUP.md) for detailed setup instructions.

### 2. Verify Email Service is Running

When you start the server, you should see:
```
✅ Email service initialized with Brevo SMTP
✅ Reminder service started
```

---

## Quick Start

### Option 1: Send All Test Emails (RECOMMENDED)

The fastest way to test all email types:

```bash
cd backend
node tests/sendTestEmails.js
```

This will send **10 different email types** to **bergin.oleg@gmail.com**:
1. ✅ Booking confirmation
2. ✅ Business notification
3. ✅ Status change
4. ✅ Cancellation
5. ✅ Reschedule
6. ✅ Reminder
7. ✅ Welcome user
8. ✅ Welcome business
9. ✅ Moderation approved
10. ✅ Moderation rejected

**Expected output:**
```
=============================================================
📧 Email Testing Script
=============================================================
ℹ️  Target email: bergin.oleg@gmail.com
ℹ️  Email service enabled: true

📧 Test 1: Booking Confirmation Email
✅ Booking confirmation sent! Message ID: <xxxxx@smtp-relay.brevo.com>

📧 Test 2: Business Notification Email
✅ Business notification sent! Message ID: <xxxxx@smtp-relay.brevo.com>

...

=============================================================
📊 Test Results Summary
=============================================================
Total emails attempted: 10
✅ Successful: 10
Success rate: 100.0%

ℹ️  Check your inbox at: bergin.oleg@gmail.com
```

---

## Test Types

### 1. Manual Testing Script

**File:** `tests/sendTestEmails.js`

**Purpose:** Quick manual testing of all email types

**Usage:**
```bash
node tests/sendTestEmails.js
```

**Features:**
- Sends all 10 email types
- Color-coded console output
- Success/failure tracking
- 2-second delays between emails
- Sends to: bergin.oleg@gmail.com

**When to use:**
- ✅ Initial setup verification
- ✅ After configuration changes
- ✅ Quick visual testing
- ✅ Debugging email templates

---

### 2. Jest Unit Tests

**File:** `tests/emailService.test.js`

**Purpose:** Automated testing of EmailService functions

**Usage:**
```bash
cd backend
npm test emailService.test.js
```

**What it tests:**
- Service initialization
- Each email type function
- Error handling
- Template loading
- SMTP connection

**When to use:**
- ✅ CI/CD pipeline
- ✅ Before deployments
- ✅ After code changes
- ✅ Automated testing

**Example output:**
```
Email Service Tests
  Service Configuration
    ✓ should initialize email service
    ✓ should check if email service is enabled
  Booking Confirmation Email
    ✓ should send booking confirmation email (2453ms)
  Business Notification Email
    ✓ should send business notification email (2124ms)
  ...

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
```

---

### 3. Integration Tests

**File:** `tests/emailIntegration.test.js`

**Purpose:** Test emails through actual API endpoints

**Usage:**
```bash
npm test emailIntegration.test.js
```

**What it tests:**
- POST /api/appointments (booking emails)
- PUT /api/appointments/:id/status (status change)
- PUT /api/appointments/:id (reschedule)
- POST /api/appointments/:id/cancel (cancellation)
- POST /api/auth/register (welcome email)
- POST /api/auth/register-business (business welcome)

**When to use:**
- ✅ End-to-end testing
- ✅ API testing
- ✅ Integration verification
- ✅ Before production deployment

---

## Running Tests

### Run All Tests

```bash
cd backend
npm test
```

### Run Specific Test File

```bash
# Email service tests
npm test emailService.test.js

# Integration tests
npm test emailIntegration.test.js

# All email tests
npm test email
```

### Run Manual Test Script

```bash
node tests/sendTestEmails.js
```

### Run in Watch Mode

```bash
npm test -- --watch
```

### Run with Coverage

```bash
npm test -- --coverage
```

---

## Checking Test Results

### 1. Check Gmail Inbox

Log in to bergin.oleg@gmail.com and check for emails:

**Expected emails:**
- 📧 אישור הזמנה (Booking Confirmation)
- 📧 הזמנה חדשה (New Booking Notification)
- 📧 עדכון סטטוס (Status Change)
- 📧 ביטול הזמנה (Cancellation)
- 📧 שינוי מועד (Reschedule)
- 📧 תזכורת להזמנה (Reminder)
- 📧 ברוכים הבאים (Welcome User)
- 📧 ברוכים הבאים - עסק (Welcome Business)
- 📧 העסק שלך אושר (Business Approved)
- 📧 עדכון לגבי העסק (Business Rejected)

### 2. Check Spam Folder

If emails are missing, check the spam folder.

### 3. Check Brevo Dashboard

1. Go to [https://app.brevo.com/](https://app.brevo.com/)
2. Navigate to **Campaigns** → **Transactional**
3. View email delivery status, opens, and clicks

### 4. Check Server Logs

Look for email-related messages in the console:
```
✅ Email sent successfully: <message-id>
✅ Booking confirmation sent: <message-id>
❌ Email send attempt 1/3 failed: Error message
```

---

## Troubleshooting

### Problem: "Email service is disabled"

**Solution:**
```bash
# Check .env file
cat backend/.env | grep EMAIL_ENABLED

# Should show:
EMAIL_ENABLED=true
```

### Problem: "Authentication failed"

**Causes:**
- Wrong SMTP credentials
- Invalid SMTP key
- Email not verified in Brevo

**Solution:**
1. Verify credentials in Brevo dashboard
2. Generate new SMTP key
3. Update `.env` file
4. Restart server

### Problem: Emails not arriving

**Checks:**
1. ✅ Check spam folder
2. ✅ Verify sender email in Brevo
3. ✅ Check Brevo dashboard for errors
4. ✅ Check server logs
5. ✅ Verify daily limit (300 emails/day on free plan)

**Commands:**
```bash
# Check if email service is enabled
node -e "console.log(require('./services/emailService').isEnabled())"

# Check SMTP config
cat backend/.env | grep SMTP

# Test simple email
node tests/sendTestEmails.js
```

### Problem: Tests timeout

**Solution:**
```bash
# Increase timeout in test file
test('test name', async () => {
  // test code
}, 30000); // 30 seconds
```

### Problem: "Template not found"

**Cause:** Email template files missing

**Solution:**
```bash
# Check templates exist
ls backend/templates/emails/

# Should show:
booking-confirmation.html
business-notification.html
cancellation.html
moderation-approved.html
moderation-rejected.html
reminder.html
reschedule.html
status-change.html
welcome-business.html
welcome-user.html
```

---

## Testing Checklist

Before considering email functionality complete:

- [ ] SMTP configured in `.env`
- [ ] Server starts without errors
- [ ] Manual test script runs successfully
- [ ] All 10 emails received in bergin.oleg@gmail.com
- [ ] Emails display correctly (no broken formatting)
- [ ] Emails not in spam folder
- [ ] Jest tests pass
- [ ] Integration tests pass
- [ ] Brevo dashboard shows successful deliveries
- [ ] Email content is in Hebrew and displays correctly
- [ ] All placeholders replaced with actual data

---

## Advanced Testing

### Test Email Templates Individually

```javascript
const emailService = require('./services/emailService');

// Test specific template
emailService.sendBookingConfirmation({
  customerEmail: 'bergin.oleg@gmail.com',
  customerName: 'Oleg Bergin',
  businessName: 'Test Salon',
  serviceName: 'Haircut',
  appointmentDate: '2025-12-25',
  appointmentTime: '10:00',
  price: 150,
  businessPhone: '054-1234567',
  businessAddress: 'Tel Aviv',
  notes: 'Test'
}).then(result => {
  console.log('Result:', result);
});
```

### Test Reminder Service

```javascript
const reminderService = require('./services/reminderService');

// Send reminder for specific appointment
reminderService.sendSingleReminder(appointmentId)
  .then(result => console.log('Reminder sent:', result));

// Check reminder service status
console.log(reminderService.getStatus());
```

### Test with Different Data

Modify `sendTestEmails.js` to test:
- Long names
- Special characters
- Missing optional fields
- Edge cases

---

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Test Email Service
  run: npm test emailService.test.js
  env:
    EMAIL_ENABLED: true
    SMTP_HOST: ${{ secrets.SMTP_HOST }}
    SMTP_USER: ${{ secrets.SMTP_USER }}
    SMTP_PASSWORD: ${{ secrets.SMTP_PASSWORD }}
```

---

## Support

For issues:
1. Check server logs
2. Review Brevo dashboard
3. Verify `.env` configuration
4. Run manual test script
5. Check [EMAIL_FEATURES_SETUP.md](../../docs/EMAIL_FEATURES_SETUP.md)
