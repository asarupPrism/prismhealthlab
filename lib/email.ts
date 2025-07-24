// Email service utilities for Prism Health Lab
// This module handles all email communications including appointment confirmations,
// reminders, and results notifications

interface EmailTemplate {
  subject: string
  htmlContent: string
  textContent: string
}

interface AppointmentEmailData {
  customerName: string
  customerEmail: string
  appointmentDate: string
  appointmentTime: string
  locationName: string
  locationAddress: string
  orderNumber: string
  testNames: string[]
  preparationInstructions?: string[]
}

// Email service configuration
const EMAIL_CONFIG = {
  provider: 'resend', // As mentioned in CLAUDE.md
  fromEmail: process.env.FROM_EMAIL || 'noreply@prismhealthlab.com',
  fromName: 'Prism Health Lab',
  apiKey: process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY
}

/**
 * Send appointment confirmation email
 */
export async function sendAppointmentConfirmation(data: AppointmentEmailData): Promise<boolean> {
  try {
    const template = generateAppointmentConfirmationTemplate(data)
    
    return await sendEmail({
      to: data.customerEmail,
      subject: template.subject,
      html: template.htmlContent,
      text: template.textContent
    })
  } catch (error) {
    console.error('Error sending appointment confirmation:', error)
    return false
  }
}

/**
 * Send appointment reminder email
 */
export async function sendAppointmentReminder(
  data: AppointmentEmailData,
  reminderType: '24h' | '1h' = '24h'
): Promise<boolean> {
  try {
    const template = generateAppointmentReminderTemplate(data, reminderType)
    
    return await sendEmail({
      to: data.customerEmail,
      subject: template.subject,
      html: template.htmlContent,
      text: template.textContent
    })
  } catch (error) {
    console.error('Error sending appointment reminder:', error)
    return false
  }
}

/**
 * Send results available notification
 */
export async function sendResultsAvailableNotification(data: {
  customerName: string
  customerEmail: string
  testNames: string[]
  resultsUrl: string
}): Promise<boolean> {
  try {
    const template = generateResultsAvailableTemplate(data)
    
    return await sendEmail({
      to: data.customerEmail,
      subject: template.subject,
      html: template.htmlContent,
      text: template.textContent
    })
  } catch (error) {
    console.error('Error sending results notification:', error)
    return false
  }
}

/**
 * Core email sending function
 */
