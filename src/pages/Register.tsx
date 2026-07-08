import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Lock,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { registerCustomer } from "../services/auth";

type CompanySuggestion = {
  name: string;
  siret: string;
  address?: string;
};

type RechercheEntrepriseEtablissement = {
  siret?: string;
  adresse?: string;
  code_postal?: string;
  libelle_commune?: string;
  est_siege?: boolean;
};

type RechercheEntrepriseResult = {
  nom_complet?: string;
  nom_raison_sociale?: string;
  denomination?: string;
  siege?: RechercheEntrepriseEtablissement;
  matching_etablissements?: RechercheEntrepriseEtablissement[];
};

function normalizeSiret(value: string) {
  return value.replace(/\D/g, "").slice(0, 14);
}

function formatSiret(value: string) {
  return normalizeSiret(value).replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

function buildAddress(etablissement?: RechercheEntrepriseEtablissement) {
  if (!etablissement) {
    return "";
  }

  return [
    etablissement.adresse,
    etablissement.code_postal,
    etablissement.libelle_commune,
  ]
    .filter(Boolean)
    .join(" ");
}

function mapCompanySuggestion(
  company: RechercheEntrepriseResult,
  searchedSiret: string
): CompanySuggestion | null {
  const establishments = Array.isArray(company.matching_etablissements)
    ? company.matching_etablissements
    : [];

  const establishment =
    establishments.find((item) => normalizeSiret(item.siret || "") === searchedSiret) ||
    establishments.find((item) => item.est_siege) ||
    company.siege ||
    establishments[0];

  const siret = normalizeSiret(establishment?.siret || company.siege?.siret || "");
  const name =
    company.nom_complet ||
    company.nom_raison_sociale ||
    company.denomination ||
    "";

  if (!name || !siret) {
    return null;
  }

  return {
    name,
    siret,
    address: buildAddress(establishment || company.siege),
  };
}

async function searchCompanySuggestions(
  query: string,
  signal: AbortSignal
): Promise<CompanySuggestion[]> {
  const searchedSiret = normalizeSiret(query);
  const response = await fetch(
    `/wp-api/ecoliz/v1/company-search?q=${encodeURIComponent(query)}&per_page=5`,
    { signal }
  );

  if (!response.ok) {
    throw new Error("Recherche entreprise indisponible.");
  }

  const data = await response.json();
  const results = Array.isArray(data?.results) ? data.results : [];

  return results
    .map((company: RechercheEntrepriseResult) =>
      mapCompanySuggestion(company, searchedSiret)
    )
    .filter(Boolean) as CompanySuggestion[];
}

export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { redirectTo?: string } | null)?.redirectTo || "/compte";

