import { PaymentMethod, RecurringFrequency } from '@prisma/client';

// PayMongo API configuration
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || '';
const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY || '';
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

// Helper to create base64 auth header
function getAuthHeader(usePublicKey = false) {
  const key = usePublicKey ? PAYMONGO_PUBLIC_KEY : PAYMONGO_SECRET_KEY;
  return `Basic ${Buffer.from(key + ':').toString('base64')}`;
}

export interface PayMongoPaymentIntent {
  id: string;
  type: string;
  attributes: {
    amount: number;
    capture_type: string;
    client_key: string;
    currency: string;
    description?: string;
    statement_descriptor?: string;
    status: string;
    payment_method_allowed: string[];
    payment_method_options?: any;
    metadata?: Record<string, any>;
    next_action?: any;
    created_at: number;
    updated_at: number;
  };
}

export interface PayMongoPaymentMethod {
  id: string;
  type: string;
  attributes: {
    billing?: {
      name: string;
      email: string;
      phone?: string;
    };
    type: string;
    details: any;
    metadata?: Record<string, any>;
  };
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  description?: string;
  statementDescriptor?: string;
  metadata?: Record<string, any>;
  paymentMethodTypes?: string[];
}

/**
 * Create a PayMongo payment intent
 */
export async function createPaymentIntent({
  amount,
  currency = 'PHP',
  description = 'Donation to Divine Jesus Church',
  statementDescriptor = 'DIVINE JESUS',
  metadata = {},
  paymentMethodTypes = ['card', 'gcash', 'grab_pay', 'paymaya'],
}: CreatePaymentIntentParams) {
  try {
    // PayMongo expects amount in cents (smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    const response = await fetch(`${PAYMONGO_API_URL}/payment_intents`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountInCents,
            payment_method_allowed: paymentMethodTypes,
            payment_method_options: {
              card: {
                request_three_d_secure: 'any', // Automatic 3D Secure when required
              },
            },
            currency,
            description,
            statement_descriptor: statementDescriptor.substring(0, 22),
            metadata,
            capture_type: 'automatic',
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to create payment intent');
    }

    const result = await response.json();
    const paymentIntent = result.data as PayMongoPaymentIntent;

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      clientKey: paymentIntent.attributes.client_key,
      amount: paymentIntent.attributes.amount / 100,
      status: paymentIntent.attributes.status,
    };
  } catch (error) {
    console.error('Failed to create PayMongo payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed',
    };
  }
}

/**
 * Create a payment method for card payments
 */
export async function createCardPaymentMethod(
  cardDetails: {
    cardNumber: string;
    expMonth: number;
    expYear: number;
    cvc: string;
  },
  billing: {
    name: string;
    email: string;
    phone?: string;
  }
) {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/payment_methods`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(true), // Use public key for payment methods
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: 'card',
            details: {
              card_number: cardDetails.cardNumber.replace(/\s/g, ''),
              exp_month: cardDetails.expMonth,
              exp_year: cardDetails.expYear,
              cvc: cardDetails.cvc,
            },
            billing: {
              name: billing.name,
              email: billing.email,
              phone: billing.phone,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to create payment method');
    }

    const result = await response.json();
    const paymentMethod = result.data as PayMongoPaymentMethod;

    return {
      success: true,
      paymentMethodId: paymentMethod.id,
      type: paymentMethod.attributes.type,
    };
  } catch (error) {
    console.error('Failed to create payment method:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment method',
    };
  }
}

/**
 * Attach a payment method to a payment intent
 */
export async function attachPaymentMethod(
  paymentIntentId: string,
  paymentMethodId: string,
  returnUrl?: string
) {
  try {
    const response = await fetch(
      `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}/attach`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
        },
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: paymentMethodId,
              return_url: returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/donate/success`,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to attach payment method');
    }

    const result = await response.json();
    const paymentIntent = result.data as PayMongoPaymentIntent;

    return {
      success: true,
      status: paymentIntent.attributes.status,
      nextAction: paymentIntent.attributes.next_action,
      paymentIntent,
    };
  } catch (error) {
    console.error('Failed to attach payment method:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process payment',
    };
  }
}

/**
 * Create a GCash payment source
 */
