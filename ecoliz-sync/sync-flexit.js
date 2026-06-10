require("dotenv").config({ override: true });

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const SftpClient = require("ssh2-sftp-client");
const { parse } = require("csv-parse/sync");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const { getFlexitProductDetails } = require("./flexit-api");

const LOCAL_FILE = path.join(__dirname, "FlexIT_feed.csv");
const LOG_DIR = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOG_DIR, "sync.log");

const MARGIN_RATE = Number(process.env.MARGIN_RATE || 1.07);
const SYNC_LIMIT = Number(process.env.SYNC_LIMIT || 0); // 0 = tous les produits
const DRY_RUN = process.env.DRY_RUN === "true";
const FLEXIT_ENRICH_PRODUCTS = process.env.FLEXIT_ENRICH_PRODUCTS === "true";
const REQUEST_DELAY_MS = Number(process.env.REQUEST_DELAY_MS || 300);

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + "\n");
}

function clean(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function createProductSyncHash(product) {
  const comparableProduct = {
    name: product.name,
    sku: product.sku,
    regular_price: product.regular_price,
    description: product.description,
    short_description: product.short_description,
    manage_stock: product.manage_stock,
    stock_quantity: product.stock_quantity,
    stock_status: product.stock_status,
    status: product.status,
    categories: product.categories || [],
    images: product.images || [],
    attributes: product.attributes || [],
    meta_data: (product.meta_data || []).filter(
      (meta) => meta.key !== "ecoliz_sync_hash"
    ),
  };

  return crypto
    .createHash("sha256")
    .update(stableStringify(comparableProduct))
    .digest("hex");
}

function getMetaValue(product, key) {
  const meta = product?.meta_data?.find((item) => item.key === key);
  return meta ? clean(meta.value) : "";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPrice(value) {
  const number = Number(String(value).replace(",", "."));
  if (Number.isNaN(number)) return "0.00";
  return (number * MARGIN_RATE).toFixed(2);
}

function toStock(value) {
  const number = Number(String(value).replace(",", "."));
  if (Number.isNaN(number)) return 0;
  return Math.max(0, Math.floor(number));
}

function getFirstAvailable(row, columns) {
  for (const column of columns) {
    const value = clean(row[column]);
    if (value) return value;
  }

  return "";
}

function buildProductName(row, sku) {
  return (
    getFirstAvailable(row, [
      "Product Name",
      "Short Product Name",
      "Web Product Name",
      "Web Description",
      "Description",
    ]) || sku
  );
}

function buildProductDescription(row) {
  return getFirstAvailable(row, [
    "Long Description",
    "Web Description Long",
    "Marketing Description",
    "Web Description",
    "Description",
  ]);
}

function buildShortDescription(row) {
  return getFirstAvailable(row, [
    "Short Description",
    "Web Description",
    "Description",
  ]);
}

function buildAttributes(row) {
  const attributes = [];

  if (clean(row["Manufacturer"])) {
    attributes.push({
      name: "Marque",
      visible: true,
      variation: false,
      options: [clean(row["Manufacturer"])],
    });
  }

  if (clean(row["Status"])) {
    attributes.push({
      name: "État",
      visible: true,
      variation: false,
      options: [clean(row["Status"])],
    });
  }

  if (clean(row["OS"])) {
    attributes.push({
      name: "OS",
      visible: true,
      variation: false,
      options: [clean(row["OS"])],
    });
  }

  if (clean(row["Product Group"])) {
    attributes.push({
      name: "Product Group",
      visible: true,
      variation: false,
      options: [clean(row["Product Group"])],
    });
  }

  if (clean(row["Manufacturer Part Number"])) {
    attributes.push({
      name: "Référence constructeur",
      visible: true,
      variation: false,
      options: [clean(row["Manufacturer Part Number"])],
    });
  }

  return attributes;
}

function buildApiProductName(apiProduct, fallbackName) {
  const manufacturer = clean(apiProduct.manufacturerName);
  const model = clean(apiProduct.modelName);
  const shortDescription = clean(apiProduct.shortDescription);

  if (manufacturer && model) {
    return `${manufacturer} ${model}`;
  }

  if (model) {
    return model;
  }

  if (manufacturer && shortDescription) {
    return `${manufacturer} ${shortDescription}`;
  }

  if (shortDescription) {
    return shortDescription;
  }

  return fallbackName;
}

function buildApiAttributes(apiProduct) {
  const attributes = [];

  if (clean(apiProduct.manufacturerName)) {
    attributes.push({
      name: "Marque",
      visible: true,
      variation: false,
      options: [clean(apiProduct.manufacturerName)],
    });
  }

  if (clean(apiProduct.productCondition)) {
    attributes.push({
      name: "Grade",
      visible: true,
      variation: false,
      options: [clean(apiProduct.productCondition)],
    });
  }

  if (clean(apiProduct.manufacturerPartNumber)) {
    attributes.push({
      name: "Référence constructeur",
      visible: true,
      variation: false,
      options: [clean(apiProduct.manufacturerPartNumber)],
    });
  }

  if (clean(apiProduct.modelName)) {
    attributes.push({
      name: "Modèle",
      visible: true,
      variation: false,
      options: [clean(apiProduct.modelName)],
    });
  }

  if (Array.isArray(apiProduct.specifications)) {
    for (const spec of apiProduct.specifications) {
      const key = clean(spec.key);
      const value = clean(spec.value);

      if (!key || !value) continue;

      attributes.push({
        name: key,
        visible: true,
        variation: false,
        options: [value],
      });
    }
  }

  return attributes;
}

function mergeAttributes(existingAttributes, newAttributes) {
  const merged = [...existingAttributes];

  for (const newAttribute of newAttributes) {
    const existing = merged.find(
      (attribute) =>
        clean(attribute.name).toLowerCase() ===
        clean(newAttribute.name).toLowerCase()
    );

    if (!existing) {
      merged.push(newAttribute);
      continue;
    }

    for (const option of newAttribute.options || []) {
      if (!existing.options.includes(option)) {
        existing.options.push(option);
      }
    }
  }

  return merged;
}

function getApiMainImage(apiProduct) {
  if (!Array.isArray(apiProduct.images) || apiProduct.images.length === 0) {
    return "";
  }

  const mainImage =
    apiProduct.images.find((image) => image.mainImageFlag) ||
    apiProduct.images[0];

  return clean(mainImage.imageUrl || mainImage.url || mainImage.src);
}

async function enrichProductWithFlexitApi(product, sku) {
  try {
    const apiProduct = await getFlexitProductDetails(sku);

    product.name = buildApiProductName(apiProduct, product.name);

    if (clean(apiProduct.shortDescription)) {
      product.short_description = clean(apiProduct.shortDescription);
    }

    if (clean(apiProduct.description)) {
      product.description = clean(apiProduct.description);
    } else if (!clean(product.description) && clean(apiProduct.shortDescription)) {
      product.description = clean(apiProduct.shortDescription);
    }

    const apiImage = getApiMainImage(apiProduct);

    if (apiImage) {
      product.images = [
        {
          src: apiImage,
        },
      ];
    }

    product.attributes = mergeAttributes(
      product.attributes || [],
      buildApiAttributes(apiProduct)
    );

    if (!Array.isArray(product.meta_data)) {
      product.meta_data = [];
    }

    product.meta_data.push(
      {
        key: "flexit_api_enriched",
        value: "yes",
      },
      {
        key: "flexit_api_last_modified",
        value: clean(apiProduct.lastModifiedTimeStamp),
      }
    );

    log(`Enrichi avec l'API FlexIT : ${sku}`);
  } catch (error) {
    log(
      `API FlexIT ignorée pour ${sku} : ${JSON.stringify(
        error.response?.data || error.message
      )}`
    );
  }

  return product;
}

const WC_URL = clean(process.env.WC_URL).replace(/\/+$/, "");

const wc = new WooCommerceRestApi({
  url: WC_URL,
  consumerKey: clean(process.env.WC_CONSUMER_KEY),
  consumerSecret: clean(process.env.WC_CONSUMER_SECRET),
  version: "wc/v3",
  timeout: 30000,
});

function wcEndpoint(url) {
  return url.replace(/^\/+/, "");
}

async function wcRequest(method, url, dataOrConfig = {}) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const endpoint = wcEndpoint(url);

      if (method === "get") {
        return await wc.get(endpoint, dataOrConfig.params || {});
      }

      if (method === "post") {
        return await wc.post(endpoint, dataOrConfig);
      }

      if (method === "put") {
        return await wc.put(endpoint, dataOrConfig);
      }

      throw new Error(`Méthode non supportée : ${method}`);
    } catch (error) {
      const message = error.response?.data || error.message;

      if (attempt === 3) {
        throw error;
      }

      log(`Tentative ${attempt}/3 échouée sur ${url} : ${JSON.stringify(message)}`);
      await sleep(1500);
    }
  }
}

