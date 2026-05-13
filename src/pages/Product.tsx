import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
  Truck,
  Leaf,
  CheckCircle2,
} from 'lucide-react';

import type { Product } from '../types/product';
import { getProductBySlug } from '../services/woocommerce';
import { formatPrice, calculateDiscount } from '../utils/formatPrice';
import { Badge } from '../components/ui/Badge';

export function ProductPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    getProductBySlug(slug)
      .then((p) => setProduct(p))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    window.location.href =
      `http://90.51.128.107:12443/index.php/panier?add-to-cart=${product.id}`;
  };

  if (loading) {
    return (
      <div className="pt-40 text-center text-brand-900/50 min-h-screen">
        Chargement…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 text-center min-h-screen">
        <h1 className="text-2xl font-bold text-brand-950 mb-4">
          Produit introuvable
        </h1>

        <Link
          to="/boutique"
          className="text-brand-700 hover:underline"
        >
          &larr; Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link
          to="/boutique"
          className="inline-flex items-center gap-2 text-brand-700 hover:text-brand-800 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la boutique
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* IMAGE */}
          <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden aspect-square">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover mix-blend-multiply"
            />
          </div>

          {/* CONTENT */}
          <div>

            {/* BADGES */}
            <div className="flex gap-2 mb-4">
              <Badge tone="brand">
                {product.grade}
              </Badge>

              <Badge tone={product.stock ? 'success' : 'warning'}>
                {product.stock
                  ? `En stock (${product.stockCount ?? 0})`
                  : 'Sur commande'}
              </Badge>

              <Badge tone="accent">
                Garantie {product.warranty}
              </Badge>
            </div>

            {/* TITLE */}
            <h1 className="text-4xl font-bold text-brand-950 tracking-tight mb-3">
              {product.name}
            </h1>

            {/* SPECS */}
            <p className="text-brand-900/60 mb-6">
              {product.specs}
            </p>

            {/* PRICE */}
            <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-brand-200">

              <span className="text-4xl font-bold text-brand-950">
                {formatPrice(product.price)}
              </span>

              <span className="text-lg text-brand-900/40 line-through">
                {formatPrice(product.originalPrice)}
              </span>

              <Badge tone="brand">
                -
                {calculateDiscount(
                  product.price,
                  product.originalPrice,
                )}
                %
              </Badge>
            </div>

            {/* DESCRIPTION */}
            {product.description && (
              <div
                className="text-brand-900/80 leading-relaxed mb-8"
                dangerouslySetInnerHTML={{
                  __html: product.description,
                }}
              />
            )}

            {/* FEATURES */}
            {product.features && product.features.length > 0 && (
              <ul className="space-y-3 mb-10">
                {product.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-brand-900"
                  >
                    <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* ACTIONS */}
            <div className="flex gap-4 mb-8">

              <button
                onClick={handleAddToCart}
                disabled={!product.stock}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-7 py-4 rounded-xl text-base font-medium transition-all shadow-lg shadow-brand-900/20"
              >
                <ShoppingCart className="w-4 h-4" />
                Ajouter au panier
              </button>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-brand-50 text-brand-900 border border-brand-200 px-7 py-4 rounded-xl text-base font-medium transition-all"
              >
                Devis pro
              </Link>
            </div>

            {/* TRUST */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-200">

              <div className="flex items-center gap-2 text-sm text-brand-900/70">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <span>Garantie {product.warranty}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-brand-900/70">
                <Truck className="w-5 h-5 text-brand-600" />
                <span>Livraison 48h</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-brand-900/70">
                <Leaf className="w-5 h-5 text-brand-600" />
                <span>Éco-responsable</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}