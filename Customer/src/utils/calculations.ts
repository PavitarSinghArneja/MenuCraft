// Tax rate will be loaded from restaurant configuration
let currentTaxRate = 0.085; // Default fallback
let currentCurrency = 'USD'; // Default currency

export function setTaxRate(rate: number): void {
  currentTaxRate = rate;
}

export function setCurrency(currency: string): void {
  currentCurrency = currency;
}

export function getTaxRate(): number {
  return currentTaxRate;
}

export function calculateSubtotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

export function calculateTax(subtotal: number): number {
  return subtotal * currentTaxRate;
}

export function calculateTotal(subtotal: number, tax: number): number {
  return subtotal + tax;
}

export function formatCurrency(amount: number): string {
  // Use Intl.NumberFormat for proper currency formatting
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentCurrency
    }).format(amount);
  } catch (error) {
    // Fallback to simple formatting
    return `$${amount.toFixed(2)}`;
  }
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp.slice(-6)}${random}`;
}