async function downloadSftpFile() {
  const sftp = new SftpClient();

  log("Connexion au SFTP...");

  await sftp.connect({
    host: process.env.SFTP_HOST,
    port: Number(process.env.SFTP_PORT || 22),
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASSWORD,
  });

  log(`Téléchargement du fichier ${process.env.SFTP_FILE}...`);
  await sftp.fastGet(process.env.SFTP_FILE, LOCAL_FILE);

  await sftp.end();

  log(`Fichier téléchargé : ${LOCAL_FILE}`);
}

function readProductsFromCsv() {
  log("Lecture du CSV...");

  const content = fs.readFileSync(LOCAL_FILE, "utf8");

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ";",
    bom: true,
    trim: true,
    relax_quotes: true,
  });

  log(`${records.length} produits trouvés dans le fichier.`);

  if (SYNC_LIMIT > 0) {
    log(`Mode limité activé : seuls les ${SYNC_LIMIT} premiers produits seront traités.`);
    return records.slice(0, SYNC_LIMIT);
  }

  return records;
}

async function findWooProductBySku(sku) {
  const response = await wcRequest("get", "/products", {
    params: {
      sku,
      per_page: 1,
      status: "any",
    },
  });

  return response.data[0] || null;
}

const categoryCache = new Map();

async function getOrCreateCategory(categoryName) {
  const name = clean(categoryName);

  if (!name) {
    return null;
  }

  if (categoryCache.has(name)) {
    return categoryCache.get(name);
  }

  const searchResponse = await wcRequest("get", "/products/categories", {
    params: {
      search: name,
      per_page: 100,
    },
  });

  const existingCategory = searchResponse.data.find(
    (category) => category.name.toLowerCase() === name.toLowerCase()
  );

  if (existingCategory) {
    categoryCache.set(name, existingCategory.id);
    return existingCategory.id;
  }

  const createResponse = await wcRequest("post", "/products/categories", {
    name,
  });

  categoryCache.set(name, createResponse.data.id);
  return createResponse.data.id;
}

