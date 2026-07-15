require("dotenv").config({ override: true });

const fs = require("fs");
const { parse } = require("csv-parse/sync");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

function clean(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function parseDate(value) {
  const text = clean(value);
  if (!text) return null;
  return new Date(`${text}T23:59:59`);
}

const wc = new WooCommerceRestApi({
  url: "http://127.0.0.1:12443/index.php",
  consumerKey: clean(process.env.WC_CONSUMER_KEY),
  consumerSecret: clean(process.env.WC_CONSUMER_SECRET),
  version: "wc/v3",
  timeout: 60000,
});

const content = fs.readFileSync("promotions.csv", "utf8");
const records = parse(content, {
  columns: true,
  skip_empty_lines: true,
  delimiter: ";",
  bom: true,
  trim: true,
});

const now = new Date();

async function run() {
  for (const record of records) {
    const sku = clean(record.sku);
    const endDate = parseDate(record.end_date);

    if (!sku || !endDate || now <= endDate) {
      continue;
    }

    console.log(`Nettoyage promo expirée : ${sku}`);

    const search = await wc.get("products", {
      sku,
      status: "any",
      per_page: 1,
    });

    const product = search.data[0];

    if (!product) {
      console.log(`  Produit introuvable : ${sku}`);
      continue;
    }

    console.log(`  Avant : sale_price=${product.sale_price || "(vide)"}`);

    await wc.put(`products/${product.id}`, {
      sale_price: "",
      date_on_sale_from: null,
      date_on_sale_to: null,
      meta_data: [
        {
          key: "ecoliz_promotion_active",
          value: "expired",
        },
      ],
    });

    console.log(`  OK : promo supprimée pour ${sku}`);
  }
}

run().catch((error) => {
  console.error(error.response?.data || error.message);
  process.exit(1);
});
