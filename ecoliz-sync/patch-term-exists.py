from pathlib import Path

path = Path("sync-flexit.js")
text = path.read_text()

old = '''  const createResponse = await wcRequest("post", "/products/categories", {
    name,
    parent,
  });

  categoryCache.set(cacheKey, createResponse.data.id);
  return createResponse.data.id;'''

new = '''  try {
    const createResponse = await wcRequest("post", "/products/categories", {
      name,
      parent,
    });

    categoryCache.set(cacheKey, createResponse.data.id);
    return createResponse.data.id;
  } catch (error) {
    let parsedMessage = null;

    if (typeof error?.message === "string") {
      const jsonMatch = error.message.match(/\\{.*\\}/s);

      if (jsonMatch) {
        try {
          parsedMessage = JSON.parse(jsonMatch[0]);
        } catch {
          parsedMessage = null;
        }
      }
    }

    const errorPayload =
      error?.response?.data ||
      error?.data ||
      parsedMessage ||
      error;

    const errorCode = errorPayload?.code || error?.code;

    const existingCategoryId =
      errorPayload?.data?.resource_id ||
      errorPayload?.resource_id ||
      error?.resource_id;

    if (errorCode === "term_exists" && existingCategoryId) {
      categoryCache.set(cacheKey, existingCategoryId);
      return existingCategoryId;
    }

    throw error;
  }'''

if new in text:
    print("La correction term_exists est déjà présente.")
elif old in text:
    text = text.replace(old, new)
    path.write_text(text)
    print("Correction term_exists ajoutée dans sync-flexit.js.")
else:
    print("Bloc à remplacer introuvable. On n'a rien modifié.")
