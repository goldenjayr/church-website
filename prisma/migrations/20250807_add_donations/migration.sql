-- CreateEnum for donation status
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum for payment methods
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'GCASH', 'PAYPAL', 'OTHER');

-- CreateEnum for recurring frequency
CREATE TYPE "RecurringFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateTable for Donations
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    
    -- Donation details
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "category" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    
    -- Donor information
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT DEFAULT 'USA',
    
    -- Recurring donation fields
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringFrequency" "RecurringFrequency",
    "recurringStartDate" TIMESTAMP(3),
    "recurringEndDate" TIMESTAMP(3),
    "recurringStatus" TEXT,
    
    -- Additional information
    "message" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "taxDeductible" BOOLEAN NOT NULL DEFAULT true,
    "receiptSent" BOOLEAN NOT NULL DEFAULT false,
    "receiptSentAt" TIMESTAMP(3),
    
    -- Security and tracking
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrerUrl" TEXT,
    "sessionId" TEXT,
    
    -- Processing details
    "processedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "refundedAt" TIMESTAMP(3),
    "refundAmount" DECIMAL(10,2),
    "refundReason" TEXT,
    
    -- Metadata
    "metadata" JSONB,
    
    -- Timestamps
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable for DonationReceipts
CREATE TABLE "DonationReceipt" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "sentTo" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonationReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable for RecurringDonationLog
CREATE TABLE "RecurringDonationLog" (
    "id" TEXT NOT NULL,
    "originalDonationId" TEXT NOT NULL,
    "executedDonationId" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "executedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringDonationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for faster queries
CREATE UNIQUE INDEX "Donation_transactionId_key" ON "Donation"("transactionId");
CREATE UNIQUE INDEX "Donation_stripePaymentIntentId_key" ON "Donation"("stripePaymentIntentId");
CREATE INDEX "Donation_email_idx" ON "Donation"("email");
CREATE INDEX "Donation_status_idx" ON "Donation"("status");
CREATE INDEX "Donation_category_idx" ON "Donation"("category");
CREATE INDEX "Donation_createdAt_idx" ON "Donation"("createdAt");
CREATE INDEX "Donation_isRecurring_idx" ON "Donation"("isRecurring");
CREATE INDEX "Donation_stripeCustomerId_idx" ON "Donation"("stripeCustomerId");

CREATE UNIQUE INDEX "DonationReceipt_receiptNumber_key" ON "DonationReceipt"("receiptNumber");
CREATE INDEX "DonationReceipt_donationId_idx" ON "DonationReceipt"("donationId");

CREATE INDEX "RecurringDonationLog_originalDonationId_idx" ON "RecurringDonationLog"("originalDonationId");
CREATE INDEX "RecurringDonationLog_scheduledDate_idx" ON "RecurringDonationLog"("scheduledDate");

-- AddForeignKey
ALTER TABLE "DonationReceipt" ADD CONSTRAINT "DonationReceipt_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringDonationLog" ADD CONSTRAINT "RecurringDonationLog_originalDonationId_fkey" FOREIGN KEY ("originalDonationId") REFERENCES "Donation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringDonationLog" ADD CONSTRAINT "RecurringDonationLog_executedDonationId_fkey" FOREIGN KEY ("executedDonationId") REFERENCES "Donation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
