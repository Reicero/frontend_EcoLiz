require("dotenv").config({ override: true });

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const SftpClient = require("ssh2-sftp-client");
const { parse } = require("csv-parse/sync");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const { getFlexitProductDetails } = require("./flexit-api");
const { buildGlobalFilterAttributes } = require("./global-filters");

const LOCAL_FILE = path.join(__dirname, "FlexIT_feed.csv");
const LOG_DIR = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOG_DIR, "sync.log");
const PROMOTIONS_FILE = path.join(__dirname, "promotions.csv");

const MARGIN_RATE = Number(process.env.MARGIN_RATE || 1.07);
const SYNC_LIMIT = Number(process.env.SYNC_LIMIT || 0);
const SYNC_SKUS = new Set(
  clean(process.env.SYNC_SKUS)
    .split(",")
    .map((sku) => clean(sku))
    .filter(Boolean)
);
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
    sale_price: product.sale_price || "",
    date_on_sale_from: product.date_on_sale_from || null,
    date_on_sale_to: product.date_on_sale_to || null,
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

function parsePrice(value) {
  const number = Number(String(value).replace(",", "."));
  return Number.isNaN(number) ? 0 : number;
}

function roundPrice(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "0.00";
  return number.toFixed(2);
}

function parsePromotionDate(value, endOfDay = false) {
  const dateText = clean(value);

  if (!dateText) return null;

  const match = dateText.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return null;

  const [, year, month, day] = match;
  const time = endOfDay ? "23:59:59" : "00:00:00";

  return new Date(`${year}-${month}-${day}T${time}`);
}

function formatWooDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

let promotionsCache = null;

function readPromotions() {
  if (promotionsCache) return promotionsCache;

  promotionsCache = new Map();

  if (!fs.existsSync(PROMOTIONS_FILE)) {
    log("Aucun fichier promotions.csv trouvé : aucune promotion EcoLiz appliquée.");
    return promotionsCache;
  }

  const content = fs.readFileSync(PROMOTIONS_FILE, "utf8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ";",
    bom: true,
    trim: true,
  });

  for (const record of records) {
    const sku = clean(record.sku || record.SKU || record["Flex IT Part Number"]);
    const discountPercent = Number(
      clean(record.discount_percent || record.discount || record.remise).replace(",", ".")
    );
    const startDateText = clean(record.start_date || record.date_debut);
    const endDateText = clean(record.end_date || record.date_fin);
    const label = clean(record.label || record.libelle || record.name);

    if (!sku) {
      log("Promotion ignorée : SKU vide dans promotions.csv.");
      continue;
    }

    if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent >= 100) {
      log(`Promotion ignorée pour ${sku} : pourcentage invalide (${record.discount_percent}).`);
      continue;
    }

    const startDate = parsePromotionDate(startDateText);
    const endDate = parsePromotionDate(endDateText, true);

    if (!startDate || !endDate || startDate > endDate) {
      log(`Promotion ignorée pour ${sku} : dates invalides (${startDateText} -> ${endDateText}).`);
      continue;
    }

    promotionsCache.set(sku, {
      sku,
      discountPercent,
      startDate,
      endDate,
      startDateText,
      endDateText,
      label,
    });
  }

  log(`${promotionsCache.size} promotion(s) chargée(s) depuis promotions.csv.`);
  return promotionsCache;
}

function applyPromotionToProduct(product, sku, regularPrice) {
  const promotions = readPromotions();
  const promotion = promotions.get(sku);

  if (!Array.isArray(product.meta_data)) {
    product.meta_data = [];
  }

  if (!promotion) {
    product.sale_price = "";
    product.date_on_sale_from = null;
    product.date_on_sale_to = null;
    product.meta_data.push({ key: "ecoliz_promotion_active", value: "no" });
    return;
  }

  const now = new Date();
  const isExpired = now > promotion.endDate;
  const isActive = now >= promotion.startDate && now <= promotion.endDate;
  const normalPrice = parsePrice(regularPrice);
  const salePrice = roundPrice(normalPrice * (1 - promotion.discountPercent / 100));

  if (isExpired) {
    product.sale_price = "";
    product.date_on_sale_from = null;
    product.date_on_sale_to = null;
    product.meta_data.push(
      { key: "ecoliz_promotion_active", value: "expired" },
      { key: "ecoliz_promotion_discount", value: String(promotion.discountPercent) },
      { key: "ecoliz_promotion_label", value: promotion.label }
    );
    log(`Promotion expirée pour ${sku} : suppression du prix promo.`);
    return;
  }

  product.sale_price = salePrice;
  product.date_on_sale_from = formatWooDate(promotion.startDate);
  product.date_on_sale_to = formatWooDate(promotion.endDate);
  product.meta_data.push(
    { key: "ecoliz_promotion_active", value: isActive ? "yes" : "scheduled" },
    { key: "ecoliz_promotion_discount", value: String(promotion.discountPercent) },
    { key: "ecoliz_promotion_label", value: promotion.label },
    { key: "ecoliz_promotion_start_date", value: promotion.startDateText },
    { key: "ecoliz_promotion_end_date", value: promotion.endDateText }
  );

  log(
    `${isActive ? "Promotion active" : "Promotion programmée"} pour ${sku} : -${promotion.discountPercent}% (${regularPrice} -> ${salePrice}).`
  );
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

function compactNamePart(value) {
  return clean(value)
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s*-\s*$/g, "")
    .trim();
}

function normalizeManufacturerName(value) {
  const manufacturer = compactNamePart(value);

  const labels = {
    "hp inc": "HP",
    "hewlett-packard": "HP",
    "hewlett packard": "HP",
    hpe: "HPE",
    cisco: "Cisco",
    meraki: "Cisco Meraki",
    "cisco meraki": "Cisco Meraki",
    apple: "Apple",
    dell: "Dell",
    lenovo: "Lenovo",
  };

  return labels[manufacturer.toLowerCase()] || manufacturer;
}

function getApiSpecification(apiProduct, ...expectedNames) {
  if (!Array.isArray(apiProduct?.specifications)) {
    return "";
  }

  const normalizedExpectedNames = expectedNames.map((name) =>
    compactNamePart(name).toLowerCase()
  );

  const specification = apiProduct.specifications.find((item) =>
    normalizedExpectedNames.includes(compactNamePart(item?.key).toLowerCase())
  );

  return compactNamePart(specification?.value);
}

function removeManufacturerPrefix(value, manufacturer) {
  let result = compactNamePart(value);

  const removablePrefixes = [
    manufacturer,
    "HP Inc",
    "HP",
    "HPE",
    "Cisco Meraki",
    "Cisco",
    "Meraki",
    "Dell",
    "Lenovo",
    "Apple",
  ]
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);

  for (const prefix of removablePrefixes) {
    result = result.replace(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i"), "");
  }

  return result.trim();
}

function normalizeOperatingSystemName(value) {
  const text = compactNamePart(value).toUpperCase();

  if (!text) return "";
  if (text.includes("W11P")) return "Windows 11 Pro";
  if (text.includes("W11H")) return "Windows 11 Home";
  if (text.includes("W10P")) return "Windows 10 Pro";
  if (text.includes("MACOS")) return "macOS";
  if (text.includes("CHROME")) return "Chrome OS";
  if (text.includes("FREEDOS")) return "FreeDOS";
  if (text.includes("LINUX")) return "Linux";

  return compactNamePart(value);
}

