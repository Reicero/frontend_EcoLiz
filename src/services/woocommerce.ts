import type { Product } from "../types/product";

const WOO_API_URL =
  (import.meta as any).env.VITE_WOO_API_URL ?? "/wp-api/wc/store";

function mapWooProduct(product: any): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.prices?.price ?? 0) / 100,
    originalPrice:
      Number(product.prices?.regular_price ?? product.prices?.price ?? 0) / 100,
    image: product.images?.[0]?.src ?? "",
    category: product.categories?.[0]?.name ?? "Non classé",
    description: product.short_description ?? product.description ?? "",
    specs: product.attributes?.map((a: any) => a.terms?.map((t: any) => t.name).join(", ")).join(" · ") ?? "",
    grade: product.attributes?.find((a: any) => a.name?.toLowerCase().includes("grade"))?.terms?.[0]?.name ?? "",
    warranty: product.attributes?.find((a: any) => a.name?.toLowerCase().includes("garantie"))?.terms?.[0]?.name ?? "",
    stock: product.is_in_stock,
    stockCount: product.low_stock_remaining ?? undefined,
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
  window.location.href = `${(import.meta as any).env.VITE_WORDPRESS_URL}/?add-to-cart=${productId}&quantity=${quantity}`;
}

export async function listCategories() {
  const res = await fetch(`${WOO_API_URL}/products/categories`)

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des catégories WooCommerce")
  }

  const data = await res.json()

  return [
    { label: "Tous", value: "Tous" },
    ...data.map((cat: any) => ({
      label: cat.name,
      value: cat.name,
    })),
  ]
}

export const woocommerceEndpoint = WOO_API_URL;