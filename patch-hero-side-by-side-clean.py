from pathlib import Path
from datetime import datetime

path = Path("src/pages/Shop.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-hero-side-by-side-clean-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

new_hero = r'''
function HeroSection({
  searchInput,
  setSearchInput,
  submitSearch,
}: {
  searchInput: string;
  setSearchInput: (value: string) => void;
  submitSearch: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <header className="relative mb-8 overflow-hidden rounded-[1.75rem] border border-cyan-200/70 bg-sky-950 text-white shadow-[0_18px_50px_rgba(12,74,110,0.22)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(34,211,238,0.28),transparent_24%),radial-gradient(circle_at_15%_90%,rgba(16,185,129,0.13),transparent_28%),linear-gradient(135deg,#082f49_0%,#0f172a_50%,#0e7490_100%)]" />
      <div className="absolute right-8 top-8 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
      <div className="absolute right-24 top-16 hidden h-44 w-44 rounded-full border border-cyan-200/15 lg:block" />

      <div className="relative grid gap-8 p-7 lg:grid-cols-[0.95fr_0.85fr] lg:items-center lg:p-10">
        <div className="min-w-0">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
            <Leaf className="h-3.5 w-3.5" />
            Boutique EcoLiz
          </p>

          <h1 className="max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.7rem]">
            Matériel informatique pro
            <span className="mt-1 block text-cyan-200">
              reconditionné et prêt à l’emploi.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-sky-100/72">
            Recherchez une référence, une marque ou une catégorie dans notre catalogue.
          </p>

          <form onSubmit={submitSearch} className="relative mt-7 max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-sky-900/45" />

            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Rechercher un produit, une marque, une référence…"
              className="w-full rounded-full border border-white/70 bg-white py-3 pl-12 pr-14 text-sm text-sky-950 outline-none shadow-[0_12px_30px_rgba(8,47,73,0.22)] transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/25"
            />

            <button
              type="submit"
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-[0_10px_22px_rgba(6,182,212,0.3)] transition hover:scale-105"
              aria-label="Rechercher"
            >
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-sky-50/82">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5">
              <ShieldCheck className="h-4 w-4 text-cyan-200" />
              Matériel vérifié
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5">
              <Leaf className="h-4 w-4 text-teal-200" />
              Éco-responsable
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5">
              <Headphones className="h-4 w-4 text-cyan-200" />
              Support pro
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute -bottom-8 left-10 h-32 w-32 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative overflow-hidden rounded-[1.6rem] border border-emerald-200/45 bg-white/12 p-6 shadow-[0_22px_65px_rgba(0,0,0,0.26)] ring-1 ring-emerald-200/20 backdrop-blur">
            <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-cyan-300/14" />

            <div className="absolute right-6 top-7 hidden opacity-35 sm:block">
              <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="12" width="78" height="50" rx="8" stroke="rgb(165 243 252)" strokeWidth="3" />
                <path d="M26 74H103" stroke="rgb(110 231 183)" strokeWidth="8" strokeLinecap="round" />
                <path d="M70 33C61 48 48 50 39 46C43 33 56 27 70 25C73 32 72 42 65 49" stroke="rgb(110 231 183)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="relative max-w-md">
              <p className="mb-4 inline-flex rounded-full bg-emerald-300 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-950">
                Try & Buy
              </p>

              <h2 className="leading-tight">
                <span className="block font-serif text-4xl font-black italic text-emerald-300 underline decoration-emerald-300/80 decoration-4 underline-offset-4">
                  Testez gratuitement
                </span>

                <span className="mt-1 block text-2xl font-black text-white">
                  un HP EliteBook 840.
                </span>
              </h2>

              <p className="mt-4 text-sm leading-6 text-sky-100/82">
                Validez le confort et les performances avant achat, sur HP EliteBook 840
                ou modèle proche selon disponibilité.
              </p>

              <div className="mt-5 grid gap-2 text-xs font-semibold text-sky-50/90">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-sky-950">
                    ✓
                  </span>
                  Test sur modèle éligible
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-sky-950">
                    ✓
                  </span>
                  Sans engagement d’achat
                </div>
              </div>

              <a
                href="/contact"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-300 px-6 py-3.5 text-sm font-black text-sky-950 shadow-[0_14px_34px_rgba(16,185,129,0.3)] transition hover:-translate-y-0.5 hover:bg-emerald-200"
              >
                Demander un test gratuit →
              </a>

              <p className="mt-3 text-[11px] leading-5 text-sky-100/60">
                Offre selon disponibilité et validation du besoin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
'''

start = text.find("function HeroSection(")

if start == -1:
    raise SystemExit("Impossible de trouver HeroSection.")

markers = [
    "\nfunction FloatingNeedHelpCTA",
    "\nfunction getPromotionDiscountPercent",
    "\nfunction PromotionSection",
    "\nfunction CategorySelectionCard",
    "\nfunction ProductCard",
]

positions = []

for marker in markers:
    pos = text.find(marker, start + 1)
    if pos != -1:
        positions.append(pos)

if not positions:
    raise SystemExit("Impossible de trouver la fin de HeroSection.")

end = min(positions)

text = text[:start] + new_hero.strip() + "\n\n" + text[end:]

path.write_text(text, encoding="utf-8")

print("✅ Hero modifié en version côte à côte")
print(f"Sauvegarde créée : {backup}")
