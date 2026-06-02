import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
  Truck,
  Leaf,
  CheckCircle2,
} from "lucide-react";

import type { Product } from "../types/product";
import { getProductBySlug } from "../services/woocommerce";
import { addToCart } from "../services/cart";
import { formatPrice, calculateDiscount } from "../utils/formatPrice";
import { Badge } from "../components/ui/Badge";

export function ProductPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    getProductBySlug(slug)
      .then((p) => {
        if (!p) {
          setError("Produit non trouvé");
        }

        setProduct(p);
      })
      .catch(() => {
        console.error(`Failed to load product: ${slug}`);
        setError("Erreur lors du chargement du produit");
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product || !product.stock) return;

    try {
      setAddingToCart(true);
      setCartSuccess(false);
      setCartError(null);

      await addToCart(product.id, 1);

      setCartSuccess(true);

      setTimeout(() => {
        setCartSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Erreur ajout panier :", error);
      setCartError("Impossible d'ajouter le produit au panier.");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-40 text-center text-brand-900/50 min-h-screen">
        Chargement…
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-40 text-center min-h-screen">
        <h1 className="text-2xl font-bold text-brand-950 mb-4">
          {error || "Produit introuvable"}
        </h1>

        <Link to="/boutique" className="text-brand-700 hover:underline">
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
              src={product.image || "/placeholder-product.png"}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover mix-blend-multiply"
            />
          </div>

          {/* CONTENT */}
          <div>
            {/* BADGES */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.grade && product.grade !== "Non renseigné" && (
                <Badge tone="brand">{product.grade}</Badge>
              )}

              <Badge tone={product.stock ? "success" : "warning"}>
                {product.availability ??
                  (product.stock ? "En stock" : "Rupture de stock")}
              </Badge>

              <Badge tone="accent">Garantie sur devis</Badge>
            </div>

            {/* TITLE */}
            <h1 className="text-4xl font-bold text-brand-950 tracking-tight mb-3">
              {product.name}
            </h1>

            {/* SPECS */}
            {product.specs && (
              <p className="text-brand-900/60 mb-6">{product.specs}</p>
            )}

            {/* PRICE */}
            <div className="mb-8 pb-8 border-b border-brand-200">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-4xl font-bold text-brand-950">
                  {formatPrice(product.price)} HT
                </span>

                {product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-brand-900/40 line-through">
                      {formatPrice(product.originalPrice)} HT
                    </span>

                    <Badge tone="brand">
                      -
                      {calculateDiscount(product.price, product.originalPrice)}
                      %
                    </Badge>
                  </>
                )}
              </div>

              {product.priceTTC && (
                <p className="text-lg text-brand-900/60 mt-2">
                  {formatPrice(product.priceTTC)} TTC
                </p>
              )}
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

            {cartSuccess && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-brand-950">
                    Produit ajouté au panier !
                  </p>
                  <p className="text-sm text-brand-900/60">
                    Vous pouvez continuer vos achats ou consulter votre panier.
                  </p>
                </div>

                <Link
                  to="/panier"
                  className="inline-flex items-center justify-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 transition-colors"
                >
                  Voir le panier
                </Link>
              </div>
            )}

            {cartError && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                <p className="font-semibold text-red-700">{cartError}</p>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!product.stock || addingToCart}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-7 py-4 rounded-xl text-base font-medium transition-all shadow-lg shadow-brand-900/20"
              >
                <ShoppingCart className="w-4 h-4" />
                {addingToCart
                  ? "Ajout en cours..."
                  : product.stock
                    ? "Ajouter au panier"
                    : "Produit indisponible"}
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
                <span>Garantie sur devis</span>
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