const { getFlexitProductDetails } = require("./flexit-api");

async function main() {
  const sku = process.argv[2];

  if (!sku) {
    console.error("Utilisation : node test-flexit-api.js <SKU>");
    process.exit(1);
  }

  const product = await getFlexitProductDetails(sku);

  console.log("Produit récupéré depuis l'API FlexIT :");
  console.log(JSON.stringify(product, null, 2));
}

main().catch((error) => {
  console.error("Erreur test API FlexIT :", error.message);
  process.exit(1);
});
