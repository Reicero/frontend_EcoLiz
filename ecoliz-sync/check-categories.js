const fs = require("fs");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

function loadEnvFile(path = ".env") {
  const content = fs.readFileSync(path, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const cleanLine = trimmed.startsWith("export ")
      ? trimmed.slice(7).trim()
      : trimmed;

    const equalIndex = cleanLine.indexOf("=");

    if (equalIndex === -1) {
      continue;
    }

    const key = cleanLine.slice(0, equalIndex).trim();
    let value = cleanLine.slice(equalIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFile();

const api = new WooCommerceRestApi({
  url: process.env.WC_URL,
  consumerKey: process.env.WC_CONSUMER_KEY,
  consumerSecret: process.env.WC_CONSUMER_SECRET,
  version: "wc/v3",
});

async function getAllCategories() {
  let page = 1;
  let allCategories = [];

  while (true) {
    const response = await api.get("products/categories", {
      per_page: 100,
      page,
      hide_empty: false,
    });

    allCategories = allCategories.concat(response.data);

    const totalPages = Number(response.headers["x-wp-totalpages"] || 1);

    if (page >= totalPages) {
      break;
    }

    page++;
  }

  return allCategories;
}

async function main() {
  const categories = await getAllCategories();

  const parents = categories
    .filter((category) => Number(category.parent || 0) === 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  const childrenByParent = new Map();

  for (const category of categories) {
    const parent = Number(category.parent || 0);

    if (!childrenByParent.has(parent)) {
      childrenByParent.set(parent, []);
    }

    childrenByParent.get(parent).push(category);
  }

  console.log("Catégories WooCommerce :");
  console.log("");

  for (const parent of parents) {
    console.log(`${parent.id} | ${parent.name} | produits=${parent.count}`);

    const children = (childrenByParent.get(parent.id) || []).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    for (const child of children) {
      console.log(`  └─ ${child.id} | ${child.name} | produits=${child.count}`);
    }
  }
}

main().catch((error) => {
  console.error(error.response?.data || error.message);
  process.exit(1);
});
