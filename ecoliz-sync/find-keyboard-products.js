require("dotenv").config();

const fs = require("fs");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const wc = new WooCommerceRestApi({
  url: process.env.WC_URL,
  consumerKey: process.env.WC_CONSUMER_KEY,
  consumerSecret: process.env.WC_CONSUMER_SECRET,
  version: "wc/v3",
  timeout: 20000,
});

function getAttributeValue(attribute) {
  if (!attribute) return "";

  if (Array.isArray(attribute.options)) {
    return attribute.options.filter(Boolean).join(", ");
  }

  if (Array.isArray(attribute.terms)) {
    return attribute.terms.map((term) => term.name).filter(Boolean).join(", ");
  }

  return "";
}

async function main() {
  const found = [];
  const layoutCounts = new Map();

  for (let page = 1; page <= 50; page++) {
    const response = await wc.get("products", {
      per_page: 100,
      page,
    });

    const products = response.data || [];

    if (products.length === 0) break;

    for (const product of products) {
      const keyboardAttr = (product.attributes || []).find((attribute) => {
        const name = String(attribute.name || "").toLowerCase();
        return (
          name === "kblanguage" ||
          name.includes("kblanguage") ||
          name.includes("langue du clavier") ||
          name.includes("keyboard language")
        );
      });

      if (!keyboardAttr) continue;

      const value = getAttributeValue(keyboardAttr);

      if (!product.sku || !value) continue;

      found.push({
        sku: product.sku,
        name: product.name,
        value,
      });

      layoutCounts.set(value, (layoutCounts.get(value) || 0) + 1);
    }
  }

  if (found.length === 0) {
    console.log("❌ Aucun produit WooCommerce avec KBlanguage trouvé.");
    process.exit(1);
  }

  fs.writeFileSync(
    "/tmp/ecoliz_keyboard_skus_from_woo.txt",
    found.map((item) => item.sku).join(","),
    "utf8"
  );

  console.log(`✅ ${found.length} produit(s) avec KBlanguage trouvés.`);
  console.log("");

  console.log("=== Types de clavier trouvés ===");
  for (const [layout, count] of layoutCounts.entries()) {
    console.log(`- ${layout} : ${count} produit(s)`);
  }

  console.log("");
  console.log("=== Exemples ===");
  for (const item of found.slice(0, 20)) {
    console.log(`${item.sku} | ${item.value} | ${item.name}`);
  }

  console.log("");
  console.log("✅ Liste des SKU écrite dans /tmp/ecoliz_keyboard_skus_from_woo.txt");
}

main().catch((error) => {
  console.error("❌ Erreur :", error.response?.status, error.response?.data || error.message);
  process.exit(1);
});
