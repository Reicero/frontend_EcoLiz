import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wrench,
  Activity,
  Search,
  HeadphonesIcon,
  Package,
  Recycle } from
'lucide-react';
import { mockServices } from '../../data/mockServices';
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
export function Services() {
  return (
    <section
      id="services"
      className="py-32 lg:py-40 bg-gradient-to-b from-brand-50 to-white border-y border-brand-100">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-brand-950 tracking-tight mb-6">
            Services IT{' '}
            <span className="font-display italic text-accent-500">
              durables
            </span>
          </h2>
          <p className="text-lg text-brand-900/70 max-w-2xl leading-relaxed">
            Au-delà de la vente, nous accompagnons les entreprises dans la
            gestion complète et responsable de leur cycle de vie matériel.
          </p>
        </div>

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
                  delay: index * 0.1
                }}
                className="group">
                
                <Link
                  to="/services"
                  className="bg-white p-8 rounded-2xl shadow-sm border border-brand-100 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/10 transition-all h-full flex flex-col cursor-pointer">
                  
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-6 text-brand-700 group-hover:bg-brand-200 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-950 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-brand-900/70 mb-6 flex-grow leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex items-center text-brand-700 font-medium text-sm mt-auto">
                    En savoir plus
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">
                      &rarr;
                    </span>
                  </div>
                </Link>
              </motion.div>);

          })}
        </div>
      </div>
    </section>);

}