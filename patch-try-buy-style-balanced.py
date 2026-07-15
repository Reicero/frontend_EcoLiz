from pathlib import Path
from datetime import datetime

path = Path("src/pages/Shop.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-try-buy-balanced-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

old_start = text.find('              <p className="mb-4 inline-flex rounded-full bg-cyan-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-950">')
if old_start == -1:
    old_start = text.find('              <p className="mb-3 inline-flex rounded-full bg-cyan-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-950">')

if old_start == -1:
    raise SystemExit("Impossible de trouver le début du bloc Try & Buy.")

old_end = text.find('            </div>', old_start)

if old_end == -1:
    raise SystemExit("Impossible de trouver la fin du bloc Try & Buy.")

old_end += len('            </div>')

new_block = r'''              <p className="mb-4 inline-flex rounded-full bg-cyan-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-950">
                Try & Buy
              </p>

              <h2 className="max-w-sm leading-tight">
                <span className="block font-serif text-4xl font-black italic text-emerald-300 underline decoration-emerald-300/80 decoration-4 underline-offset-4">
                  Testez gratuitement
                </span>

                <span className="mt-1 block text-2xl font-black text-white">
                  un HP EliteBook 840.
                </span>
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-sky-100/82">
                Validez le confort, le format et les performances avant achat,
                sur un modèle éligible.
              </p>

              <div className="mt-5 grid gap-2 text-xs font-semibold text-sky-50/90">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-centerName="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-sky-950">
                    ✓
                  </span>
                  HP EliteBook 840 disponible au test
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-sky-950">
                    ✓
                  </span>
                  Modèle proche du même gabarit possible
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-sky-950">
                    ✓
                  </span>
                  Mise à disposition selon disponibilité
                </div>
              </div>

              <a
                href="/contact"
                className="mt-5 inline-flex items-center rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-sky-950 shadow-[0_14px_34px_rgba(16,185,129,0.32)] transition hover:-translate-y-0.5 hover:bg-emerald-200"
              >
                Demander un test gratuit →
              </a>

              <p className="mt-3 text-[11px] leading-5 text-sky-100/60">
                Offre selon disponibilité et validation du besoin.
              </p>'''

text = text[:old_start] + new_block + text[old_end:]

path.write_text(text, encoding="utf-8")

print("✅ Style Try & Buy rééquilibré")
print(f"Sauvegarde créée : {backup}")
