from pathlib import Path
from datetime import datetime

path = Path("src/pages/Shop.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-try-buy-text-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

replacements = {
"""              <h2 className="max-w-sm text-2xl font-black leading-tight text-white">
                Testez avant de vous engager.
              </h2>""":
"""              <h2 className="max-w-sm text-2xl font-black leading-tight text-white">
                <span className="text-emerald-300 underline decoration-emerald-300/70 underline-offset-4">
                  Testez gratuitement
                </span>{" "}
                avant de vous engager.
              </h2>""",

"""              <p className="mt-3 text-sm leading-6 text-sky-100/85">
                Validez le matériel en conditions réelles avant achat. EcoLiz vous
                accompagne pour trouver une solution adaptée à vos besoins.
              </p>""":
"""              <p className="mt-3 text-sm leading-6 text-sky-100/85">
                Essayez un HP EliteBook 840, ou un modèle équivalent du même gabarit,
                afin de valider le confort, les performances et l’usage avant achat.
              </p>""",

"""                  Validation du matériel avant décision""":
"""                  Test gratuit sur modèle éligible""",

"""                  Accompagnement selon votre projet""":
"""                  HP EliteBook 840 ou format équivalent""",

"""                  Selon disponibilité du matériel""":
"""                  Selon disponibilité et validation du besoin""",

"""                Demander un Try & Buy →""":
"""                Contactez-nous pour tester →""",

"""                Service proposé selon validation du besoin et disponibilité des équipements.""": 
"""                Offre limitée aux modèles éligibles, sous réserve de disponibilité."""
}

missing = []

for old, new in replacements.items():
    if old not in text:
        missing.append(old[:80])
    else:
        text = text.replace(old, new, 1)

if missing:
    print("⚠️ Certains textes n'ont pas été trouvés, le fichier a peut-être déjà été modifié.")
    print("Éléments non trouvés :")
    for item in missing:
        print("-", item)
    print("Aucune modification écrite.")
    raise SystemExit(1)

path.write_text(text, encoding="utf-8")

print("✅ Texte Try & Buy mis à jour")
print(f"Sauvegarde créée : {backup}")
