# Appointment Reminder System

This document explains how to set up and use the automated appointment reminder system for Prism Health Lab.

## Overview

The appointment reminder system automatically sends email reminders to patients:
- **24-hour reminder**: Sent 24 hours before the appointment
- **1-hour reminder**: Sent 1 hour before the appointment

## Setup

### Environment Variables

Add these environment variables to your `.env.local`:

```bash
# Email configuration (using Resend)
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@prismhealthlab.com

# Cron job authorization
CRON_SECRET=your_secure_cron_secret_here

# App URL for email links
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Database Schema Updates

Add these columns to the `appointments` table:

```sql
-- Add reminder tracking fields
ALTER TABLE appointments 
ADD COLUMN confirmation_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN confirmation_email_sent_at TIMESTAMP,
ADD COLUMN reminder_24h_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN reminder_24h_sent_at TIMESTAMP,
ADD COLUMN reminder_1h_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN reminder_1h_sent_at TIMESTAMP;
```

## API Endpoints

### Send Reminders (Cron Job)

```bash
# Send 24-hour reminders
POST /api/appointments/reminders
Authorization: Bearer your_cron_secret
Content-Type: application/json

{
  "reminder_type": "24h"
}

# Send 1-hour reminders
POST /api/appointments/reminders
Authorization: Bearer your_cron_secret
Content-Type: application/json

{
  "reminder_type": "1h"
}
```

### Get Reminder Statistics

```bash
GET /api/appointments/reminders
```

Returns statistics about upcoming appointments and reminder status.

### Manual Confirmation Email

```bash
# Send confirmation email for specific appointment
POST /api/appointments/{appointment_id}/send-confirmation
```

## Cron Job Setup

### Using Vercel Cron Jobs

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/appointments/reminders",
      "schedule": "0 */1 * * *"
    }
  ]
}
```

Then create a handler that calls both reminder types:

```typescript
// pages/api/cron/appointment-reminders.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret
  const { authorization } = req.headers;
  if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Send 24-hour reminders
    const response24h = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/appointments/reminders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reminder_type: '24h' }),
    });

    // Send 1-hour reminders
    const response1h = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/appointments/reminders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reminder_type: '1h' }),
    });

    const results24h = await response24h.json();
    const results1h = await response1h.json();

    res.status(200).json({
      success: true,
      reminder_24h: results24h,
      reminder_1h: results1h,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Using External Cron Services

You can use services like:
- **Cron-job.org**: Free web-based cron service
- **EasyCron**: Professional cron service
- **GitHub Actions**: Use scheduled workflows

Example GitHub Action (`.github/workflows/appointment-reminders.yml`):

```yaml
name: Send Appointment Reminders

on:
  schedule:
    # Run every hour
    - cron: '0 * * * *'

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Send 24h reminders
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/appointments/reminders" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{"reminder_type": "24h"}'

      - name: Send 1h reminders
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/appointments/reminders" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{"reminder_type": "1h"}'
```

## Email Templates

The system uses professional HTML email templates with:
- Responsive design for mobile devices
- Medical-grade styling consistent with the app
- Clear appointment details and preparation instructions
- Links back to the patient portal

### Customizing Templates

Edit the email templates in `/lib/email.ts`:
- `generateAppointmentConfirmationTemplate()` - Confirmation emails
- `generateAppointmentReminderTemplate()` - Reminder emails
- `generateResultsAvailableTemplate()` - Results notifications

## Monitoring

### Logs

All reminder activities are logged to the console with details:
- Appointments processed
- Emails sent successfully
- Failed email attempts with reasons

### Health Check

Monitor the reminder system health:

```bash
# Check upcoming appointments and reminder status
GET /api/appointments/reminders

# Response includes:
{
  "statistics": {
    "total_upcoming": 15,
    "needs_24h_reminder": 8,
    "needs_1h_reminder": 3,
    "reminders_sent_24h": 7,
    "reminders_sent_1h": 2
  }
}
```

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check `RESEND_API_KEY` is set correctly
   - Verify domain is configured in Resend dashboard
   - Check email service logs

2. **Cron jobs not running**
   - Verify `CRON_SECRET` matches in environment and cron service
   - Check cron service is hitting the correct endpoint
   - Review cron service logs

3. **Duplicate reminders**
   - Check database tracking fields are updating correctly
   - Ensure cron jobs aren't running more frequently than intended

### Testing

Test the reminder system manually:

```bash
# Test 24-hour reminders
curl -X POST "http://localhost:3000/api/appointments/reminders" \
  -H "Authorization: Bearer your_cron_secret" \
  -H "Content-Type: application/json" \
  -d '{"reminder_type": "24h"}'

# Test 1-hour reminders  
curl -X POST "http://localhost:3000/api/appointments/reminders" \
  -H "Authorization: Bearer your_cron_secret" \
  -H "Content-Type: application/json" \
  -d '{"reminder_type": "1h"}'
```

## Security Considerations

- Always use HTTPS for production endpoints
- Keep `CRON_SECRET` secure and rotate regularly
- Monitor for unusual activity in reminder logs
- Consider rate limiting for the reminder endpoints
- Validate all appointment data before sending emails