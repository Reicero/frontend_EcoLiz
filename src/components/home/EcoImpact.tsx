import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Recycle, Zap, Cpu } from 'lucide-react';
import { ecoStats } from '../../data/mockContent';
const iconMap = {
  Leaf,
  Zap,
  Recycle,
  Cpu
};
const statIcons = [Leaf, Zap, Recycle, Cpu];
export function EcoImpact() {
  return (
    <section className="py-32 lg:py-40 bg-brand-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-brand-700/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-accent-700/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{
              opacity: 0,
              x: -20
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.6
            }}>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight leading-tight">
              L'économie{' '}
              <span className="font-display italic text-accent-400">
                circulaire
              </span>{' '}
              au cœur de notre ADN.
            </h2>
            <p className="text-brand-100/70 text-lg leading-relaxed mb-8">
              Chaque équipement reconditionné par EcoLiz prolonge la durée de
              vie du matériel informatique de 3 à 5 ans. Nous transformons la
              façon dont les entreprises consomment la technologie, en alliant
              performance économique et responsabilité écologique.
            </p>
            <a
              href="#impact"
              className="text-accent-300 hover:text-accent-200 font-medium inline-flex items-center gap-2 transition-colors border-b border-accent-300/30 hover:border-accent-200 pb-1">
              
              Découvrir notre rapport d'impact
              <span aria-hidden="true">&rarr;</span>
            </a>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 sm:gap-8">
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
                    delay: index * 0.1
                  }}
                  className="bg-white/[0.04] backdrop-blur-sm border border-brand-500/20 p-6 rounded-2xl hover:bg-white/[0.08] transition-colors">
                  
                  <div className="bg-brand-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-brand-500/40">
                    <Icon className="w-6 h-6 text-accent-300" />
                  </div>
                  <div className="text-6xl lg:text-7xl font-display italic text-accent-300 mb-3 tracking-tight leading-none">
                    {stat.value}
                  </div>
                  <div className="text-sm text-brand-100/60 font-medium leading-snug">
                    {stat.label}
                  </div>
                </motion.div>);

            })}
          </div>
        </div>
      </div>
    </section>);

}