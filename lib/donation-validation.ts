import { z } from 'zod';
import CryptoJS from 'crypto-js';

// Environment variable validation
const ENCRYPTION_KEY = process.env.DONATION_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'fallback-key-replace-in-production';

// Comprehensive donation schema with strict validation
export const donationSchema = z.object({
  // Donation details
  category: z.enum(['tithes', 'missions', 'building', 'youth', 'education', 'other']),
  amount: z.number()
    .min(1, 'Amount must be at least $1')
    .max(999999.99, 'Amount cannot exceed $999,999.99')
    .refine((val) => {
      // Check for valid decimal places (max 2)
      const decimalPlaces = (val.toString().split('.')[1] || '').length;
      return decimalPlaces <= 2;
    }, 'Amount can have maximum 2 decimal places'),
  
  // Payment details
  paymentMethod: z.enum(['card', 'gcash', 'maya', 'bank']),
  isRecurring: z.boolean(),
  frequency: z.enum(['weekly', 'monthly', 'quarterly']).optional(),
  
  // Donor information
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
  
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email cannot exceed 100 characters')
    .toLowerCase()
    .transform(val => val.trim()),
  
  phone: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      // Remove all non-digit characters for validation
      const digitsOnly = val.replace(/\D/g, '');
      return digitsOnly.length >= 10 && digitsOnly.length <= 15;
    }, 'Invalid phone number'),
  
  message: z.string()
    .max(500, 'Message cannot exceed 500 characters')
    .optional()
    .transform(val => val ? val.trim() : val),
  
  // Address information (optional but validated if provided)
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zipCode: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      // US ZIP code validation (5 digits or 5+4 format)
      return /^\d{5}(-\d{4})?$/.test(val);
    }, 'Invalid ZIP code'),
  country: z.string().max(100).default('USA').optional(),
}).refine((data) => {
  // If recurring, frequency is required
  if (data.isRecurring && !data.frequency) {
    return false;
  }
  return true;
}, {
  message: 'Frequency is required for recurring donations',
  path: ['frequency']
});

// Card validation for Stripe
export const cardValidationSchema = z.object({
  cardNumber: z.string()
    .refine((val) => {
      // Remove spaces and validate using Luhn algorithm
      const cleaned = val.replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(cleaned)) return false;
      
      // Luhn algorithm
      let sum = 0;
      let isEven = false;
      for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned.charAt(i), 10);
        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        sum += digit;
        isEven = !isEven;
      }
      return sum % 10 === 0;
    }, 'Invalid card number'),
  
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().min(new Date().getFullYear()),
  cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
  cardholderName: z.string().min(1).max(100),
});

// Sanitize input to prevent XSS attacks
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

// Encrypt sensitive data
export function encryptSensitiveData(data: any): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
}

// Decrypt sensitive data
export function decryptSensitiveData(encryptedData: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// Generate secure transaction ID
export function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = CryptoJS.lib.WordArray.random(16).toString();
  return `TXN-${timestamp}-${random.substring(0, 8).toUpperCase()}`;
}

// Generate receipt number
export function generateReceiptNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RCP-${year}${month}${day}-${random}`;
}

// Validate donation amount against limits (PHP currency)
export function validateDonationLimits(amount: number, paymentMethod: string): { valid: boolean; error?: string } {
  // Define limits per payment method in PHP
  const limits = {
    card: { min: 100, max: 1000000 },   // ₱100 - ₱1,000,000
    gcash: { min: 1, max: 100000 },     // ₱1 - ₱100,000 (GCash daily limit)
    maya: { min: 1, max: 100000 },      // ₱1 - ₱100,000 (Maya daily limit)
    bank: { min: 500, max: 5000000 }    // ₱500 - ₱5,000,000
  };

  const limit = limits[paymentMethod as keyof typeof limits];
  if (!limit) {
    return { valid: false, error: 'Invalid payment method' };
  }

  if (amount < limit.min) {
    return { valid: false, error: `Minimum amount for ${paymentMethod} is ₱${limit.min.toLocaleString()}` };
  }

  if (amount > limit.max) {
    return { valid: false, error: `Maximum amount for ${paymentMethod} is ₱${limit.max.toLocaleString()}` };
  }

  return { valid: true };
}

// Rate limiting check (to prevent spam/abuse)
export function checkRateLimit(ipAddress: string, sessionId: string): boolean {
  // In production, implement Redis-based rate limiting
  // For now, return true (allow)
  return true;
}

// Validate IP address
export function isValidIP(ip: string): boolean {
  // IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // IPv6 validation
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Mask sensitive information for logging
export function maskSensitiveData(data: any): any {
  const masked = { ...data };
  
  // Mask card numbers
  if (masked.cardNumber) {
    masked.cardNumber = masked.cardNumber.replace(/\d(?=\d{4})/g, '*');
  }
  
  // Mask email (show first 2 chars and domain)
  if (masked.email) {
    const [localPart, domain] = masked.email.split('@');
    masked.email = localPart.substring(0, 2) + '***@' + domain;
  }
  
  // Mask phone (show last 4 digits)
  if (masked.phone) {
    masked.phone = masked.phone.replace(/\d(?=\d{4})/g, '*');
  }
  
  // Remove CVV completely
  if (masked.cvv) {
    masked.cvv = '***';
  }
  
  return masked;
}

// Validate recurring donation dates
export function validateRecurringDates(
  frequency: string,
  startDate?: Date,
  endDate?: Date
): { valid: boolean; error?: string } {
  const now = new Date();
  const start = startDate || now;
  
  if (start < now) {
    return { valid: false, error: 'Start date cannot be in the past' };
  }
  
  if (endDate && endDate <= start) {
    return { valid: false, error: 'End date must be after start date' };
  }
  
  if (endDate) {
    const minDuration = {
      weekly: 7,
      monthly: 30,
      quarterly: 90
    };
    
    const daysDiff = Math.floor((endDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const minDays = minDuration[frequency as keyof typeof minDuration];
    
    if (daysDiff < minDays) {
      return { valid: false, error: `Minimum duration for ${frequency} donations is ${minDays} days` };
    }
  }
  
  return { valid: true };
}

// Type definitions for donation processing
export type DonationInput = z.infer<typeof donationSchema>;
export type CardInput = z.infer<typeof cardValidationSchema>;

export interface ProcessedDonation extends DonationInput {
  transactionId: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: Date;
}
