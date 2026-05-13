import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Shield,
  PenTool,
  Hash,
  Leaf } from
'lucide-react';
const features = [
{
  icon: LayoutDashboard,
  text: 'Historique et suivi des commandes en temps réel'
},
{
  icon: FileText,
  text: 'Centralisation des factures et devis'
},
{
  icon: Shield,
  text: 'Suivi des garanties par équipement'
},
{
  icon: Hash,
  text: 'Gestion des numéros de série et affectations'
},
{
  icon: PenTool,
  text: 'Déclaration et suivi des tickets de réparation'
}];

const dashboardRows = [
{
  model: 'MacBook Pro 14"',
  sn: 'C02F8...',
  status: 'Actif',
  badge: 'bg-brand-50 text-brand-700',
  w: '12 mois'
},
{
  model: 'Dell Latitude',
  sn: 'DL892...',
  status: 'En réparation',
  badge: 'bg-amber-50 text-amber-700',
  w: '8 mois'
},
{
  model: 'ThinkPad T14',
  sn: 'TP441...',
  status: 'Actif',
  badge: 'bg-brand-50 text-brand-700',
  w: '24 mois'
},
{
  model: 'Écran Dell 27"',
  sn: 'MN091...',
  status: 'Actif',
  badge: 'bg-brand-50 text-brand-700',
  w: 'Expirée'
}];

export function DashboardPreview() {
  return (
    <section className="py-32 lg:py-40 bg-brand-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            
            <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 mb-8 tracking-tight leading-tight">
              Votre{' '}
              <span className="font-display italic text-accent-500">
                espace client
              </span>
              ,<br /> simple et puissant.
            </h2>
            <p className="text-lg text-brand-900/70 mb-10 leading-relaxed">
              Gérez l'intégralité de votre parc informatique depuis une
              interface unique conçue pour les gestionnaires IT et les
              acheteurs.
            </p>

            <ul className="space-y-5 mb-10">
              {features.map((item, i) =>
              <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 bg-brand-100 p-1.5 rounded text-brand-700">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-brand-900 font-medium">
                    {item.text}
                  </span>
                </li>
              )}
            </ul>

            <Link
              to="/compte"
              className="inline-block bg-brand-700 hover:bg-brand-800 text-white px-7 py-4 rounded-xl font-medium transition-colors shadow-lg shadow-brand-900/20">
              
              Découvrir la plateforme
            </Link>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 20,
              rotateY: 10
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              rotateY: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.8
            }}
            className="relative perspective-1000">
            
            <div className="relative rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto bg-white border border-gray-200 rounded-md px-32 py-1 text-xs text-gray-400 flex items-center gap-2">
                  <div className="bg-brand-600 p-0.5 rounded">
                    <Leaf className="w-2.5 h-2.5 text-white" />
                  </div>
                  app.ecoliz.fr/dashboard
                </div>
              </div>

              <div className="flex h-[400px]">
                <div className="w-48 border-r border-gray-100 bg-gray-50/50 p-4 hidden sm:block">
                  <div className="space-y-1">
                    <div className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Parc IT
                    </div>
                    <div className="text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Factures
                    </div>
                    <div className="text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <PenTool className="w-4 h-4" /> Réparations
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 bg-white">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900">
                      Équipements actifs
                    </h3>
                    <button className="bg-brand-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold">
                      + Déclarer un incident
                    </button>
                  </div>

                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 grid grid-cols-4 text-xs font-medium text-gray-500">
                      <div>Modèle</div>
                      <div>N° Série</div>
                      <div>Statut</div>
                      <div>Garantie</div>
                    </div>
                    {dashboardRows.map((row, i) =>
                    <div
                      key={i}
                      className="px-4 py-3 border-b border-gray-50 grid grid-cols-4 items-center text-sm">
                      
                        <div className="font-medium text-gray-900">
                          {row.model}
                        </div>
                        <div className="text-gray-500 font-mono text-xs">
                          {row.sn}
                        </div>
                        <div>
                          <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${row.badge}`}>
                          
                            {row.status}
                          </span>
                        </div>
                        <div className="text-gray-500 text-xs">{row.w}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -z-10 top-10 -right-10 w-64 h-64 bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
            <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          </motion.div>
        </div>
      </div>
    </section>);

}