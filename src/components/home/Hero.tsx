import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, Users, Leaf } from 'lucide-react';
export function Hero() {
  return (
    <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden bg-brand-50">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] opacity-50 pointer-events-none">
        <div className="absolute inset-0 bg-brand-200 blur-3xl rounded-full" />
      </div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-accent-200 blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.6
            }}
            className="max-w-2xl">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-300 bg-white/60 backdrop-blur-sm text-brand-700 text-sm font-medium mb-8">
              <Leaf className="w-4 h-4" />
              <span>Reconditionné · Certifié · Durable</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-brand-950 tracking-tight leading-[1.05] mb-8 text-balance">
              Donnons une{' '}
              <span className="font-display italic text-accent-500">
                seconde vie
              </span>{' '}
              à la technologie.
            </h1>

            <p className="text-xl text-brand-900/70 mb-10 leading-relaxed max-w-xl">
              EcoLiz reconditionne et maintient le matériel informatique des
              entreprises engagées dans une démarche durable.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mb-12 items-start">
              <Link
                to="/boutique"
                className="inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-7 py-4 rounded-xl text-base font-medium transition-all shadow-lg shadow-brand-900/20 group">
                
                Voir la boutique
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-brand-900 font-medium text-base py-4 border-b-2 border-transparent hover:border-accent-500 transition-colors group">
                
                Découvrir nos services
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="flex items-center gap-8 text-sm text-brand-900/70 font-medium pt-8 border-t border-brand-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <span>Garantie 24 mois</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-600" />
                <span>Livraison 48h</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                <span>+12 000 clients</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            transition={{
              duration: 0.8,
              delay: 0.2
            }}
            className="relative lg:h-[600px] flex items-center justify-center">
            
            <div className="relative w-full max-w-lg mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-brand-900/20 border border-white bg-white">
                <img
                  src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1200"
                  alt="Modern laptop on desk"
                  className="w-full h-auto object-cover" />
                
              </div>

              <motion.div
                animate={{
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute -left-8 top-12 bg-white p-4 rounded-xl shadow-xl shadow-brand-900/10 border border-brand-100 flex items-center gap-3">
                
                <div className="bg-brand-100 p-2 rounded-lg text-brand-700">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Impact carbone
                  </p>
                  <p className="text-sm font-bold text-brand-700">-85% CO₂</p>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 10, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1
                }}
                className="absolute -right-6 bottom-24 bg-white p-4 rounded-xl shadow-xl shadow-accent-900/10 border border-accent-100 flex items-center gap-3">
                
                <div className="bg-accent-50 p-2 rounded-lg text-accent-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Grade A+</p>
                  <p className="text-sm font-bold text-brand-950">
                    État parfait
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}