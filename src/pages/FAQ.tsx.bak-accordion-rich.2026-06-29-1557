import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FAQItem } from '../types/page';
import { getFAQ } from '../services/wordpress';
export function FAQ() {
  const [items, setItems] = useState<FAQItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    getFAQ().then(setItems);
  }, []);
  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean) as string[])
  );
  return (
    <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
            FAQ
          </p>
          <h1 className="text-5xl font-bold text-brand-950 tracking-tight mb-4">
            Questions{' '}
            <span className="font-display italic text-accent-500">
              fréquentes
            </span>
          </h1>
          <p className="text-lg text-brand-900/70 max-w-2xl mx-auto">
            Tout ce qu'il faut savoir sur le reconditionnement, la garantie et
            nos services.
          </p>
        </header>

        {categories.map((cat) =>
        <div key={cat} className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-700 mb-4">
              {cat}
            </h2>
            <div className="space-y-3">
              {items.
            filter((i) => i.category === cat).
            map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
                  
                      <button
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left">
                    
                        <span className="font-semibold text-brand-950">
                          {item.question}
                        </span>
                        <ChevronDown
                      className={`w-5 h-5 text-brand-700 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    
                      </button>
                      <AnimatePresence>
                        {isOpen &&
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0
                      }}
                      animate={{
                        height: 'auto',
                        opacity: 1
                      }}
                      exit={{
                        height: 0,
                        opacity: 0
                      }}
                      transition={{
                        duration: 0.2
                      }}
                      className="overflow-hidden">
                      
                            <div className="px-6 pb-5 text-brand-900/70 leading-relaxed">
                              {item.answer}
                            </div>
                          </motion.div>
                    }
                      </AnimatePresence>
                    </div>);

            })}
            </div>
          </div>
        )}
      </div>
    </section>);

}