function normalizeScreenSizeForName(value) {
  const match = compactNamePart(value).match(/(\d{1,2}(?:[.,]\d+)?)\s*(?:"|″|inch(?:es)?)/i);

  if (!match) {
    return "";
  }

  return `${match[1].replace(".", ",")}″`;
}

function detectResolutionLabel(value) {
  const text = compactNamePart(value).toUpperCase();

  if (/\b(?:3840\s*[X×]\s*2160|4K)\b/.test(text)) return "4K";
  if (/\b(?:2560\s*[X×]\s*1440|QHD|WQHD)\b/.test(text)) return "QHD";
  if (/\b(?:1920\s*[X×]\s*1200|WUXGA)\b/.test(text)) return "WUXGA";
  if (/\b(?:1920\s*[X×]\s*1080|FHD|FULL HD)\b/.test(text)) return "Full HD";

  return "";
}

function detectPanelTechnology(value) {
  const text = compactNamePart(value).toUpperCase();

  if (/\bOLED\b/.test(text)) return "OLED";
  if (/\bIPS\b/.test(text)) return "IPS";
  if (/\bVA\b/.test(text)) return "VA";

  return "";
}

function normalizeProcessorForName(value) {
  const text = compactNamePart(value)
    .replace(/Intel®?/gi, "Intel")
    .replace(/Core™?/gi, "Core")
    .replace(/Processor/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const intelCore = text.match(/\b(?:Intel\s+Core\s+)?i([3579])[-\s]?([A-Z0-9]+)?\b/i);

  if (intelCore) {
    return `Core i${intelCore[1]}${intelCore[2] ? `-${intelCore[2]}` : ""}`;
  }

  const xeon = text.match(/\b(?:Xeon\s+)?([0-9]{4}[A-Z]?)\b/i);

  if (xeon && /\b(?:xeon|server|proliant|dl\d+)\b/i.test(text)) {
    return `Xeon ${xeon[1]}`;
  }

  const ryzen = text.match(/\b(?:AMD\s+)?Ryzen(?:™)?\s+(.+?)(?:\s+Processor)?$/i);

  if (ryzen) {
    return `AMD Ryzen ${compactNamePart(ryzen[1])}`;
  }

  return text;
}

function normalizeMemoryForName(value) {
  const match = compactNamePart(value).match(/\b(\d+)\s*(?:GB|GO)\b/i);
  return match ? `${match[1]} Go` : "";
}

function normalizeStorageForName(value) {
  const text = compactNamePart(value);
  const match = text.match(/\b(\d+(?:[.,]\d+)?)\s*(TB|GB)\b/i);

  if (!match) return "";

  const capacity =
    match[2].toUpperCase() === "TB"
      ? `${match[1].replace(".", ",")} To`
      : `${match[1]} Go`;

  const type = /\bNVME\b/i.test(text)
    ? "NVMe"
    : /\bSSD\b/i.test(text)
      ? "SSD"
      : /\bSAS\b/i.test(text)
        ? "SAS"
        : /\bSATA\b/i.test(text)
          ? "SATA"
          : /\bHDD\b/i.test(text)
            ? "HDD"
            : "";

  return [capacity, type].filter(Boolean).join(" ");
}

function detectPortCount(value) {
  const text = compactNamePart(value);

  const explicit = text.match(/\b(\d{1,3})\s*(?:ports?|port)\b/i);
  if (explicit) return Number(explicit[1]);

  const ethernet = text.match(/\b(\d{1,3})\s*(?:x\s*)?10\/100(?:\/1000)?\b/i);
  if (ethernet) return Number(ethernet[1]);

  const switchModel = text.match(/\b(?:MS|C|CBS|SG|JL)\d{2,4}[-\s](\d{1,2})\b/i);
  if (switchModel) return Number(switchModel[1]);

  return null;
}

function cleanManufacturerPartNumber(value) {
  return compactNamePart(value)
    .replace(/-(?:N1|N2|N3|R4|G5|W1|W2|D1|D2)$/i, "")
    .replace(/-HW$/i, "");
}

function extractMonitorModel(description) {
  const text = compactNamePart(description);

  const patterns = [
    /\b(\d+\s+Pro\s+\d{3,4}[A-Za-z]{1,3})\b/i,
    /\b([A-Z]\d{2}[A-Za-z]?\s+G\d{1,2})\b/i,
    /\b([A-Z]{1,3}\d{3,4}[A-Za-z]{0,3})\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return compactNamePart(match[1]);
  }

  const beforeSize = text.split(/\b\d{1,2}(?:[.,]\d+)?\s*(?:"|″)/)[0];

  return compactNamePart(beforeSize).split(" ").slice(0, 6).join(" ");
}

function extractNetworkModel(description, manufacturerPartNumber) {
  const text = `${compactNamePart(description)} ${compactNamePart(manufacturerPartNumber)}`;

  const patterns = [
    /\b(MS\d{3}-\d{1,2}[A-Z-]*)\b/i,
    /\b(Catalyst\s+\d{4}[A-Z-]*)\b/i,
    /\b(Aruba\s+IOn\s+\d{4}[A-Z-]*)\b/i,
    /\b([A-Z]{1,4}\d{3,5}[A-Z0-9-]*)\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return cleanManufacturerPartNumber(match[1]);
  }

  return cleanManufacturerPartNumber(manufacturerPartNumber);
}

function isAccessoryOrOptionProduct(category, productGroup, description) {
  const classification = `${compactNamePart(category)} ${compactNamePart(productGroup)}`;

  if (
    /\b(?:options?|accessories|accessoires|components?|composants?)\b/i.test(
      classification
    )
  ) {
    return true;
  }

  return /\b(?:kit|fan|guide|rail|bracket|adapter|adaptor|cable|riser|bezel|tray|carrier|heatsink|battery|power supply|psu|dock|stand|mount|stylus|pen)\b/i.test(
    compactNamePart(description)
  );
}

function uniqueNameParts(values) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const cleaned = compactNamePart(value);
    const normalized = cleaned.toLowerCase();

    if (!cleaned || seen.has(normalized)) continue;

    seen.add(normalized);
    result.push(cleaned);
  }

  return result;
}

function getProductTechnicalText(apiProduct, row, fallbackName) {
  const specificationText = Array.isArray(apiProduct?.specifications)
    ? apiProduct.specifications
        .map((specification) =>
          `${compactNamePart(specification?.key)} ${compactNamePart(
            specification?.value
          )}`
        )
        .join(" ")
    : "";

  return compactNamePart(
    [
      apiProduct?.shortDescription,
      apiProduct?.description,
      specificationText,
      row?.["Web Description"],
      row?.["Description"],
      row?.["Product Group"],
      fallbackName,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function formatConnectorCount(count, label) {
  const numericCount = Number(count);
  return Number.isFinite(numericCount) && numericCount > 1
    ? `${numericCount}×${label}`
    : label;
}

function detectConnectivityFeatures(text, apiProduct, options = {}) {
  const source = compactNamePart(text);
  const upper = source.toUpperCase();
  const features = [];
  const includeUsbA = options.includeUsbA !== false;
  const includeNetwork = options.includeNetwork !== false;
  const includeOptical = options.includeOptical !== false;

  const displayPortCount =
    getApiSpecification(apiProduct, "DisplayPorts quantity") ||
    source.match(/\b(\d+)\s*[x×]\s*DP\b/i)?.[1] ||
    source.match(/\b(\d+)\s*[x×]\s*DisplayPort/i)?.[1];

  if (displayPortCount || /DISPLAYPORT|(?:[x×]\s*)DP\b|\bDP\b/i.test(source)) {
    features.push(formatConnectorCount(displayPortCount, "DP"));
  }

  const hdmiCount =
    getApiSpecification(apiProduct, "HDMI ports quantity") ||
    source.match(/\b(\d+)\s*[x×]\s*HDMI\b/i)?.[1];

  if (hdmiCount || /(?:[x×]\s*)HDMI\b|\bHDMI\b/i.test(source)) {
    features.push(formatConnectorCount(hdmiCount, "HDMI"));
  }

  const usbCCount =
    source.match(/\b(\d+)\s*[x×]\s*USB[ -]?C\b/i)?.[1] ||
    source.match(/\b(\d+)\s*[x×]\s*TYPE[ -]?C\b/i)?.[1];

  if (/USB[ -]?C|TYPE[ -]?C|THUNDERBOLT|\bTB[34]\b/i.test(source)) {
    features.push(formatConnectorCount(usbCCount, "USB-C"));
  }

  if (/THUNDERBOLT\s*4|\bTB4\b/i.test(source)) features.push("Thunderbolt 4");
  else if (/THUNDERBOLT\s*3|\bTB3\b/i.test(source)) features.push("Thunderbolt 3");

  if (includeUsbA && /USB\s*(?:3(?:\.\d)?|2(?:\.0)?)|USB[ -]?A/i.test(source)) {
    features.push("USB-A");
  }

  if (includeNetwork && /RJ-?45|ETHERNET|10\/100\/1000/i.test(source)) {
    features.push("RJ45");
  }

  if (includeOptical) {
    const sfpPlusCount = source.match(/\b(\d+)\s*[x×]\s*(?:10G(?:E)?\s*)?SFP\+\b/i)?.[1];
    const sfp28Count = source.match(/\b(\d+)\s*[x×]\s*SFP28\b/i)?.[1];
    const qsfpCount = source.match(/\b(\d+)\s*[x×]\s*QSFP\+?\b/i)?.[1];
    const sfpCount = source.match(/\b(\d+)\s*[x×]\s*(?:GIGABIT\s*)?SFP\b/i)?.[1];

    if (/SFP28/i.test(source)) features.push(formatConnectorCount(sfp28Count, "SFP28"));
    if (/QSFP/i.test(source)) features.push(formatConnectorCount(qsfpCount, "QSFP"));
    if (/SFP\+/i.test(source)) features.push(formatConnectorCount(sfpPlusCount, "SFP+"));
    else if (/\bSFP\b/i.test(source)) features.push(formatConnectorCount(sfpCount, "SFP"));
  }

  return uniqueNameParts(features);
}

function detectPoeFeature(text) {
  const source = compactNamePart(text);

  if (!/\bPOE(?:\+\+|\+)?\b/i.test(source)) return "";

  const level = /\bPOE\+\+\b/i.test(source)
    ? "PoE++"
    : /\bPOE\+\b/i.test(source)
      ? "PoE+"
      : "PoE";

  const budget =
    source.match(/\bPOE\s*(?:BUDGET)?\s*[:(-]?\s*(\d{2,4})\s*W\b/i)?.[1] ||
    source.match(/\b(\d{2,4})\s*W\s*POE\b/i)?.[1];

  return budget ? `${level} ${budget} W` : level;
}

function detectRackFeature(text) {
  const source = compactNamePart(text);
  const unit = source.match(/\b(\d+(?:[.,]\d+)?)\s*U\b/i)?.[1];

  if (unit && /RACK|RACKMOUNT|RACK-MOUNT/i.test(source)) {
    return `Rack ${unit.replace(",", ".")}U`;
  }

  if (/RACKABLE|RACKMOUNT|RACK-MOUNTABLE|RACK MOUNTABLE/i.test(source)) {
    return "Rackable";
  }

  return "";
}

function detectWifiStandardName(text) {
  const source = compactNamePart(text).toUpperCase();

  if (/WI-?FI\s*7|802\.11BE/.test(source)) return "Wi-Fi 7";
  if (/WI-?FI\s*6E|802\.11AX.*6\s*GHZ/.test(source)) return "Wi-Fi 6E";
  if (/WI-?FI\s*6|802\.11AX|CATALYST\s*91\d{2}/.test(source)) return "Wi-Fi 6";
  if (/WI-?FI\s*5|802\.11AC/.test(source)) return "Wi-Fi 5";

  return "";
}

function detectDiskFormatName(text) {
  const source = compactNamePart(text);
  if (/\b2[.,]5\s*(?:INCH|POUCE|\")|\bSFF\b/i.test(source)) return "2,5″";
  if (/\b3[.,]5\s*(?:INCH|POUCE|\")|\bLFF\b/i.test(source)) return "3,5″";
  return "";
}

function detectRaidControllerName(text) {
  const source = compactNamePart(text);
  const match = source.match(
    /\b(?:PERC\s*[A-Z0-9-]+|SMART\s*ARRAY\s*[A-Z0-9-]+|MR\d{3,4}[A-Z0-9-]*|RAID\s*[A-Z0-9-]+)\b/i
  );
  return match ? compactNamePart(match[0]) : "";
}

function detectGpuName(apiProduct, text) {
  const value = compactNamePart(
    getApiSpecification(apiProduct, "Videocard") || text
  );

  const patterns = [
    /\bNVIDIA\s+QUADRO\s+RTX\s+\d{3,4}\b/i,
    /\b(?:NVIDIA\s+)?(?:GEFORCE\s+)?RTX\s+\d{3,4}(?:\s+(?:TI|SUPER|MAX-Q))?\b/i,
    /\b(?:NVIDIA\s+)?QUADRO\s+[A-Z]?\d{3,4}\b/i,
    /\bAMD\s+RADEON(?:\s+PRO)?\s+[A-Z]?\d{3,4}[A-Z]{0,3}\b/i,
    /\bRADEON(?:\s+PRO)?\s+[A-Z]?\d{3,4}[A-Z]{0,3}\b/i,
    /\bINTEL\s+(?:UHD\s+GRAPHICS\s+\d+|IRIS\s+XE\s+GRAPHICS)\b/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (!match) continue;

    let gpu = compactNamePart(match[0]);
    if (/^RTX/i.test(gpu)) gpu = `NVIDIA ${gpu}`;
    if (/^RADEON/i.test(gpu)) gpu = `AMD ${gpu}`;
    return gpu;
  }

  return "";
}

function detectProductTypeLabel(category, productGroup, text) {
  const classification = `${compactNamePart(category)} ${compactNamePart(
    productGroup
  )}`.toLowerCase();
  const source = `${classification} ${compactNamePart(text)}`.toLowerCase();

  if (/\b(?:option|options|accessory|accessories|accessoire|accessoires|component|components|composant|composants)\b/.test(classification)) {
    return "Accessoire / option";
  }
  if (/\bswitch(?:es)?\b/.test(source)) return "Switch";
  if (/\b(?:router|routeur)\b/.test(source)) return "Routeur";
  if (/\bfirewall\b/.test(source)) return "Firewall";
  if (/\b(?:access point|point d.acces|wireless ap|catalyst 91\d{2})\b/.test(source)) return "Point d’accès Wi-Fi";
  if (/\b(?:power injector|poe injector|injecteur)\b/.test(source)) return "Injecteur PoE";
  if (/\b(?:dock|docking station|port replicator)\b/.test(source)) return "Dock";
  if (/\b(?:monitor|tft|display)\b/.test(source)) return "Écran";
  if (/\b(?:server|serveur|proliant|poweredge)\b/.test(source)) return "Serveur";
  if (/\b(?:notebook|notebooks|laptop|laptops|elitebook|thinkpad|latitude)\b/.test(source)) return "Ordinateur portable";
  if (/\b(?:workstation|zbook|precision)\b/.test(source)) return "Workstation";
  if (/\b(?:sfp|qsfp|transceiver|optical module)\b/.test(source)) return "Module optique";
  if (/\b(?:ssd|hdd|hard drive|disque)\b/.test(source)) return "Disque";
  if (/\b(?:license|licence|subscription|smartnet)\b/.test(source)) return "Licence";
  if (/\b(?:cable|câble)\b/.test(source)) return "Câble";

  return "";
}

function cleanTitleDescription(value, manufacturer) {
  return removeManufacturerPrefix(value, manufacturer)
    .replace(/\bFrnt\b/gi, "Front")
    .replace(/\bCrd\b/gi, "Card")
    .replace(/\bGde\b/gi, "Guide")
    .replace(/\bWhen using\b/gi, "for")
    .replace(/\bof higher\b/gi, "or higher")
    .replace(/\s+/g, " ")
    .trim();
}

function joinProductTitle(base, typeLabel, features, maximumLength = 180) {
  const cleanBase = compactNamePart(base);
  const cleanType = compactNamePart(typeLabel);
  const cleanFeatures = uniqueNameParts(features).slice(0, 7);

  let title = cleanBase;

  if (cleanType) {
    title = `${title} – ${cleanType}`;
  }

  if (cleanFeatures.length > 0) {
    title = `${title}${cleanType ? " " : " – "}${cleanFeatures.join(" / ")}`;
  }

  title = compactNamePart(title);

  if (title.length <= maximumLength) return title;

  while (cleanFeatures.length > 1) {
    cleanFeatures.pop();
    title = compactNamePart(
      `${cleanBase}${cleanType ? ` – ${cleanType}` : ""}${
        cleanFeatures.length > 0 ? ` ${cleanFeatures.join(" / ")}` : ""
      }`
    );
    if (title.length <= maximumLength) return title;
  }

  return `${title.slice(0, maximumLength - 1).trim()}…`;
}

function buildDerivedDisplayAttributes(apiProduct, row, categoryMapping, fallbackName) {
  const text = getProductTechnicalText(apiProduct, row, fallbackName);
  const category = compactNamePart(categoryMapping?.child);
  const productGroup = compactNamePart(row?.["Product Group"]);
  const typeLabel = detectProductTypeLabel(category, productGroup, text);
  const attributes = [];

  function add(name, values) {
    const options = uniqueNameParts(Array.isArray(values) ? values : [values]);
    if (options.length === 0) return;
    attributes.push({ name, visible: true, variation: false, options });
  }

  add("Type d’appareil", typeLabel);

  const connectivity = detectConnectivityFeatures(text, apiProduct);
  add("Interfaces principales", connectivity);

  const poe = detectPoeFeature(text);
  if (poe) add("Alimentation PoE", poe);

  const rack = detectRackFeature(text);
  if (rack) add("Format d’installation", rack);

  const raid = detectRaidControllerName(text);
  if (raid) add("Contrôleur RAID détecté", raid);

  const diskFormat = detectDiskFormatName(text);
  if (diskFormat) add("Format de disque détecté", diskFormat);

  const wifi = detectWifiStandardName(text);
  if (wifi) add("Norme sans fil détectée", wifi);

  return attributes;
}


function buildAccessoryProductName(
  manufacturer,
  description,
  manufacturerPartNumber,
  apiProduct = {},
  category = "",
  productGroup = ""
) {
  const cleanedDescription = cleanTitleDescription(description, manufacturer) ||
    cleanManufacturerPartNumber(manufacturerPartNumber);
  const technicalText = getProductTechnicalText(
    apiProduct,
    {
      Description: cleanedDescription,
      "Product Group": productGroup,
    },
    cleanedDescription
  );

  const dockMatch = cleanedDescription.match(
    /^(.*?\b(?:ThinkPad\s+Universal\s+USB-C\s+Dock|Thunderbolt\s+(?:Universal\s+)?Dock|USB-C\s+Dock|Docking\s+Station|Port\s+Replicator|Dock))\b/i
  );

  if (dockMatch) {
    const base = compactNamePart(
      `${manufacturer} ${removeManufacturerPrefix(dockMatch[1], manufacturer)}`
    );
    const features = detectConnectivityFeatures(technicalText, apiProduct).filter(
      (feature) => feature !== "USB-A"
    );
    return joinProductTitle(base, "", features, 170);
  }

  const cableMatch = cleanedDescription.match(/^(.*?\b(?:Cable|Câble))\b/i);
  if (cableMatch) {
    const base = compactNamePart(`${manufacturer} ${cableMatch[1]}`);
    const features = detectConnectivityFeatures(technicalText, apiProduct);
    const length = technicalText.match(/\b(\d+(?:[.,]\d+)?)\s*(M|CM)\b/i)?.[0];
    return joinProductTitle(base, "", [...features, length || ""], 160);
  }

  const accessoryKeyword = cleanedDescription.match(
    /\b(?:kit|fan|guide|rail|bracket|adapter|adaptor|riser|bezel|tray|carrier|heatsink|battery|power supply|psu|stand|mount|stylus|pen|keyboard|mouse)\b/i
  );

  if (accessoryKeyword && accessoryKeyword.index > 0) {
    const model = cleanedDescription
      .slice(0, accessoryKeyword.index)
      .replace(/[\s\-/]+$/g, "")
      .trim();
    const accessory = cleanedDescription.slice(accessoryKeyword.index).trim();
    return joinProductTitle(
      compactNamePart(`${manufacturer} ${model}`),
      accessory,
      [],
      180
    );
  }

  const typeLabel = detectProductTypeLabel(category, productGroup, technicalText);
  const features = detectConnectivityFeatures(technicalText, apiProduct);

  return joinProductTitle(
    manufacturer,
    cleanedDescription || typeLabel || cleanManufacturerPartNumber(manufacturerPartNumber),
    features,
    180
  );
}

function normalizeReferenceComparison(value) {
  return compactNamePart(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}


function buildDescriptiveGenericName(
  manufacturer,
  description,
  manufacturerPartNumber,
  apiProduct = {},
  category = "",
  productGroup = ""
) {
  let text = cleanTitleDescription(description, manufacturer);
  const cleanedReference = cleanManufacturerPartNumber(manufacturerPartNumber);

  if (cleanedReference) {
    text = text.replace(
      new RegExp(
        cleanedReference.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      ),
      ""
    );
  }

  text = compactNamePart(text)
    .replace(/\s+(?:N1|N2|N3|R4|G5|W1|W2|D1|D2)\s*$/i, "")
    .trim();

  const technicalText = getProductTechnicalText(apiProduct, { Description: text, "Product Group": productGroup }, text);
  const typeLabel = detectProductTypeLabel(category, productGroup, technicalText);

  const descriptivePatterns = [
    /^(.*?\bThinkPad\s+Universal\s+USB-C\s+Dock)\b/i,
    /^(.*?\bThunderbolt\s+(?:Universal\s+)?Dock)\b/i,
    /^(.*?\bUSB-C\s+Dock)\b/i,
    /^(.*?\bDocking\s+Station)\b/i,
    /^(.*?\bPort\s+Replicator)\b/i,
    /^(.*?\bRail\s+Kit)\b/i,
    /^(.*?\bPower\s+Supply)\b/i,
    /^(.*?\bKeyboard)\b/i,
    /^(.*?\bMouse)\b/i,
    /^(.*?\bStylus)\b/i,
    /^(.*?\bCable)\b/i,
  ];

  for (const pattern of descriptivePatterns) {
    const match = text.match(pattern);
    if (match) {
      text = compactNamePart(match[1]);
      break;
    }
  }

  const slashParts = text.split(/\s*\/\s*/);
  const descriptiveBase =
    slashParts.length >= 3 && slashParts[0].trim().length >= 8
      ? slashParts[0].trim()
      : text;

  const base = compactNamePart(
    [manufacturer, descriptiveBase || cleanedReference].filter(Boolean).join(" ")
  );

  const features = detectConnectivityFeatures(technicalText, apiProduct).filter(
    (feature) => feature !== "USB-A"
  );

  return joinProductTitle(base, typeLabel && !base.toLowerCase().includes(typeLabel.toLowerCase()) ? typeLabel : "", features, 180);
}



function normalizeComparableProductName(value) {
  return compactNamePart(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function ensureUsefulProductName(
  candidateName,
  apiProduct,
  row,
  fallbackName,
  categoryMapping
) {
  const manufacturer = normalizeManufacturerName(
    apiProduct?.manufacturerName || row?.["Manufacturer"]
  );
  const candidate = compactNamePart(candidateName);
  const normalizedCandidate = normalizeComparableProductName(candidate);
  const normalizedManufacturer = normalizeComparableProductName(manufacturer);
  const reference = cleanManufacturerPartNumber(
    apiProduct?.manufacturerPartNumber || row?.["Manufacturer Part Number"]
  );
  const normalizedReference = normalizeReferenceComparison(reference);
  const candidateWithoutManufacturer = normalizedCandidate.startsWith(
    `${normalizedManufacturer} `
  )
    ? normalizedCandidate.slice(normalizedManufacturer.length).trim()
    : normalizedCandidate;

  const isOnlyManufacturer =
    Boolean(normalizedManufacturer) &&
    normalizedCandidate === normalizedManufacturer;
  const isOnlyReference =
    Boolean(normalizedReference) &&
    normalizeReferenceComparison(candidateWithoutManufacturer) ===
      normalizedReference;
  const isTooShort =
    !candidate ||
    candidate.length < 10 ||
    normalizedCandidate.split(/\s+/).filter(Boolean).length <= 1;

  if (!isOnlyManufacturer && !isOnlyReference && !isTooShort) {
    return candidate;
  }

  const description = compactNamePart(
    apiProduct?.shortDescription ||
      row?.["Web Description"] ||
      row?.["Description"] ||
      fallbackName
  );
  const fallback = buildDescriptiveGenericName(
    manufacturer,
    description,
    reference,
    apiProduct || {},
    compactNamePart(categoryMapping?.child),
    compactNamePart(row?.["Product Group"])
  );

  return fallback || candidate || compactNamePart(fallbackName) || reference;
}


function buildServerDiskProductName(manufacturer, description) {
  const text = compactNamePart(description);

  const isServerDisk =
    /\b\d+(?:[.,]\d+)?\s*[- ]?TB\b/i.test(text) &&
    /\b(?:7[.,]2K|10K|15K)\b/i.test(text) &&
    /\b(?:2[.,]5|3[.,]5)\b/.test(text);

  if (!isServerDisk) {
    return "";
  }

  const generation = text
    .match(/\bG\d+\s*-\s*G\d+\b/i)?.[0]
    ?.replace(/\s+/g, "");

  const capacityMatch = text.match(
    /\b(\d+(?:[.,]\d+)?)\s*[- ]?TB\b/i
  );

  const capacity = capacityMatch
    ? `${capacityMatch[1].replace(".", ",")} To`
    : "";

  const interfaceSpeed = text
    .match(/\b(?:6|12|24)\s*G\b/i)?.[0]
    ?.replace(/\s+/g, "");

  const rotationSpeed = text
    .match(/\b(?:7[.,]2K|10K|15K)\b/i)?.[0]
    ?.replace(".", ",");

  const formatMatch = text.match(/\b(2[.,]5|3[.,]5)\b/);
  const diskFormat = formatMatch
    ? `${formatMatch[1].replace(".", ",")}″`
    : "";

  const sectorFormat = text.match(/\b(?:512e|512n|4Kn)\b/i)?.[0];

  const base = compactNamePart(
    `${manufacturer}${generation ? ` ${generation}` : ""}`
  );

  return joinProductTitle(
    base,
    "Disque serveur",
    [
      capacity,
      interfaceSpeed || "",
      rotationSpeed || "",
      diskFormat,
      sectorFormat || "",
    ],
    180
  );
}

function buildDetailedServerProductName(manufacturer, description) {
  const text = compactNamePart(description);

  const modelMatch = text.match(
    /\b((?:DL|ML|BL)\d{2,4}\s+Gen\d+)\b/i
  );

  if (!modelMatch || !/\bServer\b/i.test(text)) {
    return "";
  }

  const model = compactNamePart(modelMatch[1]);

  const cpu = text.match(
    /\b(\d{4}[A-Z]?)\b(?=\s+\d+(?:[.,]\d+)?GHz|\s+\d+c\b)/i
  )?.[1];

  const memoryConfiguration = text.match(
    /\b(\d+)x(\d+)\s*GB(?:-R)?\b/i
  );

  let memory = "";

  if (memoryConfiguration) {
    memory = `${
      Number(memoryConfiguration[1]) *
      Number(memoryConfiguration[2])
    } Go`;
  } else {
    memory = normalizeMemoryForName(text);
  }

  const storageConfiguration = text.match(
    /\b(\d+)x(\d+)\s*GB\s*(SSD|HDD|NVMe)\b/i
  );

  const storage = storageConfiguration
    ? `${storageConfiguration[1]}×${storageConfiguration[2]} Go ${storageConfiguration[3].toUpperCase()}`
    : normalizeStorageForName(text);

  const bays = text.match(/\b\d+(?:SFF|LFF)\b/i)?.[0];

  const raidController = text.match(
    /\b(?:MR|P)\d{3,4}[A-Za-z0-9-]*\b/i
  )?.[0];

  const powerMatch = text.match(/\b(\d+)x(\d+)W\b/i);

  const power = powerMatch
    ? `${powerMatch[1]}×${powerMatch[2]} W`
    : "";

  return joinProductTitle(
    compactNamePart(`${manufacturer} ${model}`),
    "Serveur",
    [
      cpu || "",
      memory,
      storage,
      bays || "",
      raidController || "",
      power,
    ],
    190
  );
}

function buildSurfaceKeyboardProductName(manufacturer, description) {
  const text = compactNamePart(description);

  if (
    !/\bKeyboard\b/i.test(text) ||
    !/\bSurface Pro\b/i.test(text)
  ) {
    return "";
  }

  const layout = /\bUK\b/i.test(text) ? "UK" : "";

  const color = /\bBlack\b/i.test(text)
    ? "Noir"
    : /\bWhite\b/i.test(text)
      ? "Blanc"
      : "";

  let compatibility = "";

  const compatibilityMatch = text.match(
    /\bFor\s+(Surface Pro.+)$/i
  );

  if (compatibilityMatch) {
    compatibility = compactNamePart(compatibilityMatch[1])
      .replace(/Surface Pro\s+8\/9\/Pro X/i, "Surface Pro 8, 9 et Pro X")
      .replace(/\//g, ", ");

    compatibility = `Compatible ${compatibility}`;
  }

  return joinProductTitle(
    compactNamePart(`${manufacturer} Surface Pro Keyboard`),
    "",
    [layout, color, compatibility],
    180
  );
}


function buildCleanProductName(apiProduct, row, fallbackName, categoryMapping) {
  const manufacturer = normalizeManufacturerName(
    apiProduct?.manufacturerName || row["Manufacturer"]
  );
  const description = compactNamePart(
    apiProduct?.shortDescription ||
      row["Web Description"] ||
      row["Description"] ||
      fallbackName
  );
  const category = compactNamePart(categoryMapping?.child);
  const normalizedCategory = category.toLowerCase();
  const productGroup = compactNamePart(row["Product Group"]);
  const manufacturerPartNumber = compactNamePart(
    apiProduct?.manufacturerPartNumber || row["Manufacturer Part Number"]
  );
  const technicalText = getProductTechnicalText(apiProduct, row, fallbackName);

  let model = removeManufacturerPrefix(
    apiProduct?.modelName ||
      getApiSpecification(apiProduct, "Model", "Server Model"),
    manufacturer
  );

  const serverDiskName = buildServerDiskProductName(
    manufacturer,
    description
  );

  if (serverDiskName) {
    return serverDiskName;
  }

  const detailedServerName = buildDetailedServerProductName(
    manufacturer,
    description
  );

  if (detailedServerName) {
    return detailedServerName;
  }

  const surfaceKeyboardName = buildSurfaceKeyboardProductName(
    manufacturer,
    description
  );

  if (surfaceKeyboardName) {
    return surfaceKeyboardName;
  }

  if (isAccessoryOrOptionProduct(normalizedCategory, productGroup, description)) {
    return buildAccessoryProductName(
      manufacturer,
      description,
      manufacturerPartNumber,
      apiProduct,
      category,
      productGroup
    );
  }

  if (normalizedCategory.includes("écran")) {
    if (!model) model = extractMonitorModel(description);
    if (/^\d+\s+Pro\b/i.test(model)) model = `Series ${model}`;

    const screenSize =
      normalizeScreenSizeForName(
        getApiSpecification(apiProduct, "Screen size (in)", "Screen")
      ) || normalizeScreenSizeForName(description);
    const resolution = detectResolutionLabel(
      `${getApiSpecification(apiProduct, "Display resolution", "Screen")} ${technicalText}`
    );
    const panel = detectPanelTechnology(technicalText);
    const connectivity = detectConnectivityFeatures(technicalText, apiProduct, {
      includeUsbA: false,
      includeNetwork: false,
      includeOptical: false,
    });
    const extraFeatures = [
      /\bVESA\b/i.test(technicalText) ? "VESA" : "",
      /\bPIVOT\b/i.test(technicalText) ? "Pivot" : "",
      /\bWEBCAM|\bCAM\b/i.test(technicalText) ? "Webcam" : "",
    ];

    return joinProductTitle(
      compactNamePart(`${manufacturer} ${model}`),
      ["Écran", screenSize, resolution, panel].filter(Boolean).join(" "),
      [...connectivity, ...extraFeatures],
      185
    );
  }

  if (
    normalizedCategory.includes("switch") ||
    normalizedCategory.includes("routeur") ||
    normalizedCategory.includes("firewall") ||
    normalizedCategory.includes("équipements réseau") ||
    normalizedCategory.includes("wi-fi") ||
    /\b(?:switch|router|firewall|access point|wireless ap)\b/i.test(technicalText)
  ) {
    model = model || extractNetworkModel(description, manufacturerPartNumber);
    const portCount = detectPortCount(technicalText);
    const isManaged = /\b(?:managed|manageable|cloud managed|smart switch|layer\s*[23])\b/i.test(technicalText) &&
      !/\bunmanaged\b/i.test(technicalText);
    const productType = detectProductTypeLabel(category, productGroup, technicalText);

    const networkIdentity =
      `${manufacturer} ${model} ${description} ${manufacturerPartNumber} ${technicalText}`;

    const isMerakiMsSwitch =
      /\bMeraki\b/i.test(networkIdentity) &&
      /\bMS\d{3}(?:-\d{1,2}[A-Z0-9-]*)?\b/i.test(networkIdentity);

    let equipmentLabel = isMerakiMsSwitch
      ? "Switch manageable"
      : productType || "Équipement réseau";

    if (equipmentLabel === "Switch") {
      equipmentLabel = isManaged ? "Switch manageable" : "Switch";
    }

    const connectivity = detectConnectivityFeatures(technicalText, apiProduct, {
      includeUsbA: false,
      includeNetwork: false,
      includeOptical: true,
    }).filter((feature) => !/^RJ45$/i.test(feature));
    const features = [
      portCount ? `${portCount} ports` : "",
      ...connectivity,
      detectPoeFeature(technicalText),
      detectWifiStandardName(technicalText),
      detectRackFeature(technicalText),
    ];

    return joinProductTitle(
      compactNamePart(`${manufacturer} ${model}`),
      equipmentLabel,
      features,
      185
    );
  }

  if (normalizedCategory.includes("serveur")) {
    model = model || removeManufacturerPrefix(
      getApiSpecification(apiProduct, "Server Model"),
      manufacturer
    );
    const rawCpu = getApiSpecification(
      apiProduct,
      "FullProcessorName",
      "CPU",
      "Processor"
    );
    const cpu = /^\d{4}[A-Z]?$/i.test(rawCpu)
      ? `Xeon ${rawCpu}`
      : normalizeProcessorForName(rawCpu);
    const memory = normalizeMemoryForName(
      getApiSpecification(apiProduct, "Memory") || technicalText
    );
    const storage = normalizeStorageForName(
      getApiSpecification(apiProduct, "HDD") || technicalText
    );
    const features = [
      cpu,
      memory,
      storage,
      detectRaidControllerName(technicalText),
      detectDiskFormatName(technicalText),
      detectRackFeature(technicalText) ||
        (normalizedCategory.includes("rack") ? "Rack" : ""),
    ];

    return joinProductTitle(
      compactNamePart(`${manufacturer} ${model}`),
      "",
      features,
      185
    );
  }

  if (
    normalizedCategory.includes("notebook") ||
    normalizedCategory.includes("workstation") ||
    normalizedCategory.includes("pc fixes") ||
    normalizedCategory.includes("all-in-one") ||
    normalizedCategory.includes("chromebook") ||
    normalizedCategory.includes("tablette") ||
    normalizedCategory.includes("tablet")
  ) {
    model = model || removeManufacturerPrefix(
      getApiSpecification(apiProduct, "Model"),
      manufacturer
    );
    const cpu = normalizeProcessorForName(
      getApiSpecification(apiProduct, "FullProcessorName", "Processor")
    );
    const memory = normalizeMemoryForName(
      getApiSpecification(apiProduct, "Memory") || technicalText
    );
    const storage = normalizeStorageForName(
      getApiSpecification(apiProduct, "HDD") || technicalText
    );
    const screen =
      normalizeScreenSizeForName(
        getApiSpecification(apiProduct, "Screen size (in)", "Screen")
      ) || normalizeScreenSizeForName(description);
    const gpu = detectGpuName(apiProduct, technicalText);
    const os = normalizeOperatingSystemName(
      getApiSpecification(apiProduct, "OS") || row["OS"]
    );

    return joinProductTitle(
      compactNamePart(`${manufacturer} ${model}`),
      "",
      [cpu, memory, storage, screen, gpu, os],
      190
    );
  }

  if (/\b(?:SFP|QSFP|TRANSCEIVER|OPTIC)\b/i.test(technicalText)) {
    model = model || extractNetworkModel(description, manufacturerPartNumber);
    const connectivity = detectConnectivityFeatures(technicalText, apiProduct, {
      includeUsbA: false,
      includeNetwork: false,
      includeOptical: true,
    });
    const speed = technicalText.match(/\b(?:1|10|25|40|100)\s*G(?:BPS|BE)?\b/i)?.[0];
    const distance = technicalText.match(/\b\d+(?:[.,]\d+)?\s*(?:M|KM)\b/i)?.[0];
    return joinProductTitle(
      compactNamePart(`${manufacturer} ${model}`),
      "Module optique",
      [...connectivity, speed || "", distance || ""],
      170
    );
  }

  if (/\b(?:SSD|HDD|SAS|SATA|NVME|HARD DRIVE|DISQUE)\b/i.test(technicalText)) {
    model = model || cleanManufacturerPartNumber(manufacturerPartNumber);
    return joinProductTitle(
      compactNamePart(`${manufacturer} ${model}`),
      "Disque",
      [normalizeStorageForName(technicalText), detectDiskFormatName(technicalText)],
      170
    );
  }

  const cleanedReference = cleanManufacturerPartNumber(manufacturerPartNumber);
  const modelIsReference =
    model && cleanedReference &&
    normalizeReferenceComparison(model) === normalizeReferenceComparison(cleanedReference);
  const safeModel = modelIsReference ? "" : model;

  if (safeModel) {
    const typeLabel = detectProductTypeLabel(category, productGroup, technicalText);
    const connectivity = detectConnectivityFeatures(technicalText, apiProduct).filter(
      (feature) => feature !== "USB-A"
    );
    return joinProductTitle(
      compactNamePart(`${manufacturer} ${safeModel}`),
      typeLabel,
      connectivity,
      180
    );
  }

  return buildDescriptiveGenericName(
    manufacturer,
    description,
    manufacturerPartNumber,
    apiProduct,
    category,
    productGroup
  ) || compactNamePart(fallbackName);
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

async function enrichProductWithFlexitApi(product, sku, row, categoryMapping) {
  try {
    const apiProduct = await getFlexitProductDetails(sku);

    product.name = ensureUsefulProductName(
      buildCleanProductName(
        apiProduct,
        row,
        product.name,
        categoryMapping
      ),
      apiProduct,
      row,
      product.name,
      categoryMapping
    );

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
    return apiProduct;
  } catch (error) {
    log(
      `API FlexIT ignorée pour ${sku} : ${JSON.stringify(
        error.response?.data || error.message
      )}`
    );
  }

  return null;
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
      const errorCode = error.response?.data?.code;

      // Une catégorie existe déjà : getOrCreateCategory récupérera
      // directement son resource_id. Il ne faut pas retenter 3 fois.
      if (errorCode === "term_exists") {
        throw error;
      }

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

  if (SYNC_SKUS.size > 0) {
    const selectedRecords = records.filter((row) =>
      SYNC_SKUS.has(clean(row["Flex IT Part Number"]))
    );

    log(
      `Sélection par SKU activée : ${selectedRecords.length}/${SYNC_SKUS.size} produits trouvés.`
    );

    return selectedRecords;
  }

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

async function getOrCreateCategory(categoryName, parentId = 0) {
  const name = clean(categoryName);
  const parent = Number(parentId || 0);

  if (!name) {
    return null;
  }

  const cacheKey = `${parent}:${name.toLowerCase()}`;

  if (categoryCache.has(cacheKey)) {
    return categoryCache.get(cacheKey);
  }

  const searchResponse = await wcRequest("get", "/products/categories", {
    params: {
      search: name,
      per_page: 100,
      hide_empty: false,
    },
  });

  const existingCategory = searchResponse.data.find(
    (category) =>
      category.name.toLowerCase() === name.toLowerCase() &&
      Number(category.parent || 0) === parent
  );

  if (existingCategory) {
    categoryCache.set(cacheKey, existingCategory.id);
    return existingCategory.id;
  }

  try {
    const createResponse = await wcRequest("post", "/products/categories", {
      name,
      parent,
    });

    categoryCache.set(cacheKey, createResponse.data.id);
    return createResponse.data.id;
  } catch (error) {
    let parsedMessage = null;

    if (typeof error?.message === "string") {
      const jsonMatch = error.message.match(/\{.*\}/s);

      if (jsonMatch) {
        try {
          parsedMessage = JSON.parse(jsonMatch[0]);
        } catch {
          parsedMessage = null;
        }
      }
    }

    const errorPayload =
      error?.response?.data ||
      error?.data ||
      parsedMessage ||
      error;

    const errorCode = errorPayload?.code || error?.code;

    const existingCategoryId =
      errorPayload?.data?.resource_id ||
      errorPayload?.resource_id ||
      error?.resource_id;

    if (errorCode === "term_exists" && existingCategoryId) {
      categoryCache.set(cacheKey, existingCategoryId);
      return existingCategoryId;
    }

    throw error;
  }
}

async function getOrCreateCategoryPath(parentName, childName) {
  const parentId = await getOrCreateCategory(parentName);

  if (!parentId) {
    return {
      parentId: null,
      childId: null,
    };
  }

  const cleanChildName = clean(childName);

  if (!cleanChildName || cleanChildName === parentName) {
    return {
      parentId,
      childId: parentId,
    };
  }

  const childId = await getOrCreateCategory(cleanChildName, parentId);

  return {
    parentId,
    childId,
  };
}

function hasAny(value, keywords) {
  return keywords.some((keyword) => value.includes(keyword));
}

function mapEcoLizCategory(row) {
  const flexitCategory = clean(row["Category"]);
  const productGroup = clean(row["Product Group"]);

  const category = flexitCategory.toLowerCase();
  const group = productGroup.toLowerCase();
  const combined = `${category} ${group}`;

  if (
    hasAny(combined, [
      "software",
      "license",
      "licence",
      "smartnet",
      "ilo pack",
    ])
  ) {
    if (hasAny(combined, ["smartnet", "network", "firewall", "router", "switch"])) {
      return {
        parent: "Service",
        child: "Licences réseau / Smartnet",
      };
    }

    return {
      parent: "Service",
      child: "Licences serveur",
    };
  }

  if (
    category === "monitors" ||
    hasAny(combined, ["monitor", "tft"])
  ) {
    if (hasAny(combined, ["option", "accessoire", "accessories"])) {
      return {
        parent: "PC",
        child: "Accessoires écrans",
      };
    }

    return {
      parent: "PC",
      child: "Écrans",
    };
  }

  if (
    category === "networking" ||
    hasAny(combined, [
      "switch",
      "router",
      "wireless",
      "wifi",
      "wi-fi",
      "sfp",
      "glc",
      "optic",
      "network card",
      "firewall",
      "controller",
      "cable",
    ])
  ) {
    if (hasAny(combined, ["wireless", "wifi", "wi-fi"])) {
      return {
        parent: "Réseau",
        child: "Wi-Fi",
      };
    }

    if (hasAny(combined, ["switch"])) {
      return {
        parent: "Réseau",
        child: "Switches",
      };
    }

    if (hasAny(combined, ["router", "firewall", "controller"])) {
      return {
        parent: "Réseau",
        child: "Routeurs & Firewalls",
      };
    }

    if (hasAny(combined, ["sfp", "glc", "optic"])) {
      return {
        parent: "Réseau",
        child: "Modules SFP / Optiques",
      };
    }

    if (hasAny(combined, ["network card"])) {
      return {
        parent: "Réseau",
        child: "Cartes réseau",
      };
    }

    if (hasAny(combined, ["cable"])) {
      return {
        parent: "Réseau",
        child: "Câbles réseau",
      };
    }

    return {
      parent: "Réseau",
      child: "Équipements réseau",
    };
  }

  if (
    category === "servers" ||
    category === "storage" ||
    hasAny(combined, [
      "server",
      "storage",
      "hdd",
      "ssd",
      "sas",
      "s-ata",
      "raid",
      "rack",
      "blade",
      "hard drive",
      "harddrive",
    ])
  ) {
    if (hasAny(combined, ["hdd", "ssd", "sas", "s-ata", "hard drive", "harddrive"])) {
      return {
        parent: "Infra",
        child: "Disques serveur",
      };
    }

    if (hasAny(combined, ["raid"])) {
      return {
        parent: "Infra",
        child: "Contrôleurs RAID",
      };
    }

    if (hasAny(combined, ["rail", "rackmount"])) {
      return {
        parent: "Infra",
        child: "Rails et accessoires rack",
      };
    }

    if (hasAny(combined, ["blade"])) {
      return {
        parent: "Infra",
        child: "Serveurs blade",
      };
    }

    if (hasAny(combined, ["tower"])) {
      return {
        parent: "Infra",
        child: "Serveurs tour",
      };
    }

    if (hasAny(combined, ["rack"])) {
      return {
        parent: "Infra",
        child: "Serveurs rack",
      };
    }

    if (hasAny(combined, ["storage"])) {
      return {
        parent: "Infra",
        child: "Stockage",
      };
    }

    return {
      parent: "Infra",
      child: "Options serveur",
    };
  }

  if (
    category === "notebooks" ||
    category === "tablet pc's" ||
    hasAny(combined, [
      "notebook",
      "chromebook",
      "tablet",
      "docking",
      "port replicator",
      "bag",
      "sleeve",
      "case",
      "stand",
    ])
  ) {
    if (hasAny(combined, ["chromebook"])) {
      return {
        parent: "PC",
        child: "Chromebooks",
      };
    }

    if (hasAny(combined, ["tablet"])) {
      return {
        parent: "PC",
        child: "Tablettes",
      };
    }

    if (hasAny(combined, ["docking", "port replicator"])) {
      return {
        parent: "PC",
        child: "Docks et stations d'accueil",
      };
    }

    if (hasAny(combined, ["bag", "sleeve", "case"])) {
      return {
        parent: "PC",
        child: "Sacs et housses",
      };
    }

    if (hasAny(combined, ["stand", "accessoire", "accessories"])) {
      return {
        parent: "PC",
        child: "Accessoires mobilité",
      };
    }

    return {
      parent: "PC",
      child: "Notebooks",
    };
  }

  if (
    category === "workstations" ||
    category === "personal computers" ||
    hasAny(combined, [
      "workstation",
      "computer",
      "desktop",
      "tower",
      "all in one",
      "aio",
      "cpu",
      "processor",
      "memory",
    ])
  ) {
    if (hasAny(combined, ["workstation mobile"])) {
      return {
        parent: "PC",
        child: "Workstations mobiles",
      };
    }

    if (hasAny(combined, ["workstation computer"])) {
      return {
        parent: "PC",
        child: "Workstations fixes",
      };
    }

    if (hasAny(combined, ["all in one", "aio"])) {
      return {
        parent: "PC",
        child: "All-in-One",
      };
    }

    if (
      hasAny(combined, [
        "workstation option",
        "workstation memory",
        "workstation cpu",
        "workstation hdd",
        "processor",
        "memory",
      ])
    ) {
      return {
        parent: "PC",
        child: "Composants Workstation",
      };
    }

    return {
      parent: "PC",
      child: "PC fixes",
    };
  }

  return {
    parent: "Service",
    child: flexitCategory || "Autres / sur devis",
  };
}

async function buildWooProduct(row) {
  const sku = clean(row["Flex IT Part Number"]);

  const name = buildProductName(row, sku);
  const description = buildProductDescription(row);
  const shortDescription = buildShortDescription(row);

  const imageUrl = clean(row["MainImageURL"]);
  const stockQuantity = toStock(row["Stock Quantity"]);
  const priceWithMargin = toPrice(row["Sales Price"]);

  const categoryMapping = mapEcoLizCategory(row);
  const categoryName = categoryMapping.parent;
  const subCategoryName = categoryMapping.child;

  let parentCategoryId = null;
  let categoryId = null;

  if (!DRY_RUN) {
    const categoryPath = await getOrCreateCategoryPath(
      categoryName,
      subCategoryName
    );

    parentCategoryId = categoryPath.parentId;
    categoryId = categoryPath.childId;
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
        key: "flexit_original_name",
        value: name,
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
        key: "original_category",
        value: clean(row["Category"]),
      },
      {
        key: "ecoliz_category",
        value: categoryName,
      },
      {
        key: "ecoliz_subcategory",
        value: subCategoryName,
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

  applyPromotionToProduct(product, sku, priceWithMargin);

  if (parentCategoryId && categoryId && parentCategoryId !== categoryId) {
    product.categories = [{ id: parentCategoryId }, { id: categoryId }];
  } else if (categoryId) {
    product.categories = [{ id: categoryId }];
  }

  if (DRY_RUN && categoryName) {
    product.category_preview = `${categoryName} > ${subCategoryName}`;
  }

  if (imageUrl) {
    product.images = [
      {
        src: imageUrl,
      },
    ];
  }

  let apiProduct = null;

  if (FLEXIT_ENRICH_PRODUCTS) {
    apiProduct = await enrichProductWithFlexitApi(
      product,
      sku,
      row,
      categoryMapping
    );
  }

  if (!apiProduct) {
    product.name = ensureUsefulProductName(
      buildCleanProductName(
        {},
        row,
        product.name,
        categoryMapping
      ),
      {},
      row,
      product.name,
      categoryMapping
    );
  }

  product.attributes = mergeAttributes(
    product.attributes || [],
    buildDerivedDisplayAttributes(
      apiProduct || {},
      row,
      categoryMapping,
      product.name
    )
  );

  product.meta_data.push({
    key: "ecoliz_clean_name_version",
    value: "2",
  });

  const localAttributes = (product.attributes || []).filter((attribute) => {
    const attributeName = clean(attribute.name).toLowerCase();

    return !["marque", "état", "etat", "os"].includes(attributeName);
  });

  const globalFilterAttributes = await buildGlobalFilterAttributes({
    wcRequest,
    row,
    product,
    apiProduct,
    dryRun: DRY_RUN,
  });

  product.attributes = [...localAttributes, ...globalFilterAttributes];

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

        const shouldClearStalePromotion =
          !clean(productData.sale_price) &&
          (
            clean(existingProduct.sale_price) ||
            clean(existingProduct.date_on_sale_from) ||
            clean(existingProduct.date_on_sale_to)
          );

        if (previousHash && previousHash === productHash && !shouldClearStalePromotion) {
          skipped++;
          log(`Ignoré (inchangé) : ${sku} - ${productData.name}`);
          await sleep(REQUEST_DELAY_MS);
          continue;
        }

        if (shouldClearStalePromotion) {
          log(`Nettoyage d'une ancienne promotion WooCommerce : ${sku}`);
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
