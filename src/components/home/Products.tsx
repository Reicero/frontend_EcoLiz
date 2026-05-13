import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mockProducts, productCategories } from '../../data/mockProducts';
import { formatPrice, calculateDiscount } from '../../utils/formatPrice';
import { Badge } from '../ui/Badge';
export function Products() {
  const [activeCategory, setActiveCategory] = useState<string>('Tous');
  const filtered =
  activeCategory === 'Tous' ?
  mockProducts.slice(0, 6) :
  mockProducts.filter((p) => p.category === activeCategory).slice(0, 6);
  return (
    <section id="boutique" className="py-32 lg:py-40 bg-brand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-bold text-brand-950 tracking-tight mb-6">
              Boutique{' '}
              <span className="font-display italic text-accent-500">Pro</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {productCategories.map((cat) =>
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.value ? 'bg-brand-700 text-white' : 'bg-white text-brand-900/70 hover:bg-brand-100 border border-brand-100'}`}>
                
                  {cat.label}
                </button>
              )}
            </div>
          </div>
          <Link
            to="/boutique"
            className="text-brand-700 font-medium hover:text-brand-800 transition-colors whitespace-nowrap border-b border-brand-700/30 hover:border-brand-800 pb-1">
            
            Voir tout le catalogue &rarr;
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((product, index) =>
          <motion.div
            key={product.id}
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
            }}>
            
              <Link
              to={`/produit/${product.slug}`}
              className="group flex flex-col">
              
                <div className="relative aspect-[4/3] bg-white rounded-2xl overflow-hidden mb-5 border border-brand-100 group-hover:shadow-lg group-hover:shadow-brand-900/10 transition-all duration-300">
                  <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover mix-blend-multiply group-hover:scale-[1.02] transition-transform duration-500" />
                
                  {product.stock &&
                <div className="absolute top-3 right-3">
                      <Badge tone="success" outline>
                        En stock
                      </Badge>
                    </div>
                }
                </div>

                <h3 className="text-lg font-semibold text-brand-950 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-brand-900/60 mb-1">
                  {product.specs}
                </p>
                <p className="text-xs text-brand-700 font-medium mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  {product.grade}
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-brand-950">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-brand-900/40 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-xs font-medium text-brand-700 bg-brand-100 px-2 py-1 rounded">
                    -{calculateDiscount(product.price, product.originalPrice)}%
                  </span>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}