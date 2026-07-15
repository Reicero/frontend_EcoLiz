from pathlib import Path
from datetime import datetime
import re

path = Path("src/pages/Contact.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-contact-minimal-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

# Nouveau numéro
text = re.sub(r"tel:\+?[\d\s().-]+", "tel:+33178969080", text)
text = re.sub(r"\b0[1-9](?:[\s.\-]?\d{2}){4}\b", "01 78 96 90 80", text)

# Rend les champs obligatoires sans changer le design
def add_required(match):
    tag = match.group(0)

    if "required" in tag:
        return tag

    if 'type="hidden"' in tag or "type='hidden'" in tag:
        return tag

    return tag.replace(match.group(1), match.group(1) + " required", 1)

text = re.sub(r"(<input\b)([^>]*>)", add_required, text, flags=re.S)
text = re.sub(r"(<textarea\b)([^>]*>)", add_required, text, flags=re.S)
text = re.sub(r"(<select\b)([^>]*>)", add_required, text, flags=re.S)

# Remplace uniquement les options du select de sujet, si un select sujet existe
new_subject_options = """
              <option value="">Sélectionner un sujet</option>
              <option value="Demande de devis EcoLiz">Demande de devis EcoLiz</option>
              <option value="Question sur un produit de la boutique">Question sur un produit de la boutique</option>
              <option value="Demande Try & Buy">Demande Try & Buy</option>
              <option value="Recherche de matériel spécifique">Recherche de matériel spécifique</option>
              <option value="Projet d’équipement informatique">Projet d’équipement informatique</option>
              <option value="SAV / suivi de commande">SAV / suivi de commande</option>
              <option value="Compte client / espace client">Compte client / espace client</option>
"""

select_pattern = re.compile(r"(<select\b[^>]*>)(.*?)(</select>)", re.S)
replaced_subject = False

def replace_subject_select(match):
    global replaced_subject

    start, content, end = match.groups()
    full = match.group(0)
    lower = full.lower()

    # On ne touche qu'au select qui concerne le sujet
    if "sujet" in lower or "subject" in lower:
        replaced_subject = True
        return start + new_subject_options + "            " + end

    return full

text = select_pattern.sub(replace_subject_select, text)

path.write_text(text, encoding="utf-8")

print("✅ Modifications minimales appliquées")
print("- Design conservé")
print("- Champs rendus obligatoires")
print("- Numéro remplacé par 01 78 96 90 80")

if replaced_subject:
    print("- Sujets du formulaire remplacés")
else:
    print("⚠️ Aucun select de sujet trouvé automatiquement. Le reste est quand même corrigé.")

print(f"Sauvegarde créée : {backup}")
