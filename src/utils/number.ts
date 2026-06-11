/**
 * Number utility functions
 */

/**
 * Round number to 2 decimal places
 */
export function roundPrice(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate TTC price from HT price with VAT rate
 */
export function calculatePriceTTC(priceHT: number, vatRate: number = 0.2): number {
  return roundPrice(priceHT * (1 + vatRate));
}

/**
 * Calculate VAT amount from TTC and HT prices
 */
export function calculateVATAmount(priceTTC: number, priceHT: number): number {
  return roundPrice(priceTTC - priceHT);
}
