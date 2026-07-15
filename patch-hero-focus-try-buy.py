from pathlib import Path
from datetime import datetime

path = Path("src/pages/Shop.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-hero-focus-try-buy-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
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
    <header className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-cyan-200/70 bg-sky-950 text-white shadow-[0_18px_50px_rgba(12,74,110,0.22)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(34,211,238,0.28),transparent_25%),radial-gradient(circle_at_12%_88%,rgba(14,165,233,0.14),transparent_28%),linear-gradient(135deg,#082f49_0%,#0f172a_48%,#0e7490_100%)]" />
      <div className="absolute right-8 top-8 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />

      <div className="relative grid gap-8 p-5 lg:grid-cols-[0.82fr_0.95fr] lg:items-center lg:p-7">
        <div className="min-w-0">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
            <Leaf className="h-3.5 w-3.5" />
            Boutique EcoLiz
          </p>

          <h1 className="max-w-xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
            Matériel informatique pro
            <span className="mt-1 block text-cyan-200">
              reconditionné et prêt à l’emploi.
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-sky-100/72">
            Recherchez une référence, une marque ou une catégorie dans notre catalogue.
          </p>

          <form onSubmit={submitSearch} className="relative mt-5 max-w-xl">
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

          <div className="mt-5 grid gap-2 text-xs text-sky-50/80 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-3 py-2 backdrop-blur">
              <ShieldCheck className="h-5 w-5 shrink-0 text-cyan-200" />
              <span>Matériel vérifié</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-3 py-2 backdrop-blur">
              <Leaf className="h-5 w-5 shrink-0 text-teal-200" />
              <span>Éco-responsable</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-3 py-2 backdrop-blur">
              <Headphones className="h-5 w-5 shrink-0 text-cyan-200" />
              <span>Support pro</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute -bottom-10 left-8 h-36 w-36 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative overflow-hidden rounded-[1.6rem] border border-emerald-200/55 bg-white/15 p-6 shadow-[0_26px_80px_rgba(0,0,0,0.3)] ring-1 ring-emerald-200/25 backdrop-blur">
            <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-emerald-300/18" />

            <div className="relative">
              <p className="mb-4 inline-flex rounded-full bg-cyan-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-950">
                Try & Buy
              </p>

              <h2 className="max-w-md text-4xl font-black leading-tight text-white">
                <span className="block text-emerald-300 underline decoration-emerald-300 decoration-4 underline-offset-4">
                  Testez gratuitement
                </span>
                <span className="block text-white">
                  un HP EliteBook 840.
                </span>
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-sky-100/82">
                Validez le confort et les performances avant achat, sur un modèle éligible.
              </p>

              <div className="mt-5 grid gap-2 text-sm font-semibold text-sky-50/90 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center">
                  HP EliteBook 840
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center">
                  Modèle proche
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center">
                  Sur demande
                </div>
              </div>

              <a
                href="/contact"
                className="mt-6 inline-flex items-center rounded-full bg-emerald-300 px-6 py-3 text-sm font-black text-sky-950 shadow-[0_14px_34px_rgba(16,185,129,0.32)] transition hover:-translate-y-0.5 hover:bg-emerald-200"
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

print("✅ Hero modifié : priorité visuelle au Try & Buy")
print(f"Sauvegarde créée : {backup}")
