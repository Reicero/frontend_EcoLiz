import fs from "node:fs";
import path from "node:path";

/**
 * Charge simplement les fichiers .env sans afficher les secrets.
 */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const scriptDirectory = path.dirname(new URL(import.meta.url).pathname);
const projectDirectory = path.resolve(scriptDirectory, "..");

loadEnvFile(path.join(projectDirectory, ".env"));
loadEnvFile(path.join(scriptDirectory, ".env"));

function firstEnv(...names) {
  for (const name of names) {
    if (process.env[name]) {
      return process.env[name];
    }
  }

  return null;
}

const rawWooUrl = firstEnv(
  "GOOGLE_MERCHANT_WC_URL",
  "WC_URL",
  "WOO_URL",
  "WOOCOMMERCE_URL",
  "WORDPRESS_URL",
  "WP_URL"
);

const consumerKey = firstEnv(
  "WC_CONSUMER_KEY",
  "WOO_CONSUMER_KEY",
  "WOOCOMMERCE_CONSUMER_KEY",
  "CONSUMER_KEY",
  "WC_KEY"
);

const consumerSecret = firstEnv(
  "WC_CONSUMER_SECRET",
  "WOO_CONSUMER_SECRET",
  "WOOCOMMERCE_CONSUMER_SECRET",
  "CONSUMER_SECRET",
  "WC_SECRET"
);

if (!rawWooUrl || !consumerKey || !consumerSecret) {
  console.error("❌ Impossible de trouver la configuration WooCommerce.");
  console.error("");
  console.error("Le script cherche notamment :");
  console.error("  WC_URL");
  console.error("  WC_CONSUMER_KEY");
  console.error("  WC_CONSUMER_SECRET");
  console.error("");
  console.error(
    "Variables disponibles dans les fichiers .env :",
    Object.keys(process.env)
      .filter((key) => /WC|WOO|WORDPRESS/i.test(key))
      .sort()
      .join(", ")
  );

  process.exit(1);
}

/**
 * Si WC_URL contient déjà /wp-json/..., on récupère uniquement
 * l'URL principale de WordPress.
 */
function normalizeWooUrl(value) {
  const wpJsonIndex = value.indexOf("/wp-json");

  if (wpJsonIndex !== -1) {
    return value.slice(0, wpJsonIndex).replace(/\/+$/, "");
  }

  return value.replace(/\/+$/, "");
}

const wooUrl = normalizeWooUrl(rawWooUrl);

const targetCategories = new Set([
  "notebook",
  "pc fixe",
  "workstation",
]);

/**
 * EcoLiz stocke actuellement les prix en HT.
 * Pour Google Merchant France, le prix envoyé doit être TTC.
 */
const priceMultiplier = Number(
  process.env.GOOGLE_PRICE_MULTIPLIER || "1.20"
);

/**
 * Modifiable si la route React n'est pas /produit/{slug}.
 *
 * Exemples :
 * https://ecoliz.fr/produit/{slug}
 * https://ecoliz.fr/product/{id}
 */
const productUrlTemplate =
  process.env.GOOGLE_PRODUCT_URL_TEMPLATE ||
  "https://ecoliz.fr/produit/{slug}";

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function cdata(value = "") {
  return String(value).replaceAll("]]>", "]]]]><![CDATA[>");
}

