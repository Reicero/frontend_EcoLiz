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

export interface Product {
  id: number;
  slug: string;
  name: string;
  specs: string;

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
  warranty: string;
  description?: string;
  features?: string[];

  // Réapprovisionnement
  incomingQuantity?: number;
  incomingDate?: string;
}