async function sendEmail(params: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<boolean> {
  const { to, subject, html, text } = params

  // Validate email configuration
  if (!EMAIL_CONFIG.apiKey) {
    console.error('Email API key not configured')
    return false
  }

  try {
    // Using Resend API (can be swapped for other providers)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EMAIL_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
        to: [to],
        subject,
        html,
        text,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Email API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const result = await response.json()
    console.log('Email sent successfully:', { id: result.id, to, subject })
    return true

  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

/**
 * Generate appointment confirmation email template
 */
function generateAppointmentConfirmationTemplate(data: AppointmentEmailData): EmailTemplate {
  const appointmentDateTime = new Date(`${data.appointmentDate} ${data.appointmentTime}`)
  const formattedDate = appointmentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const formattedTime = appointmentDateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const subject = `Appointment Confirmed - ${formattedDate} at ${formattedTime}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Confirmation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .appointment-card { background: #f1f5f9; border-left: 4px solid #06b6d4; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #475569; }
        .value { color: #1e293b; }
        .tests-list { background: #f8fafc; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .tests-list h4 { margin: 0 0 10px; color: #475569; }
        .test-item { margin: 5px 0; color: #64748b; }
        .preparation { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; padding: 15px; margin: 20px 0; }
        .preparation h4 { margin: 0 0 10px; color: #92400e; }
        .preparation ul { margin: 10px 0; padding-left: 20px; }
        .preparation li { margin: 5px 0; color: #92400e; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
        .support-info { margin: 20px 0; }
        .support-info p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Appointment Confirmed</h1>
          <p>Your blood draw appointment has been scheduled</p>
        </div>
        
        <div class="content">
          <p>Hello ${data.customerName},</p>
          
          <p>Thank you for choosing Prism Health Lab. Your appointment has been confirmed with the following details:</p>
          
          <div class="appointment-card">
            <div class="detail-row">
              <span class="label">Date & Time:</span>
              <span class="value">${formattedDate} at ${formattedTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">${data.locationName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Address:</span>
              <span class="value">${data.locationAddress}</span>
            </div>
            <div class="detail-row">
              <span class="label">Order Number:</span>
              <span class="value">#${data.orderNumber}</span>
            </div>
          </div>
          
          <div class="tests-list">
            <h4>Tests Included:</h4>
            ${data.testNames.map(test => `<div class="test-item">• ${test}</div>`).join('')}
          </div>
          
          <div class="preparation">
            <h4>⚠️ Important Preparation Instructions</h4>
            <ul>
              <li>Do not eat or drink anything except water for 8-12 hours before your appointment</li>
              <li>Please arrive 15 minutes early to complete any necessary paperwork</li>
              <li>Bring a valid photo ID for verification</li>
              <li>Wear clothing that allows easy access to your arm</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/appointments" class="cta-button">
              View Appointment Details
            </a>
          </div>
          
          <div class="support-info">
            <h4>Need to make changes?</h4>
            <p>If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.</p>
            <p><strong>Phone:</strong> (555) 123-4567</p>
            <p><strong>Email:</strong> support@prismhealthlab.com</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Prism Health Lab</strong></p>
          <p>Advanced diagnostic testing for better health outcomes</p>
          <p>This email was sent regarding your recent order. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
    APPOINTMENT CONFIRMED - Prism Health Lab
    
    Hello ${data.customerName},
    
    Your appointment has been confirmed with the following details:
    
    Date & Time: ${formattedDate} at ${formattedTime}
    Location: ${data.locationName}
    Address: ${data.locationAddress}
    Order Number: #${data.orderNumber}
    
    Tests Included:
    ${data.testNames.map(test => `• ${test}`).join('\n')}
    
    IMPORTANT PREPARATION INSTRUCTIONS:
    • Do not eat or drink anything except water for 8-12 hours before your appointment
    • Please arrive 15 minutes early to complete any necessary paperwork  
    • Bring a valid photo ID for verification
    • Wear clothing that allows easy access to your arm
    
    Need to make changes?
    If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.
    
    Phone: (555) 123-4567
    Email: support@prismhealthlab.com
    
    View your appointment details: ${process.env.NEXT_PUBLIC_APP_URL}/portal/appointments
    
    ---
    Prism Health Lab
    Advanced diagnostic testing for better health outcomes
  `

  return { subject, htmlContent, textContent }
}

/**
 * Generate appointment reminder email template
 */
function generateAppointmentReminderTemplate(
  data: AppointmentEmailData,
  reminderType: '24h' | '1h'
): EmailTemplate {
  const timeframe = reminderType === '24h' ? '24 hours' : '1 hour'
  const urgency = reminderType === '1h' ? '🚨 ' : '⏰ '
  
  const subject = `${urgency}Appointment Reminder - ${data.appointmentTime} ${reminderType === '1h' ? 'TODAY' : 'Tomorrow'}`

  const htmlContent = `
    <!-- Similar HTML structure but focused on reminder content -->
    <!-- This would be implemented similar to confirmation template -->
  `

  const textContent = `
    ${urgency}APPOINTMENT REMINDER - ${timeframe}
    
    Hello ${data.customerName},
    
    This is a reminder that you have an appointment scheduled ${reminderType === '24h' ? 'tomorrow' : 'in 1 hour'}:
    
    Date & Time: ${data.appointmentDate} at ${data.appointmentTime}
    Location: ${data.locationName}
    
    Please remember:
    • No food or drink except water for 8-12 hours before
    • Arrive 15 minutes early
    • Bring valid photo ID
    
    Contact us: (555) 123-4567
  `

  return { subject, htmlContent, textContent }
}

/**
 * Generate results available notification template
 */
function generateResultsAvailableTemplate(data: {
  customerName: string
  customerEmail: string
  testNames: string[]
  resultsUrl: string
}): EmailTemplate {
  const subject = '📋 Your Test Results Are Ready - Prism Health Lab'

  const htmlContent = `
    <!-- Results notification HTML template -->
    <!-- This would be implemented similar to confirmation template -->
  `

  const textContent = `
    YOUR TEST RESULTS ARE READY
    
    Hello ${data.customerName},
    
    Your test results are now available in your secure patient portal.
    
    Tests completed:
    ${data.testNames.map(test => `• ${test}`).join('\n')}
    
    View your results securely: ${data.resultsUrl}
    
    If you have questions about your results, please contact your healthcare provider or our support team.
    
    Prism Health Lab
    Phone: (555) 123-4567
  `

  return { subject, htmlContent, textContent }
}