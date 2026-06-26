import { Link } from "react-router-dom";
import { useEffect } from "react";

const stats = [
  { value: "B2B", label: "une plateforme pensée pour les professionnels" },
  { value: "IT", label: "ordinateurs, écrans, serveurs et équipements réseau" },
  { value: "Réemploi", label: "une démarche orientée sobriété numérique" },
];

const values = [
  {
    title: "Du matériel professionnel sélectionné",
    description:
      "EcoLiz met en avant du matériel informatique reconditionné adapté aux usages des entreprises : postes de travail, ordinateurs portables, écrans, serveurs, stockage et réseau.",
  },
  {
    title: "Une approche plus responsable",
    description:
      "Le reconditionné permet de prolonger la durée de vie des équipements, de limiter le gaspillage électronique et de réduire le renouvellement systématique du matériel neuf.",
  },
  {
    title: "Un accompagnement B2B",
    description:
      "La plateforme aide les professionnels à comparer les caractéristiques, comprendre les grades, choisir les bonnes références et préparer leurs demandes selon leur parc informatique.",
  },
];

const reviews = [
  {
    name: "Responsable informatique",
    company: "PME région Occitanie",
    rating: "★★★★★",
    text: "La plateforme permet d'identifier rapidement le matériel adapté à nos besoins. Les informations produits sont claires et utiles pour comparer les références.",
  },
  {
    name: "Chargée administrative",
    company: "Association",
    rating: "★★★★★",
    text: "Le reconditionné nous permet d'équiper nos équipes avec du matériel professionnel tout en respectant notre budget et notre démarche responsable.",
  },
  {
    name: "Acheteur IT",
    company: "Collectivité",
    rating: "★★★★☆",
    text: "Les critères comme l'état du produit, la marque, la configuration et la langue du clavier sont essentiels pour sécuriser nos commandes.",
  },
];

const articles = [
  {
    title: "Pourquoi choisir du matériel informatique reconditionné en entreprise ?",
    description:
      "Réduction des coûts, limitation des déchets électroniques, prolongation de la durée de vie du matériel : le reconditionné répond aux enjeux économiques et environnementaux des professionnels.",
    category: "Guide achat",
    readingTime: "4 min",
  },
  {
    title: "Comment choisir un PC portable professionnel reconditionné ?",
    description:
      "Processeur, mémoire RAM, stockage SSD, taille d'écran, autonomie, système d'exploitation et état esthétique : les critères à vérifier avant de commander.",
    category: "Ordinateurs portables",
    readingTime: "5 min",
  },
  {
    title: "AZERTY, QWERTY, QWERTZ : pourquoi la langue du clavier est importante ?",
    description:
      "Sur un ordinateur portable reconditionné, la disposition clavier peut varier selon l'origine du produit. Ce critère doit être vérifié pour éviter les erreurs de commande.",
    category: "Conseils pratiques",
    readingTime: "3 min",
  },
  {
    title: "Grade A, Grade B : comprendre l'état d'un produit reconditionné",
    description:
      "Le grade indique l'état esthétique d'un produit. Il aide à choisir entre un matériel en excellent état visuel ou une solution plus économique avec de légères traces d'usage.",
    category: "Reconditionné",
    readingTime: "4 min",
  },
  {
    title: "Reprise de parc informatique : que deviennent les anciens équipements ?",
    description:
      "La reprise de parc IT permet aux entreprises de mieux gérer le renouvellement de leurs équipements, avec une logique de réemploi, de tri et de valorisation.",
    category: "Parc informatique",
    readingTime: "4 min",
  },
  {
    title: "Effacement des données et RGPD : un enjeu important pour les entreprises",
    description:
      "Avant la revente ou le recyclage d'un équipement, l'effacement sécurisé des données protège les informations sensibles et limite les risques liés au RGPD.",
    category: "Sécurité",
    readingTime: "5 min",
  },
];

const faq = [
  {
    question: "EcoLiz s'adresse à qui ?",
    answer:
      "EcoLiz s'adresse principalement aux entreprises, collectivités, associations et professionnels qui souhaitent acheter du matériel informatique reconditionné.",
  },
  {
    question: "Quelle est la différence avec la page d'accueil ?",
    answer:
      "La page d'accueil présente rapidement l'offre et les accès principaux. Cette page explique davantage l'entreprise, sa mission, ses valeurs, les avis clients et les conseils utiles pour le référencement SEO.",
  },
  {
    question: "Pourquoi ajouter des articles sur cette page ?",
    answer:
      "Les articles permettent de répondre aux recherches des visiteurs sur Google et d'améliorer la visibilité du site sur des mots-clés comme matériel informatique reconditionné, PC portable professionnel ou reprise de parc IT.",
  },
];

