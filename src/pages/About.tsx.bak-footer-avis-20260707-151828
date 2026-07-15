import React, { useEffect, useState } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Leaf, ShieldCheck, Users } from "lucide-react";

import { config } from "../config/env";

type WordPressArticle = {
  id: number;
  date: string;
  link: string;
  slug: string;
  title?: {
    rendered?: string;
  };
  excerpt?: {
    rendered?: string;
  };
};

const commitments = [
  {
    icon: ShieldCheck,
    title: "Matériel professionnel",
    text: "EcoLiz met en avant des équipements informatiques adaptés aux usages des entreprises : postes de travail, ordinateurs portables, écrans, serveurs, stockage et réseau.",
  },
  {
    icon: Leaf,
    title: "Réemploi informatique",
    text: "Le reconditionné permet de prolonger la durée de vie du matériel et de limiter le renouvellement systématique par du neuf.",
  },
  {
    icon: Users,
    title: "Accompagnement B2B",
    text: "La plateforme aide les professionnels à comparer les produits, identifier les caractéristiques importantes et préparer leurs demandes.",
  },
];

type ValidatedReview = {
  quote: string;
  author: string;
  company?: string;
  role?: string;
};

function stripHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "’")
    .replace(/&#8211;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function formatArticleDate(value: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function About() {
  const [validatedReviews, setValidatedReviews] = useState<ValidatedReview[]>([]);

  useEffect(() => {
    let isMounted = true;

    fetch("/wp-api/ecoliz/v1/testimonials")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Impossible de charger les avis clients.");
        }

        return response.json();
      })
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setValidatedReviews(Array.isArray(data?.reviews) ? data.reviews : []);
      })
      .catch((error) => {
        console.error("Erreur chargement avis clients :", error);

        if (isMounted) {
          setValidatedReviews([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);
  const [articles, setArticles] = useState<WordPressArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState("");

  useEffect(() => {
    document.title = "À propos d’EcoLiz | Informatique reconditionnée pour les professionnels";

    const description =
      "EcoLiz accompagne les professionnels dans l’achat de matériel informatique reconditionné, le réemploi IT et la gestion plus responsable du parc informatique.";

    let meta = document.querySelector('meta[name="description"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", description);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadArticles() {
      try {
        setArticlesLoading(true);
        setArticlesError("");

        const wordpressUrl = config.wordpressUrl.replace(/\/+$/, "");
        const response = await fetch(
          `${wordpressUrl}/wp-json/wp/v2/posts?per_page=3&_fields=id,date,link,slug,title,excerpt`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur WordPress ${response.status}`);
        }

        const data = (await response.json()) as WordPressArticle[];
        setArticles(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Erreur chargement articles WordPress :", error);
        setArticlesError("Les derniers articles ne sont pas disponibles pour le moment.");
      } finally {
        setArticlesLoading(false);
      }
    }

    loadArticles();

    return () => controller.abort();
  }, []);

  return (
    <main className="bg-brand-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-brand-50 to-emerald-50 pt-32 pb-20 text-brand-950 lg:pt-40 lg:pb-28">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-[420px] w-[420px] rounded-full bg-emerald-100/50 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">
              À propos d’EcoLiz
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Une plateforme dédiée à l’informatique professionnelle reconditionnée
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-brand-900/75">
              EcoLiz accompagne les professionnels dans le choix de matériel informatique
              reconditionné. L’objectif est de proposer une alternative fiable, plus responsable
              et adaptée aux besoins des entreprises.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/boutique"
                className="inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
              >
                Voir la boutique
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-900 shadow-sm transition hover:bg-brand-50"
              >
                Contacter EcoLiz
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
              Notre mission
            </p>

            <h2 className="mt-3 text-3xl font-bold text-brand-950">
              Donner une seconde vie au matériel informatique professionnel
            </h2>

            <div className="mt-6 space-y-5 text-base leading-8 text-brand-900/75">
              <p>
                EcoLiz s’adresse aux entreprises, collectivités et structures professionnelles
                qui souhaitent équiper leurs équipes avec du matériel informatique fiable,
                tout en intégrant une démarche de réemploi.
              </p>

              <p>
                La plateforme permet de consulter un catalogue de produits reconditionnés,
                de comparer les caractéristiques techniques et d’identifier les équipements
                adaptés aux usages métier.
              </p>

              <p>
                Cette approche permet de mieux maîtriser les budgets IT, de prolonger la
                durée de vie du matériel et de limiter les déchets électroniques.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-brand-100">
            <h3 className="text-xl font-bold text-brand-950">
              Ce qu’EcoLiz met en avant
            </h3>

            <div className="mt-6 space-y-6">
              {commitments.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <h4 className="font-semibold text-brand-950">{item.title}</h4>
                      <p className="mt-1 text-sm leading-6 text-brand-900/65">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-brand-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
                Guides & conseils EcoLiz
              </p>

              <h2 className="mt-3 text-3xl font-bold text-brand-950">
                Comprendre le reconditionné professionnel
              </h2>

              <p className="mt-5 text-base leading-8 text-brand-900/70">
                Retrouvez des contenus pratiques pour mieux comprendre le reconditionné,
                le réemploi informatique et les bonnes pratiques d’achat IT pour les professionnels.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800">
              <BookOpen className="h-4 w-4" />
              Guides régulièrement mis à jour
            </div>
          </div>

          <div className="mt-10">
            {articlesLoading ? (
              <div className="rounded-3xl border border-brand-100 bg-brand-50 p-8 text-brand-900/60">
                Chargement des derniers articles…
              </div>
            ) : articlesError ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-800">
                {articlesError}
              </div>
            ) : articles.length === 0 ? (
              <div className="rounded-3xl border border-brand-100 bg-brand-50 p-8 text-brand-900/70">
                Aucun guide n’est encore disponible. Les prochains contenus EcoLiz apparaîtront
                automatiquement ici lorsqu’ils seront publiés.
                <div className="pt-1">
                  <a
                    href="/temoignage-client"
                    className="inline-flex items-center justify-center rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                  >
                    Partager un témoignage
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="flex h-full flex-col rounded-3xl border border-brand-100 bg-brand-50 p-6 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                      {formatArticleDate(article.date)}
                    </p>

                    <h3 className="mt-3 text-lg font-bold text-brand-950">
                      {stripHtml(article.title?.rendered)}
                    </h3>

                    <p className="mt-3 flex-1 text-sm leading-6 text-brand-900/70">
                      {stripHtml(article.excerpt?.rendered).slice(0, 180)}
                      {stripHtml(article.excerpt?.rendered).length > 180 ? "…" : ""}
                    </p>

                    <a
                      href={`/articles/${article.slug}`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900"
                    >
                      Lire l’article
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-brand-100">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
              Avis clients
            </p>

            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-brand-950">
                Ils partagent leur expérience EcoLiz
              </h2>

              <a
                href="/temoignage-client"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                Partager un témoignage
              </a>
            </div>

            {validatedReviews.length > 0 ? (
              <div className="mt-6 space-y-5">
                {validatedReviews.map((review, index) => (
                  <blockquote
                    key={`${review.author}-${index}`}
                    className="rounded-3xl border border-brand-100 bg-brand-50/60 p-6"
                  >
                    <div className="flex items-center gap-4">
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
                        Témoignage client
                      </span>
                    </div>

                    <p className="mt-5 text-base leading-8 text-brand-900/75">
                      “{review.quote}”
                    </p>

                    <footer className="mt-5 border-t border-brand-100 pt-4">
                      <p className="text-sm font-bold text-brand-950">
                        {review.author}
                      </p>

                      {(review.role || review.company) && (
                        <p className="mt-1 text-sm text-brand-900/60">
                          {review.role}
                          {review.role && review.company ? " — " : ""}
                          {review.company}
                        </p>
                      )}
                    </footer>
                  </blockquote>
                ))}


              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <p className="text-base leading-8 text-brand-900/70">
                  Les témoignages clients seront publiés uniquement après validation et accord
                  de l’entreprise concernée.
                </p>

                <a
                  href="/temoignage-client"
                  className="inline-flex items-center justify-center rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                >
                  Partager un témoignage
                </a>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-brand-900 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-200">
              Besoin d’un conseil ?
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              EcoLiz accompagne les professionnels dans leurs achats IT
            </h2>

            <p className="mt-5 text-base leading-8 text-brand-50">
              Pour une demande de devis, un besoin spécifique, une reprise de parc ou une
              question sur un produit, le formulaire de contact permet de transmettre une
              demande à l’équipe EcoLiz.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                Devis
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                Reprise de parc
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                Conseil produit
              </span>
            </div>

            <Link
              to="/contact"
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-950 transition hover:bg-brand-100"
            >
              Contacter EcoLiz
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
