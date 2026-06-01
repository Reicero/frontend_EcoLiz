import type { Product, ProductGrade } from "../types/product";
import { config } from "../config/env";

const WOO_API_URL = config.wooApiUrl.replace(/\/+$/, "");

// Ici on part sur TVA 20%.
const VAT_RATE = 0.2;

function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}

function cleanHtml(value: string) {
  return value?.replace(/<[^>]*>/g, "").trim() ?? "";
}

function getAttributeValue(product: any, names: string[]) {
  const attribute = product.attributes?.find((a: any) =>
    names.some((name) => a.name?.toLowerCase().includes(name.toLowerCase()))
  );

  return (
    attribute?.terms?.[0]?.name ??
    attribute?.options?.[0] ??
    ""
  );
}

function mapGrade(product: any): ProductGrade {
  const rawGrade = getAttributeValue(product, ["grade", "état", "etat"]);

  if (rawGrade === "N1") return "Neuf";
  if (rawGrade === "R4") return "Reconditionné";
  if (rawGrade === "G5") return "Grade B";

  if (rawGrade === "Grade A+" || rawGrade === "Grade A" || rawGrade === "Grade B" || rawGrade === "Grade C") {
    return rawGrade;
  }

  return "Non renseigné";
}

function mapWooProduct(product: any): Product {
  // Dans ton cas, ce prix doit correspondre au prix HT venant de WooCommerce.
  const priceHT = Number(product.prices?.price ?? product.price ?? 0) / 100;

  const originalPriceHT =
    Number(product.prices?.regular_price ?? product.prices?.price ?? product.regular_price ?? 0) / 100;

  const priceTTC = roundPrice(priceHT * (1 + VAT_RATE));
  const vatAmount = roundPrice(priceTTC - priceHT);

  const stockCount =
    product.stock_quantity ??
    product.low_stock_remaining ??
    undefined;

  const isInStock =
    product.is_in_stock === true ||
    product.stock_status === "instock" ||
    (typeof stockCount === "number" && stockCount > 0);

  const image =
    product.images?.[0]?.src ||
    "/placeholder-product.png";

  const description = cleanHtml(
    product.short_description ?? product.description ?? ""
  );

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,

    price: priceHT,
    originalPrice: originalPriceHT,
    priceTTC,
    vatAmount,

    image,
    images: product.images?.map((img: any) => img.src) ?? [],

    category: product.categories?.[0]?.name ?? "Non classé",
    description,

    specs:
      product.attributes
        ?.map((a: any) => {
          const values =
            a.terms?.map((t: any) => t.name).join(", ") ||
            a.options?.join(", ") ||
            "";

          return values ? `${a.name}: ${values}` : "";
        })
        .filter(Boolean)
        .join(" · ") ?? "",

    grade: mapGrade(product),

    warranty: "Garantie : sur devis",

    stock: isInStock,
    stockCount,

    availability: isInStock ? "En stock" : "Rupture de stock",
  };
}

export async function listProducts(): Promise<Product[]> {
  try {
    const perPage = 100;
    let page = 1;
    let totalPages = 1;
    const allProducts: any[] = [];

    do {
      const res = await fetch(
        `${WOO_API_URL}/products?per_page=${perPage}&page=${page}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch products page ${page}`);
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        allProducts.push(...data);
      }

      const totalPagesHeader = res.headers.get("X-WP-TotalPages");
      totalPages = totalPagesHeader ? Number(totalPagesHeader) : 1;

      page++;
    } while (page <= totalPages);

    return allProducts.map(mapWooProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${WOO_API_URL}/products?slug=${slug}`);

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
    const res = await fetch(`${WOO_API_URL}/products/categories`);

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