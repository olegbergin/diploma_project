# Email Tests

This directory contains comprehensive tests for the email notification system.

## 🚀 Quick Start - Send Test Emails Now!

The fastest way to test all emails to **bergin.oleg@gmail.com**:

```bash
cd backend
npm run test:send-emails
```

This will send **10 test emails** in sequence and show you the results.

---

## 📁 Test Files

| File | Type | Purpose |
|------|------|---------|
| `sendTestEmails.js` | Manual Script | Send all email types to bergin.oleg@gmail.com |
| `emailService.test.js` | Jest Unit Tests | Test EmailService functions |
| `emailIntegration.test.js` | Jest Integration | Test emails through API endpoints |
| `EMAIL_TESTING_GUIDE.md` | Documentation | Complete testing guide |

---

## 🎯 Available Test Commands

### 1. Send All Test Emails (Manual)
```bash
npm run test:send-emails
```
✅ Best for: Quick visual verification
✅ Sends to: bergin.oleg@gmail.com
✅ Emails sent: 10

### 2. Run Email Service Tests (Jest)
```bash
npm run test:email
```
✅ Best for: Automated testing
✅ Tests: EmailService functions
✅ Coverage: Unit tests

### 3. Run Integration Tests (Jest)
```bash
npm run test:email-integration
```
✅ Best for: End-to-end testing
✅ Tests: API endpoints with emails
✅ Coverage: Full integration

### 4. Run All Tests
```bash
npm test
```
✅ Runs all Jest tests including email tests

---

## 📧 Email Types Tested

All tests send the following email types:

1. **Booking Confirmation** - Customer receives after booking
2. **Business Notification** - Business owner receives for new booking
3. **Status Change** - Customer receives when appointment status changes
4. **Cancellation** - Customer receives when appointment is cancelled
5. **Reschedule** - Customer receives when appointment time changes
6. **Reminder** - Customer receives 24 hours before appointment
7. **Welcome User** - New user receives after registration
8. **Welcome Business** - New business receives after registration
9. **Moderation Approved** - Business receives when approved
10. **Moderation Rejected** - Business receives when rejected

---

## ✅ Prerequisites

Before running tests, ensure:

1. **SMTP Configured** - Check `.env` file:
   ```env
   EMAIL_ENABLED=true
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASSWORD=your_smtp_key
   ```

2. **Server Can Connect** - Start server and check for:
   ```
   ✅ Email service initialized with Brevo SMTP
   ```

3. **Sender Verified** - Verify your sender email in Brevo dashboard

---

## 📊 Expected Results

### Manual Script (sendTestEmails.js)

```
=============================================================
📧 Email Testing Script
=============================================================
ℹ️  Target email: bergin.oleg@gmail.com
ℹ️  Email service enabled: true

📧 Test 1: Booking Confirmation Email
✅ Booking confirmation sent! Message ID: <xxxxx>

📧 Test 2: Business Notification Email
✅ Business notification sent! Message ID: <xxxxx>

[... 8 more tests ...]

=============================================================
📊 Test Results Summary
=============================================================
Total emails attempted: 10
✅ Successful: 10
Success rate: 100.0%
```

### Jest Tests

```
PASS  tests/emailService.test.js
  Email Service Tests
    Service Configuration
      ✓ should initialize email service (5ms)
      ✓ should check if email service is enabled (2ms)
    Booking Confirmation Email
      ✓ should send booking confirmation email (2453ms)
    [... 7 more tests ...]

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Time:        25.432s
```

---

## 🔍 Checking Results

### 1. Check Email Inbox

Log in to **bergin.oleg@gmail.com** and look for:

- ✉️ 10 new emails (if running manual script)
- ✉️ All emails in Hebrew
- ✉️ Proper formatting with colors
- ✉️ All placeholders filled with test data

### 2. Check Spam Folder

If emails are missing, check the spam folder.

### 3. Check Brevo Dashboard

1. Go to [https://app.brevo.com/](https://app.brevo.com/)
2. Navigate to **Campaigns** → **Transactional**
3. Check delivery status

### 4. Check Console Output

Look for success messages in the terminal:
```
✅ Booking confirmation sent! Message ID: <xxxxx>
✅ Business notification sent! Message ID: <xxxxx>
```

---

## 🐛 Troubleshooting

### Problem: "Email service is disabled"

**Solution:**
```bash
# Check .env
grep EMAIL_ENABLED backend/.env

# Should show:
EMAIL_ENABLED=true
```

### Problem: Tests fail with authentication error

**Solution:**
1. Verify SMTP credentials in `.env`
2. Generate new SMTP key in Brevo
3. Restart server

### Problem: Emails not arriving

**Checklist:**
- [ ] Check spam folder
- [ ] Verify sender email in Brevo
- [ ] Check Brevo dashboard for errors
- [ ] Verify daily limit (300/day free plan)
- [ ] Check server logs for errors

---

## 📚 Full Documentation

For complete testing guide, see:
- [EMAIL_TESTING_GUIDE.md](./EMAIL_TESTING_GUIDE.md)

For setup instructions, see:
- [../docs/EMAIL_FEATURES_SETUP.md](../../docs/EMAIL_FEATURES_SETUP.md)

---

## 🎨 Test Data

All tests use realistic data:

- **Customer:** Oleg Bergin
- **Email:** bergin.oleg@gmail.com
- **Business:** מספרת מירי - Test Salon
- **Service:** תספורת נשים (Women's Haircut)
- **Price:** ₪150
- **Date:** 25/12/2025
- **Time:** 10:00

---

## 💡 Tips

1. **Run manual script first** - Quickest way to verify setup
2. **Check spam folder** - First-time emails may go to spam
3. **Wait a few seconds** - Emails take time to arrive
4. **Check Brevo limits** - Free plan has 300 emails/day
5. **Use unique data** - For testing duplicates and edge cases

---

## 🔄 Continuous Integration

To run in CI/CD:

```yaml
- name: Test Email Service
  run: npm run test:email
  env:
    EMAIL_ENABLED: true
    SMTP_USER: ${{ secrets.SMTP_USER }}
    SMTP_PASSWORD: ${{ secrets.SMTP_PASSWORD }}
```

---

## 📞 Support

If you encounter issues:

1. Read [EMAIL_TESTING_GUIDE.md](./EMAIL_TESTING_GUIDE.md)
2. Check server logs
3. Verify Brevo dashboard
4. Review `.env` configuration
5. Test with manual script first
