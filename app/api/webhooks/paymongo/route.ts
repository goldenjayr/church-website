import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { verifyWebhookSignature } from '@/lib/paymongo-service';
import { sendDonationReceipt, sendDonationNotification } from '@/lib/donation-emails';

// PayMongo webhook handler
export async function POST(request: NextRequest) {
  try {
    // Get the raw body as text for signature verification
    const body = await request.text();
    const signature = request.headers.get('paymongo-signature');

    if (!signature) {
      console.error('No PayMongo signature found');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    // Parse the signature header to get the timestamp and signatures
    const elements = signature.split(',');
    let timestamp = '';
    let signatures: string[] = [];
    
    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'te' || key === 'li') {
        signatures.push(value);
      }
    }

    // Verify the webhook signature
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET || '';
    const signedPayload = `${timestamp}.${body}`;
    
    const isValid = signatures.some(sig => 
      verifyWebhookSignature(signedPayload, sig, webhookSecret)
    );

    if (!isValid) {
      console.error('Invalid PayMongo webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse the webhook event
    const event = JSON.parse(body);
    const eventType = event.data.attributes.type;
    const eventData = event.data.attributes.data;

    console.log(`Processing PayMongo webhook: ${eventType}`);

    // Handle different event types
    switch (eventType) {
      case 'payment.paid':
        await handlePaymentPaid(eventData);
        break;

      case 'payment.failed':
        await handlePaymentFailed(eventData);
        break;

      case 'source.chargeable':
        await handleSourceChargeable(eventData);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(eventData);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(eventData);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle successful payment
async function handlePaymentPaid(payment: any) {
  try {
    // Find donation by metadata or payment intent ID
    const donationId = payment.attributes.metadata?.donationId;
    const paymentIntentId = payment.attributes.payment_intent_id;

    let donation;
    if (donationId) {
      donation = await prisma.donation.findUnique({
        where: { id: donationId },
        include: { receipts: true },
      });
    } else if (paymentIntentId) {
      donation = await prisma.donation.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { receipts: true },
      });
    }

    if (!donation) {
      console.error(`Donation not found for payment: ${payment.id}`);
      return;
    }

    // Update donation status to completed
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        metadata: {
          ...(donation.metadata as any || {}),
          paymongoPaymentId: payment.id,
          paymongoPaymentStatus: payment.attributes.status,
          paymongoAmount: payment.attributes.amount,
          paymongoCurrency: payment.attributes.currency,
        },
      },
    });

    // Send receipt if not already sent
    if (!donation.receiptSent && donation.receipts.length > 0) {
      const receipt = donation.receipts[0];
      await sendDonationReceipt({
        donation,
        receiptNumber: receipt.receiptNumber,
      });

      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          receiptSent: true,
          receiptSentAt: new Date(),
        },
      });
    }

    // Send admin notification
    await sendDonationNotification(donation);

    console.log(`Payment succeeded for donation ${donation.id}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(payment: any) {
  try {
    const donationId = payment.attributes.metadata?.donationId;
    const paymentIntentId = payment.attributes.payment_intent_id;

    let donation;
    if (donationId) {
      donation = await prisma.donation.findUnique({
        where: { id: donationId },
      });
    } else if (paymentIntentId) {
      donation = await prisma.donation.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
      });
    }

    if (!donation) {
      console.error(`Donation not found for payment: ${payment.id}`);
      return;
    }

    // Update donation status to failed
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: 'FAILED',
        failureReason: payment.attributes.failed_message || 'Payment failed',
        metadata: {
          ...(donation.metadata as any || {}),
          paymongoPaymentId: payment.id,
          paymongoPaymentStatus: payment.attributes.status,
          paymongoFailedCode: payment.attributes.failed_code,
        },
      },
    });

    console.log(`Payment failed for donation ${donation.id}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Handle source chargeable (for GCash/Maya)
async function handleSourceChargeable(source: any) {
  try {
    // Find donation by source ID in metadata
    const donation = await prisma.donation.findFirst({
      where: {
        metadata: {
          path: ['paymongoSourceId'],
          equals: source.id,
        },
      },
    });

    if (!donation) {
      console.error(`Donation not found for source: ${source.id}`);
      return;
    }

    // Create payment from the source
    const response = await fetch('https://api.paymongo.com/v1/payments', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: source.attributes.amount,
            currency: source.attributes.currency,
            source: {
              id: source.id,
              type: 'source',
            },
            metadata: {
              donationId: donation.id,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to create payment');
    }

    const result = await response.json();
    console.log(`Payment created for donation ${donation.id} from source ${source.id}`);
  } catch (error) {
    console.error('Error handling source chargeable:', error);
  }
}

// Handle payment intent succeeded
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    // Find donation by payment intent ID
    const donation = await prisma.donation.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: { receipts: true },
    });

    if (!donation) {
      console.error(`Donation not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update donation status to completed
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        metadata: {
          ...(donation.metadata as any || {}),
          paymongoPaymentIntentStatus: paymentIntent.attributes.status,
          paymongoLastPaymentError: paymentIntent.attributes.last_payment_error,
        },
      },
    });

    // Send receipt if not already sent
    if (!donation.receiptSent && donation.receipts.length > 0) {
      const receipt = donation.receipts[0];
      await sendDonationReceipt({
        donation,
        receiptNumber: receipt.receiptNumber,
      });

      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          receiptSent: true,
          receiptSentAt: new Date(),
        },
      });
    }

    // Send admin notification
    await sendDonationNotification(donation);

    console.log(`Payment intent succeeded for donation ${donation.id}`);
  } catch (error) {
    console.error('Error handling payment intent success:', error);
  }
}

// Handle payment intent failed
async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    const donation = await prisma.donation.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!donation) {
      console.error(`Donation not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    const lastError = paymentIntent.attributes.last_payment_error;
    const failureReason = lastError?.message || 'Payment failed';

    // Update donation status to failed
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: 'FAILED',
        failureReason,
        metadata: {
          ...(donation.metadata as any || {}),
          paymongoPaymentIntentStatus: paymentIntent.attributes.status,
          paymongoErrorCode: lastError?.code,
          paymongoErrorType: lastError?.type,
        },
      },
    });

    console.log(`Payment intent failed for donation ${donation.id}: ${failureReason}`);
  } catch (error) {
    console.error('Error handling payment intent failure:', error);
  }
}
