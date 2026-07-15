const { getFlexitProductDetails } = require("./flexit-api");

const skus = process.argv.slice(2);

if (skus.length === 0) {
  console.error(
    "Utilisation : node inspect-specifications.js SKU1 SKU2 SKU3"
  );
  process.exit(1);
}

async function main() {
  for (const sku of skus) {
    console.log("\n==================================================");
    console.log(`SKU : ${sku}`);
    console.log("==================================================");

    try {
      const product = await getFlexitProductDetails(sku);

      console.log("Fabricant :", product.manufacturerName || "");
      console.log("Modèle :", product.modelName || "");
      console.log("Description :", product.shortDescription || "");

      const specifications = Array.isArray(product.specifications)
        ? product.specifications
        : [];

      if (specifications.length === 0) {
        console.log("Aucune spécification reçue.");
        continue;
      }

      for (const specification of specifications) {
        console.log(
          `${String(specification.key || "").trim()} = ${String(
            specification.value || ""
          ).trim()}`
        );
      }
    } catch (error) {
      console.error(
        "Erreur :",
        error.response?.data || error.message
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
