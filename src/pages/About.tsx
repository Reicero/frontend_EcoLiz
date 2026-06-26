import { Link } from "react-router-dom";
import { useEffect } from "react";

const stats = [
  { value: "B2B", label: "une plateforme pensée pour les professionnels" },
  { value: "IT", label: "postes, PC portables, écrans, serveurs, stockage et réseau" },
  { value: "Réemploi", label: "une démarche orientée sobriété numérique et seconde vie" },
];

const values = [
  {
    title: "Un catalogue pensé pour les achats professionnels",
    description:
      "EcoLiz aide les entreprises à rechercher du matériel selon des critères concrets : catégorie, marque, état esthétique, configuration, stockage, système d'exploitation ou encore langue du clavier.",
  },
  {
    title: "Une alternative au renouvellement systématique",
    description:
      "Le reconditionné permet de prolonger la durée de vie des équipements, de limiter les déchets électroniques et de mieux maîtriser les budgets IT.",
  },
  {
    title: "Une relation directe avec les entreprises",
    description:
      "L'objectif n'est pas seulement de vendre en ligne : EcoLiz permet aussi aux professionnels de demander un conseil, un devis ou une réponse adaptée à leur parc informatique.",
  },
];

const reviews = [
  {
    initials: "RI",
    role: "Responsable informatique",
    company: "PME en Occitanie",
    rating: "5.0",
    tag: "Renouvellement de parc",
    text:
      "Une plateforme claire pour comparer les références, préparer une demande de devis et identifier rapidement le matériel adapté à nos équipes.",
  },
  {
    initials: "DA",
    role: "Direction administrative",
    company: "Association",
    rating: "5.0",
    tag: "Budget maîtrisé",
    text:
      "Le reconditionné nous permet d'équiper plusieurs postes avec du matériel professionnel tout en restant cohérents avec notre démarche responsable.",
  },
  {
    initials: "AI",
    role: "Acheteur IT",
    company: "Collectivité",
    rating: "4.8",
    tag: "Critères techniques",
    text:
      "Les informations sur l'état, la configuration et la langue du clavier sont indispensables pour éviter les erreurs de commande et sécuriser l'achat.",
  },
];

const articles = [
  {
    title: "Pourquoi choisir du matériel informatique reconditionné en entreprise ?",
    description:
      "Réduire les coûts, prolonger la durée de vie du matériel et limiter les déchets électroniques : le reconditionné répond à des enjeux à la fois économiques et environnementaux.",
    category: "Guide achat",
    readingTime: "4 min",
  },
  {
    title: "Comment choisir un PC portable professionnel reconditionné ?",
    description:
      "Processeur, mémoire RAM, stockage SSD, taille d'écran, système d'exploitation, autonomie et état esthétique : les critères essentiels à comparer avant l'achat.",
    category: "Ordinateurs portables",
    readingTime: "5 min",
  },
  {
    title: "AZERTY, QWERTY, QWERTZ : pourquoi la langue du clavier compte ?",
    description:
      "Sur du matériel reconditionné, la disposition du clavier peut varier selon l'origine du produit. Ce détail doit être clairement vérifié avant une commande professionnelle.",
    category: "Conseils pratiques",
    readingTime: "3 min",
  },
  {
    title: "Grade A, Grade B : comprendre l'état visuel d'un produit",
    description:
      "Le grade concerne principalement l'aspect esthétique du produit. Il ne signifie pas qu'un équipement est moins performant, mais permet d'évaluer son état visuel.",
    category: "Reconditionné",
    readingTime: "4 min",
  },
  {
    title: "Reprise de parc IT : que deviennent les anciens équipements ?",
    description:
      "La reprise de parc aide les entreprises à organiser le renouvellement de leurs équipements avec une logique de réemploi, de tri, de valorisation ou de recyclage certifié.",
    category: "Parc informatique",
    readingTime: "4 min",
  },
  {
    title: "Effacement des données et RGPD : un point clé pour les entreprises",
    description:
      "Avant la revente, la réutilisation ou le recyclage d'un équipement, l'effacement sécurisé des données limite les risques liés aux informations sensibles.",
    category: "Sécurité",
    readingTime: "5 min",
  },
];

const faq = [
  {
    question: "EcoLiz s'adresse à qui ?",
    answer:
      "EcoLiz s'adresse aux entreprises, collectivités, associations et professionnels qui souhaitent s'équiper en matériel informatique reconditionné ou demander un accompagnement sur leur parc IT.",
  },
  {
    question: "Pourquoi passer par EcoLiz plutôt que par une simple fiche produit ?",
    answer:
      "EcoLiz met l'accent sur les critères importants pour un achat professionnel : usage, configuration, état esthétique, disponibilité, langue du clavier, garantie à confirmer et besoin éventuel de devis.",
  },
  {
    question: "Le grade d'un produit change-t-il ses performances ?",
    answer:
      "Non. Le grade sert surtout à décrire l'état visuel du matériel. Un produit avec un grade différent peut conserver les mêmes performances techniques si sa configuration est identique.",
  },
  {
    question: "Puis-je demander un conseil avant de commander ?",
    answer:
      "Oui. La stratégie d'EcoLiz est d'encourager les professionnels à prendre contact afin de comprendre leur besoin réel, leur parc existant et les contraintes de leur projet.",
  },
];

