from pathlib import Path
from datetime import datetime
import re

path = Path("src/pages/Contact.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-contact-clean-final-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

# Sécurité : App.tsx importe { Contact }, donc export nommé obligatoire
text = text.replace("export default function Contact(", "export function Contact(")

# 1) Numéro de téléphone
text = re.sub(r"tel:\+?[\d\s().-]+", "tel:+33178969080", text)
text = re.sub(r"\b0[1-9](?:[\s.\-]?\d{2}){4}\b", "01 78 96 90 80", text)

# 2) Fonction robuste pour trouver la fin d'une balise ouvrante JSX
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

# 3) Ajoute required aux input / textarea / select sans casser le JSX
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

        end = find_opening_tag_end(source, start)

        if end == -1:
            result.append(source[start:])
            break

        tag = source[start:end + 1]

        if (
            "required" not in tag
            and 'type="hidden"' not in tag
            and "type='hidden'" not in tag
        ):
            tag = tag.replace("<" + tag_name, "<" + tag_name + " required", 1)

        result.append(tag)
        i = end + 1

    return "".join(result)

for tag in ["input", "textarea", "select"]:
    text = add_required_to_tag(text, tag)

# 4) Remplace les sujets du select sans casser le onChange
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

    if "subject" in block or "sujet" in block or "objet" in block or len(select_positions) == 1:
        text = text[:open_end + 1] + subject_options + "\n                " + text[close_start:]
        changed_subject = True
        break

# 5) Ajoute les astérisques uniquement dans les labels visibles, pas dans les imports
required_words = [
    "nom",
    "prénom",
    "nom complet",
    "nom et prénom",
    "votre nom",
    "email",
    "adresse email",
    "téléphone",
    "telephone",
    "entreprise",
    "société",
    "sujet",
    "objet",
    "message",
    "votre message",
]

def add_star_to_label_block(match):
    block = match.group(0)

    # On ne touche pas aux options du select, seulement au texte du label avant le champ
    control_positions = [
        pos for pos in [
            block.find("<input"),
            block.find("<textarea"),
            block.find("<select"),
        ]
        if pos != -1
    ]

    split_at = min(control_positions) if control_positions else len(block)

    before = block[:split_at]
    after = block[split_at:]

    def add_star_to_text_node(node_match):
        content = node_match.group(1)
        clean = " ".join(content.split())
        lower = clean.lower()

        if not clean or "*" in clean:
            return node_match.group(0)

        if any(word in lower for word in required_words):
            return ">" + content.rstrip() + " *" + "<"

        return node_match.group(0)

    before = re.sub(r">([^<>]+)<", add_star_to_text_node, before)

    return before + after

text = re.sub(r"<label\b[^>]*>.*?</label>", add_star_to_label_block, text, flags=re.S)

# 6) Ajoute une mention "* Champs obligatoires" dans le formulaire si absente
if "Champs obligatoires" not in text:
    form_start = text.find("<form")

    if form_start != -1:
        form_end = find_opening_tag_end(text, form_start)

        if form_end != -1:
            mention = '\n            <p className="mb-4 text-sm text-slate-500">* Champs obligatoires</p>'
            text = text[:form_end + 1] + mention + text[form_end + 1:]

path.write_text(text, encoding="utf-8")

print("✅ Page Contact corrigée proprement")
print("- Design d'origine conservé")
print("- Champs obligatoires ajoutés")
print("- Astérisques ajoutés aux labels")
print("- Numéro remplacé par 01 78 96 90 80")
print("- Sujets remplacés :", "oui" if changed_subject else "non, select sujet non trouvé")
print(f"Sauvegarde créée : {backup}")
