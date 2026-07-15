from pathlib import Path
from datetime import datetime
import re

shop_path = Path("src/pages/Shop.tsx")
woo_path = Path("src/services/woocommerce.ts")

for path in [shop_path, woo_path]:
    if not path.exists():
        raise SystemExit(f"❌ Fichier introuvable : {path}")

    backup = path.with_suffix(path.suffix + ".bak-filter-labels-keyboard-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
    backup.write_text(path.read_text(encoding="utf-8"), encoding="utf-8")
    print(f"✅ Sauvegarde créée : {backup}")

# ============================================================
# 1) WooCommerce : noms courts + filtre clavier dans les premiers
# ============================================================

woo = woo_path.read_text(encoding="utf-8")

# Ajoute la clé TypeScript si elle n'existe pas
if '"keyboardLanguage"' not in woo:
    woo = re.sub(
        r'(\|\s*"condition"\n)',
        r'\1  | "keyboardLanguage"\n',
        woo,
        count=1,
    )

# Ajoute attributeAliases dans la config si nécessaire
if "attributeAliases?: string[];" not in woo:
    woo = woo.replace(
        "  attributeName: string;\n}> = [",
        "  attributeName: string;\n  attributeAliases?: string[];\n}> = [",
    )

# Raccourcit les titres existants
title_replacements = {
    'title: "Modèle processeur"': 'title: "Modèle CPU"',
    'title: "Génération processeur"': 'title: "Génération CPU"',
    'title: "Nombre de cœurs"': 'title: "Cœurs"',
    'title: "Carte graphique"': 'title: "GPU"',
    'title: "Modèle carte graphique"': 'title: "Modèle GPU"',
    'title: "Taille écran"': 'title: "Écran"',
    'title: "Technologie de dalle"': 'title: "Dalle"',
    'title: "Compatible VESA"': 'title: "VESA"',
    'title: "Webcam intégrée"': 'title: "Webcam"',
    'title: "Langue du clavier"': 'title: "Clavier"',
    'title: "Langue clavier"': 'title: "Clavier"',
}

for old, new in title_replacements.items():
    woo = woo.replace(old, new)

# Ajoute le filtre clavier après État si absent
if 'key: "keyboardLanguage"' not in woo:
    keyboard_config = '''  {
    key: "keyboardLanguage",
    title: "Clavier",
    attributeName: "Langue du clavier",
    attributeAliases: [
      "Langue clavier",
      "Disposition clavier",
      "Clavier",
      "Keyboard",
      "Keyboard layout",
      "Keyboard language",
      "Keyboard Language",
    ],
  },
'''

    condition_block = re.search(
        r'  \{\s*key:\s*"condition"[\s\S]*?\},\n',
        woo,
    )

    if condition_block:
        insert_at = condition_block.end()
        woo = woo[:insert_at] + keyboard_config + woo[insert_at:]
    else:
        woo = woo.replace("] as const;", keyboard_config + "] as const;", 1)

# Si la recherche d'attributs ne gère pas encore les alias, on la corrige
old_lookup = '''      const expectedName = normalizeLookupValue(configuration.attributeName);

      const attribute = attributes.find(
        (item) => normalizeLookupValue(item.name) === expectedName
      );'''

new_lookup = '''      const expectedNames = [
        configuration.attributeName,
        ...(configuration.attributeAliases ?? []),
      ].map(normalizeLookupValue);

      const attribute = attributes.find((item) =>
        expectedNames.some((expectedName) =>
          normalizeLookupValue(item.name).includes(expectedName) ||
          expectedName.includes(normalizeLookupValue(item.name))
        )
      );'''

if old_lookup in woo:
    woo = woo.replace(old_lookup, new_lookup, 1)

woo_path.write_text(woo, encoding="utf-8")

# ============================================================
# 2) Shop : noms courts côté affichage + clavier dans les filtres visibles
# ============================================================

shop = shop_path.read_text(encoding="utf-8")

# Ajoute clavier/keyboard dans les filtres autorisés des catégories.
# Même si on l'ajoute un peu largement, il ne s'affichera que si des valeurs existent.
filter_block_match = re.search(
    r"(const FILTERS_BY_CATEGORY[\s\S]*?\};)",
    shop,
)

if filter_block_match:
    block = filter_block_match.group(1)

    lines = block.splitlines()
    next_lines = []

    for line in lines:
        next_lines.append(line)

        if (
            ('"etat"' in line or '"condition"' in line)
            and '"clavier"' not in "\n".join(next_lines[-4:])
        ):
            indent = re.match(r"(\s*)", line).group(1)
            next_lines.append(f'{indent}"clavier",')
            next_lines.append(f'{indent}"keyboard",')
            next_lines.append(f'{indent}"langue-du-clavier",')

    new_block = "\n".join(next_lines)
    shop = shop.replace(block, new_block, 1)
else:
    print("⚠️ Bloc FILTERS_BY_CATEGORY non trouvé dans Shop.tsx.")

# Fonction d'affichage courte si absente
compact_function = r'''
function getCompactFilterTitle(title: string) {
  const normalizedTitle = normalizeText(title).replace(/\s+/g, "-");

  const compactTitles: Record<string, string> = {
    "modele-processeur": "Modèle CPU",
    "generation-processeur": "Génération CPU",
    "nombre-de-coeurs": "Cœurs",
    "carte-graphique": "GPU",
    "modele-carte-graphique": "Modèle GPU",
    "taille-ecran": "Écran",
    "technologie-de-dalle": "Dalle",
    "compatible-vesa": "VESA",
    "webcam-integree": "Webcam",
    "langue-du-clavier": "Clavier",
    "langue-clavier": "Clavier",
    "disposition-clavier": "Clavier",
    "keyboard-language": "Clavier",
    "keyboard-layout": "Clavier",
  };

  return compactTitles[normalizedTitle] ?? title;
}
'''

if "function getCompactFilterTitle" not in shop:
    marker = "\nfunction FilterGroup("
    if marker in shop:
        shop = shop.replace(marker, "\n" + compact_function.strip() + "\n\nfunction FilterGroup(", 1)
    else:
        print("⚠️ Impossible de placer getCompactFilterTitle automatiquement.")

# Utilise le titre court dans les boutons de filtres
shop = shop.replace(
    "title={group.title}",
    "title={getCompactFilterTitle(group.title)}",
)

# Élargit très légèrement les boutons pour éviter les coupures restantes
shop = shop.replace(
    'className="relative w-full self-start sm:w-[180px]"',
    'className="relative w-full self-start sm:w-[188px]"',
)

shop_path.write_text(shop, encoding="utf-8")

print("✅ Noms des filtres raccourcis")
print("✅ Filtre clavier placé dans les premiers filtres si l’attribut existe")
