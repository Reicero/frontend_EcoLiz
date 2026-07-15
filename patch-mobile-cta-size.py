from pathlib import Path
from datetime import datetime

path = Path("src/pages/Shop.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-mobile-cta-size-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

start = text.find("function FloatingNeedHelpCTA(")

if start == -1:
    raise SystemExit("Impossible de trouver FloatingNeedHelpCTA.")

markers = [
    "\nfunction HeroSection",
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
    raise SystemExit("Impossible de trouver la fin de FloatingNeedHelpCTA.")

end = min(positions)

new_cta = r'''
function FloatingNeedHelpCTA() {
  const storageKey = "ecoliz_need_help_cta_minimized_v1";
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem(storageKey) === "1";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(storageKey, isMinimized ? "1" : "0");
  }, [isMinimized]);

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-200/70 bg-sky-950 text-xl text-white shadow-[0_14px_34px_rgba(8,47,73,0.28)] transition hover:-translate-y-0.5"
        aria-label="Afficher l’aide EcoLiz"
      >
        💬
      </button>
    );
  }

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-40 rounded-2xl border border-cyan-200/70 bg-white/96 p-4 shadow-[0_18px_45px_rgba(8,47,73,0.22)] backdrop-blur sm:bottom-6 sm:left-auto sm:right-6 sm:w-[360px] sm:p-5">
      <button
        type="button"
        onClick={() => setIsMinimized(true)}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-500 transition hover:bg-slate-200"
        aria-label="Réduire l’encart"
      >
        −
      </button>

      <div className="pr-8">
        <p className="mb-2 inline-flex rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-800">
          Besoin spécifique ?
        </p>

        <h3 className="text-base font-black leading-snug text-sky-950 sm:text-lg">
          Vous ne trouvez pas le matériel adapté ?
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
          EcoLiz peut vous accompagner pour trouver une solution adaptée à votre besoin,
          même au-delà du catalogue.
        </p>

        <a
          href="/contact"
          className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-cyan-600 px-4 py-2.5 text-xs font-black text-white shadow-[0_12px_24px_rgba(8,145,178,0.22)] transition hover:-translate-y-0.5 hover:bg-cyan-700 sm:text-sm"
        >
          Parler de mon projet →
        </a>
      </div>
    </aside>
  );
}
'''

text = text[:start] + new_cta.strip() + "\n\n" + text[end:]

path.write_text(text, encoding="utf-8")

print("✅ Encart mobile 'Besoin spécifique' redimensionné")
print(f"Sauvegarde créée : {backup}")
