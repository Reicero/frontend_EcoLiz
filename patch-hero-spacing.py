from pathlib import Path
from datetime import datetime

path = Path("src/pages/Shop.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-hero-spacing-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

replacements = {
    # Plus d'espace dans le hero global
    'className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-cyan-200/70 bg-sky-950 text-white shadow-[0_18px_50px_rgba(12,74,110,0.22)]"':
    'className="relative mb-8 overflow-hidden rounded-[1.75rem] border border-cyan-200/70 bg-sky-950 text-white shadow-[0_18px_50px_rgba(12,74,110,0.22)]"',

    # Padding intérieur plus confortable
    'className="relative p-5 lg:p-7"':
    'className="relative p-7 lg:p-10"',

    # Plus d'espace avant la barre de recherche
    'className="relative mt-5 max-w-2xl"':
    'className="relative mt-7 max-w-2xl"',

    # Plus d'espace entre recherche et badges
    'className="mt-4 flex flex-wrap gap-2 text-xs text-sky-50/82"':
    'className="mt-6 flex flex-wrap gap-3 text-xs text-sky-50/82"',

    # Badges un peu plus respirants
    'rounded-full border border-white/10 bg-white/10 px-3 py-2':
    'rounded-full border border-white/10 bg-white/10 px-4 py-2.5',

    # Plus d'espace-full border border-white/10 bg-white/10 px-4 py-2.5',

    # Plus d'espace avant le bandeau Try & Buy
    'className="mt-6 rounded-2xl border border-emerald-200/45 bg-white/10 p-4 shadow-[0_14px_36px_rgba(0,0,0,0.18)] ring-1 ring-emerald-200/15 backdrop-blur"':
    'className="mt-8 rounded-2xl border border-emerald-200/45 bg-white/10 p-6 shadow-[0_14px_36px_rgba(0,0,0,0.18)] ring-1 ring-emerald-200/15 backdrop-blur"',

    # Plus d'espace entre texte Try & Buy et bouton
    'className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"':
    'className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"',

    # Bouton un peu plus confortable
    'className="inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-sky-950 shadow-[0_14px_34px_rgba(16,185,129,0.28)] transition hover:-translate-y-0.5 hover:bg-emerald-200"':
    'className="inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-300 px-6 py-3.5 text-sm font-black text-sky-950 shadow-[0_14px_34px_rgba(16,185,129,0.28)] transition hover:-translate-y-0.5 hover:bg-emerald-200"',
}

changed = 0

for old, new in replacements.items():
    if old in text:
        text = text.replace(old, new, 1)
        changed += 1
    else:
        print("⚠️ Non trouvé :", old[:90])

path.write_text(text, encoding="utf-8")

print(f"✅ Espacements du hero modifiés : {changed} changement(s)")
print(f"Sauvegarde créée : {backup}")
