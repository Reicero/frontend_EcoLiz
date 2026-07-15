from pathlib import Path
from datetime import datetime
import re

path = Path("src/pages/Shop.tsx")

if not path.exists():
    raise SystemExit("❌ Impossible de trouver src/pages/Shop.tsx")

text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-keyboard-front-only-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

# ============================================================
# 1) Ajout de fonctions front pour créer le filtre Clavier
#    depuis l'attribut produit KBlanguage
# ============================================================

helper = r'''
function mapKeyboardLanguageLabel(value: string) {
  const normalized = normalizeFilterValue(value);

  if (normalized.includes("french") || normalized.includes("francais")) {
    return "AZERTY FR";
  }

  if (normalized.includes("german") || normalized.includes("deutsch")) {
    return "QWERTZ DE";
  }

  if (normalized.includes("spanish") || normalized.includes("espagnol") || normalized.includes("espanol")) {
    return "Espagnol";
  }

  if (normalized.includes("italian") || normalized.includes("italien")) {
    return "Italien";
  }

  if (
    normalized.includes("uk") ||
    normalized.includes("united-kingdom") ||
    normalized.includes("british")
  ) {
    return "QWERTY UK";
  }

  if (
    normalized.includes("us") ||
    normalized.includes("us-int") ||
    normalized.includes("united-states") ||
    normalized.includes("american")
  ) {
    return "QWERTY US";
  }

  return "Autre";
}

function getProductKeyboardLanguages(product: Product) {
  return (product.attributes ?? [])
    .filter((attribute) => {
      const name = normalizeFilterValue(attribute.name);

      return (
        name === "kblanguage" ||
        name === "kb-language" ||
        name === "keyboard-language" ||
        name === "langue-du-clavier" ||
        name === "langue-clavier" ||
        name === "clavier"
      );
    })
    .flatMap((attribute) => attribute.values)
    .map(mapKeyboardLanguageLabel);
}

function shouldShowKeyboardLanguageFilter(selectedMainCategoryTitle: string | null) {
  if (!selectedMainCategoryTitle) return false;

  const category = normalizeFilterValue(selectedMainCategoryTitle);

  return (
    category.includes("notebook") ||
    category.includes("portable") ||
    category.includes("workstation") ||
    category.includes("pc")
  );
}

function buildKeyboardLanguageFilterGroup(
  products: Product[],
  selectedMainCategoryTitle: string | null
): WooFilterGroup | null {
  if (!shouldShowKeyboardLanguageFilter(selectedMainCategoryTitle)) {
    return null;
  }

  const counts = new Map<string, number>();

  products.forEach((product) => {
    getProductKeyboardLanguages(product).forEach((language) => {
      counts.set(language, (counts.get(language) ?? 0) + 1);
    });
  });

  const orderedLabels = [
    "AZERTY FR",
    "QWERTY UK",
    "QWERTY US",
    "QWERTZ DE",
    "Espagnol",
    "Italien",
    "Autre",
  ];

  const options = orderedLabels
    .filter((label) => counts.has(label))
    .map((label, index) => ({
      id: 900000 + index,
      name: label,
      slug: normalizeFilterValue(label),
      count: counts.get(label) ?? 0,
    }));

  if (options.length === 0) {
    return null;
  }

  return {
    key: "keyboardLanguage",
    title: "Clavier",
    taxonomy: "",
    options,
  };
}

function addKeyboardLanguageFilterGroup(
  groups: WooFilterGroup[],
  products: Product[],
  selectedMainCategoryTitle: string | null
) {
  if (groups.some((group) => group.key === "keyboardLanguage")) {
    return groups;
  }

  const keyboardGroup = buildKeyboardLanguageFilterGroup(
    products,
    selectedMainCategoryTitle
  );

  if (!keyboardGroup) {
    return groups;
  }

  const insertAfterIndex = groups.findIndex(
    (group) => group.key === "condition" || normalizeFilterValue(group.title) === "etat"
  );

  if (insertAfterIndex === -1) {
    return [keyboardGroup, ...groups];
  }

  return [
    ...groups.slice(0, insertAfterIndex + 1),
    keyboardGroup,
    ...groups.slice(insertAfterIndex + 1),
  ];
}

function filterProductsByKeyboardLanguage(
  products: Product[],
  selectedKeyboardLanguages: string[] | undefined
) {
  if (!selectedKeyboardLanguages || selectedKeyboardLanguages.length === 0) {
    return products;
  }

  return products.filter((product) => {
    const productLanguages = getProductKeyboardLanguages(product).map((language) =>
      normalizeFilterValue(language)
    );

    return selectedKeyboardLanguages.some((selectedLanguage) =>
      productLanguages.includes(selectedLanguage)
    );
  });
}
'''

if "function buildKeyboardLanguageFilterGroup" not in text:
    marker = "function buildContextualFilterGroups("
    if marker not in text:
        raise SystemExit("❌ Impossible de placer les fonctions clavier dans Shop.tsx")

    text = text.replace(marker, helper.strip() + "\n\n" + marker, 1)

# ============================================================
# 2) Injecter le filtre Clavier dans les filtres affichés
# ============================================================

old_visible = '''  const visibleFilterGroups = buildContextualFilterGroups(
    filterGroups,
    categoryFilterProducts,
    selectedMainCategoryTitle
  );'''

new_visible = '''  const visibleFilterGroups = addKeyboardLanguageFilterGroup(
    buildContextualFilterGroups(
      filterGroups,
      categoryFilterProducts,
      selectedMainCategoryTitle
    ),
    categoryFilterProducts,
    selectedMainCategoryTitle
  );

  const displayedProducts = filterProductsByKeyboardLanguage(
    products,
    selectedFilters.keyboardLanguage
  );'''

if old_visible in text:
    text = text.replace(old_visible, new_visible, 1)
elif "const displayedProducts = filterProductsByKeyboardLanguage" not in text:
    raise SystemExit("❌ Impossible de remplacer visibleFilterGroups automatiquement.")

# ============================================================
# 3) Utiliser displayedProducts dans l'affichage boutique
# ============================================================

text = text.replace("products.length === 0", "displayedProducts.length === 0")
text = text.replace("{products.map((product) => (", "{displayedProducts.map((product) => (")

path.write_text(text, encoding="utf-8")

print("✅ Filtre Clavier ajouté côté front uniquement")
print("✅ Donnée utilisée : attribut produit KBlanguage")
print("✅ Aucun changement sur la récupération WooCommerce")
print(f"Sauvegarde créée : {backup}")
