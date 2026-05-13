import React from 'react';
import { Star, ShieldCheck, Lock, Award, Leaf } from 'lucide-react';
import { testimonials } from '../../data/mockContent';
export function Trust() {
  return (
    <section className="py-32 lg:py-40 bg-gradient-to-b from-white to-brand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-24">
          <p className="text-center text-sm font-semibold text-brand-700 uppercase tracking-wider mb-10">
            Certifications et partenaires de confiance
          </p>
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

        <div className="grid md:grid-cols-3 gap-8 mb-24">
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

        <div className="grid sm:grid-cols-3 gap-8 pt-12 border-t border-brand-100">
          <div className="flex items-center justify-center gap-3 text-brand-900">
            <Lock className="w-6 h-6 text-brand-700" />
            <span className="font-medium">Paiement 100% sécurisé</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-brand-900">
            <ShieldCheck className="w-6 h-6 text-brand-700" />
            <span className="font-medium">Garantie 24 mois incluse</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-brand-900">
            <Award className="w-6 h-6 text-brand-700" />
            <span className="font-medium">SAV basé en France</span>
          </div>
        </div>
      </div>
    </section>);

}