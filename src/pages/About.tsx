import { Link } from "react-router-dom";
import { useEffect } from "react";

const commitments = [
  "Proposer du matériel informatique professionnel reconditionné",
  "Accompagner les entreprises dans le choix de leurs équipements",
  "Favoriser le réemploi et limiter le gaspillage électronique",
  "Mettre en avant des solutions adaptées aux besoins réels des professionnels",
];

const adviceItems = [
  {
    title: "Bien choisir son ordinateur professionnel",
    text: "Le choix dépend de l'usage : bureautique, mobilité, performance, stockage, taille d'écran ou besoins logiciels spécifiques.",
  },
  {
    title: "Comprendre les grades du reconditionné",
    text: "Le grade indique principalement l'état esthétique du produit. Un produit reconditionné reste testé et fonctionnel.",
  },
  {
    title: "Identifier la disposition du clavier",
    text: "Selon les modèles, un ordinateur peut être équipé d'un clavier AZERTY, QWERTY ou QWERTZ. Cette information est importante avant l'achat.",
  },
  {
    title: "Penser à la reprise de parc informatique",
    text: "La reprise de matériel permet de donner une seconde vie aux équipements et de mieux gérer le renouvellement d'un parc IT.",
  },
];

export function About() {
  useEffect(() => {
    document.title = "À propos d'EcoLiz | Matériel informatique reconditionné";

    const description =
      "EcoLiz accompagne les professionnels dans le choix de matériel informatique reconditionné, avec une approche orientée réemploi, sobriété numérique et besoins métiers.";

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
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-200">
              À propos
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              EcoLiz, une solution dédiée à l'informatique professionnelle reconditionnée
            </h1>

            <p className="mt-6 text-lg leading-8 text-emerald-50">
              EcoLiz accompagne les entreprises dans l'achat de matériel informatique
              professionnel reconditionné, avec une approche orientée qualité, réemploi
              et sobriété numérique.
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
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Notre mission
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Donner une seconde vie au matériel informatique professionnel
            </h2>

            <div className="mt-6 space-y-5 text-base leading-8 text-slate-700">
              <p>
                EcoLiz a été pensée pour aider les professionnels à trouver du matériel
                informatique fiable, adapté à leurs usages et plus responsable qu'un achat
                systématique de matériel neuf.
              </p>

              <p>
                La plateforme propose une sélection d'équipements reconditionnés :
                ordinateurs portables, postes de travail, écrans, serveurs, stockage et
                équipements réseau.
              </p>

              <p>
                L'objectif est simple : faciliter le renouvellement du parc informatique
                tout en favorisant le réemploi et la réduction des déchets électroniques.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              Nos engagements
            </h3>

            <ul className="mt-6 space-y-4">
              {commitments.map((item) => (
                <li key={item} className="flex gap-3 text-slate-700">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Conseils pratiques
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Mieux comprendre le matériel reconditionné
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-700">
              EcoLiz met aussi en avant des informations utiles pour aider les professionnels
              à faire les bons choix avant de commander ou de demander un devis.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {adviceItems.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <h3 className="text-lg font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {item.text}
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
              Avis et retours clients
            </p>

            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              Une relation basée sur l'accompagnement
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-700">
              Les retours clients validés pourront être ajoutés sur cette page afin de
              présenter des exemples concrets d'accompagnement, de renouvellement de parc
              ou de recherche de matériel spécifique.
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-900 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Un besoin spécifique ?
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              L'équipe EcoLiz peut vous aider à trouver le matériel adapté
            </h2>

            <p className="mt-5 text-base leading-8 text-emerald-50">
              Pour une demande de devis, une question sur un produit, une reprise de parc
              informatique ou un besoin particulier, vous pouvez contacter l'équipe EcoLiz.
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
