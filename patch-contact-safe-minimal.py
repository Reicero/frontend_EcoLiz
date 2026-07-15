from pathlib import Path
from datetime import datetime
import re

contact = Path("src/pages/Contact.tsx")
text = contact.read_text(encoding="utf-8")

backup = contact.with_suffix(".tsx.bak-contact-safe-minimal-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

# 1) Numéro de téléphone dans la page contact
text = re.sub(r"tel:\+?[\d\s().-]+", "tel:+33178969080", text)
text = re.sub(r"\b0[1-9](?:[\s.\-]?\d{2}){4}\b", "01 78 96 90 80", text)

# 2) Ajoute required sur input / textarea / select sans casser le JSX
def add_required_to_tag(source: str, tag_name: str) -> str:
    result = []
    i = 0
    needle = "<" + tag_name

    while True:
        start = source.find(needle, i)

        if start == -1:
            result.append(source[i:])
            break

        result.append(source[i:start])

        # Trouve la fin du tag ouvrant en ignorant les > dans les {...}
        pos = start
        brace_depth = 0
        quote = None

        while pos < len(source):
            ch = source[pos]

            if quote:
                if ch == quote and source[pos - 1] != "\\":
                    quote = None
            else:
                if ch in ("'", '"', "`"):
                    quote = ch
                elif ch == "{":
                    brace_depth += 1
                elif ch == "}":
                    brace_depth = max(0, brace_depth - 1)
                elif ch == ">" and brace_depth == 0:
                    break

            pos += 1

        tag = source[start:pos + 1]

        if "required" not in tag and 'type="hidden"' not in tag and "type='hidden'" not in tag:
            tag = tag.replace("<" + tag_name, "<" + tag_name + " required", 1)

        result.append(tag)
        i = pos + 1

    return "".join(result)

for tag in ["input", "textarea", "select"]:
    text = add_required_to_tag(text, tag)

# 3) Remplace uniquement les options du select de sujet, sans toucher au design du select
subject_options = """
                  <option value="">Sélectionner un sujet</option>
                  <option value="Demande de devis EcoLiz">Demande de devis EcoLiz</option>
                  <option value="Question sur un produit de la boutique">Question sur un produit de la boutique</option>
                  <option value="Demande Try & Buy">Demande Try & Buy</option>
                  <option value="Recherche de matériel spécifique">Recherche de matériel spécifique</option>
                  <option value="Projet d’équipement informatique">Projet d’équipement informatique</option>
                  <option value="SAV / suivi de commande">SAV / suivi de commande</option>
                  <option value="Compte client / espace client">Compte client / espace client</option>
"""

def find_opening_tag_end(source: str, start: int) -> int:
    pos = start
    brace_depth = 0
    quote = None

    while pos < len(source):
        ch = source[pos]

        if quote:
            if ch == quote and source[pos - 1] != "\\":
                quote = None
        else:
            if ch in ("'", '"', "`"):
                quote = ch
            elif ch == "{":
                brace_depth += 1
            elif ch == "}":
                brace_depth = max(0, brace_depth - 1)
            elif ch == ">" and brace_depth == 0:
                return pos

        pos += 1

    return -1

select_positions = [m.start() for m in re.finditer(r"<select\b", text)]
changed_subject = False

for start in select_positions:
    open_end = find_opening_tag_end(text, start)

    if open_end == -1:
        continue

    close_start = text.find("</select>", open_end)

    if close_start == -1:
        continue

    close_end = close_start + len("</select>")
    block = text[start:close_end].lower()

    if "subject" in block or "sujet" in block or len(select_positions) == 1:
        text = text[:open_end + 1] + subject_options + "\n                " + text[close_start:]
        changed_subject = True
        break

contact.write_text(text, encoding="utf-8")

print("✅ Modifications appliquées sans changer le design")
print("- Champs obligatoires")
print("- Numéro : 01 78 96 90 80")
print("- Sujets cohérents EcoLiz :", "oui" if changed_subject else "non, select sujet non trouvé")
print(f"Sauvegarde créée : {backup}")
