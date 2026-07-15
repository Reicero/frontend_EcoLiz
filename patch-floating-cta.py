from pathlib import Path
from datetime import datetime

path = Path("src/pages/Shop.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-floating-cta-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

component = r'''
function FloatingNeedHelpCTA() {
  return (
    <a
      href="/contact"
      className="group fixed bottom-5 left-4 right-4 z-50 overflow-hidden rounded-2xl border border-cyan-200/70 bg-sky-950 text-white shadow-[0_18px_50px_rgba(8,47,73,0.35)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(6,182,212,0.35)] sm:left-auto sm:right-6 sm:w-[360px]"
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-300/25 blur-2xl transition group-hover:bg-cyan-300/40" />
      <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-teal-300/20 blur-2xl" />

      <div className="relative flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300 text-2xl shadow-[0_0_28px_rgba(103,232,249,0.45)]">
          💬
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
            Besoin spécifique ?
          </p>

          <p className="text-sm font-black leading-snug text-white">
            Vous ne trouvez pas votre matériel ?
          </p>

          <p className="mt-1 text-xs leading-5 text-sky-100/75">
            EcoLiz peut le rechercher pour vous, même hors catalogue.
          </p>

          <span className="mt-3 inline-flex items-center rounded-full bg-white px-3 py-2 text-xs font-bold text-sky-950 transition group-hover:bg-cyan-100">
            Parlez-nous de votre projet →
          </span>
        </div>

        <span className="absolute right-3 top-3 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-300" />
        </span>
      </div>
    </a>
  );
}
'''

if "function FloatingNeedHelpCTA()" not in text:
    marker = "function getPromotionDiscountPercent"
    if marker not in text:
        marker = "function PromotionSection"

    if marker not in text:
        marker not in text:
        marker = "function PromotionSection"

    if marker not in text:
        raise SystemExit("Impossible de trouver où insérer le composant CTA.")

    text = text.replace(marker, component + "\n" + marker, 1)

if "<FloatingNeedHelpCTA />" not in text:
    shop_start = text.find("export function Shop")
    helper_start = text.find("function getPromotionDiscountPercent", shop_start)

    if shop_start == -1 or helper_start == -1:
        raise SystemExit("Impossible de trouver le bloc Shop.")

    shop_block = text[shop_start:helper_start]
    last_section_close = shop_block.rfind("    </section>")

    if last_section_close == -1:
        raise SystemExit("Impossible de trouver la fin du <section> principal.")

    insert_at = shop_start + last_section_close
    text = text[:insert_at] + "      <FloatingNeedHelpCTA />\n\n" + text[insert_at:]

path.write_text(text, encoding="utf-8")

print("CTA fixe ajouté dans src/pages/Shop.tsx")
print(f"Sauvegarde créée : {backup}")
