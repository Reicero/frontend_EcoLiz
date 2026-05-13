export type ProductGrade = 'Grade A+' | 'Grade A' | 'Grade B' | 'Grade C';

export type ProductCategory =
'Ordinateurs portables' |
'Postes fixes' |
'Écrans' |
'Serveurs' |
'Non classé' |
'Accessoires';

export interface Product {
  id: number;
  slug: string;
  name: string;
  specs: string;
  price: number;
  originalPrice: number;
  image: string;
  images?: string[];
  grade: ProductGrade;
  stock: boolean;
  stockCount?: number;
  category: ProductCategory;
  warranty: string;
  description?: string;
  features?: string[];
}