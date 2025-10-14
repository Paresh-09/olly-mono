import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto, { randomBytes } from 'crypto';
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const adjectives = ['Swift', 'Bright', 'Clever', 'Daring', 'Eager', 'Fierce', 'Gentle', 'Happy', 'Innovative', 'Jolly'];
const nouns = ['Team', 'Group', 'Crew', 'Squad', 'Collective', 'Alliance', 'Network', 'Association', 'Guild', 'League'];

export function generateRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}

export function formatOrganizationName(name: string): string {
  // Remove any non-alphanumeric characters except hyphens
  let formatted = name.replace(/[^a-zA-Z0-9-]/g, '');
  
  // Replace spaces with hyphens
  formatted = formatted.replace(/\s+/g, '-');
  
  // Convert to lowercase
  formatted = formatted.toLowerCase();
  
  // Trim hyphens from the start and end
  formatted = formatted.replace(/^-+|-+$/g, '');
  
  // Limit to 63 characters (common limit for subdomains)
  formatted = formatted.slice(0, 63);
  
  return formatted;
}

/**
 * Generate a unique license key with OLLYR prefix
 * Format: OLLYR-XXXX-XXXX-XXXX-XXXX
 * 
 * Note: This is a synchronous version that doesn't check for uniqueness in the database.
 * For admin-generated redeem codes, use the async version in create-redeem-codes/route.ts
 * which checks for uniqueness in the database.
 */
export function generateLicenseKey(): string {
  const uuid = crypto.randomUUID().replace(/-/g, '').toUpperCase();
  
  // Format into parts
  const parts = [
    uuid.substring(0, 4),
    uuid.substring(4, 8),
    uuid.substring(8, 12),
    uuid.substring(12, 16)
  ];
  
  // Add the OLLYR prefix
  return `OLLYR-${parts.join('-')}`;
}

export function generateApiKey(): string {
  // Generate 24 random bytes (instead of 32 to account for the prefix length)
  const key = randomBytes(24).toString('hex');
  
  // Format the key into groups and add the olly- prefix
  const formattedKey = key.match(/.{1,4}/g)?.join('-') || key;
  return `olly-${formattedKey}`;
}

export const calculateCreditPrice = (creditAmount: number) => {
  const basePrice = Number(process.env.OLLY_CREDIT_PRICING_PER_CREDIT ?? "0.01");
  
  if (isNaN(basePrice) || basePrice <= 0) {
    throw new Error("Invalid base price configuration");
  }

  let discountPercentage = 0;

  if (creditAmount > 500) {
    discountPercentage = 20;
  } else if (creditAmount > 100) {
    discountPercentage = 10;
  }

  const discountMultiplier = (100 - discountPercentage) / 100;
  const totalPrice = creditAmount * basePrice * discountMultiplier;

  return Number(totalPrice.toFixed(2));
};