from pathlib import Path
from datetime import datetime

path = Path("src/pages/Shop.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-try-buy-visual-priority-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

replacements = {
    # Réduit le gros titre de gauche
    'className="max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl"':
    'className="max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.85rem]"',

    # Donne un peu plus de présence au bloc de droite
    'lg:grid-cols-[1fr_0.72fr]':
    'lg:grid-cols-[0.92fr_0.82fr]',

    # Carte Try & Buy plus visible
    'rounded-[1.5rem] border border-cyan-100/30 bg-white/10 p-4 shadow-[0_20px_55px_rgba(0,0,0,0.22)] backdrop-blur':
    'rounded-[1.5rem] border border-cyan-100/45 bg-white/15 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-cyan-200/20 backdrop-blur',

    # Titre Try & Buy plus fort
    'className="max-w-sm text-2xl font-black leading-tight text-white"':
    'className="max-w-sm text-3xl font-black leading-tight text-white"',

    # “Testez gratuitement” plus visible
    'text-emerald-300 underline decoration-emerald-300/70 underline-offset-4':
    'text-emerald-300 underline decoration-emerald-300 decoration-4 underline-offset-4',

    # Bouton plus visible, vert
    'className="mt-5 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-black text-sky-950 shadow-[0_12px_28px_rgba(255,255,255,0.16)] transition hover:-translate-y-0.5 hover:bg-cyan-100"':
    'className="mt-5 inline-flex items-center rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-sky-950 shadow-[0_14px_34px_rgba(16,185,129,0.32)] transition hover:-translate-y-0.5 hover:bg-emerald-200"',

    # Un peu moins de poids sur le paragraphe de gauche
    'className="mt-4 max-w-xl text-sm leading-6 text-sky-100/82"':
    'className="mt-4 max-w-xl text-sm leading-6 text-sky-100/72"',
}

changed = 0

for old, new in replacements.items():
    if old in text:
        text = text.replace(old, new, 1)
        changed += 1
    else:
        print("⚠️ Non trouvé :", old[:90])

path.write_text(text, encoding="utf-8")

print(f"✅ Patch appliqué : {changed} modification(s)")
print(f"Sauvegarde créée : {backup}")
