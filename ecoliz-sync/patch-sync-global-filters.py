from pathlib import Path
import re

path = Path("sync-flexit.js")
text = path.read_text(encoding="utf-8")
original = text

require_line = 'const { buildGlobalFilterAttributes } = require("./global-filters");'
if require_line not in text:
    marker = 'const { getFlexitProductDetails } = require("./flexit-api");'
    if marker not in text:
        raise SystemExit("Marqueur import flexit-api introuvable")
    text = text.replace(marker, marker + "\n" + require_line, 1)

sync_skus_line = 'const SYNC_SKUS = new Set('
if sync_skus_line not in text:
    marker = 'const SYNC_LIMIT = Number(process.env.SYNC_LIMIT || 0); // 0 = tous les produits'
    replacement = marker + '''
const SYNC_SKUS = new Set(
  clean(process.env.SYNC_SKUS)
    .split(",")
    .map((sku) => clean(sku))
    .filter(Boolean)
);'''
    if marker not in text:
        raise SystemExit("Marqueur SYNC_LIMIT introuvable")
    text = text.replace(marker, replacement, 1)

# Remplace uniquement la fin de readProductsFromCsv.
pattern = re.compile(
    r'''  log\(`\$\{records\.length\} produits trouvés dans le fichier\.`\);\n\n'''
    r'''  if \(SYNC_LIMIT > 0\) \{\n'''
    r'''    log\(`Mode limité activé : seuls les \$\{SYNC_LIMIT\} premiers produits seront traités\.`\);\n'''
    r'''    return records\.slice\(0, SYNC_LIMIT\);\n'''
    r'''  \}\n\n'''
    r'''  return records;'''
)
replacement = '''  log(`${records.length} produits trouvés dans le fichier.`);

  if (SYNC_SKUS.size > 0) {
    const selectedRecords = records.filter((row) =>
      SYNC_SKUS.has(clean(row["Flex IT Part Number"]))
    );

    log(
      `Sélection par SKU activée : ${selectedRecords.length}/${SYNC_SKUS.size} produits trouvés.`
    );

    return selectedRecords;
  }

  if (SYNC_LIMIT > 0) {
    log(`Mode limité activé : seuls les ${SYNC_LIMIT} premiers produits seront traités.`);
    return records.slice(0, SYNC_LIMIT);
  }

  return records;'''
text, count = pattern.subn(replacement, text, count=1)
if count != 1 and "Sélection par SKU activée" not in text:
    raise SystemExit("Impossible de modifier readProductsFromCsv")

# enrichProductWithFlexitApi renvoie maintenant l'objet API utilisé pour normaliser les filtres.
if "return apiProduct;" not in text:
    marker = '    log(`Enrichi avec l\'API FlexIT : ${sku}`);\n  } catch (error) {'
    if marker not in text:
        raise SystemExit("Marqueur de fin d'enrichissement introuvable")
    text = text.replace(
        marker,
        '    log(`Enrichi avec l\'API FlexIT : ${sku}`);\n    return apiProduct;\n  } catch (error) {',
        1,
    )

# Le return final de la fonction était "return product".
enrich_start = text.find("async function enrichProductWithFlexitApi")
enrich_end = text.find("\nconst WC_URL", enrich_start)
if enrich_start == -1 or enrich_end == -1:
    raise SystemExit("Fonction enrichProductWithFlexitApi introuvable")
enrich_block = text[enrich_start:enrich_end]
if "return product;" in enrich_block:
    enrich_block = enrich_block.replace("  return product;", "  return null;", 1)
    text = text[:enrich_start] + enrich_block + text[enrich_end:]

old_end = '''  if (FLEXIT_ENRICH_PRODUCTS) {
    await enrichProductWithFlexitApi(product, sku);
  }

  return product;
}'''
new_end = '''  let apiProduct = null;

  if (FLEXIT_ENRICH_PRODUCTS) {
    apiProduct = await enrichProductWithFlexitApi(product, sku);
  }

  const localAttributes = (product.attributes || []).filter((attribute) => {
    const attributeName = clean(attribute.name).toLowerCase();

    return !["marque", "état", "etat", "os"].includes(attributeName);
  });

  const globalFilterAttributes = await buildGlobalFilterAttributes({
    wcRequest,
    row,
    product,
    apiProduct,
    dryRun: DRY_RUN,
  });

  product.attributes = [...localAttributes, ...globalFilterAttributes];

  return product;
}'''
if old_end in text:
    text = text.replace(old_end, new_end, 1)
elif "buildGlobalFilterAttributes({" not in text:
    raise SystemExit("Bloc final buildWooProduct introuvable")

if text == original:
    print("Aucune modification nécessaire : patch déjà appliqué.")
else:
    path.write_text(text, encoding="utf-8")
    print("Patch appliqué à sync-flexit.js")
