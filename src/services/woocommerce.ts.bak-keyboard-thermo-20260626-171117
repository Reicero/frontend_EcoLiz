import type { Product, ProductAttribute, ProductGrade } from "../types/product";
import { config } from "../config/env";
import {
  calculatePriceTTC,
  calculateVATAmount,
  roundPrice,
} from "../utils/number";
import { stripHtmlTags } from "../utils/string";

const WOO_API_URL = config.wooApiUrl.replace(/\/+$/, "");
const VAT_RATE = 0.2;

export type ProductFilterKey =
  | "brand"
  | "condition"
  | "os"
  | "cpu"
  | "cpuModel"
  | "cpuGeneration"
  | "cpuCores"
  | "ram"
  | "ramType"
  | "storage"
  | "storageType"
  | "diskFormat"
  | "gpu"
  | "gpuModel"
  | "screen"
  | "resolution"
  | "panelTechnology"
  | "touchscreen"
  | "connectivity"
  | "vesa"
  | "webcam"
  | "equipmentType"
  | "ports"
  | "networkPortType"
  | "speed"
  | "poe"
  | "switchManagement"
  | "serverType"
  | "raidController"
  | "wifiStandard"
  | "wifiEquipmentType"
  | "licenseEditor"
  | "keyboardLanguage"
  | "licenseType";

export type SelectedProductFilters = Partial<
  Record<ProductFilterKey, string[]>
>;

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
  parent: number;
  label: string;
  value: string;
}

export interface WooFilterOption {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WooFilterGroup {
  key: ProductFilterKey;
  title: string;
  taxonomy: string;
  options: WooFilterOption[];
}

export interface ProductListParams {
  page?: number;
  perPage?: number;
  search?: string;
  categoryIds?: number[];
  stockStatus?: "instock" | "outofstock" | null;
  onSale?: boolean;
  orderby?: "date" | "price" | "title";
  order?: "asc" | "desc";
  attributeFilters?: SelectedProductFilters;
}

export interface ProductListResult {
  products: Product[];
  total: number;
  totalPages: number;
}

type WooAttribute = {
  id: number;
  name: string;
  taxonomy: string;
};

type WooAttributeTerm = {
  id: number;
  name: string;
  slug: string;
  count?: number;
};

const FILTER_ATTRIBUTE_CONFIG: Array<{
  key: ProductFilterKey;
  title: string;
  attributeName: string;
  attributeAliases?: string[];
}> = [
  { key: "brand", title: "Marque", attributeName: "Marque" },
  {
    key: "keyboardLanguage",
    title: "Clavier",
    attributeName: "Langue du clavier",
    attributeAliases: [
      "Langue clavier",
      "Disposition clavier",
      "Clavier",
      "Keyboard",
      "Keyboard layout",
      "Keyboard language",
    ],
  },
  { key: "condition", title: "État", attributeName: "État" },
  { key: "os", title: "OS", attributeName: "OS" },

  { key: "cpu", title: "Processeur", attributeName: "Processeur" },
  {
    key: "cpuModel",
    title: "Modèle CPU",
    attributeName: "Modèle processeur",
  },
  {
    key: "cpuGeneration",
    title: "Génération CPU",
    attributeName: "Génération processeur",
  },
  {
    key: "cpuCores",
    title: "Cœurs",
    attributeName: "Nombre de cœurs",
  },

  { key: "ram", title: "RAM", attributeName: "RAM" },
  { key: "ramType", title: "Type de RAM", attributeName: "Type de RAM" },

  { key: "storage", title: "Stockage", attributeName: "Stockage" },
  {
    key: "storageType",
    title: "Type de stockage",
    attributeName: "Type de stockage",
  },
  {
    key: "diskFormat",
    title: "Format de disque",
    attributeName: "Format de disque",
  },

  {
    key: "gpu",
    title: "GPU",
    attributeName: "Carte graphique",
  },
  {
    key: "gpuModel",
    title: "Modèle GPU",
    attributeName: "Modèle carte graphique",
  },

  { key: "screen", title: "Écran", attributeName: "Taille écran" },
  { key: "resolution", title: "Résolution", attributeName: "Résolution" },
  {
    key: "panelTechnology",
    title: "Dalle",
    attributeName: "Technologie de dalle",
  },
  {
    key: "touchscreen",
    title: "Écran tactile",
    attributeName: "Écran tactile",
  },
  {
    key: "connectivity",
    title: "Connectique",
    attributeName: "Connectique",
  },
  { key: "vesa", title: "VESA", attributeName: "Compatible VESA" },
  {
    key: "webcam",
    title: "Webcam",
    attributeName: "Webcam intégrée",
  },

  {
    key: "equipmentType",
    title: "Type d’équipement",
    attributeName: "Type d’équipement",
  },
  {
    key: "ports",
    title: "Nombre de ports",
    attributeName: "Nombre de ports",
  },
  {
    key: "networkPortType",
    title: "Type de port réseau",
    attributeName: "Type de port réseau",
  },
  {
    key: "speed",
    title: "Débit réseau",
    attributeName: "Débit réseau",
  },
  { key: "poe", title: "PoE", attributeName: "PoE" },
  {
    key: "switchManagement",
    title: "Administration réseau",
    attributeName: "Administration réseau",
  },

  {
    key: "serverType",
    title: "Type de serveur",
    attributeName: "Type de serveur",
  },
  {
    key: "raidController",
    title: "Contrôleur RAID",
    attributeName: "Contrôleur RAID",
  },

  {
    key: "wifiStandard",
    title: "Norme Wi-Fi",
    attributeName: "Norme Wi-Fi",
  },
  {
    key: "wifiEquipmentType",
    title: "Type d’équipement Wi-Fi",
    attributeName: "Type d’équipement Wi-Fi",
  },


  {
    key: "licenseEditor",
    title: "Éditeur de licence",
    attributeName: "Éditeur de licence",
  },
  {
    key: "licenseType",
    title: "Type de licence",
    attributeName: "Type de licence",
  },
];

let filterGroupsPromise: Promise<WooFilterGroup[]> | null = null;

function normalizeLookupValue(value: unknown) {
  return decodeHtmlEntities(value)
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'")
    .trim();
}

function decodeHtmlEntities(value: unknown) {
  let result = String(value ?? "");

  const namedEntities: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    "#039": "'",
    nbsp: " ",
    rsquo: "’",
    lsquo: "‘",
    rdquo: "”",
    ldquo: "“",
    ndash: "–",
    mdash: "—",
    hellip: "…",
    laquo: "«",
    raquo: "»",
    times: "×",
    prime: "′",
    Prime: "″",
    eacute: "é",
    egrave: "è",
    ecirc: "ê",
    agrave: "à",
    ugrave: "ù",
    ccedil: "ç",
  };

