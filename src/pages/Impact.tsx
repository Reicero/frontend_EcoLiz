import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Leaf,
  Recycle,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
  Wrench,
} from 'lucide-react';

const approachSteps = [
  {
    icon: Search,
    eyebrow: 'Avant l’achat',
    title: 'Comprendre le besoin réel',
    text: 'Identifier les usages, les contraintes métier et le niveau de performance nécessaire avant de proposer un équipement.',
  },
  {
    icon: Target,
    eyebrow: 'Choix matériel',
    title: 'Sélectionner juste',
    text: 'Privilégier un matériel cohérent avec l’usage attendu, sans surdimensionnement inutile ni renouvellement automatique.',
  },
  {
    icon: Wrench,
    eyebrow: 'Pendant l’usage',
    title: 'Préparer pour durer',
    text: 'Configurer, maintenir et accompagner les équipements afin de prolonger leur durée d’utilisation dans de bonnes conditions.',
  },
  {
    icon: Recycle,
    eyebrow: 'Après l’usage',
    title: 'Organiser la suite',
    text: 'Anticiper la réutilisation, le remplacement ou l’orientation vers les filières adaptées lorsque le matériel arrive en fin de cycle.',
  },
];

const businessEffects = [
  {
    title: 'Achats plus maîtrisés',
    text: 'Réduire le recours systématique au neuf et mieux adapter les achats informatiques aux besoins réels.',
  },
  {
    title: 'Parc plus cohérent',
    text: 'Gagner en visibilité sur les équipements, leur usage, leur durée de vie et leur renouvellement.',
  },
  {
    title: 'Démarche RSE plus lisible',
    text: 'Transformer l’achat informatique en action concrète et compréhensible de numérique responsable.',
  },
];

const indicators = [
  {
    icon: BarChart3,
    title: 'Volumes d’équipements',
    text: 'Suivi des matériels vendus, préparés, maintenus ou remis en circulation.',
  },
  {
    icon: RefreshCw,
    title: 'Durée d’usage',
    text: 'Analyse progressive du temps d’utilisation gagné grâce au reconditionné et aux services associés.',
  },
  {
    icon: ShieldCheck,
    title: 'Traçabilité',
    text: 'Meilleure visibilité sur l’origine, l’état, la préparation et le devenir des équipements.',
  },
  {
    icon: Leaf,
    title: 'Impact environnemental',
    text: 'Construction d’une méthode fiable avant publication de données chiffrées.',
  },
];

const badges = [
  'Traçabilité',
  'Indicateurs d’impact',
  'Réemploi',
  'Filières DEEE',
  'Démarche RSE',
  'Conformité données',
];

export function Impact() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-24 lg:pt-40 lg:pb-32 bg-brand-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-brand-700/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-accent-700/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <p className="text-accent-300 font-semibold tracking-wide uppercase text-sm mb-4">
              Notre impact
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6">
              Réduire l’impact IT, c’est agir{' '}
              <span className="font-display italic text-accent-300">
                avant, pendant et après
              </span>{' '}
              l’achat.
            </h1>
            <p className="text-xl text-brand-100/70 leading-relaxed max-w-3xl">
              EcoLiz accompagne les entreprises dans une gestion plus responsable
              de leur matériel informatique : choisir le bon équipement,
              prolonger son usage, limiter le remplacement inutile et organiser
              sa fin de vie.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
            {['Avant l’achat', 'Pendant l’usage', 'Au renouvellement', 'En fin de vie'].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="bg-white/[0.04] border border-brand-500/20 rounded-2xl px-5 py-4 text-brand-100/80"
              >
                <span className="text-accent-300 font-display italic text-2xl mr-2">
                  0{index + 1}
                </span>
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
              Notre approche
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight leading-tight">
              Une méthode en{' '}
              <span className="font-display italic text-accent-500">
                4 temps
              </span>
              .
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {approachSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="bg-brand-50 p-7 rounded-2xl border border-brand-100"
                >
                  <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center mb-5 text-brand-700 border border-brand-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-3">
                    {step.eyebrow}
                  </p>
                  <h3 className="text-xl font-bold text-brand-950 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-brand-900/70 leading-relaxed">
                    {step.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Business effects */}
      <section className="py-24 lg:py-32 bg-brand-50 border-y border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
            <div>
              <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
                Côté entreprise
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight leading-tight mb-6">
                Ce que ça change{' '}
                <span className="font-display italic text-accent-500">
                  concrètement
                </span>
                .
              </h2>
              <p className="text-brand-900/70 leading-relaxed text-lg">
                L’impact ne se limite pas à un indicateur environnemental. Il se
                traduit aussi dans la manière d’acheter, d’utiliser et de piloter
                le parc informatique au quotidien.
              </p>
            </div>

            <div className="grid gap-5">
              {businessEffects.map((effect, index) => (
                <motion.div
                  key={effect.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="bg-white p-7 rounded-2xl border border-brand-100"
                >
                  <h3 className="text-xl font-bold text-brand-950 mb-2">
                    {effect.title}
                  </h3>
                  <p className="text-brand-900/70 leading-relaxed">
                    {effect.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Indicators */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
              Mesure d’impact
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight leading-tight mb-6">
              Des indicateurs en{' '}
              <span className="font-display italic text-accent-500">
                construction
              </span>
              .
            </h2>
            <p className="text-brand-900/70 leading-relaxed text-lg">
              Les chiffres d’impact seront publiés lorsqu’ils pourront être
              appuyés sur une méthode fiable et des données vérifiables. En
              attendant, EcoLiz structure les indicateurs qui permettront de
              suivre l’impact réel des équipements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {indicators.map((indicator, index) => {
              const Icon = indicator.icon;

              return (
                <motion.div
                  key={indicator.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="p-7 rounded-2xl border border-brand-100 hover:border-brand-200 transition-colors"
                >
                  <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center mb-5 text-brand-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-950 mb-3">
                    {indicator.title}
                  </h3>
                  <p className="text-brand-900/70 leading-relaxed">
                    {indicator.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Work in progress */}
      <section className="py-24 lg:py-32 bg-brand-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-700/30 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <p className="text-accent-300 font-semibold tracking-wide uppercase text-sm mb-3">
            Démarche en cours
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight leading-tight">
            Des preuves plutôt que des{' '}
            <span className="font-display italic text-accent-300">
              promesses
            </span>
            .
          </h2>
          <p className="text-lg text-brand-100/70 mb-10 max-w-3xl mx-auto leading-relaxed">
            Les indicateurs d’impact et les démarches de labellisation sont en
            cours de structuration. EcoLiz privilégie une communication
            progressive, fondée sur des éléments vérifiables et cohérents avec
            son activité réelle.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {badges.map((badge) => (
              <span
                key={badge}
                className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-brand-100 text-sm font-medium"
              >
                {badge}
              </span>
            ))}
          </div>

          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-brand-50 text-brand-950 px-7 py-4 rounded-xl text-base font-medium transition-all group"
          >
            Construire votre démarche IT responsable
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
}