export function About() {
  useEffect(() => {
    document.title =
      "À propos d'EcoLiz | Matériel informatique reconditionné professionnel";

    const description =
      "Découvrez EcoLiz, une plateforme B2B dédiée au matériel informatique professionnel reconditionné, au réemploi, à la reprise de parc IT et à la sobriété numérique.";

    let meta = document.querySelector('meta[name="description"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", description);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "EcoLiz",
      description,
      areaServed: "France",
      knowsAbout: [
        "matériel informatique reconditionné",
        "informatique professionnelle",
        "réemploi informatique",
        "reprise de parc informatique",
        "sobriété numérique",
      ],
    };

    let script = document.querySelector<HTMLScriptElement>(
      'script[data-seo="about-ecoliz"]',
    );

    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seo = "about-ecoliz";
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(jsonLd);
  }, []);

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-20 h-48 w-48 rounded-full bg-emerald-400 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-lime-300 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">
              À propos d'EcoLiz
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Mieux équiper les professionnels avec du matériel informatique reconditionné
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-emerald-50">
              EcoLiz est une plateforme e-commerce B2B dédiée au matériel informatique
              professionnel reconditionné. Elle aide les entreprises à trouver des
              ordinateurs portables, postes de travail, écrans, serveurs, solutions de
              stockage et équipements réseau adaptés à leurs besoins.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/boutique"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-emerald-950 shadow-sm transition hover:bg-emerald-50"
              >
                Découvrir la boutique
              </Link>

              <Link
                to="/contact"
                className="rounded-full border border-white/40 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Demander un conseil
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.value}
                className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur"
              >
                <p className="text-3xl font-bold text-emerald-200">{stat.value}</p>
                <p className="mt-2 text-sm leading-6 text-emerald-50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Notre histoire
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Une solution pensée pour les besoins informatiques des entreprises
            </h2>

            <div className="mt-6 space-y-5 text-base leading-8 text-slate-700">
              <p>
                EcoLiz a été conçu pour proposer une expérience plus claire et plus moderne
                autour de l'achat de matériel informatique reconditionné. L'objectif est de
                rendre le catalogue plus lisible, les filtres plus utiles et les informations
                produits plus simples à comparer.
              </p>

              <p>
                La plateforme s'inscrit dans un environnement professionnel lié aux services
                numériques, aux infrastructures informatiques, à la connectivité réseau, à la
                cybersécurité, à la virtualisation et à l'hébergement.
              </p>

              <p>
                Contrairement à la page d'accueil, cette page sert à expliquer qui se trouve
                derrière EcoLiz, pourquoi le projet existe et comment il peut aider les
                professionnels à acheter plus efficacement leur matériel informatique.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            {values.map((value) => (
              <article
                key={value.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-bold text-slate-900">{value.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Avis clients
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Des retours pour rassurer les professionnels avant leur achat
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-700">
              Cette section permet d'ajouter de vrais témoignages clients une fois validés
              par l'entreprise. Les avis renforcent la confiance, montrent les cas d'usage
              concrets et différencient cette page d'une simple présentation commerciale.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={`${review.name}-${review.company}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <p className="text-sm tracking-widest text-amber-500">{review.rating}</p>
                <blockquote className="mt-4 text-sm leading-7 text-slate-700">
                  “{review.text}”
                </blockquote>
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <p className="font-semibold text-slate-900">{review.name}</p>
                  <p className="text-sm text-slate-500">{review.company}</p>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-6 text-sm text-slate-500">
            À remplacer par des avis réels dès que les témoignages clients seront validés.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Articles & conseils
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Des contenus utiles pour mieux comprendre l'informatique reconditionnée
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-700">
              Ces articles courts apportent du contenu SEO à la page tout en aidant les
              visiteurs à comprendre les critères importants : grade, configuration, clavier,
              sécurité, reprise de parc et choix du matériel.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.title}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {article.category}
                </p>
                <p className="text-xs text-slate-500">{article.readingTime}</p>
              </div>

              <h3 className="mt-5 text-lg font-bold leading-7 text-slate-900 group-hover:text-emerald-800">
                {article.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-700">
                {article.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-emerald-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Pourquoi nous choisir ?
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Une page à la fois informative, rassurante et optimisée SEO
            </h2>

            <p className="mt-5 text-base leading-8 text-emerald-50">
              L'objectif est de montrer qu'EcoLiz ne vend pas uniquement des produits : la
              plateforme accompagne aussi les entreprises dans une meilleure compréhension
              du reconditionné, de la gestion de parc et des critères techniques.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/10">
              <h3 className="font-bold">Clarté du catalogue</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-50">
                Des informations utiles pour comparer les produits, les marques, les états
                et les configurations.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/10">
              <h3 className="font-bold">Démarche responsable</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-50">
                Une mise en avant du réemploi, de la sobriété numérique et de la réduction
                des déchets électroniques.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/10">
              <h3 className="font-bold">Conseils professionnels</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-50">
                Des contenus pédagogiques pour aider les acheteurs à choisir le bon matériel.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/10">
              <h3 className="font-bold">Confiance client</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-50">
                Une zone d'avis pour afficher des témoignages réels dès qu'ils seront validés.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Questions fréquentes
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Comprendre EcoLiz en quelques questions
            </h2>

            <div className="mt-8 space-y-5">
              {faq.map((item) => (
                <article key={item.question} className="border-t border-slate-200 pt-5">
                  <h3 className="font-bold text-slate-900">{item.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-emerald-900 p-8 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Besoin d'un conseil ?
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Parlez-nous de votre besoin informatique
            </h2>

            <p className="mt-5 text-base leading-8 text-emerald-50">
              Pour une recherche de matériel, une reprise de parc, une question sur un
              produit ou une demande professionnelle, l'équipe peut vous orienter vers les
              solutions les plus adaptées.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <Link
                to="/contact"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50"
              >
                Contacter EcoLiz
              </Link>

              <Link
                to="/boutique"
                className="rounded-full border border-white/30 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Voir les produits disponibles
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
