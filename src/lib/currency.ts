
/**
 * Formats a number as Indian Rupee currency
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number with INR symbol
 */
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Parses a price string and returns a number
 */
export function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace(/[₹,]/g, '')) || 0;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}