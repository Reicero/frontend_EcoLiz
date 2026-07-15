from pathlib import Path
from datetime import datetime
import re

shop_path = Path("src/pages/Shop.tsx")
woo_path = Path("src/services/woocommerce.ts")

if not shop_path.exists():
    raise SystemExit("❌ Impossible de trouver src/pages/Shop.tsx")

if not woo_path.exists():
    raise SystemExit("❌ Impossible de trouver src/services/woocommerce.ts")

for path in [shop_path, woo_path]:
    text = path.read_text(encoding="utf-8")
    backup = path.with_suffix(path.suffix + ".bak-filters-keyboard-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
    backup.write_text(text, encoding="utf-8")
    print(f"✅ Sauvegarde créée : {backup}")

# ============================================================
# 1) WooCommerce : ajout du filtre "Langue du clavier"
# ============================================================

woo = woo_path.read_text(encoding="utf-8")

# Ajoute la clé TypeScript du nouveau filtre
if '| "keyboardLanguage"' not in woo:
    woo = woo.replace(
        '  | "licenseType";',
        '  | "keyboardLanguage"\n  | "licenseType";'
    )

# Autorise des alias d'attributs WooCommerce
if "attributeAliases?: string[];" not in woo:
    woo = re.sub(
        r"(attributeName:\s*string;\n)(\s*}> = \[)",
        r"\1  attributeAliases?: string[];\n\2",
        woo,
        count=1,
    )

# Ajoute la configuration du filtre si absente
if 'key: "keyboardLanguage"' not in woo:
    keyboard_config = '''
  {
    key: "keyboardLanguage",
    title: "Langue du clavier",
    attributeName: "Langue du clavier",
    attributeAliases: [
      "Langue clavier",
      "Disposition clavier",
      "Clavier",
      "Keyboard",
      "Keyboard layout",
      "Keyboard language",
    ],
  },
'''

    marker = '  {\n    key: "licenseEditor",'

    if marker in woo:
        woo = woo.replace(marker, keyboard_config + "\n" + marker, 1)
    else:
        woo = woo.replace("];\n\nlet filterGroupsPromise", keyboard_config + "];\n\nlet filterGroupsPromise", 1)

# Modifie la recherche d'attribut pour accepter les alias
old_lookup = '''      const expectedName = normalizeLookupValue(configuration.attributeName);

      const attribute = attributes.find(
        (item) => normalizeLookupValue(item.name) === expectedName
      );'''

new_lookup = '''      const expectedNames = [
        configuration.attributeName,
        ...(configuration.attributeAliases ?? []),
      ].map(normalizeLookupValue);

      const attribute = attributes.find((item) =>
        expectedNames.includes(normalizeLookupValue(item.name))
      );'''

if old_lookup in woo:
    woo = woo.replace(old_lookup, new_lookup, 1)

woo_path.write_text(woo, encoding="utf-8")

# ============================================================
# 2) Boutique : comportement des catégories/sous-catégories
# ============================================================

shop = shop_path.read_text(encoding="utf-8")

# Ajoute "Langue du clavier" dans les familles PC / portables / workstations
def add_filter_to_category_array(source: str, key: str) -> str:
    pattern = re.compile(
        rf'((?:"{re.escape(key)}"|{re.escape(key)}):\s*\[)(.*?)(\n\s*\],)',
        re.S,
    )

    def repl(match):
        start, body, end = match.groups()

        if "langue-du-clavier" in body:
            return match.group(0)

        lines = body.splitlines()
        inserted = False
        next_lines = []

        for line in lines:
            next_lines.append(line)

            if not inserted and '"etat"' in line:
                indent = re.match(r"(\s*)", line).group(1)
                next_lines.append(f'{indent}"langue-du-clavier",')
                inserted = True

        if not inserted:
            next_lines.append('    "langue-du-clavier",')

        return start + "\n".join(next_lines) + end

    return pattern.sub(repl, source)

for key in [
    "pc",
    "notebooks",
    "workstations",
    "pc-portables",
    "ordinateurs-portables",
    "laptops",
    "laptop",
]:
    shop = add_filter_to_category_array(shop, key)

# Remplace la logique : si aucune sous-catégorie n'est cochée,
# on affiche quand même tous les produits de la catégorie principale.
old_block = '''  const selectedCategoryKey = selectedCategoryIds.join(",");
  const categoryGroups = getCategoryGroups(categories);
  const selectedMainCategory =
    categoryGroups.find((group) => group.title === selectedMainCategoryTitle) ??
    null;
'''

new_block = '''  const categoryGroups = getCategoryGroups(categories);
  const selectedMainCategory =
    categoryGroups.find((group) => group.title === selectedMainCategoryTitle) ??
    null;
  const activeCategoryIds =
    selectedCategoryIds.length > 0
      ? selectedCategoryIds
      : selectedMainCategory?.children.map((category) => category.id) ?? [];
  const selectedCategoryKey = activeCategoryIds.join(",");
'''

if old_block in shop:
    shop = shop.replace(old_block, new_block, 1)
elif "const activeCategoryIds" not in shop:
    raise SystemExit("❌ Impossible de placer activeCategoryIds automatiquement dans Shop.tsx")

# Quand on arrive via l'URL ?categorie=pc, on sélectionne la catégorie principale,
# mais on ne coche plus toutes les sous-catégories.
shop = shop.replace(
    '        setSelectedCategoryIds(group.children.map((category) => category.id));',
    '        setSelectedCategoryIds([]);'
)

# Quand on clique sur une catégorie principale, on ne coche plus toutes les sous-catégories.
shop = shop.replace(
    '    setSelectedCategoryIds(group.children.map((category) => category.id));',
    '    setSelectedCategoryIds([]);'
)

# Les requêtes produits utilisent maintenant activeCategoryIds :
# - catégorie principale seule = tous les enfants
# - sous-catégorie cochée = seulement cette sous-catégorie
shop = shop.replace(
    "      selectedCategoryIds.length === 0",
    "      activeCategoryIds.length === 0"
)

shop = shop.replace(
    "    if (!isSearching && selectedCategoryIds.length === 0) {",
    "    if (!isSearching && activeCategoryIds.length === 0) {"
)

shop = shop.replace(
    "          categoryIds: selectedCategoryIds,",
    "          categoryIds: activeCategoryIds,"
)

shop = shop.replace(
    "              categoryIds: selectedCategoryIds,",
    "              categoryIds: activeCategoryIds,"
)

shop = shop.replace(
    "      categoryIds: isSearching ? undefined : selectedCategoryIds,",
    "      categoryIds: isSearching ? undefined : activeCategoryIds,"
)

# Dépendances React : selectedCategoryKey représente maintenant la vraie sélection active
shop = shop.replace(
    "    selectedCategoryIds,\n    selectedStockStatuses,",
    "    selectedCategoryKey,\n    selectedStockStatuses,"
)

shop_path.write_text(shop, encoding="utf-8")

print("✅ Comportement des filtres modifié")
print("- Catégorie principale : affiche tous les produits")
print("- Sous-catégories : décochées par défaut")
print("- Clic sous-catégorie : filtre uniquement cette sous-catégorie")
print("- Nouveau filtre : Langue du clavier")