async function buildWooProduct(row) {
  const sku = clean(row["Flex IT Part Number"]);

  const name = buildProductName(row, sku);
  const description = buildProductDescription(row);
  const shortDescription = buildShortDescription(row);

  const imageUrl = clean(row["MainImageURL"]);
  const stockQuantity = toStock(row["Stock Quantity"]);
  const priceWithMargin = toPrice(row["Sales Price"]);

  const categoryName = clean(row["Category"]);

  let categoryId = null;

  if (!DRY_RUN) {
    categoryId = await getOrCreateCategory(categoryName);
  }

  const product = {
    name,
    sku,
    type: "simple",
    regular_price: priceWithMargin,

    description,
    short_description: shortDescription,

    manage_stock: true,
    stock_quantity: stockQuantity,
    stock_status: stockQuantity > 0 ? "instock" : "outofstock",

    status: "publish",

    attributes: buildAttributes(row),

    meta_data: [
      {
        key: "flexit_part_number",
        value: sku,
      },
      {
        key: "manufacturer",
        value: clean(row["Manufacturer"]),
      },
      {
        key: "manufacturer_part_number",
        value: clean(row["Manufacturer Part Number"]),
      },
      {
        key: "ean",
        value: clean(row["EAN"]),
      },
      {
        key: "os",
        value: clean(row["OS"]),
      },
      {
        key: "condition_status",
        value: clean(row["Status"]),
      },
      {
        key: "product_group",
        value: clean(row["Product Group"]),
      },
      {
        key: "incoming_quantity",
        value: clean(row["Incoming Quantity"]),
      },
      {
        key: "incoming_date",
        value: clean(row["Incoming Date"]),
      },
      {
        key: "original_sales_price_ht",
        value: clean(row["Sales Price"]),
      },
      {
        key: "margin_rate",
        value: String(MARGIN_RATE),
      },
      {
        key: "warranty",
        value: "sur devis",
      },
    ],
  };

  if (categoryId) {
    product.categories = [{ id: categoryId }];
  }

  if (DRY_RUN && categoryName) {
    product.category_preview = categoryName;
  }

  if (imageUrl) {
    product.images = [
      {
        src: imageUrl,
      },
    ];
  }

  if (FLEXIT_ENRICH_PRODUCTS) {
    await enrichProductWithFlexitApi(product, sku);
  }

  return product;
}