function stripHtml(value = "") {
  return String(value)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function findAttribute(product, names) {
  const normalizedNames = names.map(normalize);

  for (const attribute of product.attributes || []) {
    const attributeName = normalize(attribute.name);

    if (normalizedNames.some((name) => attributeName === name)) {
      return (attribute.options || []).join(" ").trim();
    }
  }

  return "";
}

function findMeta(product, names) {
  const normalizedNames = names.map(normalize);

  for (const meta of product.meta_data || []) {
    if (normalizedNames.includes(normalize(meta.key))) {
      return String(meta.value || "").trim();
    }
  }

  return "";
}

function getBrand(product) {
  if (Array.isArray(product.brands) && product.brands.length > 0) {
    return product.brands[0].name || "";
  }

  return (
    findAttribute(product, [
      "marque",
      "manufacturer",
      "fabricant",
      "brand",
    ]) ||
    findMeta(product, [
      "brand",
      "_brand",
      "manufacturer",
      "_manufacturer",
    ])
  );
}

function getMpn(product) {
  return (
    findAttribute(product, [
      "mpn",
      "part number",
      "manufacturer part number",
      "reference constructeur",
      "référence constructeur",
    ]) ||
    findMeta(product, [
      "mpn",
      "_mpn",
      "manufacturer_part_number",
      "part_number",
    ]) ||
    product.sku ||
    ""
  );
}

function getGtin(product) {
  const value =
    product.global_unique_id ||
    findMeta(product, [
      "ean",
      "_ean",
      "gtin",
      "_gtin",
      "_global_unique_id",
    ]);

  const digits = String(value || "").replace(/\D/g, "");

  if ([8, 12, 13, 14].includes(digits.length)) {
    return digits;
  }

  return "";
}

function getCondition(product) {
  const conditionText = normalize(
    [
      findAttribute(product, [
        "etat",
        "état",
        "condition",
        "grade",
        "product condition",
      ]),
      findMeta(product, [
        "condition",
        "_condition",
        "product_condition",
      ]),
    ].join(" ")
  );

  if (
    conditionText.includes("n1") ||
    conditionText.includes("neuf") ||
    conditionText.includes("new")
  ) {
    return "new";
  }

  if (
    conditionText.includes("r4") ||
    conditionText.includes("reconditionne") ||
    conditionText.includes("refurbished")
  ) {
    return "refurbished";
  }

  return "used";
}

function getAvailability(product) {
  switch (product.stock_status) {
    case "instock":
      return "in_stock";

    case "onbackorder":
      return "backorder";

    default:
      return "out_of_stock";
  }
}

function getProductUrl(product) {
  return productUrlTemplate
    .replaceAll("{id}", String(product.id))
    .replaceAll("{slug}", String(product.slug || product.id))
    .replaceAll("{sku}", String(product.sku || product.id));
}

async function wooRequest(endpoint, parameters = {}) {
  const url = new URL(
    `${wooUrl}/wp-json/wc/v3/${endpoint.replace(/^\/+/, "")}`
  );

  for (const [key, value] of Object.entries(parameters)) {
    url.searchParams.set(key, String(value));
  }

  const authorization = Buffer.from(
    `${consumerKey}:${consumerSecret}`
  ).toString("base64");

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${authorization}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Erreur WooCommerce ${response.status} : ${text.slice(0, 500)}`
    );
  }

  return response;
}

async function getAllProducts() {
  const products = [];
  let page = 1;

  while (true) {
    console.log(`📦 Récupération de la page ${page}...`);

    const response = await wooRequest("products", {
      status: "publish",
      per_page: 100,
      page,
    });

    const pageProducts = await response.json();

    products.push(...pageProducts);

    if (pageProducts.length < 100) {
      break;
    }

    page += 1;
  }

  return products;
}

function belongsToTargetCategory(product) {
  return (product.categories || []).some((category) =>
    targetCategories.has(normalize(category.name))
  );
}

function buildItem(product) {
  const rawPrice = Number(product.price);

  if (!Number.isFinite(rawPrice) || rawPrice <= 0) {
    return null;
  }

  const imageUrl = product.images?.[0]?.src;

  if (!imageUrl) {
    return null;
  }

  const priceTtc = (rawPrice * priceMultiplier).toFixed(2);

  const description =
    stripHtml(product.short_description) ||
    stripHtml(product.description) ||
    product.name;

  const brand = getBrand(product);
  const mpn = getMpn(product);
  const gtin = getGtin(product);

  const identifiers = [];

  if (gtin) {
    identifiers.push(`    <g:gtin>${escapeXml(gtin)}</g:gtin>`);
  }

  if (mpn) {
    identifiers.push(`    <g:mpn>${escapeXml(mpn)}</g:mpn>`);
  }

  if (brand) {
    identifiers.push(`    <g:brand>${escapeXml(brand)}</g:brand>`);
  }

  if (!gtin && !mpn) {
    identifiers.push(
      "    <g:identifier_exists>false</g:identifier_exists>"
    );
  }

  return `
  <item>
    <g:id>${escapeXml(product.sku || product.id)}</g:id>
    <title><![CDATA[${cdata(product.name)}]]></title>
    <description><![CDATA[${cdata(description)}]]></description>
    <link>${escapeXml(getProductUrl(product))}</link>
    <g:image_link>${escapeXml(imageUrl)}</g:image_link>
    <g:availability>${getAvailability(product)}</g:availability>
    <g:price>${priceTtc} EUR</g:price>
    <g:condition>${getCondition(product)}</g:condition>
${identifiers.join("\n")}
  </item>`;
}

async function main() {
  console.log("🛒 Récupération des produits WooCommerce...");

  const allProducts = await getAllProducts();

  console.log(`✅ ${allProducts.length} produits récupérés au total.`);

  const selectedProducts = allProducts.filter(
    belongsToTargetCategory
  );

  console.log("");
  console.log("🎯 Catégories Google Merchant :");
  console.log("   - Notebook");
  console.log("   - PC fixe");
  console.log("   - Workstation");
  console.log("");
  console.log(
    `✅ ${selectedProducts.length} produits correspondent aux catégories demandées.`
  );

  const items = [];
  let skipped = 0;

  for (const product of selectedProducts) {
    const item = buildItem(product);

    if (item) {
      items.push(item);
    } else {
      skipped += 1;
      console.warn(
        `⚠️ Produit ignoré : ${product.name} — prix ou image manquant`
      );
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>EcoLiz - Matériel informatique reconditionné</title>
  <link>https://ecoliz.fr/</link>
  <description>Notebook, PC fixe et Workstation professionnels</description>
${items.join("\n")}
</channel>
</rss>
`;

  const outputPath = path.join(
    projectDirectory,
    "public",
    "google-merchant-feed.xml"
  );

  fs.writeFileSync(outputPath, xml, "utf8");

  console.log("");
  console.log("🎉 Flux Google Merchant généré !");
  console.log(`📄 Fichier : ${outputPath}`);
  console.log(`📦 Produits inclus : ${items.length}`);
  console.log(`⏭️ Produits ignorés : ${skipped}`);
}

main().catch((error) => {
  console.error("");
  console.error("❌ Erreur pendant la génération du flux :");
  console.error(error.message);
  process.exit(1);
});