export function About() {
  useEffect(() => {
    document.title =
      "À propos d'EcoLiz | Matériel informatique reconditionné B2B";

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
      audience: {
        "@type": "BusinessAudience",
        audienceType: "Professionnels, entreprises, collectivités et associations",
      },
      knowsAbout: [
        "matériel informatique reconditionné",
        "informatique professionnelle",
        "réemploi informatique",
        "reprise de parc informatique",
        "sobriété numérique",
        "équipements IT B2B",
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
          <div className="absolute left-10 top-20 h-40 w-40 rounded-full bg-emerald-400 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-lime-300 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-20 lg:pt-32">
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
              stockage et équipements réseau adaptés à leurs usages.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-emerald-950 shadow-sm transition hover:bg-emerald-50"
              >
                Demander un devis
              </Link>

              <Link
                to="/boutique"
                className="rounded-full border border-white/40 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Découvrir la boutique
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.value}
                className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur"
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
              Qui sommes-nous ?
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Une solution pensée pour les besoins informatiques des entreprises
            </h2>

            <div className="mt-6 space-y-5 text-base leading-8 text-slate-700">
              <p>
                EcoLiz a été conçu pour proposer une expérience plus claire autour de
                l'achat de matériel informatique reconditionné. L'objectif est de rendre
                le catalogue plus lisible, les filtres plus utiles et les informations
                produits plus simples à comparer.
              </p>

              <p>
                La plateforme s'inscrit dans une démarche B2B : comprendre le besoin du
                client, l'aider à identifier les bons équipements et faciliter la demande
                de devis lorsque le projet nécessite un accompagnement.
              </p>

              <p>
                Cette page complète la page d'accueil : elle explique davantage la vision
                d'EcoLiz, la logique du reconditionné, les critères de choix importants et
                les sujets utiles pour les entreprises.
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
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Avis clients
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                Des retours concrets pour rassurer les acheteurs professionnels
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-700">
                Les témoignages permettent de montrer les usages réels : renouvellement de
                parc, achat ponctuel, recherche d'un meilleur budget ou choix d'un matériel
                plus responsable.
              </p>
            </div>

            <Link
              to="/contact"
              className="inline-flex w-fit rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Parler de mon besoin
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={`${review.role}-${review.company}`}
                className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="absolute right-5 top-4 text-7xl font-black leading-none text-emerald-100">
                  ”
                </div>

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-sm font-bold text-white">
                      {review.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{review.role}</p>
                      <p className="text-sm text-slate-500">{review.company}</p>
                    </div>
                  </div>

                  <div className="rounded-full bg-white px-3 py-1 text-sm font-bold text-emerald-800 shadow-sm">
                    ★ {review.rating}
                  </div>
                </div>

                <p className="relative mt-5 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                  {review.tag}
                </p>

                <blockquote className="relative mt-5 text-sm leading-7 text-slate-700">
                  “{review.text}”
                </blockquote>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Ressources & conseils
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Des contenus utiles pour mieux comprendre l'informatique reconditionnée
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-700">
              Ces contenus enrichissent la page pour le SEO tout en répondant aux questions
              que peuvent se poser les professionnels avant de demander un devis.
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
              Impact & réemploi
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Une démarche tournée vers la seconde vie du matériel IT
            </h2>

            <p className="mt-5 text-base leading-8 text-emerald-50">
              EcoLiz valorise une consommation IT plus raisonnée : mieux choisir le matériel,
              prolonger sa durée d'usage, organiser la reprise de parc et orienter les
              équipements non réutilisables vers des filières adaptées.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/10">
              <h3 className="font-bold">Sobriété numérique</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-50">
                Accompagner les professionnels vers des achats IT plus raisonnés.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/10">
              <h3 className="font-bold">Reprise de parc</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-50">
                Donner une seconde vie aux équipements lorsque leur état le permet.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/10">
              <h3 className="font-bold">Recyclage DEEE</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-50">
                Orienter les matériels en fin de vie vers des circuits de traitement adaptés.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/10">
              <h3 className="font-bold">Données & RGPD</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-50">
                Mettre en avant l'importance de l'effacement sécurisé avant réemploi ou recyclage.
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
              Une autre question ?
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Nous serons ravis d'y répondre
            </h2>

            <p className="mt-5 text-base leading-8 text-emerald-50">
              Pour une recherche de matériel, une reprise de parc, une question sur un
              produit ou une demande professionnelle, contactez EcoLiz afin d'obtenir une
              réponse adaptée à votre besoin.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <Link
                to="/contact"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50"
              >
                Contactez-nous
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
