/**
 * Optica Luxe — Client Pricing & Shipping Configuration
 * Matches authoritative server-side rules in backend/src/config/pricing.config.ts
 */
export const PRICING_CONFIG = {
  // Free delivery threshold in EGP
  FREE_SHIPPING_THRESHOLD_EGP: 2000,
  // Standard shipping fee in EGP
  STANDARD_SHIPPING_FEE_EGP: 75,
  // 14% VAT (Law 67/2016)
  VAT_RATE: 0.14,
  // Optical consumer prices in Egypt are VAT-inclusive
  PRICES_INCLUDE_VAT: true,
  // Currency code
  CURRENCY: 'EGP',
  CURRENCY_AR: 'ج.م',
};
