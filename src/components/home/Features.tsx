import React from 'react';
import { motion } from 'framer-motion';
import {
  Recycle,
  Wrench,
  ShieldCheck,
  Truck,
  Leaf,
  Award,
  Cpu,
  HeartHandshake } from
'lucide-react';
const features = [
{
  name: 'Équipement reconditionné',
  description:
  'Matériel audité, testé sur 50 points de contrôle et remis à neuf.',
  icon: Cpu
},
{
  name: 'Expertise réparation',
  description:
  'Ateliers certifiés en France pour des réparations durables et rapides.',
  icon: Wrench
},
{
  name: 'Support professionnel',
  description: 'Une équipe dédiée aux entreprises, réactive et experte.',
  icon: HeartHandshake
},
{
  name: 'Garantie & SAV',
  description:
  'Garantie standard de 24 mois avec échange à J+1 si nécessaire.',
  icon: ShieldCheck
},
{
  name: 'Livraison rapide',
  description: 'Expédition sécurisée en 48h partout en France et en Europe.',
  icon: Truck
},
{
  name: 'Démarche éco-responsable',
  description:
  'Emballages recyclés et compensation carbone sur chaque envoi.',
  icon: Leaf
},
{
  name: 'Matériel durable',
  description:
  'Sélection rigoureuse des gammes professionnelles conçues pour durer.',
  icon: Award
},
{
  name: 'Modèle circulaire',
  description:
  'Reprise de votre ancien parc informatique pour lui donner une seconde vie.',
  icon: Recycle
}];

export function Features() {
  return (
    <section className="py-32 lg:py-40 bg-gradient-to-b from-white to-brand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-4">
            Pourquoi EcoLiz
          </h2>
          <p className="text-4xl font-bold text-brand-950 sm:text-5xl mb-6 tracking-tight leading-tight">
            L'excellence technologique,{' '}
            <span className="font-display italic text-accent-500">
              sans compromis
            </span>
            .
          </p>
          <p className="text-lg text-brand-900/70 leading-relaxed">
            Nous offrons aux entreprises une alternative fiable, économique et
            écologique pour la gestion de leur parc informatique.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
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
                  delay: index * 0.05
                }}
                className="bg-white p-6 rounded-2xl shadow-soft border border-brand-100 hover:shadow-lg hover:border-brand-200 transition-all group">
                
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-100 transition-colors">
                  <Icon className="w-6 h-6 text-brand-700" />
                </div>
                <h3 className="text-lg font-semibold text-brand-950 mb-2">
                  {feature.name}
                </h3>
                <p className="text-sm text-brand-900/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>);

          })}
        </div>
      </div>
    </section>);

}