  for (let pass = 0; pass < 4; pass += 1) {
    const previousResult = result;

    result = result
      .replace(/&#x([0-9a-f]+);/gi, (_, hexadecimal: string) =>
        String.fromCodePoint(Number.parseInt(hexadecimal, 16))
      )
      .replace(/&#(\d+);/g, (_, decimal: string) =>
        String.fromCodePoint(Number.parseInt(decimal, 10))
      )
      .replace(/&([a-zA-Z0-9#]+);/g, (match, entity: string) => {
        return namedEntities[entity] ?? match;
      });

    if (result === previousResult) {
      break;
    }
  }

  return result;
}

function normalizeWooImageUrl(value: unknown) {
  const imageUrl = decodeHtmlEntities(value).trim();

  if (!imageUrl) {
    return "";
  }

  return imageUrl.replace(
    /^https?:\/\/90\.51\.128\.107:12443/i,
    ""
  );
}
async function fetchJson<T>(url: string): Promise<{
  data: T;
  response: Response;
}> {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();

    throw new Error(
      `HTTP ${response.status} pendant l’appel WooCommerce : ${details}`
    );
  }

  return {
    data: (await response.json()) as T,
    response,
  };
}

function getAttributeValue(product: any, names: string[]): string {
  if (!Array.isArray(product.attributes)) {
    return "";
  }

  const normalizedNames = names.map(normalizeLookupValue);

  const attribute = product.attributes.find((item: any) => {
    const attributeName = normalizeLookupValue(item?.name);

    return normalizedNames.some((name) => attributeName.includes(name));
  });

  if (!attribute) {
    return "";
  }

  const term = attribute.terms?.[0];

  if (typeof term === "string") {
    return decodeHtmlEntities(term);
  }

  if (term?.name) {
    return decodeHtmlEntities(term.name);
  }

  return decodeHtmlEntities(attribute.options?.[0]);
}

