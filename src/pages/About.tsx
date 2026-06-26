import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Leaf,
  Users,
  Award,
  Target,
  ArrowRight,
  Star,
  BookOpen,
  Keyboard,
  ShieldCheck,
  Recycle,
  Laptop,
  Server,
} from 'lucide-react'
import { testimonials } from '../data/mockContent'

const values = [
  {
    icon: Leaf,
    title: 'Réemploi informatique',
    text: "Prolonger la durée de vie du matériel professionnel et limiter le renouvellement systématique par du neuf.",
  },
  {
    icon: Target,
    title: 'Approche B2B',
    text: 'Une plateforme pensée pour les entreprises, collectivités, associations et professionnels.',
  },
  {
    icon: Users,
    title: 'Accompagnement métier',
    text: 'Aider les acheteurs à comparer les références, comprendre les grades et choisir une configuration adaptée.',
  },
  {
    icon: Award,
    title: 'Qualité & traçabilité',
    text: 'Mettre en avant des produits vérifiés, avec des informations claires sur l’état, les caractéristiques et les usages.',
  },
]

const articles = [
  {
    icon: Laptop,
    category: 'Guide achat',
    title: 'Bien choisir un PC portable professionnel reconditionné',
    text: "Processeur, RAM, stockage SSD, taille d'écran, système d'exploitation, autonomie : les critères essentiels à comparer avant d'équiper vos équipes.",
    linkLabel: 'Lire le guide',
  },
  {
    icon: Award,
    category: 'Reconditionné',
    title: 'Comprendre les grades A+, A et B',
    text: "Le grade concerne surtout l'aspect visuel du produit. Les performances dépendent avant tout de la configuration technique choisie.",
    linkLabel: 'Comprendre les grades',
  },
  {
    icon: Keyboard,
    category: 'Conseil pratique',
    title: 'AZERTY, QWERTY, QWERTZ : attention à la langue du clavier',
    text: "Sur du matériel reconditionné, la disposition du clavier peut varier selon l'origine du produit. C'est un point important à vérifier avant commande.",
    linkLabel: 'Voir les conseils',
  },
  {
    icon: Recycle,
    category: 'Impact',
    title: 'Reprise de parc IT : que deviennent les anciens équipements ?',
    text: "Réemploi, tri, valorisation ou recyclage DEEE : la gestion de fin de vie du matériel est un vrai sujet pour les entreprises.",
    linkLabel: 'Découvrir la reprise',
  },
  {
    icon: ShieldCheck,
    category: 'Sécurité',
    title: 'Effacement des données et RGPD : un enjeu clé',
    text: "Avant la revente ou le recyclage, l'effacement sécurisé des données permet de protéger les informations sensibles de l'entreprise.",
    linkLabel: 'En savoir plus',
  },
  {
    icon: Server,
    category: 'Infrastructure',
    title: 'Serveurs, stockage, réseau : le reconditionné ne concerne pas que les PC',
    text: "Switches, serveurs, stockage, écrans ou stations de travail : le réemploi peut aussi répondre à des besoins IT plus techniques.",
    linkLabel: 'Explorer les usages',
  },
]

const faq = [
  {
    question: "EcoLiz s'adresse à qui ?",
    answer:
      "EcoLiz s'adresse aux professionnels : entreprises, collectivités, associations, établissements et structures qui souhaitent s'équiper en matériel informatique reconditionné.",
  },
  {
    question: "Le grade influence-t-il les performances ?",
    answer:
      "Non, le grade décrit principalement l'état esthétique du produit. Les performances dépendent de la configuration : processeur, mémoire RAM, stockage, carte graphique et génération du matériel.",
  },
  {
    question: 'Pourquoi faire une demande de devis ?',
    answer:
      "Une demande de devis permet de préciser votre besoin, les quantités, la langue des claviers, les contraintes de livraison, le niveau de garantie attendu et les références adaptées à votre parc.",
  },
]

