import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Users, Award, Target, ArrowRight, Star } from 'lucide-react';
import { testimonials } from '../data/mockContent';
export function About() {
  return (
    <>
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-brand-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-brand-200/50 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-4">
            À propos
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-brand-950 tracking-tight mb-6 leading-[1.05]">
            Réinventer l'
            <span className="font-display italic text-accent-500">
              informatique d'entreprise
            </span>
            , durablement.
          </h1>
          <p className="text-xl text-brand-900/70 leading-relaxed">
            Fondée en 2022, EcoLiz accompagne les entreprises engagées dans une
            démarche numérique responsable. Nous reconditionnons, réparons et
            gérons le matériel informatique pour prolonger sa durée de vie de 3
            à 5 ans.
          </p>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg text-brand-900/80 max-w-none leading-relaxed">
            <p className="mb-6">
              Notre mission est simple : prouver qu'il est possible d'allier
              performance économique, exigence professionnelle et responsabilité
              écologique. Chaque ordinateur que nous remettons en circulation,
              c'est plusieurs centaines de kilos de CO₂ évités.
            </p>
            <p className="mb-6">
              Nos ateliers, basés en France, réalisent un audit complet sur 50
              points de contrôle avant chaque mise en vente. Nous remplaçons les
              pièces usées par des composants de qualité d'origine et
              garantissons chaque équipement 24 mois.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mt-16">
            {[
            {
              icon: Leaf,
              title: 'Notre mission',
              text: "Réduire l'impact carbone du numérique professionnel."
            },
            {
              icon: Target,
              title: 'Notre vision',
              text: "Faire du reconditionné le standard de l'IT en entreprise."
            },
            {
              icon: Users,
              title: 'Notre équipe',
              text: '45 collaborateurs passionnés répartis en France.'
            },
            {
              icon: Award,
              title: 'Nos engagements',
              text: 'Certifié ISO 14001, Label Numérique Responsable.'
            }].
            map((v) =>
            <div
              key={v.title}
              className="bg-brand-50 rounded-2xl border border-brand-100 p-6">
              
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4 text-brand-700">
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-brand-950 mb-2">
                  {v.title}
                </h3>
                <p className="text-brand-900/70">{v.text}</p>
              </div>
            )}
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
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) =>
            <div
              key={t.id}
              className="bg-white p-8 rounded-2xl shadow-sm border border-brand-100">
              
                <div className="flex gap-1 mb-4 text-amber-400">
                  {[...Array(5)].map((_, j) =>
                <Star key={j} className="w-4 h-4 fill-current" />
                )}
                </div>
                <p className="text-brand-900 mb-6 italic leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-10 h-10 rounded-full object-cover" />
                
                  <div>
                    <div className="font-bold text-brand-950 text-sm">
                      {t.author}
                    </div>
                    <div className="text-brand-900/60 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 mb-6 tracking-tight">
            Rejoignez le mouvement{' '}
            <span className="font-display italic text-accent-500">durable</span>
            .
          </h2>
          <p className="text-lg text-brand-900/70 mb-10">
            Discutons de la manière dont EcoLiz peut vous accompagner dans votre
            démarche RSE.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-7 py-4 rounded-xl font-medium transition-all shadow-lg shadow-brand-900/20 group">
            
            Prendre contact
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>);

}