function getMetaValue(product: any, key: string): string {
  const meta = product.meta_data?.find((item: any) => item?.key === key);
  return decodeHtmlEntities(meta?.value);
}

function getWooPrice(product: any, field: "price" | "regular_price"): number {
  const storeApiValue = product.prices?.[field];

  if (storeApiValue !== undefined && storeApiValue !== null) {
    const numericValue = Number(storeApiValue);
    const minorUnit = Number(product.prices?.currency_minor_unit ?? 2);

    return Number.isFinite(numericValue)
      ? roundPrice(numericValue / 10 ** minorUnit)
      : 0;
  }

  const restApiValue = Number(product[field]);

  return Number.isFinite(restApiValue) ? roundPrice(restApiValue) : 0;
}

function mapGrade(product: any): ProductGrade {
  const rawGrade = getAttributeValue(product, [
    "grade",
    "état",
    "etat",
    "condition",
  ]);

  const normalizedGrade = rawGrade.trim().toUpperCase();

  if (["N1", "N2", "N3"].includes(normalizedGrade)) return "Neuf";
  if (["R4", "W1", "W2"].includes(normalizedGrade)) {
    return "Reconditionné";
  }
  if (normalizedGrade === "G5") return "Grade B";

  const standardGrades: ProductGrade[] = [
    "Grade A+",
    "Grade A",
    "Grade B",
    "Grade C",
  ];

  return standardGrades.includes(rawGrade as ProductGrade)
    ? (rawGrade as ProductGrade)
    : "Non renseigné";
}

function mapConditionLabel(status?: string): string {
  const decodedStatus = decodeHtmlEntities(status).trim();

  if (!decodedStatus) return "Non renseigné";

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

  return labels[decodedStatus.toUpperCase()] ?? decodedStatus;
}

function extractProductAttributes(product: any): ProductAttribute[] {
  if (!Array.isArray(product.attributes)) {
    return [];
  }

  return product.attributes
    .map((attribute: any) => {
      const name = decodeHtmlEntities(attribute?.name).trim();

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
            .map((option: unknown) => decodeHtmlEntities(option).trim())
            .filter(Boolean)
        : [];

      const values = termValues.length > 0 ? termValues : optionValues;

      return {
        name,
        values: Array.from(new Set(values)),
      };
    })
    .filter(
      (attribute: { name: string; values: string[] }) =>
        Boolean(attribute.name) && attribute.values.length > 0
    );
}

function extractSpecifications(product: any): string {
  return extractProductAttributes(product)
    .map((attribute: ProductAttribute) =>
      `${attribute.name}: ${attribute.values.join(", ")}`
    )
    .join(" · ");
}

function cleanProductDisplayName(value: unknown) {
  return decodeHtmlEntities(value)
    .replace(/\s+/g, " ")
    .replace(/^HP Inc\b/i, "HP")
    .replace(/^Hewlett[- ]Packard\b/i, "HP")
    .replace(/^Meraki Cisco Meraki\b/i, "Cisco Meraki")
    .replace(/^Cisco Cisco\b/i, "Cisco")
    .replace(/^HP HP\b/i, "HP")
    .trim();
}

function getMostSpecificCategoryName(product: any) {
  if (!Array.isArray(product.categories) || product.categories.length === 0) {
    return "Non classé";
  }

  const lastCategory = product.categories[product.categories.length - 1];

  return decodeHtmlEntities(lastCategory?.name ?? "Non classé");
}

function isProductInStock(product: any): boolean {
  const stockCount = product.stock_quantity;

  return (
    product.is_in_stock === true ||
    product.stock_status === "instock" ||
    (typeof stockCount === "number" && stockCount > 0)
  );
}

