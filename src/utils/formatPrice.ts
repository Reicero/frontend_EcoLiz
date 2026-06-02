/**
 * Formats a number as a EUR price string.
 * @example formatPrice(1290) => "1 290,00 €"
 */
export function formatPrice(
  amount: number,
  options: { showDecimals?: boolean } = {}
): string {
  const { showDecimals = true } = options;

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Calculates the percentage saved between original and discounted price.
 */
export function calculateDiscount(
  price: number,
  originalPrice: number
): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round((1 - price / originalPrice) * 100);
}