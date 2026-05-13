import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Lock,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Card } from "../components/ui/Card";

const WORDPRESS_URL = "http://90.51.128.107:12443/index.php";

export default function Checkout() {
  return (
    <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/panier"
          className="inline-flex items-center gap-2 text-brand-700 hover:text-brand-800 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au panier
        </Link>

        <Card variant="elevated" className="p-10 lg:p-14">
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6">
            <CreditCard className="w-9 h-9 text-brand-700" />
          </div>

          <h1 className="text-4xl font-bold text-brand-950 tracking-tight mb-4">
            Paiement{" "}
            <span className="font-display italic text-accent-500">
              sécurisé
            </span>
          </h1>

          <p className="text-brand-900/70 mb-8 max-w-2xl">
            La validation de commande, le paiement et la création de commande
            sont conservés côté WooCommerce afin de sécuriser le parcours
            d’achat.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <a
              href={`${WORDPRESS_URL}/validation-de-la-commande`}
              className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-7 py-4 rounded-xl font-medium transition-all shadow-lg shadow-brand-900/20 group"
            >
              Continuer vers le checkout WooCommerce
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <Link
              to="/panier"
              className="inline-flex items-center gap-2 bg-white hover:bg-brand-50 text-brand-900 border border-brand-200 px-7 py-4 rounded-xl font-medium transition-all"
            >
              Retour au panier
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-8 border-t border-brand-100">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-brand-600 mt-0.5" />
              <div>
                <p className="font-semibold text-brand-950 text-sm">
                  Paiement sécurisé
                </p>
                <p className="text-xs text-brand-900/60">
                  Données sensibles gérées par WooCommerce.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-brand-600 mt-0.5" />
              <div>
                <p className="font-semibold text-brand-950 text-sm">
                  Commande suivie
                </p>
                <p className="text-xs text-brand-900/60">
                  Historique disponible dans le compte client.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-600 mt-0.5" />
              <div>
                <p className="font-semibold text-brand-950 text-sm">
                  Parcours fiable
                </p>
                <p className="text-xs text-brand-900/60">
                  Checkout conservé dans WooCommerce.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}