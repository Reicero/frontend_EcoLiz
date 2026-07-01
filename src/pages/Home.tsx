import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, ShieldCheck, Wrench, Users } from 'lucide-react';
import { Hero } from '../components/home/Hero';
const highlights = [
{
  icon: Leaf,
  title: 'Reconditionné en France',
  text: 'Audit 50 points, remise à neuf en ateliers certifiés.'
},
{
  icon: ShieldCheck,
  title: 'Garantie 24 mois',
  text: 'Échange J+1 en cas de panne, SAV basé en France.'
},
{
  icon: Wrench,
  title: 'Services IT durables',
  text: 'Masterisation, maintenance, gestion de parc, recyclage DEEE.'
},
{
  icon: Users,
  title: 'Pour les entreprises',
  text: '+12 000 clients accompagnés dans leur démarche RSE.'
}];

export function Home() {
  return (
    <>
      <Hero />

      {/* Compact highlights */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <motion.div
                  key={h.title}
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
                  className="p-6 rounded-2xl border border-brand-100 bg-white hover:border-brand-200 hover:shadow-sm transition-all">
                  
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-4 text-brand-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-brand-950 mb-1">
                    {h.title}
                  </h3>
                  <p className="text-sm text-brand-900/60 leading-relaxed">
                    {h.text}
                  </p>
                </motion.div>);

            })}
          </div>
        </div>
      </section>

      {/* Pillars / navigation to other pages */}
      <section className="py-24 lg:py-32 bg-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
              Notre univers
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight leading-tight">
              Une plateforme{' '}
              <span className="font-display italic text-accent-500">
                complète
              </span>{' '}
              pour votre IT.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
            {
              to: '/boutique',
              eyebrow: 'Boutique',
              title: 'Matériel reconditionné premium',
              text: 'Ordinateurs portables, postes fixes, écrans et serveurs reconditionnés, garantis 24 mois.',
              cta: 'Voir le catalogue',
              image:
              '/PC_réparation.png'
            },
            {
              to: '/services',
              eyebrow: 'Services',
              title: 'Masterisation, maintenance, SAV',
              text: 'Une gamme complète de services IT pour prolonger la durée de vie de votre parc.',
              cta: 'Découvrir nos services',
              image:
              '/SAV.png'
            },
            {
              to: '/impact',
              eyebrow: 'Impact',
              title: 'Notre démarche éco-responsable',
              text: "Économie circulaire, réduction du CO₂, recyclage DEEE et reporting d'impact.",
              cta: 'Voir notre impact',
              image:
              '/eco.png'
            }].
            map((pillar, i) =>
            <motion.div
              key={pillar.to}
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
                delay: i * 0.1
              }}>
              
                <Link
                to={pillar.to}
                className="group block bg-white rounded-2xl overflow-hidden border border-brand-100 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-900/10 transition-all h-full">
                
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                    src={pillar.image}
                    alt={pillar.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  
                  </div>
                  <div className="p-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-3">
                      {pillar.eyebrow}
                    </p>
                    <h3 className="text-xl font-bold text-brand-950 mb-3">
                      {pillar.title}
                    </h3>
                    <p className="text-brand-900/70 mb-6 leading-relaxed">
                      {pillar.text}
                    </p>
                    <div className="inline-flex items-center gap-2 text-brand-700 font-medium text-sm">
                      {pillar.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 lg:py-32 bg-brand-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-700/30 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-700/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight leading-tight">
            Prêt à passer au{' '}
            <span className="font-display italic text-accent-300">durable</span>{' '}
            ?
          </h2>
          <p className="text-lg text-brand-100/70 mb-10 max-w-2xl mx-auto">
            Demandez un audit gratuit de votre parc informatique. Nos équipes
            vous répondent sous 4h ouvrées.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-brand-50 text-brand-950 px-7 py-4 rounded-xl text-base font-medium transition-all group">
              
              Demander un devis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/boutique"
              className="inline-flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 text-white px-7 py-4 rounded-xl text-base font-medium transition-all">
              
              Voir la boutique
            </Link>
          </div>
        </div>
      </section>
    </>);

}