/**
 * Optica Luxe — Authoritative Server-Side Pricing & Tax Configuration
 *
 * Business Policy Documentation:
 * 1. Currency: Egyptian Pound (EGP).
 * 2. Shipping Policy:
 *    - Free delivery for orders with net subtotal >= 2000 EGP.
 *    - Standard shipping fee of 75 EGP applies for orders below 2000 EGP.
 * 3. Tax / VAT Policy:
 *    - In accordance with Egyptian Tax Law No. 67 of 2016 (Value Added Tax),
 *      consumer retail prices for optics and frames in Egypt are inclusive of 14% VAT.
 *    - Tax is not added as an extra surcharge at checkout; prices already incorporate VAT.
 *    - The tax breakdown indicates the portion of the subtotal allocated to VAT (14/114).
 * 4. Payment Method:
 *    - Cash on Delivery (COD) exclusively.
 */
import Decimal from 'decimal.js';

export const PRICING_CONFIG = {
  // Free delivery threshold in EGP
  FREE_SHIPPING_THRESHOLD_EGP: new Decimal(2000),
  // Standard shipping fee in EGP
  STANDARD_SHIPPING_FEE_EGP: new Decimal(75),
  // VAT Rate (14%)
  VAT_RATE: new Decimal(0.14),
  // Whether catalog prices include VAT
  PRICES_INCLUDE_VAT: true,
  // Currency code
  CURRENCY: 'EGP',
};

export interface CalculatedOrderPricing {
  subtotal: Decimal;
  discount: Decimal;
  shipping: Decimal;
  tax: Decimal;
  total: Decimal;
}

/**
 * Calculates authoritative order pricing using safe Decimal arithmetic.
 */
export function calculateAuthoritativePricing(
  subtotal: Decimal,
  discount: Decimal
): CalculatedOrderPricing {
  const safeSubtotal = Decimal.max(0, subtotal).toDecimalPlaces(2);
  const safeDiscount = Decimal.min(safeSubtotal, Decimal.max(0, discount)).toDecimalPlaces(2);
  const netSubtotal = safeSubtotal.minus(safeDiscount).toDecimalPlaces(2);

  const shipping = netSubtotal.greaterThanOrEqualTo(PRICING_CONFIG.FREE_SHIPPING_THRESHOLD_EGP) || netSubtotal.isZero()
    ? new Decimal(0)
    : PRICING_CONFIG.STANDARD_SHIPPING_FEE_EGP;

  // Informative VAT calculation (14% VAT included in price: subtotal * 14 / 114)
  const tax = PRICING_CONFIG.PRICES_INCLUDE_VAT
    ? netSubtotal.times(14).dividedBy(114).toDecimalPlaces(2)
    : netSubtotal.times(PRICING_CONFIG.VAT_RATE).toDecimalPlaces(2);

  // Total = net subtotal + shipping (since tax is inclusive)
  const total = netSubtotal.plus(shipping).toDecimalPlaces(2);

  return {
    subtotal: safeSubtotal,
    discount: safeDiscount,
    shipping,
    tax,
    total,
  };
}
