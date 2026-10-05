/**
 * Aadhaar Number Verification & Formatting Utility
 * Implements standard UIDAI 12-digit rules & Verhoeff algorithm checksum validation.
 */

// The multiplication table (d)
const d: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// The permutation table (p)
const p: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/**
 * Validates that an Aadhaar number string passes the Verhoeff algorithm.
 */
export function validateVerhoeff(numStr: string): boolean {
  let c = 0;
  const invertedArray = numStr.split('').map(Number).reverse();

  for (let i = 0; i < invertedArray.length; i++) {
    c = d[c][p[i % 8][invertedArray[i]]];
  }

  return c === 0;
}

/**
 * Strips all non-digit characters from string
 */
export function cleanAadhaar(raw: string): string {
  return (raw || '').replace(/\D/g, '').slice(0, 12);
}

/**
 * Formats a 12-digit Aadhaar string with spaces: 'XXXX XXXX XXXX'
 */
export function formatAadhaar(raw: string): string {
  const clean = cleanAadhaar(raw);
  const parts: string[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    parts.push(clean.substring(i, i + 4));
  }
  return parts.join(' ');
}

/**
 * Masks an Aadhaar string preserving only the last 4 digits: '•••• •••• 1234'
 */
export function maskAadhaar(raw: string): string {
  const clean = cleanAadhaar(raw);
  if (clean.length < 12) {
    return formatAadhaar(clean);
  }
  const lastFour = clean.slice(-4);
  return `•••• •••• ${lastFour}`;
}

export interface AadhaarValidationResult {
  isValid: boolean;
  isComplete: boolean;
  cleanNumber: string;
  formattedNumber: string;
  maskedNumber: string;
  message: string;
}

/**
 * Comprehensive Aadhaar validation
 */
export function verifyAadhaarNumber(raw: string): AadhaarValidationResult {
  const clean = cleanAadhaar(raw);
  const formatted = formatAadhaar(clean);
  const masked = maskAadhaar(clean);

  if (!clean || clean.length === 0) {
    return {
      isValid: false,
      isComplete: false,
      cleanNumber: '',
      formattedNumber: '',
      maskedNumber: '',
      message: '12-digit Aadhaar number required',
    };
  }

  if (clean.length < 12) {
    return {
      isValid: false,
      isComplete: false,
      cleanNumber: clean,
      formattedNumber: formatted,
      maskedNumber: masked,
      message: `Enter ${12 - clean.length} more digit${12 - clean.length === 1 ? '' : 's'}`,
    };
  }

  // First digit should not be 0 or 1 under standard UIDAI rules
  if (clean.startsWith('0') || clean.startsWith('1')) {
    return {
      isValid: false,
      isComplete: true,
      cleanNumber: clean,
      formattedNumber: formatted,
      maskedNumber: masked,
      message: 'Invalid: Aadhaar cannot start with 0 or 1',
    };
  }

  const passesVerhoeff = validateVerhoeff(clean);
  if (!passesVerhoeff) {
    return {
      isValid: false,
      isComplete: true,
      cleanNumber: clean,
      formattedNumber: formatted,
      maskedNumber: masked,
      message: 'Invalid Aadhaar checksum (UIDAI Verhoeff algorithm verification failed)',
    };
  }

  return {
    isValid: true,
    isComplete: true,
    cleanNumber: clean,
    formattedNumber: formatted,
    maskedNumber: masked,
    message: 'Aadhaar Verified (UIDAI Checksum Valid)',
  };
}
