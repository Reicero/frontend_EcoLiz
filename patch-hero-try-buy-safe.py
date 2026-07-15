from pathlib import Path
from datetime import datetime

path = Path("src/pages/Shop.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-hero-try-buy-safe-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(34,211,238,0.28),transparent_25%),radial-gradient(circle_at_12%_88%,rgba(14,165,233,0.16),transparent_28%),linear-gradient(135deg,#082f49_0%,#0f172a_48%,#0e7490_100%)]" />
      <div className="absolute right-16 top-8 h-52 w-52 rounded-full border border-cyan-300/15" />
      <div className="absolute right-28 top-14 h-40 w-40 rounded-full bg-cyan-300/18 blur-3xl" />
      <div className="absolute right-8 top-8 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />

      <div className="relative grid gap-7 p-5 lg:grid-cols-[1fr_0.72fr] lg:items-center lg:p-7">
        <div className="min-w-0">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
            <Leaf className="h-3.5 w-3.5" />
            Boutique EcoLiz
          </p>

          <h1 className="max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Trouvez le bon matériel pro.
            <span className="mt-1 block bg-gradient-to-r from-cyan-200 to-teal-300 bg-clip-text text-transparent">
              Reconditionné, filtré, prêt à travailler.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-sky-100/82">
            Parcourez les catégories, repérez les offres du moment et filtrez le
            catalogue selon vos besoins réels.
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

          <div className="mt-5 grid gap-2 text-xs text-sky-50/92 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
              <ShieldCheck className="h-5 w-5 shrink-0 text-cyan-200" />
              <span>Matériel vérifié et garanti</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
              <Leaf className="h-5 w-5 shrink-0 text-teal-200" />
              <span>Démarche éco-responsable</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
              <Headphones className="h-5 w-5 shrink-0 text-cyan-200" />
              <span>Support pro dédié</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute -bottom-8 left-4 h-32 w-32 rounded-full bg-teal-300/15 blur-3xl" />

          <div className="relative overflow-hidden rounded-[1.5rem] border border-cyan-100/30 bg-white/10 p-4 shadow-[0_20px_55px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-cyan-300/15" />

            <div className="relative">
              <p className="mb-3 inline-flex rounded-full bg-cyan-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-950">
                Try & Buy
              </p>

              <h2 className="max-w-sm text-2xl font-black leading-tight text-white">
                Testez avant de vous engager.
              </h2>

              <p className="mt-3 text-sm leading-6 text-sky-100/85">
                Validez le matériel en conditions réelles avant achat. EcoLiz vous
                accompagne pour trouver une solution adaptée à vos besoins.
              </p>

              <div className="mt-4 grid gap-2 text-xs text-sky-50/90">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-200 text-sky-950">
                    ✓
                  </span>
                  Validation du matériel avant décision
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-200 text-sky-950">
                    ✓
                  </span>
                  Accompagnement selon votre projet
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-200 text-sky-950">
                    ✓
                  </span>
                  Selon disponibilité du matériel
                </div>
              </div>

              <a
                href="/contact"
                className="mt-5 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-black text-sky-950 shadow-[0_12px_28px_rgba(255,255,255,0.16)] transition hover:-translate-y-0.5 hover:bg-cyan-100"
              >
                Demander un Try & Buy →
              </a>

              <p className="mt-3 text-[11px] leading-5 text-sky-100/65">
                Service proposé selon validation du besoin et disponibilité des équipements.
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

print("✅ Bandeau boutique corrigé avec Try & Buy")
print(f"Sauvegarde créée : {backup}")