useEffect(() => {
  const user = localStorage.getItem("ecoliz_user");

  if (user) {
    navigate(redirectTo, { replace: true });
  }
}, [navigate, redirectTo]);

  const [formData, setFormData] = useState({
    company: "",
    siret: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [newsletterConsent, setNewsletterConsent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState<CompanySuggestion[]>([]);
  const [companySearchLoading, setCompanySearchLoading] = useState(false);
  const [companySearchError, setCompanySearchError] = useState<string | null>(null);
  const [selectedSiret, setSelectedSiret] = useState("");
  const [companySearchSource, setCompanySearchSource] = useState<"company" | "siret" | null>(null);

  useEffect(() => {
    const normalizedSiret = normalizeSiret(formData.siret);
    const query = normalizedSiret.length >= 3 ? normalizedSiret : formData.company.trim();

    if (normalizedSiret && normalizedSiret === selectedSiret) {
      setCompanySuggestions([]);
      setCompanySearchError(null);
      setCompanySearchLoading(false);
      return;
    }

    if (query.length < 3) {
      setCompanySuggestions([]);
      setCompanySearchError(null);
      setCompanySearchLoading(false);
      setCompanySearchSource(null);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setCompanySearchLoading(true);
        setCompanySearchError(null);

        const suggestions = await searchCompanySuggestions(query, controller.signal);
        setCompanySuggestions(suggestions);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Erreur recherche SIRET :", error);
        setCompanySuggestions([]);
        setCompanySearchError("Recherche entreprise indisponible pour le moment.");
      } finally {
        setCompanySearchLoading(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [formData.company, formData.siret, selectedSiret]);

  const selectCompanySuggestion = (suggestion: CompanySuggestion) => {
    setSelectedSiret(suggestion.siret);
    setCompanySuggestions([]);
    setCompanySearchError(null);
    setCompanySearchSource(null);

    setFormData((current) => ({
      ...current,
      company: suggestion.name,
      siret: suggestion.siret,
    }));
  };

  const renderCompanySuggestions = () => {
    if (!companySearchLoading && !companySearchError && companySuggestions.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-brand-100 bg-white shadow-sm">
        {companySearchLoading && (
          <p className="px-4 py-3 text-sm text-brand-900/60">
            Recherche de l’entreprise…
          </p>
        )}

        {!companySearchLoading && companySearchError && (
          <p className="px-4 py-3 text-sm text-red-600">
            {companySearchError}
          </p>
        )}

        {!companySearchLoading &&
          !companySearchError &&
          companySuggestions.map((suggestion) => (
            <button
              key={suggestion.siret}
              type="button"
              onClick={() => selectCompanySuggestion(suggestion)}
              className="block w-full px-4 py-3 text-left hover:bg-brand-50 transition-colors border-b border-brand-100 last:border-b-0"
            >
              <span className="block text-sm font-semibold text-brand-950">
                {suggestion.name}
              </span>
              <span className="block text-xs text-brand-900/60">
                SIRET : {formatSiret(suggestion.siret)}
                {suggestion.address ? ` · ${suggestion.address}` : ""}
              </span>
            </button>
          ))}
      </div>
    );
  };

  const validateForm = () => {
    if (!formData.company.trim()) {
      return "Le nom de l’entreprise est obligatoire.";
    }

    const normalizedSiret = normalizeSiret(formData.siret);

    if (normalizedSiret && normalizedSiret.length !== 14) {
      return "Le numéro SIRET doit contenir 14 chiffres.";
    }

    if (!formData.firstName.trim()) {
      return "Le prénom est obligatoire.";
    }

    if (!formData.lastName.trim()) {
      return "Le nom est obligatoire.";
    }

    if (!formData.email.trim()) {
      return "L’adresse email est obligatoire.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      return "L’adresse email n’est pas valide.";
    }

    if (!formData.password) {
      return "Le mot de passe est obligatoire.";
    }

    if (formData.password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }

    return null;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setError(null);
  setSuccess(null);

  const validationError = validateForm();

  if (validationError) {
    setError(validationError);
    return;
  }

  try {
    setLoading(true);

    const result = await registerCustomer({ ...formData, siret: normalizeSiret(formData.siret) });

    if (newsletterConsent) {
      try {
        const newsletterResponse = await fetch("/wp-api/ecoliz/v1/newsletter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            company: formData.company.trim(),
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
            customer_id: result.user?.id ?? result.user?.customer_id ?? 0,
            source: "inscription-client",
            consent: true,
          }),
        });

        if (!newsletterResponse.ok) {
          console.warn("Inscription newsletter non enregistrée.");
        }
      } catch (newsletterError) {
        console.warn("Erreur inscription newsletter :", newsletterError);
      }
    }

    localStorage.setItem("ecoliz_user", JSON.stringify(result.user));

    setSuccess("Compte créé avec succès. Redirection vers la commande...");

    setTimeout(() => {
    navigate(redirectTo);    
  }, 800);
  } catch (error) {
    console.error("Erreur inscription :", error);

    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("Impossible de créer le compte pour le moment.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-950 relative overflow-hidden flex-col justify-between p-12 lg:p-20">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-700/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-700/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10">
          <Link to="/" className="inline-block mb-16">
            <img
              src="/logo.png"
              alt="EcoLiz"
              className="h-10 w-auto object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
            />
          </Link>

          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight max-w-xl">
            Équipez votre entreprise de manière{" "}
            <span className="font-display italic text-accent-300">
              durable
            </span>
            .
          </h1>
        </div>

        <div className="relative z-10">
          <ul className="space-y-4 text-brand-100/80 text-lg">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-400" />
              Matériel premium garanti 24 mois
            </li>

            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-400" />
              Paiement à 30 jours net
            </li>

            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-400" />
              Certificats d’économie CO₂
            </li>
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 py-12 lg:py-12 relative overflow-y-auto">
        <Link
          to="/"
          className="absolute top-8 left-4 sm:left-6 lg:left-12 inline-flex items-center gap-2 text-sm font-medium text-brand-900/60 hover:text-brand-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au site
        </Link>

        <div className="w-full max-w-md mx-auto mt-12 lg:mt-0">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-brand-950 mb-3 tracking-tight">
              Créer un compte pro
            </h2>

            <p className="text-brand-900/70">
              Rejoignez les entreprises engagées dans le réemploi.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-brand-900 mb-2"
                >
                  Nom de l’entreprise *
                </label>

                <div className="relative">
                  <Building2 className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-brand-900/40" />

                  <input
                    id="company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => {
                      setSelectedSiret("");
                      setCompanySearchSource("company");
                      setFormData({
                        ...formData,
                        company: e.target.value,
                      });
                    }}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white"
                    placeholder="Acme Corp"
                  />
                </div>

                {companySearchSource === "company" && renderCompanySuggestions()}
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="siret"
                  className="block text-sm font-medium text-brand-900 mb-2"
                >
                  Numéro SIRET{" "}
                  <span className="text-brand-900/40 font-normal">
                    optionnel
                  </span>
                </label>

                <input
                  id="siret"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={17}
                  value={formatSiret(formData.siret)}
                  onChange={(e) => {
                    setSelectedSiret("");
                    setCompanySearchSource("siret");
                    setFormData({
                      ...formData,
                      siret: normalizeSiret(e.target.value),
                    });
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white"
                  placeholder="123 456 789 00012"
                />

                {companySearchSource === "siret" && renderCompanySuggestions()}
              </div>
            </div>

            <div className="w-full h-px bg-brand-100 my-2" />

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-brand-900 mb-2"
                >
                  Prénom *
                </label>

                <input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      firstName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-brand-900 mb-2"
                >
                  Nom *
                </label>

                <input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lastName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white"
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-brand-900 mb-2"
                >
                  Email professionnel *
                </label>

                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-brand-900/40" />

                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white"
                    placeholder="jean.dupont@entreprise.com"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-brand-900 mb-2"
                >
                  Mot de passe *
                </label>

                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-brand-900/40" />

                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white"
                    placeholder="8 caractères minimum"
                  />
                </div>

                <p className="mt-2 text-xs text-brand-900/50">
                  Le mot de passe doit contenir au moins 8 caractères.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
              <label className="flex items-start gap-3 text-sm text-brand-900">
                <input
                  type="checkbox"
                  checked={newsletterConsent}
                  onChange={(event) => setNewsletterConsent(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-brand-300 text-brand-700 focus:ring-brand-500"
                />
                <span>
                  <span className="font-medium">
                    Je souhaite recevoir les nouveautés, promotions et arrivages EcoLiz.
                  </span>

                </span>
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                size="lg"
                className="group"
                disabled={loading}
              >
                {loading ? "Création en cours..." : "Créer mon compte"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-brand-900/70">
            Déjà client ?{" "}
            <Link
              to="/connexion"
              state={{ redirectTo }}
              className="font-semibold text-brand-700 hover:text-brand-800 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}