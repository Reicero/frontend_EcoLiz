import type { Product } from '../types/product';

export const mockProducts: Product[] = [
{
  id: 1,
  slug: 'macbook-pro-14-m1-pro',
  name: 'MacBook Pro 14" M1 Pro',
  specs: '16Go RAM · 512Go SSD · 2021',
  price: 1290,
  originalPrice: 2249,
  image:
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
  grade: 'Grade A',
  stock: true,
  stockCount: 12,
  category: 'Ordinateurs portables',
  warranty: '24 mois',
  description:
  'Le MacBook Pro 14" avec puce M1 Pro offre des performances exceptionnelles pour les créatifs et professionnels. Reconditionné selon nos standards les plus stricts.',
  features: [
  'Écran Liquid Retina XDR 14"',
  'Puce Apple M1 Pro 10 cœurs',
  '16 Go de mémoire unifiée',
  'SSD 512 Go',
  "Autonomie jusqu'à 17h"]

},
{
  id: 2,
  slug: 'dell-latitude-7420',
  name: 'Dell Latitude 7420',
  specs: 'Core i7 · 16Go RAM · 512Go SSD',
  price: 650,
  originalPrice: 1450,
  image:
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800',
  grade: 'Grade A+',
  stock: true,
  stockCount: 28,
  category: 'Ordinateurs portables',
  warranty: '24 mois',
  description:
  'Ordinateur portable professionnel ultra-fiable. Idéal pour la mobilité des équipes en entreprise.',
  features: [
  'Intel Core i7-1185G7',
  '16 Go RAM DDR4',
  'SSD NVMe 512 Go',
  'Écran 14" Full HD',
  "Lecteur d'empreintes"]

},
{
  id: 3,
  slug: 'lenovo-thinkpad-t14',
  name: 'Lenovo ThinkPad T14',
  specs: 'Ryzen 7 · 16Go RAM · 512Go SSD',
  price: 590,
  originalPrice: 1390,
  image:
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800',
  grade: 'Grade A',
  stock: true,
  stockCount: 18,
  category: 'Ordinateurs portables',
  warranty: '24 mois'
},
{
  id: 4,
  slug: 'ecran-dell-ultrasharp-27',
  name: 'Écran Dell UltraSharp 27"',
  specs: '4K UHD · USB-C · IPS',
  price: 320,
  originalPrice: 650,
  image:
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
  grade: 'Grade A',
  stock: true,
  stockCount: 22,
  category: 'Écrans',
  warranty: '24 mois'
},
{
  id: 5,
  slug: 'mac-mini-m1',
  name: 'Mac mini M1',
  specs: '8Go RAM · 256Go SSD · 2020',
  price: 450,
  originalPrice: 799,
  image:
  'https://images.unsplash.com/photo-1618424181497-157f25b6ce5e?auto=format&fit=crop&q=80&w=800',
  grade: 'Grade A+',
  stock: false,
  category: 'Postes fixes',
  warranty: '24 mois'
},
{
  id: 6,
  slug: 'serveur-hp-proliant-dl380',
  name: 'Serveur HP ProLiant DL380',
  specs: 'Gen10 · 2x Xeon · 64Go RAM',
  price: 1850,
  originalPrice: 4500,
  image:
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
  grade: 'Grade B',
  stock: true,
  stockCount: 4,
  category: 'Serveurs',
  warranty: '12 mois'
}];


export const productCategories: {
  label: string;
  value: 'Tous' | Product['category'];
}[] = [
{ label: 'Tous', value: 'Tous' },
{ label: 'Ordinateurs portables', value: 'Ordinateurs portables' },
{ label: 'Postes fixes', value: 'Postes fixes' },
{ label: 'Écrans', value: 'Écrans' },
{ label: 'Serveurs', value: 'Serveurs' },
{ label: 'Accessoires', value: 'Accessoires' }];