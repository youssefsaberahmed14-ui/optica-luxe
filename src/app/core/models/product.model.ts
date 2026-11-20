export type ProductCategory = 'sunglasses' | 'eyeglasses' | 'contact-lenses' | 'luxury-frames' | 'accessories';
export type FrameShape = 'aviator' | 'square' | 'round' | 'cat-eye' | 'hexagonal' | 'rectangle';
export type FrameMaterial = 'titanium' | 'acetate' | 'gold-plated' | 'metal' | 'carbon-fiber';
export type Gender = 'unisex' | 'men' | 'women';

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

export interface ProductColor {
  name: string;
  nameAr: string;
  code: string;
  image?: string;
}

export interface FrameDimensions {
  lensWidth: number; // in mm
  bridgeWidth: number; // in mm
  templeLength: number; // in mm
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  brand: string;
  brandAr: string;
  category: ProductCategory;
  categoryAr: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  thumbnail: string;
  colors: ProductColor[];
  selectedColor?: string;
  shape: FrameShape;
  shapeAr: string;
  material: FrameMaterial;
  materialAr: string;
  gender: Gender;
  genderAr: string;
  dimensions: FrameDimensions;
  descriptionAr: string;
  storyAr: string;
  featuresAr: string[];
  inStock: boolean;
  sku: string;
}

export interface FilterState {
  category?: ProductCategory | 'all';
  brand?: string | 'all';
  shape?: FrameShape | 'all';
  material?: FrameMaterial | 'all';
  gender?: Gender | 'all';
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  onlyDiscounted?: boolean;
  onlyNew?: boolean;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

