from pathlib import Path

path = Path("sync-flexit.js")
text = path.read_text()

if "function mapEcoLizCategory(row)" in text:
    print("Le mapping des catégories semble déjà être présent. Rien à faire.")
    raise SystemExit

start_marker = "const categoryCache = new Map();"
end_marker = "async function buildWooProduct(row) {"

start = text.index(start_marker)
end = text.index(end_marker)

new_block = r'''const categoryCache = new Map();

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

  const createResponse = await wcRequest("post", "/products/categories", {
    name,
    parent,
  });

  categoryCache.set(cacheKey, createResponse.data.id);
  return createResponse.data.id;
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

  if (hasAny(combined, ["software", "license", "licence", "smartnet", "ilo pack"])) {
    return {
      parent: "Licences & Logiciels",
      child: hasAny(combined, ["smartnet", "network", "firewall", "router", "switch"])
        ? "Licences réseau / Smartnet"
        : "Licences serveur",
    };
  }

  if (category === "monitors" || hasAny(combined, ["monitor", "tft"])) {
    return {
      parent: "Écrans & accessoires",
      child: hasAny(combined, ["option", "accessoire", "accessories"])
        ? "Accessoires écrans"
        : "Écrans",
    };
  }

  if (
    category === "networking" ||
    hasAny(combined, ["switch", "router", "wireless", "wifi", "wi-fi", "sfp", "glc", "optic", "network card", "firewall", "controller", "cable"])
  ) {
    if (hasAny(combined, ["wireless", "wifi", "wi-fi"])) {
      return { parent: "Réseau & Wi-Fi", child: "Wi-Fi" };
    }

    if (hasAny(combined, ["switch"])) {
      return { parent: "Réseau & Wi-Fi", child: "Switches" };
    }

    if (hasAny(combined, ["router", "firewall", "controller"])) {
      return { parent: "Réseau & Wi-Fi", child: "Routeurs & Firewalls" };
    }

    if (hasAny(combined, ["sfp", "glc", "optic"])) {
      return { parent: "Réseau & Wi-Fi", child: "Modules SFP / Optiques" };
    }

    if (hasAny(combined, ["network card"])) {
      return { parent: "Réseau & Wi-Fi", child: "Cartes réseau" };
    }

    if (hasAny(combined, ["cable"])) {
      return { parent: "Réseau & Wi-Fi", child: "Câbles réseau" };
    }

    return { parent: "Réseau & Wi-Fi", child: "Équipements réseau" };
  }

  if (
    category === "servers" ||
    category === "storage" ||
    hasAny(combined, ["server", "storage", "hdd", "ssd", "sas", "s-ata", "raid", "rack", "blade", "hard drive", "harddrive"])
  ) {
    if (hasAny(combined, ["hdd", "ssd", "sas", "s-ata", "hard drive", "harddrive"])) {
      return { parent: "Serveurs & Stockage", child: "Disques serveur" };
    }

    if (hasAny(combined, ["raid"])) {
      return { parent: "Serveurs & Stockage", child: "Contrôleurs RAID" };
    }

    if (hasAny(combined, ["rail", "rackmount"])) {
      return { parent: "Serveurs & Stockage", child: "Rails et accessoires rack" };
    }

    if (hasAny(combined, ["blade"])) {
      return { parent: "Serveurs & Stockage", child: "Serveurs blade" };
    }

    if (hasAny(combined, ["tower"])) {
      return { parent: "Serveurs & Stockage", child: "Serveurs tour" };
    }

    if (hasAny(combined, ["rack"])) {
      return { parent: "Serveurs & Stockage", child: "Serveurs rack" };
    }

    if (hasAny(combined, ["storage"])) {
      return { parent: "Serveurs & Stockage", child: "Stockage" };
    }

    return { parent: "Serveurs & Stockage", child: "Options serveur" };
  }

  if (
    category === "notebooks" ||
    category === "tablet pc's" ||
    hasAny(combined, ["notebook", "chromebook", "tablet", "docking", "port replicator", "bag", "sleeve", "case", "stand"])
  ) {
    if (hasAny(combined, ["chromebook"])) {
      return { parent: "Ordinateurs portables & Mobilité", child: "Chromebooks" };
    }

    if (hasAny(combined, ["tablet"])) {
      return { parent: "Ordinateurs portables & Mobilité", child: "Tablettes" };
    }

    if (hasAny(combined, ["docking", "port replicator"])) {
      return { parent: "Ordinateurs portables & Mobilité", child: "Docks et stations d'accueil" };
    }

    if (hasAny(combined, ["bag", "sleeve", "case"])) {
      return { parent: "Ordinateurs portables & Mobilité", child: "Sacs et housses" };
    }

    if (hasAny(combined, ["stand", "accessoire", "accessories"])) {
      return { parent: "Ordinateurs portables & Mobilité", child: "Accessoires mobilité" };
    }

    return { parent: "Ordinateurs portables & Mobilité", child: "Notebooks" };
  }

  if (
    category === "workstations" ||
    category === "personal computers" ||
    hasAny(combined, ["workstation", "computer", "desktop", "tower", "all in one", "aio", "cpu", "processor", "memory"])
  ) {
    if (hasAny(combined, ["workstation mobile"])) {
      return { parent: "PC fixes & Workstations", child: "Workstations mobiles" };
    }

    if (hasAny(combined, ["workstation computer"])) {
      return { parent: "PC fixes & Workstations", child: "Workstations fixes" };
    }

    if (hasAny(combined, ["all in one", "aio"])) {
      return { parent: "PC fixes & Workstations", child: "All-in-One" };
    }

    if (hasAny(combined, ["workstation option", "workstation memory", "workstation cpu", "workstation hdd", "processor", "memory"])) {
      return { parent: "PC fixes & Workstations", child: "Composants Workstation" };
    }

    return { parent: "PC fixes & Workstations", child: "PC fixes" };
  }

  return {
    parent: "Autres",
    child: flexitCategory || "Non classé",
  };
}

'''

text = text[:start] + new_block + text[end:]

text = text.replace(
    '  const categoryName = clean(row["Category"]);',
    '''  const categoryMapping = mapEcoLizCategory(row);
  const categoryName = categoryMapping.parent;
  const subCategoryName = categoryMapping.child;'''
)

text = text.replace(
    '''  let categoryId = null;

  if (!DRY_RUN) {
    categoryId = await getOrCreateCategory(categoryName);
  }''',
    '''  let parentCategoryId = null;
  let categoryId = null;

  if (!DRY_RUN) {
    const categoryPath = await getOrCreateCategoryPath(
      categoryName,
      subCategoryName
    );

    parentCategoryId = categoryPath.parentId;
    categoryId = categoryPath.childId;
  }'''
)

text = text.replace(
    '''      {
        key: "product_group",
        value: clean(row["Product Group"]),
      },
      {
        key: "incoming_quantity",''',
    '''      {
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
        key: "incoming_quantity",'''
)

text = text.replace(
    '''  if (categoryId) {
    product.categories = [{ id: categoryId }];
  }''',
    '''  if (parentCategoryId && categoryId && parentCategoryId !== categoryId) {
    product.categories = [{ id: parentCategoryId }, { id: categoryId }];
  } else if (categoryId) {
    product.categories = [{ id: categoryId }];
  }'''
)

text = text.replace(
    '''  if (DRY_RUN && categoryName) {
    product.category_preview = categoryName;
  }''',
    '''  if (DRY_RUN && categoryName) {
    product.category_preview = `${categoryName} > ${subCategoryName}`;
  }'''
)

path.write_text(text)
print("Le fichier sync-flexit.js a été modifié.")
