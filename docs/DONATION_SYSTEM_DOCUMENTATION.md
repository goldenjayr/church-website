# Divine Jesus Church Donation System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Security Features](#security-features)
3. [Setup Instructions](#setup-instructions)
4. [Payment Methods](#payment-methods)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Testing](#testing)
8. [Production Checklist](#production-checklist)
9. [Troubleshooting](#troubleshooting)
10. [Compliance & Legal](#compliance--legal)

## Overview

The donation system is a robust, secure, and compliant platform for processing online donations. It supports multiple payment methods, recurring donations, and comprehensive tax receipt generation.

### Key Features
- ✅ **Multiple Payment Methods**: Credit/Debit Cards (via Stripe), GCash, Bank Transfer
- ✅ **Recurring Donations**: Weekly, Monthly, Quarterly subscriptions
- ✅ **Security**: PCI-compliant, encrypted data, rate limiting, fraud detection
- ✅ **Tax Compliance**: Automatic receipt generation, EIN included, IRS-compliant
- ✅ **Email Notifications**: Instant receipts to donors, admin notifications
- ✅ **Audit Trail**: Complete transaction history, refund tracking
- ✅ **Webhook Integration**: Real-time payment status updates from Stripe

## Security Features

### 1. Input Validation & Sanitization
- **Zod Schema Validation**: All inputs validated against strict schemas
- **XSS Prevention**: HTML tags and JavaScript removed from all inputs
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **Email Validation**: RFC-compliant email validation
- **Phone Validation**: International phone number format validation

### 2. Payment Security
- **PCI DSS Compliance**: Card details never touch our servers (Stripe handles all card data)
- **SSL/TLS Encryption**: All data transmitted over HTTPS
- **Webhook Signature Verification**: All Stripe webhooks verified with signatures
- **Idempotency Keys**: Prevents duplicate charges

### 3. Rate Limiting & Fraud Prevention
- **IP-based Rate Limiting**: Max 10 donations per IP per hour (configurable)
- **Session-based Rate Limiting**: Max 5 donations per session per hour
- **Amount Limits**: Configurable min/max donation amounts per payment method
- **Suspicious Activity Detection**: Logs unusual patterns for review

### 4. Data Protection
- **Encryption at Rest**: Sensitive data encrypted in database
- **Masked Logging**: Credit card numbers and personal info masked in logs
- **GDPR Compliant**: User data can be exported/deleted on request
- **Audit Logging**: All transactions logged with IP, user agent, timestamp

## Setup Instructions

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database
- Stripe account (for card payments)
- Resend account (for emails)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy the example file and fill in your values:
```bash
cp .env.example.donations .env
```

Required variables:
```env
# Database (should already exist)
DATABASE_URL=postgresql://...

# Stripe (REQUIRED for card payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (should already exist)
RESEND_API_KEY=re_...

# Security
DONATION_ENCRYPTION_KEY=minimum-32-character-secure-key
```

### 3. Run Database Migrations
```bash
pnpm prisma migrate deploy
pnpm prisma generate
```

### 4. Configure Stripe Webhooks
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `charge.refunded`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

### 5. Test the System
```bash
# Use Stripe test keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Run development server
pnpm dev

# Test with Stripe test cards:
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
# 3D Secure: 4000 0025 0000 3155
```

## Payment Methods

### Credit/Debit Cards (Stripe)
- **Supported Cards**: Visa, Mastercard, American Express, Discover
- **3D Secure**: Automatic handling for European cards
- **Limits**: $1 - $50,000 per transaction
- **Recurring**: Full support via Stripe Subscriptions

### GCash (Philippines)
- **Limits**: ₱1 - ₱500,000 per transaction
- **Process**: Manual verification required
- **Instructions**: Sent via email with reference number

### Bank Transfer
- **Limits**: $100 - $100,000 per transaction
- **Process**: Manual verification required
- **Details**: Bank account info sent via email

## Database Schema

### Core Tables
- **Donation**: Main donation records
- **DonationReceipt**: Receipt generation tracking
- **RecurringDonationLog**: Recurring payment history

### Key Fields
```prisma
model Donation {
  id                    String    @id
  transactionId         String    @unique
  stripePaymentIntentId String?   @unique
  amount                Decimal
  status                DonationStatus
  firstName             String
  lastName              String
  email                 String
  // ... full schema in prisma/schema.prisma
}
```

## API Endpoints

### POST /api/donations
Process a new donation.

**Request Body:**
```json
{
  "category": "tithes|missions|building|youth|education",
  "amount": 100.00,
  "paymentMethod": "card|gcash|bank",
  "isRecurring": false,
  "frequency": "weekly|monthly|quarterly",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Optional message"
}
```

**Response (Card Payment):**
```json
{
  "success": true,
  "transactionId": "TXN-...",
  "clientSecret": "pi_..._secret_...",
  "requiresAction": true,
  "paymentMethod": "stripe"
}
```

**Response (Bank/GCash):**
```json
{
  "success": true,
  "transactionId": "TXN-...",
  "receiptNumber": "RCP-...",
  "paymentInstructions": {...},
  "message": "Payment instructions sent to email"
}
```

### POST /api/webhooks/stripe
Stripe webhook endpoint (automatic).

### GET /api/donations
Check API status.

## Testing

### Test Card Numbers
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
3D Secure Required: 4000 0025 0000 3155
```

### Test Recurring Donations
1. Use test mode with monthly frequency
2. Stripe will simulate monthly charges
3. Check webhook logs for confirmations

### Load Testing
```bash
# Install k6
brew install k6

# Run load test
k6 run tests/donation-load-test.js
```

## Production Checklist

### Before Going Live

#### 1. Security
- [ ] Change to Stripe LIVE keys
- [ ] Set strong `DONATION_ENCRYPTION_KEY` (min 32 chars)
- [ ] Enable rate limiting with Redis
- [ ] Configure fraud detection limits
- [ ] Set up SSL certificate
- [ ] Enable CORS for your domain only
- [ ] Review and test all validation rules

#### 2. Legal & Compliance
- [ ] Add real church EIN number
- [ ] Update tax disclaimer text
- [ ] Review receipt format with accountant
- [ ] Ensure GDPR compliance for EU donors
- [ ] Add privacy policy link
- [ ] Add terms of service

#### 3. Payment Configuration
- [ ] Complete Stripe account verification
- [ ] Set up Stripe radar rules for fraud
- [ ] Configure GCash business account
- [ ] Verify bank account details
- [ ] Set appropriate min/max amounts
- [ ] Test refund process

#### 4. Email Configuration
- [ ] Verify email domain with Resend
- [ ] Set up SPF/DKIM records
- [ ] Test email deliverability
- [ ] Configure admin notification emails
- [ ] Review email templates

#### 5. Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up database backups
- [ ] Enable Stripe webhook monitoring
- [ ] Configure alert notifications

#### 6. Testing
- [ ] Test all payment methods
- [ ] Test recurring donations
- [ ] Test email receipts
- [ ] Test refund process
- [ ] Test with real cards (small amounts)
- [ ] Load test the system
- [ ] Test on mobile devices

## Troubleshooting

### Common Issues

#### "Payment system is not configured"
- Check `STRIPE_SECRET_KEY` is set
- Verify Stripe API key is valid

#### Webhook signature verification failed
- Ensure `STRIPE_WEBHOOK_SECRET` matches dashboard
- Check you're using raw body for verification
- Verify webhook URL is correct

#### Emails not sending
- Check `RESEND_API_KEY` is valid
- Verify email domain is configured
- Check spam folder

#### Database errors
- Run `pnpm prisma migrate deploy`
- Check `DATABASE_URL` is correct
- Verify database is accessible

### Debug Mode
Set these for detailed logging:
```env
NODE_ENV=development
DEBUG=stripe:*
```

## Compliance & Legal

### Tax Compliance
- All donations automatically generate IRS-compliant receipts
- EIN included on all receipts
- Annual giving statements available
- Supports both cash and non-cash donations

### PCI Compliance
- We never store credit card numbers
- All card processing handled by Stripe (PCI Level 1)
- SSL/TLS encryption required
- Regular security updates required

### Data Privacy
- GDPR compliant data handling
- Data retention policies implemented
- User consent for data processing
- Right to deletion supported

### Financial Regulations
- Anti-money laundering checks via Stripe
- Know Your Customer (KYC) for large donations
- Suspicious activity reporting
- Regular financial audits recommended

## Support

For technical issues:
- Check logs: `pnpm pm2 logs`
- Review Stripe dashboard for payment issues
- Contact: tech@divinejesus.org

For financial questions:
- Contact: finance@divinejesus.org

## Updates & Maintenance

### Regular Tasks
- **Daily**: Check for failed payments
- **Weekly**: Review donation reports
- **Monthly**: Reconcile with bank statements
- **Quarterly**: Update security dependencies
- **Annually**: Review and update limits

### Updating Dependencies
```bash
# Check for updates
pnpm outdated

# Update all dependencies
pnpm update

# Update Stripe SDK specifically
pnpm add stripe@latest

# Run tests after updating
pnpm test
```

---

## Important Security Notes

⚠️ **NEVER**:
- Log credit card numbers
- Store CVV codes
- Share webhook secrets
- Commit .env files to git
- Process cards without SSL
- Skip webhook verification
- Disable rate limiting in production

✅ **ALWAYS**:
- Use HTTPS in production
- Verify webhook signatures
- Validate all inputs
- Keep Stripe SDK updated
- Monitor for suspicious activity
- Test thoroughly before deploying
- Keep audit logs
- Back up your database regularly

---

*Last Updated: August 2025*
*Version: 1.0.0*
