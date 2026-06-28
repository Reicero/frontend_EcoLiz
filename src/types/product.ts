export type ProductGrade =
  | "Grade A+"
  | "Grade A"
  | "Grade B"
  | "Grade C"
  | "Neuf"
  | "Reconditionné"
  | "Non renseigné";

export type ProductCategory = string;

export type ProductAvailability =
  | "En stock"
  | "Rupture de stock"
  | "En réapprovisionnement";

export interface ProductAttribute {
  name: string;
  values: string[];
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  specs: string;

  // Identifiants
  sku?: string;
  ean?: string;
  manufacturerPartNumber?: string;

  // Prix
  price: number; // prix HT
  originalPrice: number;
  priceTTC?: number;
  vatAmount?: number;

  // Images
  image: string;
  images?: string[];

  // Infos produit
  grade: ProductGrade;
  stock: boolean;
  stockCount?: number;
  availability?: ProductAvailability;

  category: ProductCategory;
  manufacturer?: string;
  status?: string;
  conditionLabel?: string;
  productGroup?: string;
  os?: string;
  keyboardLanguage?: string;

  warranty: string;
  description?: string;
  features?: string[];

  // Attributs structurés utilisés sur la fiche technique
  attributes?: ProductAttribute[];

  // Réapprovisionnement
  incomingQuantity?: number;
  incomingDate?: string;
}