function mapWooProduct(product: any): Product {
  const priceHT = getWooPrice(product, "price");
  const originalPriceHT = getWooPrice(product, "regular_price") || priceHT;
  const priceTTC = calculatePriceTTC(priceHT, VAT_RATE);
  const vatAmount = calculateVATAmount(priceTTC, priceHT);
  const inStock = isProductInStock(product);

  const status =
    getAttributeValue(product, ["état", "etat", "status", "condition"]) ||
    getMetaValue(product, "condition_status");

  return {
    id: Number(product.id),
    name: cleanProductDisplayName(product.name),
    slug: decodeHtmlEntities(product.slug),
    sku: decodeHtmlEntities(product.sku),

    ean: getMetaValue(product, "ean"),
    manufacturerPartNumber:
      getAttributeValue(product, [
        "référence constructeur",
        "reference constructeur",
        "manufacturer part number",
      ]) || getMetaValue(product, "manufacturer_part_number"),

    price: priceHT,
    originalPrice: originalPriceHT,
    priceTTC,
    vatAmount,

    image:
      normalizeWooImageUrl(product.images?.[0]?.src) ||
      "/placeholder-product.png",
    images: Array.isArray(product.images)
      ? product.images
          .map((image: any) => normalizeWooImageUrl(image?.src))
          .filter(Boolean)
      : [],

    category: getMostSpecificCategoryName(product),
    manufacturer:
      getAttributeValue(product, ["marque", "manufacturer"]) ||
      getMetaValue(product, "manufacturer"),
    status,
    conditionLabel: mapConditionLabel(status),
    os:
      getAttributeValue(product, ["os", "operating system"]) ||
      getMetaValue(product, "os"),
    productGroup:
      getAttributeValue(product, ["product group", "groupe produit"]) ||
      getMetaValue(product, "product_group"),

    specs: extractSpecifications(product),
    attributes: extractProductAttributes(product),
    grade: mapGrade(product),
    warranty: getMetaValue(product, "warranty") || "sur devis",
    description: decodeHtmlEntities(
      stripHtmlTags(product.description ?? product.short_description ?? "")
    ),

    stock: inStock,
    stockCount:
      typeof product.stock_quantity === "number"
        ? product.stock_quantity
        : undefined,
    availability: inStock ? "En stock" : "Rupture de stock",

    incomingQuantity:
      Number(getMetaValue(product, "incoming_quantity")) || undefined,
    incomingDate: getMetaValue(product, "incoming_date") || undefined,
  };
}

async function fetchAllAttributeTerms(
  attributeId: number
): Promise<WooFilterOption[]> {
  const params = new URLSearchParams({
    orderby: "name",
    order: "asc",
  });

  const { data } = await fetchJson<WooAttributeTerm[]>(
    `${WOO_API_URL}/products/attributes/${attributeId}/terms?${params}`
  );

  return (Array.isArray(data) ? data : [])
    .map((term) => ({
      id: Number(term.id),
      name: decodeHtmlEntities(term.name),
      slug: term.slug,
      count: Number(term.count ?? 0),
    }))
    .filter((term) => term.count > 0);
}

async function loadProductFilterGroups(): Promise<WooFilterGroup[]> {
  const { data } = await fetchJson<WooAttribute[]>(
    `${WOO_API_URL}/products/attributes`
  );

  const attributes = Array.isArray(data) ? data : [];

  const groups = await Promise.all(
    FILTER_ATTRIBUTE_CONFIG.map(async (configuration) => {
      const expectedNames = [
        configuration.attributeName,
        ...(configuration.attributeAliases ?? []),
      ].map(normalizeLookupValue);

      const attribute = attributes.find((item) =>
        expectedNames.includes(normalizeLookupValue(item.name))
      );

      if (!attribute) {
        return null;
      }

      const options = await fetchAllAttributeTerms(attribute.id);

      if (options.length === 0) {
        return null;
      }

      return {
        key: configuration.key,
        title: configuration.title,
        taxonomy: attribute.taxonomy,
        options,
      } satisfies WooFilterGroup;
    })
  );

  return groups.filter(
    (group): group is WooFilterGroup => group !== null
  );
}

export function listProductFilterGroups(): Promise<WooFilterGroup[]> {
  if (!filterGroupsPromise) {
    filterGroupsPromise = loadProductFilterGroups().catch((error) => {
      filterGroupsPromise = null;
      throw error;
    });
  }

  return filterGroupsPromise;
}

