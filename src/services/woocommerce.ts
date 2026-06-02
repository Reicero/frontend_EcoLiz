import type { Product, ProductGrade } from "../types/product";
import { config } from "../config/env";

const WOO_API_URL = config.wooApiUrl.replace(/\/+$/, "");

// TVA 20%
const VAT_RATE = 0.2;

export type WooCategory = {
  id: number;
  name: string;
  slug: string;
  count?: number;
  label: string;
  value: string;
};

export type ProductListParams = {
  page?: number;
  perPage?: number;
  search?: string;
  categoryIds?: number[];
  stockStatus?: "instock" | "outofstock" | null;
};

export type ProductListResult = {
  products: Product[];
  total: number;
  totalPages: number;
};

function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}

function cleanHtml(value: string) {
  return value?.replace(/<[^>]*>/g, "").trim() ?? "";
}

function getWooPrice(product: any, field: "price" | "regular_price") {
  if (product.prices?.[field] !== undefined) {
    return Number(product.prices[field]) / 100;
  }

  if (field === "price" && product.price !== undefined) {
    return Number(product.price);
  }

  if (field === "regular_price" && product.regular_price !== undefined) {
    return Number(product.regular_price);
  }

  return 0;
}

function getAttributeValue(product: any, names: string[]) {
  const attribute = product.attributes?.find((a: any) =>
    names.some((name) =>
      a.name?.toLowerCase().includes(name.toLowerCase())
    )
  );

  return attribute?.terms?.[0]?.name ?? attribute?.options?.[0] ?? "";
}

function getMetaValue(product: any, key: string) {
  const meta = product.meta_data?.find((m: any) => m.key === key);
  return meta?.value ?? "";
}

function mapGrade(product: any): ProductGrade {
  const rawGrade = getAttributeValue(product, [
    "grade",
    "état",
    "etat",
    "condition",
  ]);

  if (rawGrade === "N1") return "Neuf";
  if (rawGrade === "R4") return "Reconditionné";
  if (rawGrade === "G5") return "Grade B";

  if (
    rawGrade === "Grade A+" ||
    rawGrade === "Grade A" ||
    rawGrade === "Grade B" ||
    rawGrade === "Grade C"
  ) {
    return rawGrade;
  }

  return "Non renseigné";
}

function mapConditionLabel(status?: string) {
  if (!status) return "Non renseigné";

  const labels: Record<string, string> = {
    N1: "Neuf",
    N2: "Neuf",
    N3: "Neuf",
    R4: "Reconditionné",
    G5: "Grade B",
    AS: "As-is",
    W1: "Reconditionné",
    W2: "Reconditionné",
    D1: "Déstockage",
    D2: "Déstockage",
  };

  return labels[status] ?? status;
}

function mapWooProduct(product: any): Product {
  const priceHT = getWooPrice(product, "price");
  const originalPriceHT = getWooPrice(product, "regular_price") || priceHT;

  const priceTTC = roundPrice(priceHT * (1 + VAT_RATE));
  const vatAmount = roundPrice(priceTTC - priceHT);

  const stockCount = product.stock_quantity ?? undefined;

  const isInStock =
    product.is_in_stock === true ||
    product.stock_status === "instock" ||
    (typeof stockCount === "number" && stockCount > 0);

  const image = product.images?.[0]?.src || "/placeholder-product.png";

  const description = cleanHtml(
    product.description ?? product.short_description ?? ""
  );

  const manufacturer =
    getAttributeValue(product, ["marque", "manufacturer"]) ||
    getMetaValue(product, "manufacturer");

  const status =
    getAttributeValue(product, ["état", "etat", "status", "condition"]) ||
    getMetaValue(product, "condition_status");

  const os =
    getAttributeValue(product, ["os", "operating system"]) ||
    getMetaValue(product, "os");

  const productGroup =
    getAttributeValue(product, ["product group", "groupe produit"]) ||
    getMetaValue(product, "product_group");

  const manufacturerPartNumber =
    getAttributeValue(product, [
      "référence constructeur",
      "reference constructeur",
      "manufacturer part number",
    ]) || getMetaValue(product, "manufacturer_part_number");

  const ean = getMetaValue(product, "ean");

  const specs =
    product.attributes
      ?.map((a: any) => {
        const values =
          a.terms?.map((t: any) => t.name).join(", ") ||
          a.options?.join(", ") ||
          "";

        return values ? `${a.name}: ${values}` : "";
      })
      .filter(Boolean)
      .join(" · ") ?? "";

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,

    sku: product.sku,
    ean,
    manufacturerPartNumber,

    price: priceHT,
    originalPrice: originalPriceHT,
    priceTTC,
    vatAmount,

    image,
    images: product.images?.map((img: any) => img.src) ?? [],

    category: product.categories?.[0]?.name ?? "Non classé",
    manufacturer,
    status,
    conditionLabel: mapConditionLabel(status),
    os,
    productGroup,

    specs,

    grade: mapGrade(product),
    warranty: "sur devis",
    description,

    stock: isInStock,
    stockCount,

    availability: isInStock ? "En stock" : "Rupture de stock",

    incomingQuantity:
      Number(getMetaValue(product, "incoming_quantity")) || undefined,
    incomingDate: getMetaValue(product, "incoming_date") || undefined,
  };
}

export async function listProducts({
  page = 1,
  perPage = 20,
  search = "",
  categoryIds = [],
  stockStatus = null,
}: ProductListParams = {}): Promise<ProductListResult> {
  try {
    const params = new URLSearchParams({
      per_page: String(perPage),
      page: String(page),
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (categoryIds.length > 0) {
      params.set("category", categoryIds.join(","));
    }

    if (stockStatus) {
      params.set("stock_status", stockStatus);
    }

    const res = await fetch(`${WOO_API_URL}/products?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(
        `HTTP ${res.status}: Failed to fetch products page ${page}`
      );
    }

    const data = await res.json();

    const total = Number(res.headers.get("X-WP-Total") ?? data.length ?? 0);
    const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? 1);

    return {
      products: Array.isArray(data) ? data.map(mapWooProduct) : [],
      total,
      totalPages: Math.max(1, totalPages),
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${WOO_API_URL}/products?slug=${slug}`, {
      cache: "no-store",
    });

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

export async function listCategories(): Promise<WooCategory[]> {
  try {
    const res = await fetch(
      `${WOO_API_URL}/products/categories?per_page=100`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch categories`);
    }

    const data = await res.json();

    return data.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: cat.count,
      label: cat.name,
      value: cat.name,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}