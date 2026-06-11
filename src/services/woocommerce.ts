/**
 * WooCommerce product and category service
 */

import type { Product, ProductGrade } from '../types/product';
import { config } from '../config/env';
import { buildQueryString } from '../utils/http';
import { roundPrice, calculatePriceTTC, calculateVATAmount } from '../utils/number';
import { stripHtmlTags, decodeHtmlEntities } from '../utils/string';

const WOO_API_URL = config.wooApiUrl;
const VAT_RATE = 0.2;

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
  parent: number;
  label: string;
  value: string;
}

export interface ProductListParams {
  page?: number;
  perPage?: number;
  search?: string;
  categoryIds?: number[];
  stockStatus?: 'instock' | 'outofstock' | null;
  orderby?: 'date' | 'price' | 'title';
  order?: 'asc' | 'desc';
}

export interface ProductListResult {
  products: Product[];
  total: number;
  totalPages: number;
}

/**
 * Extract attribute value by names (case-insensitive)
 */
function getAttributeValue(product: any, names: string[]): string {
  const attribute = product.attributes?.find((a: any) =>
    names.some((name) =>
      a.name?.toLowerCase().includes(name.toLowerCase())
    )
  );

  return attribute?.terms?.[0]?.name ?? attribute?.options?.[0] ?? '';
}

/**
 * Extract meta value by key
 */
function getMetaValue(product: any, key: string): string {
  const meta = product.meta_data?.find((m: any) => m.key === key);
  return meta?.value ?? '';
}

/**
 * Extract price from product (handles multiple price formats)
 */
function getWooPrice(product: any, field: 'price' | 'regular_price'): number {
  if (product.prices?.[field] !== undefined) {
    return roundPrice(Number(product.prices[field]) / 100);
  }

  if (field === 'price' && product.price !== undefined) {
    return roundPrice(Number(product.price));
  }

  if (field === 'regular_price' && product.regular_price !== undefined) {
    return roundPrice(Number(product.regular_price));
  }

  return 0;
}

/**
 * Map product grade code to display value
 */
function mapGrade(product: any): ProductGrade {
  const rawGrade = getAttributeValue(product, ['grade', 'état', 'etat', 'condition']);

  const gradeMap: Record<string, ProductGrade> = {
    N1: 'Neuf',
    R4: 'Reconditionné',
    G5: 'Grade B',
  };

  if (gradeMap[rawGrade]) return gradeMap[rawGrade];

  const standardGrades: ProductGrade[] = ['Grade A+', 'Grade A', 'Grade B', 'Grade C'];
  if (standardGrades.includes(rawGrade as ProductGrade)) return rawGrade as ProductGrade;

  return 'Non renseigné';
}

/**
 * Map condition status code to display label
 */
function mapConditionLabel(status?: string): string {
  if (!status) return 'Non renseigné';

  const normalizedStatus = status.trim().toUpperCase();
  const decodedStatus = decodeHtmlEntities(status).trim();

  const labels: Record<string, string> = {
    N1: 'Neuf',
    N2: 'Neuf',
    N3: 'Neuf',
    R4: 'Reconditionné',
    G5: 'Grade B',
    AS: 'As-is',
    W1: 'Reconditionné',
    W2: 'Reconditionné',
    D1: 'Déstockage',
    D2: 'Déstockage',
  };

  return (labels[normalizedStatus] ?? decodedStatus) || 'Non renseigné';
}

function buildSpecs(product: any) {
  if (!Array.isArray(product.attributes)) {
    return "";
  }

  return product.attributes
    .map((attribute: any) => {
      const attributeName = decodeHtmlEntities(attribute?.name).trim();

      const termValues = Array.isArray(attribute?.terms)
        ? attribute.terms
            .map((term: any) =>
              decodeHtmlEntities(
                typeof term === "string" ? term : term?.name
              ).trim()
            )
            .filter(Boolean)
        : [];

      const optionValues = Array.isArray(attribute?.options)
        ? attribute.options
            .map((option: unknown) =>
              decodeHtmlEntities(
                typeof option === "string" ? option : String(option)
              ).trim()
            )
            .filter(Boolean)
        : [];

      const values = termValues.length > 0 ? termValues : optionValues;

      if (!attributeName || values.length === 0) {
        return "";
      }

      return `${attributeName}: ${values.join(", ")}`;
    })
    .filter(Boolean)
    .join(" · ");
}

/**
 * Extract product specifications as concatenated string
 */
