import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { config } from "../config/env";
import { Card } from "../components/ui/Card";

export default function Cart() {
  return (
    <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/boutique"
          className="inline-flex items-center gap-2 text-brand-700 hover:text-brand-800 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Continuer mes achats
        </Link>

        <Card variant="elevated" className="p-10 lg:p-14">
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-9 h-9 text-brand-700" />
          </div>

          <h1 className="text-4xl font-bold text-brand-950 tracking-tight mb-4">
            Votre panier{" "}
            <span className="font-display italic text-accent-500">
              WooCommerce
            </span>
          </h1>

          <p className="text-brand-900/70 mb-8 max-w-2xl">
            Le panier et le paiement sont conservés côté WooCommerce pour
            sécuriser le parcours d'achat, les commandes et la gestion client.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <a
              href={config.cartUrl}
              className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-7 py-4 rounded-xl font-medium transition-all shadow-lg shadow-brand-900/20 group"
            >
              Ouvrir le panier WooCommerce
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <Link
              to="/boutique"
              className="inline-flex items-center gap-2 bg-white hover:bg-brand-50 text-brand-900 border border-brand-200 px-7 py-4 rounded-xl font-medium transition-all"
            >
              Retour à la boutique
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-8 border-t border-brand-100">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-600 mt-0.5" />
              <div>
                <p className="font-semibold text-brand-950 text-sm">
                  Paiement sécurisé
                </p>
                <p className="text-xs text-brand-900/60">
                  Checkout géré par WooCommerce.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-brand-600 mt-0.5" />
              <div>
                <p className="font-semibold text-brand-950 text-sm">
                  Livraison suivie
                </p>
                <p className="text-xs text-brand-900/60">
                  Informations de commande conservées.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Leaf className="w-5 h-5 text-brand-600 mt-0.5" />
              <div>
                <p className="font-semibold text-brand-950 text-sm">
                  Reconditionné
                </p>
                <p className="text-xs text-brand-900/60">
                  Parcours aligné avec EcoLiz.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
