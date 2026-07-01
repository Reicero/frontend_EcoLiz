import React, { Component, ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Wrench,
  Activity,
  Search,
  HeadphonesIcon,
  Package,
  Recycle,
  CheckCircle2 } from
'lucide-react';
import { mockServices } from '../data/mockServices';
const iconMap: Record<
  string,
  ComponentType<{
    className?: string;
  }>> =
{
  Wrench,
  Activity,
  Search,
  HeadphonesIcon,
  Package,
  Recycle
};
const process = [
{
  step: '01',
  title: 'Diagnostic',
  text: 'Audit complet de votre parc et de vos besoins métier.'
},
{
  step: '02',
  title: 'Proposition',
  text: "Plan d'action sur-mesure avec engagement de service."
},
{
  step: '03',
  title: 'Intervention',
  text: 'Masterisation, maintenance ou déploiement par nos techniciens.'
},
{
  step: '04',
  title: 'Suivi',
  text: 'Reporting régulier et suivi via votre espace client.'
}];

export function Services() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-brand-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-brand-200/50 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-4">
              Services IT
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-brand-950 tracking-tight leading-[1.05] mb-6">
              Services IT{' '}
              <span className="font-display italic text-accent-500">
                durables
              </span>
            </h1>
            <p className="text-xl text-brand-900/70 leading-relaxed">
              Au-delà de la vente, nous accompagnons les entreprises dans la
              gestion complète et responsable de leur cycle de vie matériel.
            </p>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockServices.map((service, index) => {
              const Icon = iconMap[service.icon] ?? Wrench;
              return (
                <motion.div
                  key={service.id}
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
                    delay: index * 0.08
                  }}
                  className="group">
                  
                  <div className="bg-white p-8 rounded-2xl border border-brand-100 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/10 transition-all h-full flex flex-col">
                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-6 text-brand-700 group-hover:bg-brand-200 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-brand-950 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-brand-900/70 mb-6 flex-grow leading-relaxed">
                      {service.description}
                    </p>
                    <Link
                      to="/contact"
                      className="inline-flex items-center text-brand-700 font-medium text-sm mt-auto group-hover:gap-3 transition-all gap-2">
                      
                      En savoir plus
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>);

            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 lg:py-32 bg-brand-50 border-y border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
              Méthodologie
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight leading-tight">
              Une approche{' '}
              <span className="font-display italic text-accent-500">
                structurée
              </span>
              .
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((p, i) =>
            <motion.div
              key={p.step}
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
                delay: i * 0.1
              }}
              className="bg-white p-8 rounded-2xl border border-brand-100">
              
                <p className="text-5xl font-display italic text-accent-500 mb-4">
                  {p.step}
                </p>
                <h3 className="font-bold text-brand-950 mb-2">{p.title}</h3>
                <p className="text-sm text-brand-900/70 leading-relaxed">
                  {p.text}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Engagements */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
              Nos engagements
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight leading-tight mb-8">
              Des{' '}
              <span className="font-display italic text-accent-500">SLA</span>{' '}
              taillés pour les pros.
            </h2>
            <ul className="space-y-4">
              {[
              'Intervention sur site en 4h ouvrées (zones couvertes)',
              'Échange à J+1 en cas de panne sous garantie',
              'Support technique téléphonique 6j/7',
              'Reporting mensuel sur la santé de votre parc',
              "Pièces d'origine ou équivalentes garanties"].
              map((line) =>
              <li
                key={line}
                className="flex items-start gap-3 text-brand-900">
                
                  <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              )}
            </ul>
            <Link
              to="/contact"
              className="mt-10 inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-7 py-4 rounded-xl font-medium transition-all shadow-lg shadow-brand-900/20 group">
              
              Discuter de mon projet
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="relative">
            <img
              src="/service.png"
              alt="Atelier de masterisation EcoLiz"
              className="rounded-2xl shadow-2xl shadow-brand-900/10 border border-brand-100 w-full" />
            
          </div>
        </div>
      </section>
    </>);

}