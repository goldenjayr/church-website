import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma-client"
import { 
  donationSchema, 
  sanitizeInput, 
  generateTransactionId, 
  generateReceiptNumber,
  validateDonationLimits,
  checkRateLimit,
  maskSensitiveData,
  isValidIP
} from "@/lib/donation-validation"
import { sendDonationReceipt, sendDonationNotification } from "@/lib/donation-emails"
import { 
  createPaymentIntent,
  createGCashSource,
  createMayaSource,
  createBankTransferPayment,
  validatePayMongoConfig,
  mapPayMongoPaymentMethod
} from "@/lib/paymongo-service"
import { DonationStatus, PaymentMethod, RecurringFrequency } from "@prisma/client"
import { z } from "zod"

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  if (realIP) return realIP
  return '127.0.0.1'
}

export async function POST(request: NextRequest) {
  let donation = null;
  
  try {
    // Check PayMongo configuration
    if (!validatePayMongoConfig()) {
      console.error('PayMongo is not properly configured')
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 503 }
      )
    }

    // Get request metadata
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const referrer = request.headers.get('referer') || ''
    const sessionId = request.cookies.get('session')?.value || ''
    
    // Validate IP address
    if (!isValidIP(ipAddress) && ipAddress !== '127.0.0.1') {
      console.warn('Invalid IP address detected:', ipAddress)
    }
    
    // Check rate limiting
    if (!checkRateLimit(ipAddress, sessionId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    
    // Sanitize all string inputs
    const sanitizedData = {
      ...body,
      firstName: sanitizeInput(body.firstName || ''),
      lastName: sanitizeInput(body.lastName || ''),
      email: (body.email || '').toLowerCase().trim(),
      phone: sanitizeInput(body.phone || ''),
      message: sanitizeInput(body.message || ''),
      address: sanitizeInput(body.address || ''),
      city: sanitizeInput(body.city || ''),
      state: sanitizeInput(body.state || ''),
      zipCode: sanitizeInput(body.zipCode || ''),
    }

    // Validate with schema
    const validatedData = donationSchema.parse(sanitizedData)
    
    // Additional amount validation based on payment method
    const amountValidation = validateDonationLimits(validatedData.amount, validatedData.paymentMethod)
    if (!amountValidation.valid) {
      return NextResponse.json(
        { error: amountValidation.error },
        { status: 400 }
      )
    }

    // Log sanitized data (with sensitive info masked)
    console.log('Processing donation:', maskSensitiveData(validatedData))

    // Generate unique identifiers
    const transactionId = generateTransactionId()
    const receiptNumber = generateReceiptNumber()

    // Map payment method to enum
    const paymentMethodMap: Record<string, PaymentMethod> = {
      card: 'CREDIT_CARD',
      gcash: 'GCASH',
      maya: 'OTHER',
      bank: 'BANK_TRANSFER'
    }

    // Map frequency to enum
    const frequencyMap: Record<string, RecurringFrequency> = {
      weekly: 'WEEKLY',
      monthly: 'MONTHLY',
      quarterly: 'QUARTERLY'
    }

    // Create donation record in database (initially as PENDING)
    donation = await prisma.donation.create({
      data: {
        transactionId,
        amount: validatedData.amount,
        currency: 'USD',
        category: validatedData.category,
        paymentMethod: paymentMethodMap[validatedData.paymentMethod],
        status: 'PENDING',
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        country: validatedData.country || 'USA',
        isRecurring: validatedData.isRecurring,
        recurringFrequency: validatedData.isRecurring && validatedData.frequency 
          ? frequencyMap[validatedData.frequency] 
          : null,
        recurringStartDate: validatedData.isRecurring ? new Date() : null,
        message: validatedData.message,
        ipAddress,
        userAgent,
        referrerUrl: referrer,
        sessionId,
        metadata: {
          source: 'website',
          formVersion: '1.0',
        },
      },
    })

    // Process payment based on method
    let paymentResult: any = { success: false, error: 'Payment method not implemented' }
    let paymongoPaymentIntentId: string | null = null
    let paymongoSourceId: string | null = null

    if (validatedData.paymentMethod === 'card') {
      // Create PayMongo payment intent for card payments
      const paymentIntentResult = await createPaymentIntent({
        amount: validatedData.amount,
        currency: 'PHP',
        description: `Donation - ${validatedData.category}`,
        metadata: {
          donationId: donation.id,
          category: validatedData.category,
          donorName: `${validatedData.firstName} ${validatedData.lastName}`,
          donorEmail: validatedData.email,
        },
        paymentMethodTypes: ['card'],
      })

      if (!paymentIntentResult.success) {
        throw new Error(paymentIntentResult.error || 'Failed to create payment intent')
      }

      paymongoPaymentIntentId = paymentIntentResult.paymentIntentId!
      paymentResult = {
        success: true,
        clientKey: paymentIntentResult.clientKey,
        paymentIntentId: paymentIntentResult.paymentIntentId,
        paymentMethod: 'paymongo_card',
      }
    } else if (validatedData.paymentMethod === 'gcash') {
      // Create GCash source
      const gcashResult = await createGCashSource(
        validatedData.amount,
        {
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          email: validatedData.email,
          phone: validatedData.phone || '+639000000000',
        },
        `${process.env.NEXT_PUBLIC_SITE_URL}/donate/success?transaction=${transactionId}`,
        `${process.env.NEXT_PUBLIC_SITE_URL}/donate/failed?transaction=${transactionId}`
      )

      if (!gcashResult.success) {
        throw new Error(gcashResult.error || 'Failed to create GCash payment')
      }

      paymongoSourceId = gcashResult.sourceId!
      paymentResult = {
        success: true,
        redirectUrl: gcashResult.redirectUrl,
        sourceId: gcashResult.sourceId,
        paymentMethod: 'gcash',
      }
    } else if (validatedData.paymentMethod === 'maya') {
      // Create Maya source
      const mayaResult = await createMayaSource(
        validatedData.amount,
        {
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          email: validatedData.email,
          phone: validatedData.phone || '+639000000000',
        },
        `${process.env.NEXT_PUBLIC_SITE_URL}/donate/success?transaction=${transactionId}`,
        `${process.env.NEXT_PUBLIC_SITE_URL}/donate/failed?transaction=${transactionId}`
      )

      if (!mayaResult.success) {
        throw new Error(mayaResult.error || 'Failed to create Maya payment')
      }

      paymongoSourceId = mayaResult.sourceId!
      paymentResult = {
        success: true,
        redirectUrl: mayaResult.redirectUrl,
        sourceId: mayaResult.sourceId,
        paymentMethod: 'maya',
      }
    } else if (validatedData.paymentMethod === 'bank') {
      // Get bank transfer instructions
      const bankResult = await createBankTransferPayment(
        validatedData.amount,
        {
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          email: validatedData.email,
          phone: validatedData.phone || '',
        }
      )

      paymentResult = {
        success: true,
        paymentInstructions: bankResult.paymentInstructions,
        paymentMethod: 'bank_transfer',
      }
    }

    // Update donation with payment processing info
    if (paymentResult.success) {
      donation = await prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: validatedData.paymentMethod === 'card' ? 'PROCESSING' : 'PENDING',
          stripePaymentIntentId: paymongoPaymentIntentId, // Using same field for PayMongo
          metadata: {
            ...(donation.metadata as any || {}),
            paymongoSourceId,
            paymentProvider: 'paymongo',
          },
        },
      })

      // Create receipt record
      await prisma.donationReceipt.create({
        data: {
          donationId: donation.id,
          receiptNumber,
          sentTo: validatedData.email,
        },
      })

      // Send emails asynchronously (don't wait)
      Promise.all([
        sendDonationReceipt({
          donation,
          receiptNumber,
        }),
        sendDonationNotification(donation),
      ]).catch(error => {
        console.error('Failed to send emails:', error)
      })
    }

    // Return response based on payment method
    if (validatedData.paymentMethod === 'card') {
      // For card payments, return client key for PayMongo
      return NextResponse.json({
        success: true,
        transactionId,
        clientKey: paymentResult.clientKey,
        paymentIntentId: paymentResult.paymentIntentId,
        requiresAction: true,
        paymentMethod: 'paymongo_card',
      })
    } else if (validatedData.paymentMethod === 'gcash' || validatedData.paymentMethod === 'maya') {
      // For e-wallet payments, return redirect URL
      return NextResponse.json({
        success: true,
        transactionId,
        redirectUrl: paymentResult.redirectUrl,
        sourceId: paymentResult.sourceId,
        paymentMethod: paymentResult.paymentMethod,
        message: 'Redirecting to payment gateway...',
      })
    } else {
      // For bank transfer, return instructions
      return NextResponse.json({
        success: true,
        transactionId,
        receiptNumber,
        paymentInstructions: paymentResult.paymentInstructions,
        message: 'Payment instructions have been sent to your email',
      })
    }

  } catch (error) {
    console.error('Donation processing error:', error)
    
    // If we created a donation record, mark it as failed
    if (donation) {
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: 'FAILED',
          failureReason: error instanceof Error ? error.message : 'Unknown error',
        },
      }).catch(console.error)
    }

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An error occurred while processing your donation',
        transactionId: donation?.transactionId,
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check API status
export async function GET() {
  return NextResponse.json({
    status: "active",
    message: "Donation API is running",
    acceptedPaymentMethods: ["card", "gcash", "bank"],
  })
}
