import { Product, ProductColor } from './product.model';

export interface CartItem {
  id: string; // unique item id (e.g. productId_colorCode_lensType)
  productId: string;
  product: Product;
  quantity: number;
  selectedColor: ProductColor;
  lensOption?: LensOption;
  customPrescription?: PrescriptionDetails;
  price: number;
  total: number;
}

export interface LensOption {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  descriptionAr: string;
}

export interface PrescriptionDetails {
  rightEyeOD?: string;
  leftEyeOS?: string;
  pupillaryDistancePD?: string;
}

export interface CartSummary {
  subtotal: number;
  discountAmount: number;
  shipping: number;
  taxAmount: number;
  total: number;
  appliedCoupon?: string;
  couponDiscountPercent?: number;
}

