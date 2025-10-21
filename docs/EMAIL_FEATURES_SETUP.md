# Email Features Setup Guide

This document explains how to configure and use the email notification system in the booking platform.

## Overview

The email system provides the following features:
1. ✅ Booking confirmation emails to customers
2. ✅ New booking notifications to business owners
3. ✅ Appointment status change notifications
4. ✅ Appointment cancellation emails
5. ✅ Appointment reschedule notifications
6. ✅ Reminder emails 24 hours before appointments
7. ✅ Welcome emails for new users
8. ✅ Welcome emails for new businesses
9. ✅ Business moderation result emails (approved/rejected)

## Setup Instructions

### 1. Sign Up for Brevo (Sendinblue)

Brevo provides a free SMTP service for sending transactional emails.

1. Go to [https://www.brevo.com/](https://www.brevo.com/)
2. Create a free account
3. Verify your email address
4. Complete the account setup

### 2. Get SMTP Credentials

1. Log in to your Brevo dashboard
2. Go to **Settings** → **SMTP & API** → **SMTP**
3. You'll find your SMTP credentials:
   - **SMTP Server**: smtp-relay.brevo.com
   - **Port**: 587
   - **Login**: Your Brevo account email
   - **SMTP Key**: Click "Create SMTP Key" if you don't have one

### 3. Verify Sender Email

For emails to be delivered successfully:

1. Go to **Settings** → **Senders & IP**
2. Add your sender email address
3. Verify it by clicking the link sent to that email
4. This email will appear in the "From" field of all emails

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env` in the backend directory:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit the `.env` file and add your Brevo credentials:
   ```env
   # Enable email notifications
   EMAIL_ENABLED=true

   # Brevo SMTP Settings
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your_brevo_email@example.com
   SMTP_PASSWORD=your_brevo_smtp_key

   # Email Sender Information
   EMAIL_FROM_NAME=Booking Platform
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com

   # Admin Email
   ADMIN_EMAIL=admin@yourdomain.com
   ```

3. Configure reminder settings (optional):
   ```env
   # Send reminders 24 hours before appointment
   REMINDER_HOURS_BEFORE=24

   # Run reminder check every day at 9 AM
   REMINDER_CRON_SCHEDULE=0 9 * * *
   ```

### 5. Restart the Server

After configuring the environment variables, restart your backend server:

```bash
cd backend
npm start
```

You should see these messages in the console:
```
✅ Email service initialized with Brevo SMTP
✅ Reminder service started (Schedule: 0 9 * * *)
```

## Email Triggers

### Automatic Triggers

The following emails are sent automatically:

| Event | Emails Sent | Recipients |
|-------|-------------|------------|
| New appointment created | 1. Booking confirmation<br>2. Business notification | 1. Customer<br>2. Business owner |
| Appointment rescheduled | Reschedule notification | Customer |
| Appointment cancelled | Cancellation email | Customer |
| Appointment status changed | Status change email | Customer |
| User registered | Welcome email | New user |
| Business registered | Welcome email | Business owner |
| Daily at 9 AM | Reminder emails | Customers with appointments tomorrow |

### Email Templates

All email templates are located in `backend/templates/emails/` and are fully customizable HTML files:

- `booking-confirmation.html` - Sent to customers after booking
- `business-notification.html` - Sent to business owners for new bookings
- `status-change.html` - Sent when appointment status changes
- `cancellation.html` - Sent when appointment is cancelled
- `reschedule.html` - Sent when appointment is rescheduled
- `reminder.html` - Sent 24 hours before appointment
- `welcome-user.html` - Sent to new users after registration
- `welcome-business.html` - Sent to new businesses after registration
- `moderation-approved.html` - Sent when business is approved
- `moderation-rejected.html` - Sent when business is rejected

### Template Customization

You can customize any template by editing the HTML files. Each template uses placeholders in the format `{{variableName}}`:

Example:
```html
<p>Hello {{customerName}},</p>
<p>Your appointment at {{businessName}} is confirmed for {{appointmentDate}} at {{appointmentTime}}.</p>
```

## Testing Email Functionality

### Test User Registration Email

```bash
curl -X POST http://localhost:3031/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "test123"
  }'