export async function createGCashSource(
  amount: number,
  billing: {
    name: string;
    email: string;
    phone: string;
  },
  successUrl?: string,
  failedUrl?: string
) {
  try {
    const amountInCents = Math.round(amount * 100);

    const response = await fetch(`${PAYMONGO_API_URL}/sources`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(true), // Use public key
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountInCents,
            redirect: {
              success: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/donate/success`,
              failed: failedUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/donate/failed`,
            },
            type: 'gcash',
            currency: 'PHP',
            billing: {
              name: billing.name,
              email: billing.email,
              phone: billing.phone,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to create GCash source');
    }

    const result = await response.json();
    const source = result.data;

    return {
      success: true,
      sourceId: source.id,
      redirectUrl: source.attributes.redirect.checkout_url,
      status: source.attributes.status,
    };
  } catch (error) {
    console.error('Failed to create GCash source:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create GCash payment',
    };
  }
}

/**
 * Create a Maya (PayMaya) payment source
 */
export async function createMayaSource(
  amount: number,
  billing: {
    name: string;
    email: string;
    phone: string;
  },
  successUrl?: string,
  failedUrl?: string
) {
  try {
    const amountInCents = Math.round(amount * 100);

    const response = await fetch(`${PAYMONGO_API_URL}/sources`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(true),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountInCents,
            redirect: {
              success: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/donate/success`,
              failed: failedUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/donate/failed`,
            },
            type: 'paymaya',
            currency: 'PHP',
            billing: {
              name: billing.name,
              email: billing.email,
              phone: billing.phone,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to create Maya source');
    }

    const result = await response.json();
    const source = result.data;

    return {
      success: true,
      sourceId: source.id,
      redirectUrl: source.attributes.redirect.checkout_url,
      status: source.attributes.status,
    };
  } catch (error) {
    console.error('Failed to create Maya source:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Maya payment',
    };
  }
}

/**
 * Create a payment for bank transfer or over-the-counter
 */
export async function createBankTransferPayment(
  amount: number,
  billing: {
    name: string;
    email: string;
    phone: string;
  }
) {
  // For bank transfers, we'll provide manual instructions
  // since PayMongo doesn't directly support bank transfers
  return {
    success: true,
    paymentInstructions: {
      method: 'bank_transfer',
      banks: [
        {
          name: 'BDO Unibank',
          accountName: process.env.BANK_ACCOUNT_NAME || 'Divine Jesus Church',
          accountNumber: process.env.BDO_ACCOUNT_NUMBER || 'XXXX-XXXX-XXXX',
          branch: process.env.BDO_BRANCH || 'Main Branch',
        },
        {
          name: 'BPI',
          accountName: process.env.BANK_ACCOUNT_NAME || 'Divine Jesus Church',
          accountNumber: process.env.BPI_ACCOUNT_NUMBER || 'XXXX-XXXX-XXXX',
          branch: process.env.BPI_BRANCH || 'Main Branch',
        },
        {
          name: 'Metrobank',
          accountName: process.env.BANK_ACCOUNT_NAME || 'Divine Jesus Church',
          accountNumber: process.env.METROBANK_ACCOUNT_NUMBER || 'XXXX-XXXX-XXXX',
          branch: process.env.METROBANK_BRANCH || 'Main Branch',
        },
      ],
      amount,
      referenceNumber: generateReferenceNumber(),
      instructions: [
        'Choose any of the banks listed above',
        'Use online banking, mobile app, or visit a branch',
        'Transfer the exact amount',
        'Use the reference number in the notes/description',
        'Send proof of payment to donations@divinejesus.org',
        'Allow 1-2 business days for verification',
      ],
    },
  };
}

/**
 * Retrieve payment intent status
 */
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const response = await fetch(
      `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to retrieve payment intent');
    }

    const result = await response.json();
    const paymentIntent = result.data as PayMongoPaymentIntent;

    return {
      success: true,
      paymentIntent,
      status: paymentIntent.attributes.status,
      amount: paymentIntent.attributes.amount / 100,
    };
  } catch (error) {
    console.error('Failed to retrieve payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve payment',
    };
  }
}

/**
 * Create a webhook endpoint in PayMongo
 */
export async function createWebhook(url: string, events: string[]) {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/webhooks`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            url,
            events,
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to create webhook');
    }

    const result = await response.json();
    return {
      success: true,
      webhookId: result.data.id,
      webhookSecret: result.data.attributes.secret_key,
    };
  } catch (error) {
    console.error('Failed to create webhook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create webhook',
    };
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  try {
    const crypto = require('crypto');
    const computedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');
    
    return computedSignature === signature;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

/**
 * Generate reference number for manual payments
 */
function generateReferenceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DON-${year}${month}${day}-${random}`;
}

/**
 * Map PayMongo payment types to our enum
 */
export function mapPayMongoPaymentMethod(paymongoType: string): PaymentMethod {
  const mapping: Record<string, PaymentMethod> = {
    card: 'CREDIT_CARD',
    gcash: 'GCASH',
    paymaya: 'OTHER',
    grab_pay: 'OTHER',
    bank_transfer: 'BANK_TRANSFER',
  };
  return mapping[paymongoType] || 'OTHER';
}

/**
 * Validate PayMongo configuration
 */
export function validatePayMongoConfig(): boolean {
  if (!PAYMONGO_SECRET_KEY) {
    console.error('PAYMONGO_SECRET_KEY is not configured');
    return false;
  }
  if (!PAYMONGO_PUBLIC_KEY) {
    console.error('PAYMONGO_PUBLIC_KEY is not configured');
    return false;
  }
  return true;
}
