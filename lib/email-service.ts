import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SendReplyEmailParams {
  to: string;
  subject: string;
  message: string;
  originalMessage: {
    firstName: string;
    lastName: string;
    subject: string;
    message: string;
    createdAt: Date;
  };
  senderName?: string;
  senderEmail?: string;
  siteSettings?: {
    siteName?: string;
    logoUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
  };
}

/**
 * Send a generic email
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = process.env.EMAIL_FROM || 'Divine Jesus Church <noreply@divinejesus.org>',
  replyTo = process.env.EMAIL_REPLY_TO || 'info@divinejesus.org',
}: SendEmailParams) {
  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      reply_to: replyTo,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

/**
 * Send a reply to a contact form message
 */
export async function sendReplyEmail({
  to,
  subject,
  message,
  originalMessage,
  senderName = 'Divine Jesus Church Team',
  senderEmail = process.env.EMAIL_REPLY_TO || 'info@divinejesus.org',
  siteSettings,
}: SendReplyEmailParams) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(originalMessage.createdAt);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .email-container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            display: inline-block;
            vertical-align: middle;
          }
          .logo-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            vertical-align: middle;
            margin-right: 15px;
          }
          .logo-img {
            width: 50px;
            height: 50px;
            object-fit: contain;
            border-radius: 8px;
            vertical-align: middle;
            margin-right: 15px;
            display: inline-block;
          }
          h1 {
            color: #1e293b;
            font-size: 24px;
            margin: 0;
            line-height: 50px;
            display: inline-block;
            vertical-align: middle;
          }
          .greeting {
            font-size: 18px;
            color: #475569;
            margin-bottom: 20px;
          }
          .message-content {
            background-color: #f8fafc;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .original-message {
            background-color: #f1f5f9;
            border-left: 4px solid #94a3b8;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #64748b;
          }
          .original-message-header {
            font-weight: 600;
            color: #475569;
            margin-bottom: 10px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
          }
          .signature {
            margin-top: 30px;
            font-style: italic;
          }
          .contact-info {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8fafc;
            border-radius: 6px;
          }
          .contact-info p {
            margin: 5px 0;
            font-size: 14px;
          }
          a {
            color: #3b82f6;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">
              ${siteSettings?.logoUrl 
                ? `<img src="${siteSettings.logoUrl}" alt="${siteSettings.siteName || 'Church Logo'}" class="logo-img" />` 
                : '<span class="logo-icon">✝</span>'
              }<h1>${siteSettings?.siteName || 'Divine Jesus Church'}</h1>
            </div>
          </div>
          
          <div class="greeting">
            Dear ${originalMessage.firstName} ${originalMessage.lastName},
          </div>
          
          <div class="message-content">
            ${message.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
          </div>
          
          <div class="signature">
            <p>Blessings,<br>
            <strong>${senderName || siteSettings?.siteName || 'Divine Jesus Church Team'}</strong></p>
          </div>
          
          <div class="original-message">
            <div class="original-message-header">Your Original Message:</div>
            <p><strong>Subject:</strong> ${originalMessage.subject}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Message:</strong><br>${originalMessage.message}</p>
          </div>
          
          <div class="footer">
            <div class="contact-info">
              ${siteSettings?.logoUrl 
                ? `<img src="${siteSettings.logoUrl}" alt="${siteSettings.siteName || 'Church Logo'}" style="width: 40px; height: 40px; object-fit: contain; margin-bottom: 10px;" />` 
                : ''
              }
              <p><strong>${siteSettings?.siteName || 'Divine Jesus Church'}</strong></p>
              ${siteSettings?.contactEmail ? `<p>📧 Email: <a href="mailto:${siteSettings.contactEmail}">${siteSettings.contactEmail}</a></p>` : `<p>📧 Email: <a href="mailto:${senderEmail}">${senderEmail}</a></p>`}
              ${siteSettings?.contactPhone ? `<p>📞 Phone: ${siteSettings.contactPhone}</p>` : ''}
              ${siteSettings?.contactAddress ? `<p>📍 Address: ${siteSettings.contactAddress}</p>` : ''}
              <p>🌐 Website: <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://divinejesus.org'}">${process.env.NEXT_PUBLIC_SITE_URL || 'divinejesus.org'}</a></p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
              This email was sent in response to your inquiry. If you have any further questions, 
              please don't hesitate to reach out to us.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Dear ${originalMessage.firstName} ${originalMessage.lastName},

${message}

Blessings,
${senderName}

---
Your Original Message:
Subject: ${originalMessage.subject}
Date: ${formattedDate}
Message: ${originalMessage.message}

---
Divine Jesus Church
Email: ${senderEmail}
Website: ${process.env.NEXT_PUBLIC_SITE_URL || 'divinejesus.org'}
  `;

  return sendEmail({
    to,
    subject,
    html,
    text,
    from: `${senderName} <${senderEmail}>`,
    replyTo: senderEmail,
  });
}

/**
 * Get admin emails from various sources
 */
export async function getAdminEmails(): Promise<string[]> {
  const emails: string[] = [];
  
  try {
    // First, try to get from database settings
    const { prisma } = await import('@/lib/prisma-client');
    const settings = await prisma.siteSettings.findFirst();
    
    if (settings?.adminEmails && settings.adminEmails.length > 0) {
      emails.push(...settings.adminEmails);
    }
  } catch (error) {
    console.error('Failed to fetch admin emails from database:', error);
  }
  
  // If no emails from database, check environment variables
  if (emails.length === 0) {
    const envEmails = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (envEmails) {
      // Support comma-separated emails in env variable
      const parsedEmails = envEmails.split(',').map(email => email.trim()).filter(Boolean);
      emails.push(...parsedEmails);
    }
  }
  
  // Fallback to default if still no emails
  if (emails.length === 0) {
    const fallbackEmail = process.env.EMAIL_REPLY_TO || 'admin@divinejesus.org';
    emails.push(fallbackEmail);
  }
  
  // Remove duplicates
  return [...new Set(emails)];
}

/**
 * Send a notification email when a new contact form is submitted
 */
export async function sendNewMessageNotification(message: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: Date;
}) {
  const adminEmails = await getAdminEmails();
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 20px -30px;
          }
          h1 {
            margin: 0;
            font-size: 24px;
          }
          .info-grid {
            display: grid;
            gap: 15px;
            margin: 20px 0;
          }
          .info-item {
            padding: 10px;
            background-color: #f8fafc;
            border-radius: 6px;
          }
          .label {
            font-weight: 600;
            color: #475569;
            margin-bottom: 5px;
          }
          .value {
            color: #1e293b;
          }
          .message-box {
            background-color: #f1f5f9;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .action-button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📬 New Contact Form Submission</h1>
          </div>
          
          <p>You have received a new message through the contact form:</p>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="label">From:</div>
              <div class="value">${message.firstName} ${message.lastName}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${message.email}">${message.email}</a></div>
            </div>
            
            ${message.phone ? `
            <div class="info-item">
              <div class="label">Phone:</div>
              <div class="value">${message.phone}</div>
            </div>
            ` : ''}
            
            <div class="info-item">
              <div class="label">Subject:</div>
              <div class="value">${message.subject}</div>
            </div>
          </div>
          
          <div class="message-box">
            <div class="label">Message:</div>
            <p>${message.message}</p>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/messages" class="action-button">
            View in Admin Panel
          </a>
        </div>
      </body>
    </html>
  `;

  // Send to all admin emails
  const emailPromises = adminEmails.map(adminEmail => 
    sendEmail({
      to: adminEmail,
      subject: `New Contact Form: ${message.subject}`,
      html,
      from: process.env.EMAIL_FROM || 'Divine Jesus Church <notifications@divinejesus.org>',
    })
  );
  
  // Send all emails in parallel
  const results = await Promise.allSettled(emailPromises);
  
  // Check if at least one email was sent successfully
  const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failureCount = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
  
  if (successCount > 0) {
    console.log(`Notification sent to ${successCount} admin(s)`);
    if (failureCount > 0) {
      console.warn(`Failed to send to ${failureCount} admin(s)`);
    }
    return { success: true, data: { sent: successCount, failed: failureCount } };
  } else {
    console.error('Failed to send notification to any admin');
    return { success: false, error: 'Failed to send notification emails' };
  }
}
