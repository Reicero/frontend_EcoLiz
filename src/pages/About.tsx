import { Link } from "react-router-dom";
import { useEffect } from "react";

const guides = [
  {
    title: "Pourquoi choisir du matériel informatique reconditionné en entreprise ?",
    description:
      "Le matériel reconditionné permet aux professionnels de réduire leurs coûts tout en limitant l'impact environnemental de leur parc informatique.",
    keywords: "informatique reconditionné, entreprise, matériel professionnel",
  },
  {
    title: "Comment bien choisir un PC portable professionnel reconditionné ?",
    description:
      "Processeur, mémoire RAM, stockage, taille d'écran, état esthétique et garantie : plusieurs critères permettent de choisir un ordinateur adapté aux usages métier.",
    keywords: "PC portable reconditionné, ordinateur professionnel, parc informatique",
  },
  {
    title: "AZERTY, QWERTY ou QWERTZ : comprendre les dispositions clavier",
    description:
      "La disposition clavier est un critère important lors de l'achat d'un ordinateur portable reconditionné, notamment pour les utilisateurs francophones.",
    keywords: "clavier AZERTY, clavier QWERTY, clavier QWERTZ, thermocollage clavier",
  },
  {
    title: "Grade A, Grade B : comprendre l'état d'un produit reconditionné",
    description:
      "Les grades permettent d'indiquer l'état esthétique d'un produit reconditionné. Ils ne remettent pas en cause son fonctionnement technique.",
    keywords: "grade A, grade B, produit reconditionné, état esthétique",
  },
  {
    title: "Reprise de parc informatique : que deviennent vos anciens équipements ?",
    description:
      "La reprise de parc IT permet de donner une seconde vie aux équipements professionnels tout en assurant une gestion responsable du matériel.",
    keywords: "reprise parc informatique, recyclage informatique, DEEE",
  },
  {
    title: "Effacement des données et RGPD : un point essentiel pour les entreprises",
    description:
      "Avant la revente ou le recyclage d'un équipement, l'effacement sécurisé des données est une étape importante pour protéger les informations professionnelles.",
    keywords: "effacement données, RGPD, sécurité informatique, reconditionnement",
  },
];

const trustItems = [
  "Matériel informatique professionnel reconditionné",
  "Solutions adaptées aux entreprises, collectivités et associations",
  "Approche orientée sobriété numérique et réemploi",
  "Accompagnement dans le choix du matériel et la gestion du parc IT",
];

export function About() {
  useEffect(() => {
    document.title = "À propos d'EcoLiz | Informatique reconditionné pour les professionnels";

    const description =
      "Découvrez EcoLiz, une plateforme B2B dédiée au matériel informatique professionnel reconditionné, au réemploi, à la reprise de parc IT et à la sobriété numérique.";

    let meta = document.querySelector('meta[name="description"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", description);
  }, []);

  return (
    <main className="bg-slate-50">
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">
            À propos d'EcoLiz
          </p>

          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Une plateforme B2B dédiée au matériel informatique reconditionné
            </h1>

            <p className="mt-6 text-lg leading-8 text-emerald-50">
              EcoLiz accompagne les professionnels dans l'achat de matériel informatique
              reconditionné : ordinateurs portables, postes de travail, écrans, serveurs,
              équipements réseau et solutions adaptées aux besoins des entreprises.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/boutique"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-50"
              >
                Voir la boutique
              </Link>

              <Link
                to="/contact"
                className="rounded-full border border-white/40 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Demander un accompagnement
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Notre mission
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Rendre l'informatique professionnelle plus responsable et plus accessible
            </h2>

            <div className="mt-6 space-y-5 text-base leading-8 text-slate-700">
              <p>
                EcoLiz a pour objectif de faciliter l'accès à du matériel informatique
                professionnel reconditionné pour les entreprises. La plateforme permet de
                consulter un catalogue de produits, de comparer les caractéristiques
                techniques et de préparer des demandes adaptées aux besoins du client.
              </p>

              <p>
                Le reconditionnement informatique s'inscrit dans une logique de réemploi :
                prolonger la durée de vie des équipements, limiter le gaspillage électronique
                et proposer une alternative économique au matériel neuf.
              </p>

              <p>
                La plateforme s'adresse principalement aux professionnels qui souhaitent
                équiper leurs équipes, renouveler une partie de leur parc informatique ou
                mettre en place une démarche plus responsable autour de leurs équipements IT.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              Ce qu'EcoLiz met en avant
            </h3>

            <ul className="mt-6 space-y-4">
              {trustItems.map((item) => (
                <li key={item} className="flex gap-3 text-slate-700">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-900">
                Objectif SEO
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Cette page regroupe les informations importantes pour aider les visiteurs
                et améliorer la visibilité du site sur les recherches liées au matériel
                informatique reconditionné professionnel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Guides & conseils
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Ressources pour mieux choisir son matériel informatique reconditionné
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-700">
              Cette section regroupe des contenus courts de type articles SEO. Elle permet
              d'expliquer les notions importantes aux visiteurs : choix d'un ordinateur,
              dispositions clavier, grades de reconditionnement, reprise de parc informatique
              et sécurité des données.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <article
                key={guide.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Guide
                </p>

                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  {guide.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {guide.description}
                </p>

                <p className="mt-5 text-xs text-slate-500">
                  Mots-clés : {guide.keywords}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Avis clients
            </p>

            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              Une section prévue pour les retours clients
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-700">
              Les avis clients réels pourront être ajoutés ici lorsque l'entreprise aura
              validé les témoignages à afficher. Cette section permet de rassurer les
              visiteurs et d'améliorer la crédibilité du site.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-700">
              Exemple de contenu à remplacer par un vrai avis validé :
              <br />
              “Accompagnement réactif, matériel conforme au besoin et solution adaptée
              à notre parc informatique.”
            </div>
          </div>

          <div className="rounded-3xl bg-emerald-900 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Besoin d'un conseil ?
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              EcoLiz peut accompagner les professionnels dans leur choix
            </h2>

            <p className="mt-5 text-base leading-8 text-emerald-50">
              Pour un besoin précis, une recherche de matériel, une reprise de parc ou
              une question sur le reconditionné, le formulaire de contact permet de
              transmettre une demande à l'équipe.
            </p>

            <Link
              to="/contact"
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
            >
              Contacter EcoLiz
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
