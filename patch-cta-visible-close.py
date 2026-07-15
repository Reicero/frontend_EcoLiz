from pathlib import Path
from datetime import datetime
import re

path = Path("src/pages/Shop.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-cta-visible-close-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

component = r'''
function FloatingNeedHelpCTA() {
  const [isHidden, setIsHidden] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem("ecoliz_need_help_cta_hidden") === "1";
  });

  if (isHidden) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-4 right-4 z-[9999] sm:left-auto sm:right-6 sm:w-[410px]">
      <div className="pointer-events-none absolute -inset-1 rounded-[1.35rem] bg-gradient-to-r from-cyan-300 via-teal-300 to-sky-400 opacity-80 blur-md" />

      <div className="relative overflow-hidden rounded-[1.25rem] border border-cyan-100/80 bg-gradient-to-br from-sky-950 via-cyan-950 to-sky-900 text-white shadow-[0_20px_65px_rgba(8,47,73,0.48)]">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-300/30 blur-2xl" />
        <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-teal-300/25 blur-2xl" />

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            if (typeof window !== "undefined") {
              localStorage.setItem("ecoliz_need_help_cta_hidden", "1");
            }

            setIsHidden(true);
          }}
          className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-black text-white transition hover:bg-white hover:text-sky-950"
          aria-label="Fermer le message"
          title="Masquer"
        >
          ×
        </button>

        <a href="/contact" className="group relative block p-4 pr-10">
          <div className="flex items-start gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-200 to-teal-400 text-2xl shadow-[0_0_34px_rgba(103,232,249,0.65)]">
              <span className="absolute -right-1 -top-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-200 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-cyan-200" />
              </span>
              💬
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-2 inline-flex rounded-full bg-cyan-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-950">
                Besoin hors catalogue-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-950">
                Besoin hors catalogue ?
              </p>

              <p className="text-base font-black leading-snug text-white">
                Vous ne trouvez pas votre matériel ?
              </p>

              <p className="mt-1 text-sm leading-5 text-sky-100/85">
                EcoLiz peut rechercher une solution pour vous, même si elle
                n’est pas affichée dans la boutique.
              </p>

              <span className="mt-3 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-black text-sky-950 shadow-[0_10px_26px_rgba(255,255,255,0.16)] transition group-hover:translate-x-1 group-hover:bg-cyan-100">
                Parlez-nous de votre projet →
              </span>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
'''

# Supprime l'ancien composant CTA s'il existe
if "function FloatingNeedHelpCTA()" in text:
    text = re.sub(
        r"\nfunction FloatingNeedHelpCTA\(\) \{.*?\n\}\n(?=\nfunction |\nexport )",
        "\n",
        text,
        count=1,
        flags=re.S,
    )

# Ajoute le nouveau composant avant les fonctions utilitaires
marker = "function getPromotionDiscountPercent"
if marker not in text:
    marker = "function HeroSection"

if marker not in text:
    raise SystemExit("Impossible de trouver où insérer le composant CTA.")

text = text.replace(marker, component + "\n" + marker, 1)

# Supprime tous les anciens appels du CTA
text = text.replace("      <FloatingNeedHelpCTA />\n\n", "")
text = text.replace("      <FloatingNeedHelpCTA />\n", "")

# Ajoute un seul appel dans la page Shop
shop_pos = text.find("export function Shop")
return_pos = text.find("return (", shop_pos)
section_pos = text.find("<section", return_pos)
section_end = text.find(">", section_pos)

if shop_pos == -1 or return_pos == -1 or section_pos == -1 or section_end == -1:
    raise SystemExit("Impossible de trouver le <section> principal de Shop.")

text = text[:section_end + 1] + "\n      <FloatingNeedHelpCTA />" + text[section_end + 1:]

path.write_text(text, encoding="utf-8")

print("CTA modifié avec succès.")
print(f"Sauvegarde créée : {backup}")
