import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, X } from "lucide-react";

const DELAY_MS = 3000;

function shouldShowPopup(pathname: string) {
  return (
    pathname.startsWith("/boutique") ||
    pathname.startsWith("/produit") ||
    pathname.startsWith("/product")
  );
}

export function BitdefenderPopup() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    setIsClosed(false);

    if (!shouldShowPopup(location.pathname)) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.pathname]);

  function closePopup() {
    setIsClosed(true);
    setIsVisible(false);
  }

  if (!isVisible || isClosed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/35 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-cyan-100 bg-white p-6 shadow-2xl shadow-brand-950/30">
        <button
          type="button"
          onClick={closePopup}
          className="absolute right-4 top-4 rounded-full p-1.5 text-brand-900/40 hover:bg-brand-50 hover:text-brand-900 transition-colors"
          aria-label="Fermer le message Bitdefender"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-700">
          Cybersécurité
        </p>

        <h2 className="pr-8 text-xl font-bold text-brand-950">
          Avez-vous pensé à protéger vos postes ?
        </h2>

        <p className="mt-3 text-sm leading-6 text-brand-900/70">
          EcoLiz peut aussi vous accompagner sur les solutions Bitdefender EDR,
          XDR et MDR pour sécuriser votre parc informatique.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/contact"
            onClick={closePopup}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 transition-colors"
          >
            Demander une information
          </Link>

          <button
            type="button"
            onClick={closePopup}
            className="inline-flex items-center justify-center rounded-full border border-brand-200 px-4 py-2.5 text-sm font-semibold text-brand-900 hover:bg-brand-50 transition-colors"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
