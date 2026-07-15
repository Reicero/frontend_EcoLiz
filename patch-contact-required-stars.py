from pathlib import Path
from datetime import datetime
import re

path = Path("src/pages/Contact.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-contact-stars-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

# 1) Ajoute une petite mention si elle n'existe pas déjà
if "Champs obligatoires" not in text:
    text = text.replace(
        "Envoyez-nous un message",
        "Envoyez-nous un message"
    )

    # On ajoute la mention après le premier titre de formulaire possible
    patterns = [
        r"(<h2[^>]*>.*?message.*?</h2>)",
        r"(<h2[^>]*>.*?demande.*?</h2>)",
        r"(<h3[^>]*>.*?message.*?</h3>)",
        r"(<h3[^>]*>.*?demande.*?</h3>)",
    ]

    inserted = False

    for pattern in patterns:
        match = re.search(pattern, text, flags=re.I | re.S)

        if match:
            text = text[:match.end()] + '\n            <p className="mt-2 text-sm text-slate-500">* Champs obligatoires</p>' + text[match.end():]
            inserted = True
            break

    if not inserted:
        # Si on ne trouve pas de titre, on ne casse rien
        print("⚠️ Mention champs obligatoires non insérée automatiquement.")

# 2) Ajoute les astérisques visibles sur les libellés connus
labels = [
    "Nom",
    "Nom complet",
    "Prénom",
    "Email",
    "Adresse email",
    "Téléphone",
    "Entreprise",
    "Société",
    "Sujet",
    "Message",
    "Votre message",
]

for label in sorted(labels, key=len, reverse=True):
    # N'ajoute pas deux fois l'astérisque
    text = re.sub(
        rf"({re.escape(label)})(?!\s*\*)",
        rf"\1 *",
        text
    )

# 3) Si les champs Entreprise / Téléphone n'existent pas du tout, on les ajoute avant le message
has_company = re.search(r"entreprise|société|company", text, flags=re.I)
has_phone = re.search(r"téléphone|telephone|phone", text, flags=re.I)

# Récupère une classe d'input existante pour garder le même design
input_class_match = re.search(r'<input[^>]*className="([^"]+)"', text, flags=re.S)
input_class = input_class_match.group(1) if input_class_match else "w-full rounded-xl border border-slate-200 px-4 py-3"

# Cherche le bloc textarea pour insérer les champs juste avant
textarea_pos = text.find("<textarea")

extra_fields = ""

if not has_company:
    extra_fields += f'''
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Entreprise *</span>
              <input
                required
                type="text"
                name="company"
                placeholder="Nom de votre entreprise"
                className="{input_class}"
              />
            </label>
'''

if not has_phone:
    extra_fields += f'''
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Téléphone *</span>
              <input
                required
                type="tel"
                name="phone"
                placeholder="01 78 96 90 80"
                className="{input_class}"
              />
            </label>
'''

if extra_fields and textarea_pos != -1:
    # On remonte au label précédent si possible pour insérer proprement avant le message
    label_start = text.rfind("<label", 0, textarea_pos)
    insert_pos = label_start if label_start != -1 else textarea_pos
    text = text[:insert_pos] + extra_fields + "\n" + text[insert_pos:]
    print("✅ Champs supplémentaires ajoutés.")
else:
    print("ℹ️ Aucun champ supplémentaire ajouté : ils existent déjà ou textarea introuvable.")

path.write_text(text, encoding="utf-8")

print("✅ Astérisques ajoutés aux champs obligatoires")
print(f"Sauvegarde créée : {backup}")
