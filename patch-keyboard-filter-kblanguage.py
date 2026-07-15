from pathlib import Path
from datetime import datetime
import re

path = Path("src/services/woocommerce.ts")

if not path.exists():
    raise SystemExit("❌ Impossible de trouver src/services/woocommerce.ts")

text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".ts.bak-kblanguage-filter-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

# 1) S'assurer que le filtre clavier existe
if 'key: "keyboardLanguage"' not in text:
    keyboard_config = '''  {
    key: "keyboardLanguage",
    title: "Clavier",
    attributeName: "KBlanguage",
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
    ],
  },
'''

    condition_block = re.search(r'  \{\s*key:\s*"condition"[\s\S]*?\},\n', text)

    if condition_block:
      text = text[:condition_block.end()] + keyboard_config + text[condition_block.end():]
    else:
      text = text.replace("] as const;", keyboard_config + "] as const;", 1)

# 2) Ajouter KBlanguage dans les alias si le bloc existe déjà
keyboard_block = re.search(r'  \{\s*key:\s*"keyboardLanguage"[\s\S]*?\},', text)

if keyboard_block:
    block = keyboard_block.group(0)

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

    text = text[:keyboard_block.start()] + block + text[keyboard_block.end():]

# 3) Ajouter une fonction pour convertir les valeurs anglaises en valeurs propres
mapper = r'''
function mapKeyboardLanguageValue(value: string) {
  const normalized = normalizeLookupValue(value);

  if (
    normalized.includes("french") ||
    normalized.includes("francais") ||
    normalized === "fr" ||
    normalized.includes("azerty")
  ) {
    return "AZERTY FR";
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

  if (
    normalized.includes("german") ||
    normalized.includes("deutsch") ||
    normalized === "de" ||
    normalized.includes("qwertz")
  ) {
    return "QWERTZ DE";
  }

  if (
    normalized.includes("spanish") ||
    normalized.includes("espagnol") ||
    normalized.includes("espanol")
  ) {
    return "Espagnol";
  }

  if (
    normalized.includes("italian") ||
    normalized.includes("italien")
  ) {
    return "Italien";
  }

  return "Autre";
}
'''

if "function mapKeyboardLanguageValue" not in text:
    marker = "function normalizeLookupValue"
    pos = text.find(marker)

    if pos != -1:
        text = text[:pos] + mapper.strip() + "\n\n" + text[pos:]
    else:
        raise SystemExit("❌ Impossible de trouver normalizeLookupValue pour placer le mapper clavier.")

# 4) Transformer les valeurs uniquement pour le filtre clavier
# Cas classique : terms.map(...name...)
patterns = [
    (
        "term.name",
        'configuration.key === "keyboardLanguage" ? mapKeyboardLanguageValue(term.name) : term.name'
    ),
    (
        "String(term.name)",
        'configuration.key === "keyboardLanguage" ? mapKeyboardLanguageValue(String(term.name)) : String(term.name)'
    ),
]

for old, new in patterns:
    if old in text and new not in text:
        text = text.replace(old, new)

path.write_text(text, encoding="utf-8")

print("✅ Filtre clavier corrigé pour utiliser l’attribut WooCommerce KBlanguage")
print("✅ Valeurs converties : French -> AZERTY FR, German -> QWERTZ DE, Spanish -> Espagnol, US -> QWERTY US")
print(f"Sauvegarde créée : {backup}")