```

### Test Appointment Booking Email

```bash
curl -X POST http://localhost:3031/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": 1,
    "serviceId": 1,
    "date": "2025-12-25",
    "time": "10:00",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890",
    "email": "customer@example.com",
    "notes": "First appointment"
  }'
```

## Troubleshooting

### Emails Not Sending

1. **Check SMTP credentials**
   - Verify `SMTP_USER` and `SMTP_PASSWORD` in `.env`
   - Make sure the SMTP key is active in Brevo

2. **Check sender verification**
   - Verify your sender email in Brevo dashboard
   - Use a verified email in `EMAIL_FROM_ADDRESS`

3. **Check server logs**
   - Look for email-related errors in the console
   - Check if `EMAIL_ENABLED=true` in `.env`

4. **Check Brevo limits**
   - Free plan: 300 emails/day
   - Verify you haven't exceeded daily limit

### Emails Going to Spam

1. **Verify sender domain**
   - Add SPF and DKIM records to your domain
   - Instructions available in Brevo dashboard

2. **Improve email content**
   - Avoid spam trigger words
   - Include unsubscribe link (for marketing emails)

3. **Use a professional sender address**
   - Use a real domain instead of free email providers

## Configuration Options

### Disable Email Notifications

To temporarily disable all emails:
```env
EMAIL_ENABLED=false
```

### Disable Specific Email Types

Edit `backend/config/email.config.js`:
```javascript
features: {
  enabled: true,
  bookingConfirmation: true,
  businessNotification: true,
  statusChange: true,
  cancellation: true,
  reschedule: true,
  reminders: false, // Disable reminders
  registration: true,
  verification: false
}
```

### Change Reminder Schedule

Modify `REMINDER_CRON_SCHEDULE` in `.env`:
```env
# Every day at 8:30 AM
REMINDER_CRON_SCHEDULE=30 8 * * *

# Every 6 hours
REMINDER_CRON_SCHEDULE=0 */6 * * *

# Every Monday at 9 AM
REMINDER_CRON_SCHEDULE=0 9 * * 1
```

### Change Reminder Timing

Modify `REMINDER_HOURS_BEFORE` in `.env`:
```env
# Send reminders 48 hours before
REMINDER_HOURS_BEFORE=48

# Send reminders 12 hours before
REMINDER_HOURS_BEFORE=12
```

## API Integration

### Manual Email Sending (Optional)

You can manually send emails from your code:

```javascript
const emailService = require('./services/emailService');

// Send booking confirmation
await emailService.sendBookingConfirmation({
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  businessName: 'Hair Salon',
  serviceName: 'Haircut',
  appointmentDate: '2025-12-25',
  appointmentTime: '10:00',
  price: 100,
  businessPhone: '123-456-7890',
  businessAddress: '123 Main St',
  notes: 'Please arrive 5 minutes early'
});

// Send reminder for specific appointment
const reminderService = require('./services/reminderService');
await reminderService.sendSingleReminder(appointmentId);
```

## Brevo Free Plan Limits

- ✅ 300 emails per day
- ✅ Unlimited contacts
- ✅ SMTP relay
- ✅ Transactional emails
- ❌ No marketing emails (upgrade required)

For higher volume, consider upgrading to a paid plan.

## Support

For issues or questions:
1. Check the server logs for error messages
2. Review the Brevo dashboard for delivery status
3. Verify all configuration settings in `.env`
4. Test with a simple email first (user registration)

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Rotate SMTP keys regularly** - Generate new keys every 6 months
3. **Use environment-specific configs** - Different keys for dev/staging/production
4. **Monitor email sending** - Set up alerts for failed deliveries
5. **Keep templates updated** - Review and update email content regularly
