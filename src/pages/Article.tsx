import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, Leaf } from "lucide-react";

import { config } from "../config/env";

type WordPressArticleDetail = {
  id: number;
  date: string;
  link: string;
  title?: {
    rendered?: string;
  };
  content?: {
    rendered?: string;
  };
  excerpt?: {
    rendered?: string;
  };
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

function estimateReadingTime(html = "") {
  const text = stripHtml(html);
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));

  return `${minutes} min de lecture`;
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const [article, setArticle] = useState<WordPressArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const title = stripHtml(article?.title?.rendered);
  const excerpt = stripHtml(article?.excerpt?.rendered);
  const readingTime = useMemo(
    () => estimateReadingTime(article?.content?.rendered),
    [article?.content?.rendered]
  );

  useEffect(() => {
    if (!slug) {
      setError("Article introuvable.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadArticle() {
      try {
        setLoading(true);
        setError("");

        const wordpressUrl = config.wordpressUrl.replace(/\/+$/, "");
        const response = await fetch(
          `${wordpressUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=id,date,link,title,content,excerpt`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur article ${response.status}`);
        }

        const data = (await response.json()) as WordPressArticleDetail[];
        const currentArticle = Array.isArray(data) ? data[0] : null;

        if (!currentArticle) {
          setArticle(null);
          setError("Article introuvable.");
          return;
        }

        setArticle(currentArticle);

        const pageTitle = stripHtml(currentArticle.title?.rendered);
        document.title = `${pageTitle} | EcoLiz`;

        const description = stripHtml(currentArticle.excerpt?.rendered).slice(0, 155);
        let meta = document.querySelector('meta[name="description"]');

        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("name", "description");
          document.head.appendChild(meta);
        }

        meta.setAttribute("content", description);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }

        console.error("Erreur chargement article :", requestError);
        setError("Impossible de charger cet article.");
      } finally {
        setLoading(false);
      }
    }

    loadArticle();

    return () => controller.abort();
  }, [slug]);

  return (
    <main className="bg-brand-50 pt-32 pb-20 lg:pt-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/a-propos"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux guides EcoLiz
        </Link>

        {loading ? (
          <div className="rounded-3xl border border-brand-100 bg-white p-10 text-brand-900/60 shadow-sm">
            Chargement de l’article…
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-red-700 shadow-sm">
            {error}
          </div>
        ) : article ? (
          <article className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
            <header className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-emerald-900 px-6 py-14 text-white sm:px-10 lg:px-14 lg:py-16">
              <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />

              <div className="relative z-10 max-w-4xl">
                <div className="mb-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-brand-50 ring-1 ring-white/15">
                    <Leaf className="h-4 w-4" />
                    Guide EcoLiz
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-brand-50 ring-1 ring-white/15">
                    <CalendarDays className="h-4 w-4" />
                    {formatArticleDate(article.date)}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-brand-50 ring-1 ring-white/15">
                    <Clock className="h-4 w-4" />
                    {readingTime}
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {title}
                </h1>

                {excerpt && (
                  <p className="mt-6 max-w-3xl text-lg leading-8 text-brand-50/90">
                    {excerpt}
                  </p>
                )}
              </div>
            </header>

            <div className="grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:px-14 lg:py-14">
              <div
                className="max-w-none text-brand-950
                [&_h2]:mt-12 [&_h2]:border-t [&_h2]:border-brand-100 [&_h2]:pt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-brand-950
                [&_h2:first-child]:mt-0 [&_h2:first-child]:border-t-0 [&_h2:first-child]:pt-0
                [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-brand-950
                [&_p]:mt-5 [&_p]:text-[1.02rem] [&_p]:leading-8 [&_p]:text-brand-900/75
                [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:text-brand-900/75
                [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol]:text-brand-900/75
                [&_li]:leading-7
                [&_a]:font-semibold [&_a]:text-brand-700 [&_a]:underline
                [&_strong]:font-semibold [&_strong]:text-brand-950
                [&_blockquote]:mt-8 [&_blockquote]:rounded-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-brand-600 [&_blockquote]:bg-brand-50 [&_blockquote]:p-6 [&_blockquote]:text-brand-900"
                dangerouslySetInnerHTML={{
                  __html: article.content?.rendered ?? "",
                }}
              />

              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-3xl border border-brand-100 bg-brand-50 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
                    À retenir
                  </p>

                  <p className="mt-4 text-sm leading-6 text-brand-900/70">
                    EcoLiz accompagne les professionnels dans le choix de matériel
                    informatique reconditionné adapté à leurs usages, leurs contraintes
                    techniques et leur budget.
                  </p>

                  <div className="mt-6 space-y-3">
                    <Link
                      to="/boutique"
                      className="flex w-full items-center justify-center rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
                    >
                      Voir la boutique
                    </Link>

                    <Link
                      to="/contact"
                      className="flex w-full items-center justify-center rounded-full border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
                    >
                      Contacter EcoLiz
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </article>
        ) : null}
      </div>
    </main>
  );
}
