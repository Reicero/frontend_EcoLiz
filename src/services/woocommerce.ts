import type { Product } from "../types/product";

const WOO_API_URL =
  (import.meta as any).env?.VITE_WOO_API_URL ?? "/wp-api/wc/store";
  "";

function mapWooProduct(product: any): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.prices?.price ?? 0) / 100,
    originalPrice: Number(product.prices?.regular_price ?? product.prices?.price ?? 0) / 100,
    image: product.images?.[0]?.src ?? "",
    category: product.categories?.[0]?.name ?? "Non classé",
    description: product.short_description ?? product.description ?? "",
    specs: product.specs ?? "",
    grade: product.grade ?? "",
    warranty: product.warranty ?? "",
    stock: product.stock_availability?.text ?? "",
  };
}

export async function listProducts(): Promise<Product[]> {
  const res = await fetch(`${WOO_API_URL}/products`);

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des produits WooCommerce");
  }

  const data = await res.json();
  return data.map(mapWooProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const res = await fetch(`${WOO_API_URL}/products?slug=${slug}`);

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération du produit WooCommerce");
  }

  const data = await res.json();
  return data.length > 0 ? mapWooProduct(data[0]) : null;
}

export async function addToCart(productId: number, quantity = 1) {
  console.info("[woocommerce] addToCart à brancher plus tard", {
    productId,
    quantity,
  });

  return { ok: true };
}

export const woocommerceEndpoint = WOO_API_URL;