async function syncProducts() {
  log("Début de la synchronisation FlexIT.");

  if (DRY_RUN) {
    log("Mode TEST activé : aucun produit ne sera créé ou modifié dans WooCommerce.");
  }

  if (FLEXIT_ENRICH_PRODUCTS) {
    log("Enrichissement API FlexIT activé.");
  } else {
    log("Enrichissement API FlexIT désactivé.");
  }

  await downloadSftpFile();

  const rows = readProductsFromCsv();

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let tested = 0;
  let failed = 0;

  for (const row of rows) {
    const sku = clean(row["Flex IT Part Number"]);

    if (!sku) {
      log("Produit ignoré : SKU vide.");
      continue;
    }

    try {
      const productData = await buildWooProduct(row);
      const productHash = createProductSyncHash(productData);

      if (!Array.isArray(productData.meta_data)) {
        productData.meta_data = [];
      }

      productData.meta_data.push({
        key: "ecoliz_sync_hash",
        value: productHash,
      });

      if (DRY_RUN) {
        tested++;
        log(`[TEST] Produit préparé : ${sku} - ${productData.name}`);
        log(`[TEST] Hash sync : ${productHash}`);
        log(JSON.stringify(productData, null, 2));
        await sleep(100);
        continue;
      }

      const existingProduct = await findWooProductBySku(sku);

      if (existingProduct) {
        const previousHash = getMetaValue(existingProduct, "ecoliz_sync_hash");

        if (previousHash && previousHash === productHash) {
          skipped++;
          log(`Ignoré (inchangé) : ${sku} - ${productData.name}`);
          await sleep(REQUEST_DELAY_MS);
          continue;
        }

        await wcRequest("put", `/products/${existingProduct.id}`, productData);
        updated++;
        log(`Mis à jour : ${sku} - ${productData.name}`);
      } else {
        await wcRequest("post", "/products", productData);
        created++;
        log(`Créé : ${sku} - ${productData.name}`);
      }

      await sleep(REQUEST_DELAY_MS);
    } catch (error) {
      failed++;
      log(`Erreur sur ${sku} : ${JSON.stringify(error.response?.data || error.message)}`);
    }
  }

  log("Synchronisation terminée.");

  if (DRY_RUN) {
    log(`Produits testés : ${tested}`);
  } else {
    log(`Créés : ${created}`);
    log(`Mis à jour : ${updated}`);
    log(`Ignorés car inchangés : ${skipped}`);
  }

  log(`Erreurs : ${failed}`);
}

syncProducts().catch((error) => {
  log(`Erreur générale : ${error.message}`);
  process.exit(1);
});
