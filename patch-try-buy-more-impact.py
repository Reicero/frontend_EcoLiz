from pathlib import Path
from datetime import datetime

path = Path("src/pages/Shop.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-try-buy-impact-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

marker = "Try & Buy"
pos = text.find(marker)

if pos == -1:
    raise SystemExit("Impossible de trouver le bloc Try & Buy.")

# Remplace le titre du bloc Try & Buy
h2_start = text.find('              <h2', pos)
h2_end = text.find('              </h2>', h2_start)

if h2_start == -1 or h2_end == -1:
    raise SystemExit("Impossible de trouver le titre Try & Buy.")

h2_end += len('              </h2>')

new_h2 = '''              <h2 className="max-w-sm text-2xl font-black leading-tight text-white">
                <span className="text-emerald-300 underline decoration-emerald-300/70 underline-offset-4">
                  Testez gratuitement
                </span>
                <span className="block text-white">
                  un HP EliteBook 840.
                </span>
              </h2>'''

text = text[:h2_start] + new_h2 + text[h2_end:]

# Remplace le paragraphe principal juste après le titre
pos = text.find(marker)
p_start = text.find('              <p className="mt-3 text-sm leading-6 text-sky-100/85">', pos)
p_end = text.find('              </p>', p_start)

if p_start == -1 or p_end == -1:
    raise SystemExit("Impossible de trouver le paragraphe Try & Buy.")

p_end += len('              </p>')

new_p = '''              <p className="mt-3 text-sm leading-6 text-sky-100/85">
                Un poste pro, le bon gabarit, zéro engagement : validez le
                confort et les performances avant achat.
              </p>'''

text = text[:p_start] + new_p + text[p_end:]

# Remplace les trois arguments
replacements = {
    "Test gratuit sur modèle éligible": "HP EliteBook 840",
    "HP EliteBook 840 ou format équivalent": "ou modèle proche",
    "Selon disponibilité et validation du besoin": "sur demande",
    "Validation du matériel avant décision": "HP EliteBook 840",
    "Accompagnement selon votre projet": "ou modèle proche",
    "Selon disponibilité du matériel": "sur demande",
}

for old, new in replacements.items():
    text = text.replace(old, new)

# Remplace le bouton
text = text.replace("Contactez-nous pour tester →", "Demander un test gratuit →")
text = text.replace("Demander un Try & Buy →", "Demander un test gratuit →")

# Remplace la petite mention finale
old_mentions = [
    "Offre limitée aux modèles éligibles, sous réserve de disponibilité.",
    "Service proposé selon validation du besoin et disponibilité des équipements.",
]

new_mention = "Test gratuit sur modèle éligible, selon disponibilité."

for old in old_mentions:
    text = text.replace(old, new_mention)

path.write_text(text, encoding="utf-8")

print("✅ Bloc Try & Buy rendu plus impactant et plus aéré")
print(f"Sauvegarde créée : {backup}")
