from pathlib import Path
import re

path = Path("global-filters.js")
text = path.read_text(encoding="utf-8")

# 1) Ajoute la définition du filtre global WooCommerce
if "keyboardLanguage" not in text.split("};", 1)[0]:
    text = text.replace(
        '  licenseType: { name: "Type de licence", slug: "type-licence" },',
        '''  licenseType: { name: "Type de licence", slug: "type-licence" },
  keyboardLanguage: { name: "Langue du clavier", slug: "langue-du-clavier" },'''
    )

# 2) Ajoute la fonction de normalisation des langues clavier
if "function normalizeKeyboardLanguage" not in text:
    keyboard_function = r'''
function normalizeKeyboardLanguage(value) {
  const text = normalizeText(value);

  if (!text) return "";

  if (
    text.includes("french") ||
    text.includes("francais") ||
    text.includes("français") ||
    text === "fr"
  ) {
    return "AZERTY FR";
  }

  if (
    text.includes("german") ||
    text.includes("deutsch") ||
    text === "de" ||
    text.includes("qwertz")
  ) {
    return "QWERTZ DE";
  }

  if (
    text.includes("spanish") ||
    text.includes("espagnol") ||
    text.includes("espanol")
  ) {
    return "Espagnol";
  }

  if (
    text.includes("italian") ||
    text.includes("italien")
  ) {
    return "Italien";
  }

  if (
    text.includes("uk") ||
    text.includes("united kingdom") ||
    text.includes("british")
  ) {
    return "QWERTY UK";
  }

  if (
    text.includes("us") ||
    text.includes("us int") ||
    text.includes("united states") ||
    text.includes("american")
  ) {
    return "QWERTY US";
  }

  return "Autre";
}

'''
    marker = "function extractFilterValues"
    if marker not in text:
        raise SystemExit("❌ Impossible de trouver extractFilterValues.")
    text = text.replace(marker, keyboard_function + marker, 1)

# 3) Crée la variable keyboardLanguage dans extractFilterValues
if "const keyboardLanguage = normalizeKeyboardLanguage" not in text:
    marker = '''  const os = normalizeOs(getSpec(specifications, "OS") || row?.["OS"], searchText);'''
    insert = '''  const os = normalizeOs(getSpec(specifications, "OS") || row?.["OS"], searchText);
  const keyboardLanguage = normalizeKeyboardLanguage(
    getSpec(
      specifications,
      "KBlanguage",
      "KB language",
      "Keyboard language",
      "Keyboard Language",
      "Keyboard layout",
      "Langue du clavier",
      "Langue clavier",
      "Clavier"
    )
  );'''
    if marker not in text:
        raise SystemExit("❌ Impossible de placer keyboardLanguage après OS.")
    text = text.replace(marker, insert, 1)

# 4) Ajoute keyboardLanguage dans l'objet retourné par extractFilterValues
if "keyboardLanguage:" not in re.search(r"function extractFilterValues[\s\S]*?async function", text).group(0):
    # On l'ajoute juste après os si possible
    text = text.replace(
        "    os: [os],",
        '''    os: [os],
    keyboardLanguage: [keyboardLanguage],''',
        1
    )

path.write_text(text, encoding="utf-8")
print("✅ global-filters.js patché : Langue du clavier ajoutée")
