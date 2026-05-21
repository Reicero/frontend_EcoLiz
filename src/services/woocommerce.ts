import type { Product } from "../types/product";
import { config } from "../config/env";

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
  try {
    const res = await fetch(`${config.wooApiUrl}/products`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch products`);
    }

    const data = await res.json();
    return (Array.isArray(data) ? data : []).map(mapWooProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${config.wooApiUrl}/products?slug=${slug}`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch product`);
    }

    const data = await res.json();
    return data.length > 0 ? mapWooProduct(data[0]) : null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

export async function listCategories() {
  try {
    const res = await fetch(`${config.wooApiUrl}/products/categories`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch categories`);
    }

    const data = await res.json();

    return [
      { label: "Tous", value: "Tous" },
      ...data.map((cat: any) => ({
        label: cat.name,
        value: cat.name,
      })),
    ];
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}
