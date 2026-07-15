require("dotenv").config();

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const wc = new WooCommerceRestApi({
  url: process.env.WC_URL,
  consumerKey: process.env.WC_CONSUMER_KEY,
  consumerSecret: process.env.WC_CONSUMER_SECRET,
  version: "wc/v3",
  timeout: 15000,
});

async function main() {
  console.log("URL WooCommerce :", process.env.WC_URL);

  const response = await wc.get("products/attributes", {
    per_page: 100,
  });

  const attrs = response.data || [];

  const matches = attrs.filter((attr) => {
    const text = `${attr.name || ""} ${attr.slug || ""}`.toLowerCase();
    return text.includes("clavier") || text.includes("keyboard") || text.includes("langue");
  });

  if (matches.length === 0) {
    console.log("❌ Aucun attribut global clavier/langue trouvé.");
    return;
  }

  for (const attr of matches) {
    console.log(`✅ Attribut trouvé : ID=${attr.id} | ${attr.name} | ${attr.slug}`);

    const termsResponse = await wc.get(`products/attributes/${attr.id}/terms`, {
      per_page: 100,
    });

    const terms = termsResponse.data || [];

    if (terms.length === 0) {
      console.log("   ⚠️ Aucun terme.");
    } else {
      for (const term of terms) {
        console.log(`   - ${term.name} | count=${term.count} | slug=${term.slug}`);
      }
    }
  }
}

main().catch((error) => {
  console.error("❌ Erreur WooCommerce :", error.response?.status, error.response?.data || error.message);
  process.exit(1);
});
