export type ProductGrade =
  | 'Grade A+'
  | 'Grade A'
  | 'Grade B'
  | 'Grade C'
  | 'Neuf'
  | 'Reconditionné'
  | 'Non renseigné';

export type ProductCategory = string;

export type ProductAvailability =
  | 'En stock'
  | 'Rupture de stock'
  | 'En réapprovisionnement';

export interface Product {
  id: number;
  slug: string;
  name: string;
  specs: string;

  price: number; // prix HT
  originalPrice: number;
  priceTTC?: number;
  vatAmount?: number;

  image: string;
  images?: string[];

  grade: ProductGrade;
  stock: boolean;
  stockCount?: number;
  availability?: ProductAvailability;

  category: ProductCategory;
  warranty: string;
  description?: string;
  features?: string[];

  incomingQuantity?: number;
  incomingDate?: string;
}