import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf,
  Recycle,
  Zap,
  Cpu,
  ArrowRight,
  Award,
  ShieldCheck } from
'lucide-react';
import { ecoStats } from '../data/mockContent';
const statIcons = [Leaf, Zap, Recycle, Cpu];
const commitments = [
{
  title: 'Économie circulaire',
  text: "Chaque appareil que nous reconditionnons évite la production d'un neuf et prolonge la durée de vie de 3 à 5 ans."
},
{
  title: 'Réduction du CO₂',
  text: "Un ordinateur reconditionné émet 85% moins de CO₂ qu'un appareil neuf sur l'ensemble de son cycle de vie."
},
{
  title: 'Recyclage DEEE',
  text: 'Nous récupérons et traitons gratuitement votre ancien matériel via nos filières certifiées.'
},
{
  title: 'Sobriété numérique',
  text: 'Nous accompagnons nos clients vers une consommation IT plus raisonnée et plus durable.'
}];

export function Impact() {
  return (
    <>
      {/* Hero — dark green */}
      <section className="pt-32 pb-24 lg:pt-40 lg:pb-32 bg-brand-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-brand-700/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-accent-700/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <p className="text-accent-300 font-semibold tracking-wide uppercase text-sm mb-4">
              Notre impact
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6">
              L'économie{' '}
              <span className="font-display italic text-accent-300">
                circulaire
              </span>{' '}
              au cœur de notre ADN.
            </h1>
            <p className="text-xl text-brand-100/70 leading-relaxed">
              EcoLiz transforme la façon dont les entreprises consomment la
              technologie, en alliant performance économique et responsabilité
              écologique.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {ecoStats.map((stat, index) => {
              const Icon = statIcons[index] ?? Leaf;
              return (
                <motion.div
                  key={stat.id}
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0
                  }}
                  viewport={{
                    once: true
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08
                  }}
                  className="bg-white/[0.04] backdrop-blur-sm border border-brand-500/20 p-6 rounded-2xl">
                  
                  <div className="bg-brand-500/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-brand-500/40">
                    <Icon className="w-5 h-5 text-accent-300" />
                  </div>
                  <div className="text-5xl lg:text-6xl font-display italic text-accent-300 mb-2 tracking-tight leading-none">
                    {stat.value}
                  </div>
                  <div className="text-sm text-brand-100/60 font-medium leading-snug">
                    {stat.label}
                  </div>
                </motion.div>);

            })}
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
              Nos engagements
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight leading-tight">
              Une démarche{' '}
              <span className="font-display italic text-accent-500">
                complète
              </span>
              .
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {commitments.map((c, i) =>
            <motion.div
              key={c.title}
              initial={{
                opacity: 0,
                y: 20
              }}
              whileInView={{
                opacity: 1,
                y: 0
              }}
              viewport={{
                once: true
              }}
              transition={{
                duration: 0.4,
                delay: i * 0.08
              }}
              className="bg-brand-50 p-8 rounded-2xl border border-brand-100">
              
                <h3 className="text-xl font-bold text-brand-950 mb-3">
                  {c.title}
                </h3>
                <p className="text-brand-900/70 leading-relaxed">{c.text}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-24 lg:py-32 bg-brand-50 border-y border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
              Certifications
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-950 tracking-tight leading-tight">
              Une démarche{' '}
              <span className="font-display italic text-accent-500">
                certifiée
              </span>
              .
            </h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
            <div className="text-xl font-black tracking-tighter text-brand-900 border-2 border-brand-900 px-3 py-1 rounded">
              ISO 14001
            </div>
            <div className="text-xl font-bold font-serif text-brand-700 flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              Label Numérique Responsable
            </div>
            <div className="text-xl font-bold border-2 border-brand-800 p-1 text-brand-800">
              RGPD Compliant
            </div>
            <div className="text-xl font-bold italic text-brand-700">
              EcoVadis
            </div>
            <div className="text-xl font-bold tracking-widest text-brand-900">
              FRENCH TECH
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 mb-6 tracking-tight">
            Mesurez votre{' '}
            <span className="font-display italic text-accent-500">impact</span>.
          </h2>
          <p className="text-lg text-brand-900/70 mb-10">
            Demandez un rapport d'impact personnalisé pour évaluer les économies
            de CO₂ et financières qu'EcoLiz peut générer pour votre entreprise.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-7 py-4 rounded-xl font-medium transition-all shadow-lg shadow-brand-900/20 group">
            
            Demander mon rapport d'impact
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>);

}