async function appendAttributeFilters(
  params: URLSearchParams,
  selectedFilters: SelectedProductFilters
) {
  const activeEntries = Object.entries(selectedFilters).filter(
    ([, slugs]) => Array.isArray(slugs) && slugs.length > 0
  ) as Array<[ProductFilterKey, string[]]>;

  if (activeEntries.length === 0) {
    return;
  }

  const filterGroups = await listProductFilterGroups();
  const groupsByKey = new Map(
    filterGroups.map((group) => [group.key, group])
  );

  let attributeIndex = 0;

  for (const [filterKey, selectedSlugs] of activeEntries) {
    const group = groupsByKey.get(filterKey);

    if (!group) {
      continue;
    }

    const selectedOptions = group.options.filter((option) =>
      selectedSlugs.includes(option.slug)
    );

    if (selectedOptions.length === 0) {
      continue;
    }

    params.set(
      `attributes[${attributeIndex}][attribute]`,
      group.taxonomy
    );

    params.set(
      `attributes[${attributeIndex}][slug]`,
      selectedOptions.map((option) => option.slug).join(",")
    );

    params.set(`attributes[${attributeIndex}][operator]`, "in");

    attributeIndex += 1;
  }

  if (attributeIndex > 1) {
    params.set("attribute_relation", "and");
  }
}

export async function listProducts({
  page = 1,
  perPage = 20,
  search = "",
  categoryIds = [],
  stockStatus = null,
  onSale = false,
  orderby,
  order,
  attributeFilters = {},
}: ProductListParams = {}): Promise<ProductListResult> {
  try {
    const safePage = Math.max(1, Math.floor(page));
    const safePerPage = Math.min(100, Math.max(1, Math.floor(perPage)));

    const params = new URLSearchParams({
      page: String(safePage),
      per_page: String(safePerPage),
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (categoryIds.length > 0) {
      params.set("category", categoryIds.join(","));
    }

    if (stockStatus) {
      params.set("stock_status[0]", stockStatus);
    }

    if (onSale) {
      params.set("on_sale", "true");
    }

    if (orderby) {
      params.set("orderby", orderby);
    }

    if (order) {
      params.set("order", order);
    }

    await appendAttributeFilters(params, attributeFilters);

    const { data, response } = await fetchJson<any[]>(
      `${WOO_API_URL}/products?${params}`
    );

    const products = Array.isArray(data) ? data.map(mapWooProduct) : [];
    const total = Number(
      response.headers.get("X-WP-Total") ?? products.length
    );
    const totalPages = Number(
      response.headers.get("X-WP-TotalPages") ?? 1
    );

    return {
      products,
      total: Number.isFinite(total) ? total : products.length,
      totalPages:
        Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error);
    throw error;
  }
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  try {
    const params = new URLSearchParams({
      slug: slug.trim(),
    });

    const { data } = await fetchJson<any[]>(
      `${WOO_API_URL}/products?${params}`
    );

    return Array.isArray(data) && data.length > 0
      ? mapWooProduct(data[0])
      : null;
  } catch (error) {
    console.error("Erreur lors de la récupération du produit :", error);
    throw error;
  }
}

export async function listCategories(): Promise<WooCategory[]> {
  try {
    const categories: WooCategory[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "100",
        hide_empty: "true",
        orderby: "name",
        order: "asc",
      });

      const { data, response } = await fetchJson<any[]>(
        `${WOO_API_URL}/products/categories?${params}`
      );

      categories.push(
        ...(Array.isArray(data)
          ? data.map((category): WooCategory => {
              const name = decodeHtmlEntities(category.name);

              return {
                id: Number(category.id),
                name,
                slug: category.slug,
                count: Number(category.count ?? 0),
                parent: Number(category.parent ?? 0),
                label: name,
                value: name,
              };
            })
          : [])
      );

      totalPages = Math.max(
        1,
        Number(response.headers.get("X-WP-TotalPages") ?? 1)
      );
      page += 1;
    } while (page <= totalPages);

    return categories;
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
    throw error;
  }
}