function extractSpecifications(product: any): string {
  return (
    product.attributes
      ?.map((a: any) => {
        const values =
          a.terms?.map((t: any) => t.name).join(', ') ||
          a.options?.join(', ') ||
          '';
        return values ? `${a.name}: ${values}` : '';
      })
      .filter(Boolean)
      .join(' · ') ?? ''
  );
}

/**
 * Check if product is in stock
 */
function isProductInStock(product: any): boolean {
  const stockCount = product.stock_quantity;
  return (
    product.is_in_stock === true ||
    product.stock_status === 'instock' ||
    (typeof stockCount === 'number' && stockCount > 0)
  );
}

/**
 * Transform WooCommerce product to internal Product type
 */
function mapWooProduct(product: any): Product {
  const priceHT = getWooPrice(product, 'price');
  const originalPriceHT = getWooPrice(product, 'regular_price') || priceHT;
  const priceTTC = calculatePriceTTC(priceHT, VAT_RATE);
  const vatAmount = calculateVATAmount(priceTTC, priceHT);
  const inStock = isProductInStock(product);
  const status = getAttributeValue(product, ['état', 'etat', 'status', 'condition']) ||
    getMetaValue(product, 'condition_status');

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    ean: getMetaValue(product, 'ean'),
    manufacturerPartNumber: getAttributeValue(product, [
      'référence constructeur',
      'reference constructeur',
      'manufacturer part number',
    ]) || getMetaValue(product, 'manufacturer_part_number'),
    price: priceHT,
    originalPrice: originalPriceHT,
    priceTTC,
    vatAmount,
    image: product.images?.[0]?.src || '/placeholder-product.png',
    images: product.images?.map((img: any) => img.src) ?? [],
    category: product.categories?.[0]?.name ?? 'Non classé',
    manufacturer:
      getAttributeValue(product, ['marque', 'manufacturer']) ||
      getMetaValue(product, 'manufacturer'),
    status,
    conditionLabel: mapConditionLabel(status),
    os:
      getAttributeValue(product, ['os', 'operating system']) ||
      getMetaValue(product, 'os'),
    productGroup:
      getAttributeValue(product, ['product group', 'groupe produit']) ||
      getMetaValue(product, 'product_group'),
    specs: extractSpecifications(product),
    grade: mapGrade(product),
    warranty: 'sur devis',
    description: stripHtmlTags(product.description ?? product.short_description ?? ''),
    stock: inStock,
    stockCount: product.stock_quantity,
    availability: inStock ? 'En stock' : 'Rupture de stock',
    incomingQuantity: Number(getMetaValue(product, 'incoming_quantity')) || undefined,
    incomingDate: getMetaValue(product, 'incoming_date') || undefined,
  };
}

/**
 * List products with filters and pagination
 */
export async function listProducts({
  page = 1,
  perPage = 20,
  search = '',
  categoryIds = [],
  stockStatus = null,
  orderby,
  order,
}: ProductListParams = {}): Promise<ProductListResult> {
  try {
    const params = buildQueryString({
      per_page: perPage,
      page,
      ...(search && { search }),
      ...(categoryIds.length > 0 && { category: categoryIds }),
      ...(stockStatus && { stock_status: stockStatus }),
      ...(orderby && { orderby }),
      ...(order && { order }),
    });

    const response = await fetch(`${WOO_API_URL}/products?${params}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch products page ${page}`);
    }

    const data = await response.json();
    const products: Product[] = Array.isArray(data) ? data.map(mapWooProduct) : [];
    const total = Number(response.headers.get('X-WP-Total') ?? data.length ?? 0);
    const totalPages = Number(response.headers.get('X-WP-TotalPages') ?? 1);

    return {
      products: products,
      total: Number.isFinite(total) ? total : products.length,
      totalPages:
        Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(`${WOO_API_URL}/products?slug=${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch product`);
    }

    const data = await response.json();
    return data.length > 0 ? mapWooProduct(data[0]) : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

/**
 * List product categories
 */
export async function listCategories(): Promise<WooCategory[]> {
  try {
    const params = buildQueryString({
      per_page: 100,
      hide_empty: true,
      orderby: 'name',
    });

    const response = await fetch(`${WOO_API_URL}/products/categories?${params}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch categories`);
    }

    const data = await response.json();

    return data.map((cat: any) => {
      const name = decodeHtmlEntities(cat.name);
      return {
        id: cat.id,
        name,
        slug: cat.slug,
        count: cat.count,
        parent: Number(cat.parent ?? 0),
        label: name,
        value: name,
      };
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}
