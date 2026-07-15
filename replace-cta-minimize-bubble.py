from pathlib import Path
from datetime import datetime
import re

path = Path("src/pages/Shop.tsx")
text = path.read_text(encoding="utf-8")

backup = path.with_suffix(".tsx.bak-cta-minimize-bubble-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(text, encoding="utf-8")

component = r'''
function FloatingNeedHelpCTA() {
  const storageKey = "ecoliz_need_help_cta_minimized_v1";

  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem(storageKey) === "1";
  });

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined") {
            localStorage.removeItem(storageKey);
          }

          setIsMinimized(false);
        }}
        className="group fixed bottom-5 right-5 z-[9999] flex h-16 w-16 items-center justify-center rounded-full border border-cyan-100/80 bg-gradient-to-br from-sky-950 via-cyan-900 to-teal-700 text-3xl text-white shadow-[0_0_35px_rgba(34,211,238,0.65)] transition hover:scale-110 hover:shadow-[0_0_45px_rgba(20,184,166,0.75)]"
        aria-label="Afficher l’aide EcoLiz"
        title="Besoin d’aide ?"
      >
        <span className="absolute -right-1 -top-1 flex h-5 w-5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
          <span className="relative inline-flex h-5 w-5 rounded-full bg-cyan-300" />
        </span>

        <span className="transition group-hover:rotate-6">💬</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 left-4 right-4 z-[9999] sm:left-auto sm:right-6 sm:w-[440px]">
      <div className="pointer-events-none absolute -inset-1 rounded-[1.4rem] bg-gradient-to-r from-cyan-300 via-teal-300 to-sky-400 opacity-85 blur-md" />

      <div className="relative overflow-hidden rounded-[1.3rem] border border-cyan-100/80 bg-gradient-to-br from-sky-950 via-cyan-950 to-sky-900 text-white shadow-[0_22px_70px_rgba(8,47,73,0.52)]">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-300/30 blur-2xl" />
        <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-teal-300/25 blur-2xl" />

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            if (typeof window !== "undefined") {
              localStorage.setItem(storageKey, "1");
            }

            setIsMinimized(true);
          }}
          className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-white/10 text-lg font-black leading-none text-white transition hover:bg-white hover:text-sky-950"
          aria-label="Réduire le message"
          title="Réduire"
        >
          −
        </button>

        <div className="relative p-4 pr-10">
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
                Besoin spécifique ?
              </p>

              <p className="text-base font-black leading-snug text-white">
                Votre projet a des exigences spécifiques ?
              </p>

              <p className="mt-1 text-sm leading-5 text-sky-100/85">
                Nous vous accompagnons pour trouver le matériel le plus adapté à vos besoins, au-delà de notre catalogue.
              </p>

              <a
                href="/contact"
                className="mt-3 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-black text-sky-950 shadow-[0_10px_26px_rgba(255,255,255,0.16)] transition hover:translate-x-1 hover:bg-cyan-100"
              >
                Contactez-nous !
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'''

def remove_function(source: str, function_name: str) -> str:
    while True:
        start = source.find(f"function {function_name}()")

        if start == -1:
            return source

        brace_start = source.find("{", start)

        if brace_start == -1:
            return source

        depth = 0
        end = None

        for index in range(brace_start, len(source)):
            char = source[index]

            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1

                if depth == 0:
                    end = index + 1
                    break

        if end is None:
            raise SystemExit("Impossible de supprimer l'ancien CTA.")

        source = source[:start] + source[end:]

text = remove_function(text, "FloatingNeedHelpCTA")

marker = "function getPromotionDiscountPercent"

if marker not in text:
    marker = "function HeroSection"

if marker not in text:
    raise SystemExit("Impossible de trouver où insérer le CTA.")

text = text.replace(marker, component + "\n" + marker, 1)

text = re.sub(r"\s*<FloatingNeedHelpCTA\s*/>\s*", "\n", text)

shop_pos = text.find("export function Shop")
return_pos = text.find("return (", shop_pos)
section_pos = text.find("<section", return_pos)
section_end = text.find(">", section_pos)

if shop_pos == -1 or return_pos == -1 or section_pos == -1 or section_end == -1:
    raise SystemExit("Impossible de trouver le <section> principal de Shop.")

text = text[:section_end + 1] + "\n      <FloatingNeedHelpCTA />" + text[section_end + 1:]

path.write_text(text, encoding="utf-8")

print("✅ CTA remplacé par une version réductible en bulle")
print(f"Sauvegarde créée : {backup}")
