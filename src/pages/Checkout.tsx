import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  User,
  UserPlus,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Card } from "../components/ui/Card";

export default function Checkout() {
  // Pour l’instant, on vérifie simplement si un token ou un utilisateur existe en localStorage.
  // On branchera la vraie connexion WordPress/WooCommerce après.
  const isLoggedIn =
    Boolean(localStorage.getItem("ecoliz_user")) ||
    Boolean(localStorage.getItem("ecoliz_token")) ||
    Boolean(localStorage.getItem("wp_token"));

  return (
    <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/panier"
          className="inline-flex items-center gap-2 text-brand-700 hover:text-brand-800 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au panier
        </Link>

        <header className="mb-10">
          <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
            Commande
          </p>

          <h1 className="text-5xl font-bold text-brand-950 tracking-tight mb-4">
            Finaliser votre{" "}
            <span className="font-display italic text-accent-500">
              commande
            </span>
          </h1>

          <p className="text-lg text-brand-900/70 max-w-2xl">
            Pour passer commande, vous devez être connecté à votre compte
            EcoLiz ou créer un compte client.
          </p>
        </header>

        {!isLoggedIn ? (
          <Card variant="elevated" className="p-8 lg:p-12">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-9 h-9 text-brand-700" />
            </div>

            <h2 className="text-3xl font-bold text-brand-950 mb-4">
              Connexion requise
            </h2>

            <p className="text-brand-900/70 mb-8 max-w-2xl">
              Pour sécuriser la commande et retrouver l’historique dans
              l’espace client, vous devez vous connecter ou créer un compte
              avant de continuer.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <Link
                to="/connexion"
                className="group rounded-2xl border border-brand-100 bg-brand-700 text-white p-6 hover:bg-brand-800 transition-all shadow-lg shadow-brand-900/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>

                  <h3 className="text-xl font-bold">Se connecter</h3>
                </div>

                <p className="text-white/80 mb-5">
                  J’ai déjà un compte EcoLiz et je souhaite continuer ma
                  commande.
                </p>

                <span className="inline-flex items-center gap-2 font-semibold">
                  Connexion
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                to="/inscription"
                className="group rounded-2xl border border-brand-100 bg-white p-6 hover:bg-brand-50 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-brand-50 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-brand-700" />
                  </div>

                  <h3 className="text-xl font-bold text-brand-950">
                    Créer un compte
                  </h3>
                </div>

                <p className="text-brand-900/70 mb-5">
                  Je n’ai pas encore de compte et je souhaite en créer un pour
                  passer commande.
                </p>

                <span className="inline-flex items-center gap-2 font-semibold text-brand-700">
                  Inscription
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-8 border-t border-brand-100">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-brand-950 text-sm">
                    Compte sécurisé
                  </p>
                  <p className="text-xs text-brand-900/60">
                    Commandes liées au client.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShoppingBag className="w-5 h-5 text-brand-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-brand-950 text-sm">
                    Panier conservé
                  </p>
                  <p className="text-xs text-brand-900/60">
                    Les articles restent dans le panier.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-brand-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-brand-950 text-sm">
                    Paiement fiable
                  </p>
                  <p className="text-xs text-brand-900/60">
                    Paiement à brancher ensuite.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card variant="elevated" className="p-8 lg:p-12">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="w-9 h-9 text-brand-700" />
            </div>

            <h2 className="text-3xl font-bold text-brand-950 mb-4">
              Vous êtes connecté
            </h2>

            <p className="text-brand-900/70 mb-8 max-w-2xl">
              La prochaine étape sera d’afficher ici le formulaire de livraison,
              de facturation et de validation de commande.
            </p>

            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
              <p className="font-semibold text-brand-950 mb-2">
                Prochaine étape technique :
              </p>
              <p className="text-brand-900/70">
                Brancher le vrai formulaire checkout avec WooCommerce :
                informations client, adresse, livraison, validation de commande
                et paiement.
              </p>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}