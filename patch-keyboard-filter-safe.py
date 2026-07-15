from pathlib import Path
from datetime import datetime
import re

woo_path = Path("src/services/woocommerce.ts")
shop_path = Path("src/pages/Shop.tsx")

for path in [woo_path, shop_path]:
    backup = path.with_suffix(path.suffix + ".bak-keyboard-safe-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
    backup.write_text(path.read_text(encoding="utf-8"), encoding="utf-8")
    print(f"✅ Sauvegarde créée : {backup}")

woo = woo_path.read_text(encoding="utf-8")

# 1) Corrige uniquement le bloc du filtre clavier
block_match = re.search(r'  \{\s*key:\s*"keyboardLanguage"[\s\S]*?\n  \},', woo)

if not block_match:
    raise SystemExit("❌ Bloc keyboardLanguage introuvable dans woocommerce.ts")

block = block_match.group(0)

block = re.sub(r'title:\s*"[^"]+"', 'title: "Clavier"', block)
block = re.sub(r'attributeName:\s*"[^"]+"', 'attributeName: "KBlanguage"', block)

aliases = [
    "KBlanguage",
    "KB language",
    "KB Language",
    "Keyboard language",
    "Keyboard Language",
    "Keyboard layout",
    "Langue du clavier",
    "Langue clavier",
    "Disposition clavier",
    "Clavier",
]

if "attributeAliases" in block:
    for alias in aliases:
        if f'"{alias}"' not in block:
            block = block.replace("attributeAliases: [", f'attributeAliases: [\n      "{alias}",', 1)
else:
    block = block.replace(
        'attributeName: "KBlanguage",',
        '''attributeName: "KBlanguage",
    attributeAliases: [
      "KBlanguage",
      "KB language",
      "KB Language",
      "Keyboard language",
      "Keyboard Language",
      "Keyboard layout",
      "Langue du clavier",
      "Langue clavier",
      "Disposition clavier",
      "Clavier",
    ],'''
    )

woo = woo[:block_match.start()] + block + woo[block_match.end():]
woo_path.write_text(woo, encoding="utf-8")

shop = shop_path.read_text(encoding="utf-8")

# 2) Ajoute la vraie clé technique dans les catégories qui ont déjà tenté d’ajouter clavier
lines = shop.splitlines()
new_lines = []

for i, line in enumerate(lines):
    new_lines.append(line)

    if (
        ('"condition"' in line or '"etat"' in line)
        and not any('"keyboardLanguage"' in l for l in lines[max(0, i-3):i+8])
    ):
        indent = re.match(r"(\s*)", line).group(1)
        new_lines.append(f'{indent}"keyboardLanguage",')

shop = "\n".join(new_lines) + "\n"

shop_path.write_text(shop, encoding="utf-8")

print("✅ Filtre clavier corrigé sans toucher à la récupération des produits")
print("- clé technique ajoutée dans Shop.tsx : keyboardLanguage")
print("- attribut WooCommerce lu : KBlanguage")
