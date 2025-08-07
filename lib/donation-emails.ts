import { sendEmail, getAdminEmails } from './email-service';
import { Donation } from '@prisma/client';

interface DonationEmailData {
  donation: Partial<Donation>;
  receiptNumber: string;
  receiptUrl?: string;
}

/**
 * Send donation receipt to donor
 */
export async function sendDonationReceipt(data: DonationEmailData) {
  const { donation, receiptNumber, receiptUrl } = data;
  
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: donation.currency || 'USD',
  }).format(Number(donation.amount));

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(donation.createdAt || new Date());

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Donation Receipt - Divine Jesus Church</title>
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
          .receipt-container {
            background-color: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 30px;
            margin-bottom: 30px;
          }
          .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 36px;
            margin-bottom: 20px;
          }
          h1 {
            color: #1e293b;
            font-size: 28px;
            margin: 0 0 10px 0;
          }
          .receipt-label {
            color: #64748b;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .receipt-number {
            font-family: 'Courier New', monospace;
            font-size: 16px;
            color: #3b82f6;
            font-weight: bold;
            margin-top: 5px;
          }
          .thank-you {
            background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
          }
          .thank-you h2 {
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .details {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 25px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            color: #64748b;
            font-weight: 500;
          }
          .detail-value {
            color: #1e293b;
            font-weight: 600;
            text-align: right;
          }
          .amount-row {
            background-color: #3b82f6;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin-top: 15px;
          }
          .amount-row .detail-label,
          .amount-row .detail-value {
            color: white;
            font-size: 18px;
          }
          .tax-notice {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .tax-notice-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 5px;
          }
          .tax-notice-text {
            color: #78350f;
            font-size: 14px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 14px;
          }
          .contact-info {
            margin: 20px 0;
          }
          .contact-info p {
            margin: 5px 0;
          }
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 20px;
          }
          .recurring-notice {
            background-color: #dbeafe;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .recurring-notice-title {
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 5px;
          }
          .recurring-notice-text {
            color: #1e3a8a;
            font-size: 14px;
          }
          @media print {
            body {
              background-color: white;
            }
            .receipt-container {
              box-shadow: none;
            }
            .button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="logo">✝</div>
            <h1>Divine Jesus Church</h1>
            <div class="receipt-label">Official Donation Receipt</div>
            <div class="receipt-number">${receiptNumber}</div>
          </div>
          
          <div class="thank-you">
            <h2>Thank You for Your Generosity!</h2>
            <p>Your donation makes a difference in our community and beyond.</p>
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Donor Name:</span>
              <span class="detail-value">${donation.firstName} ${donation.lastName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${donation.email}</span>
            </div>
            ${donation.phone ? `
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${donation.phone}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value" style="font-family: monospace; font-size: 12px;">${donation.transactionId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Donation Category:</span>
              <span class="detail-value">${formatCategory(donation.category || '')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${formatPaymentMethod(donation.paymentMethod)}</span>
            </div>
            
            <div class="amount-row detail-row">
              <span class="detail-label">Donation Amount:</span>
              <span class="detail-value">${formattedAmount}</span>
            </div>
          </div>
          
          ${donation.isRecurring ? `
          <div class="recurring-notice">
            <div class="recurring-notice-title">🔄 Recurring Donation</div>
            <div class="recurring-notice-text">
              This is a ${donation.recurringFrequency?.toLowerCase()} recurring donation. 
              You will be automatically charged ${formattedAmount} every ${donation.recurringFrequency?.toLowerCase()}.
              You can manage or cancel your recurring donation at any time by contacting us.
            </div>
          </div>
          ` : ''}
          
          ${donation.message ? `
          <div class="details">
            <div class="detail-row">
              <div>
                <div class="detail-label" style="margin-bottom: 10px;">Special Instructions / Prayer Request:</div>
                <div style="color: #475569; font-style: italic;">${donation.message}</div>
              </div>
            </div>
          </div>
          ` : ''}
          
          <div class="tax-notice">
            <div class="tax-notice-title">📋 Tax Deductible Donation</div>
            <div class="tax-notice-text">
              Divine Jesus Church is a registered 501(c)(3) non-profit organization. 
              Your donation is tax-deductible to the extent allowed by law. 
              Please keep this receipt for your tax records.
              <br><br>
              EIN: XX-XXXXXXX (Replace with actual EIN)
            </div>
          </div>
          
          ${receiptUrl ? `
          <div style="text-align: center;">
            <a href="${receiptUrl}" class="button">Download PDF Receipt</a>
          </div>
          ` : ''}
          
          <div class="footer">
            <div class="contact-info">
              <p><strong>Divine Jesus Church</strong></p>
              <p>📧 donations@divinejesus.org</p>
              <p>📞 (555) 123-4567</p>
              <p>📍 123 Faith Street, City, State 12345</p>
              <p>🌐 www.divinejesus.org</p>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">
              "Each of you should give what you have decided in your heart to give, 
              not reluctantly or under compulsion, for God loves a cheerful giver."
              <br>
              — 2 Corinthians 9:7
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Divine Jesus Church - Official Donation Receipt

Receipt Number: ${receiptNumber}
Date: ${formattedDate}

Dear ${donation.firstName} ${donation.lastName},

Thank you for your generous donation of ${formattedAmount} to Divine Jesus Church.

Donation Details:
- Transaction ID: ${donation.transactionId}
- Category: ${formatCategory(donation.category || '')}
- Payment Method: ${formatPaymentMethod(donation.paymentMethod)}
${donation.isRecurring ? `- Recurring: ${donation.recurringFrequency} payments` : ''}

This receipt confirms that Divine Jesus Church has received your donation. 
As a registered 501(c)(3) non-profit organization, your donation is tax-deductible 
to the extent allowed by law.

Please keep this receipt for your tax records.
EIN: XX-XXXXXXX (Replace with actual EIN)

If you have any questions about your donation, please contact us:
Email: donations@divinejesus.org
Phone: (555) 123-4567

Thank you for your support!

Divine Jesus Church
www.divinejesus.org
  `;

  return sendEmail({
    to: donation.email!,
    subject: `Donation Receipt - ${receiptNumber}`,
    html,
    text,
    from: process.env.EMAIL_FROM || 'Divine Jesus Church <donations@divinejesus.org>',
    replyTo: process.env.DONATIONS_EMAIL || 'donations@divinejesus.org',
  });
}

/**
 * Send notification to admins about new donation
 */
export async function sendDonationNotification(donation: Partial<Donation>) {
  const adminEmails = await getAdminEmails();
  
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: donation.currency || 'USD',
  }).format(Number(donation.amount));

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Donation Received</title>
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
            background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 20px -30px;
          }
          h1 {
            margin: 0;
            font-size: 24px;
          }
          .amount {
            font-size: 36px;
            font-weight: bold;
            color: #10b981;
            text-align: center;
            margin: 20px 0;
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
          .recurring-badge {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
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
            <h1>💰 New Donation Received!</h1>
          </div>
          
          <div class="amount">${formattedAmount}</div>
          
          ${donation.isRecurring ? '<div style="text-align: center; margin-bottom: 20px;"><span class="recurring-badge">🔄 Recurring Donation</span></div>' : ''}
          
          <div class="info-grid">
            <div class="info-item">
              <div class="label">Donor:</div>
              <div class="value">${donation.firstName} ${donation.lastName}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${donation.email}">${donation.email}</a></div>
            </div>
            
            ${donation.phone ? `
            <div class="info-item">
              <div class="label">Phone:</div>
              <div class="value">${donation.phone}</div>
            </div>
            ` : ''}
            
            <div class="info-item">
              <div class="label">Category:</div>
              <div class="value">${formatCategory(donation.category || '')}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Payment Method:</div>
              <div class="value">${formatPaymentMethod(donation.paymentMethod)}</div>
            </div>
            
            ${donation.isRecurring ? `
            <div class="info-item">
              <div class="label">Recurring Frequency:</div>
              <div class="value">${donation.recurringFrequency}</div>
            </div>
            ` : ''}
            
            <div class="info-item">
              <div class="label">Transaction ID:</div>
              <div class="value" style="font-family: monospace; font-size: 12px;">${donation.transactionId}</div>
            </div>
            
            ${donation.message ? `
            <div class="info-item">
              <div class="label">Message/Prayer Request:</div>
              <div class="value" style="font-style: italic;">${donation.message}</div>
            </div>
            ` : ''}
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/donations" class="action-button">
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
      subject: `New Donation: ${formattedAmount} from ${donation.firstName} ${donation.lastName}`,
      html,
      from: process.env.EMAIL_FROM || 'Divine Jesus Church <notifications@divinejesus.org>',
    })
  );
  
  const results = await Promise.allSettled(emailPromises);
  const successCount = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
  
  return { success: successCount > 0 };
}

// Helper functions
function formatCategory(category: string): string {
  const categories: Record<string, string> = {
    tithes: 'Tithes & Offerings',
    missions: 'Mission Fund',
    building: 'Building Fund',
    youth: 'Youth Ministry',
    education: 'Christian Education',
    other: 'General Fund'
  };
  return categories[category] || category;
}

function formatPaymentMethod(method: any): string {
  if (!method) return 'Unknown';
  
  const methods: Record<string, string> = {
    CREDIT_CARD: 'Credit Card',
    DEBIT_CARD: 'Debit Card',
    BANK_TRANSFER: 'Bank Transfer',
    GCASH: 'GCash',
    PAYPAL: 'PayPal',
    card: 'Credit/Debit Card',
    gcash: 'GCash',
    bank: 'Bank Transfer'
  };
  
  return methods[method] || method;
}