export function About() {
  useEffect(() => {
    document.title =
      "À propos d'EcoLiz | Matériel informatique reconditionné pour professionnels"

    const description =
      "Découvrez EcoLiz, une plateforme B2B dédiée au matériel informatique professionnel reconditionné, au réemploi, à la reprise de parc IT et à la sobriété numérique."

    let meta = document.querySelector('meta[name="description"]')

    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }

    meta.setAttribute('content', description)
  }, [])

  return (
    <>
      <section className="pt-28 pb-16 lg:pt-32 lg:pb-20 bg-brand-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-brand-200/50 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-4">
            À propos d&apos;EcoLiz
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-brand-950 tracking-tight mb-6 leading-[1.05]">
            Réinventer l&apos;
            <span className="font-display italic text-accent-500">
              informatique d&apos;entreprise
            </span>
            , durablement.
          </h1>
          <p className="text-xl text-brand-900/70 leading-relaxed">
            EcoLiz accompagne les professionnels dans l&apos;achat de matériel
            informatique reconditionné : ordinateurs portables, postes de
            travail, écrans, serveurs, stockage et équipements réseau. Notre
            objectif est simple : rendre le réemploi informatique plus clair,
            plus accessible et plus adapté aux besoins B2B.
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg text-brand-900/80 max-w-none leading-relaxed">
            <p className="mb-6">
              Notre mission est de prouver qu&apos;il est possible d&apos;allier
              performance économique, exigence professionnelle et responsabilité
              environnementale. Le matériel reconditionné permet de prolonger la
              durée de vie des équipements et de limiter le renouvellement
              systématique par du matériel neuf.
            </p>
            <p className="mb-6">
              Cette page permet de mieux comprendre l&apos;approche EcoLiz, au-delà
              de la boutique : notre vision du réemploi, les critères importants
              avant un achat, les sujets à surveiller comme les grades, la langue
              des claviers, la reprise de parc IT ou encore l&apos;effacement des
              données.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mt-16">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-brand-50 rounded-2xl border border-brand-100 p-6"
              >
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4 text-brand-700">
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-brand-950 mb-2">
                  {v.title}
                </h3>
                <p className="text-brand-900/70">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32 bg-brand-50 border-y border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
              Témoignages
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight leading-tight">
              Ils nous font{' '}
              <span className="font-display italic text-accent-500">
                confiance
              </span>
              .
            </h2>
            <p className="mt-5 text-brand-900/70 leading-relaxed">
              Des retours clients permettent de rassurer les entreprises avant
              une demande de devis ou une commande de matériel reconditionné.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="group bg-white p-8 rounded-[2rem] shadow-sm border border-brand-100 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-brand-100/60 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-3 py-1">
                      Avis client
                    </span>
                  </div>

                  <p className="text-brand-900 mb-8 italic leading-relaxed">
                    “{t.quote}”
                  </p>

                  <div className="flex items-center gap-4 pt-6 border-t border-brand-100">
                    <img
                      src={t.avatar}
                      alt={t.author}
                      className="w-12 h-12 rounded-full object-cover ring-4 ring-brand-50"
                    />
                    <div>
                      <div className="font-bold text-brand-950 text-sm">
                        {t.author}
                      </div>
                      <div className="text-brand-900/60 text-xs">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
              Ressources & conseils
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight leading-tight">
              Des articles pour mieux comprendre{' '}
              <span className="font-display italic text-accent-500">
                le reconditionné
              </span>
              .
            </h2>
            <p className="mt-5 text-lg text-brand-900/70 leading-relaxed">
              Ces contenus donnent de la valeur à la page et améliorent son SEO
              en répondant aux questions que se posent les professionnels avant
              d&apos;acheter ou de renouveler leur parc informatique.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article
                key={article.title}
                className="group bg-brand-50 rounded-3xl border border-brand-100 p-7 hover:bg-white hover:shadow-xl hover:shadow-brand-900/10 hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 text-brand-700 border border-brand-100 group-hover:bg-brand-700 group-hover:text-white transition-colors">
                  <article.icon className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-700 bg-white border border-brand-100 rounded-full px-3 py-1">
                    {article.category}
                  </span>
                  <BookOpen className="w-4 h-4 text-brand-900/40" />
                </div>

                <h3 className="text-xl font-bold text-brand-950 mb-3 leading-snug group-hover:text-brand-700 transition-colors">
                  {article.title}
                </h3>
                <p className="text-brand-900/70 leading-relaxed mb-6">
                  {article.text}
                </p>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 group-hover:text-brand-900"
                >
                  {article.linkLabel}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 lg:py-32 bg-brand-50 border-y border-brand-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
              Questions fréquentes
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight leading-tight">
              Mieux connaître{' '}
              <span className="font-display italic text-accent-500">EcoLiz</span>
              .
            </h2>
          </div>

          <div className="space-y-5">
            {faq.map((item) => (
              <article
                key={item.question}
                className="bg-white rounded-2xl border border-brand-100 p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-brand-950">
                  {item.question}
                </h3>
                <p className="mt-3 text-brand-900/70 leading-relaxed">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 mb-6 tracking-tight">
            Un besoin informatique{' '}
            <span className="font-display italic text-accent-500">professionnel</span>
            ?
          </h2>
          <p className="text-lg text-brand-900/70 mb-10">
            Parlez-nous de votre parc, de vos contraintes et des équipements que
            vous recherchez. EcoLiz peut vous aider à identifier les références
            les plus adaptées.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-7 py-4 rounded-xl font-medium transition-all shadow-lg shadow-brand-900/20 group"
          >
            Demander un devis
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  )
}
