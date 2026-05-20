import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";

interface ImportMetaEnv {
  readonly VITE_WORDPRESS_URL?: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const WORDPRESS_URL =
  import.meta.env.VITE_WORDPRESS_URL ??
  "http://90.51.128.107:12443/index.php";

export function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // V1 : WooCommerce gère la vraie authentification client.
    // V2 : remplacer cette redirection par un vrai login React
    // via JWT / WordPress REST API quand domaine + HTTPS seront prêts.
    window.location.href = `${WORDPRESS_URL}/mon-compte`;
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-950 relative overflow-hidden flex-col justify-between p-12 lg:p-20">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-700/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-700/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10">
          <Link to="/" className="inline-block bg-white p-2.5 rounded-xl mb-16">
            <img src="/logo.png" alt="EcoLiz" className="h-8 w-auto object-contain" />
          </Link>

          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight max-w-xl">
            Bienvenue dans la nouvelle économie du{" "}
            <span className="font-display italic text-accent-300">réemploi</span>.
          </h1>
        </div>

        <div className="relative z-10">
          <p className="text-brand-100/70 text-lg max-w-md">
            Gérez votre parc informatique reconditionné, suivez vos commandes et
            mesurez votre impact carbone depuis votre espace pro.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 py-12 lg:py-0 relative">
        <Link
          to="/"
          className="absolute top-8 left-4 sm:left-6 lg:left-12 inline-flex items-center gap-2 text-sm font-medium text-brand-900/60 hover:text-brand-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au site
        </Link>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-brand-950 mb-3 tracking-tight">
              Connexion
            </h2>

            <p className="text-brand-900/70">
              Accédez à votre espace client EcoLiz.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-900 mb-2">
                Email professionnel
              </label>

              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-brand-900/40" />

                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white"
                  placeholder="jean.dupont@entreprise.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-brand-900">
                  Mot de passe
                </label>

                <a
                  href={`${WORDPRESS_URL}/mon-compte/lost-password/`}
                  className="text-sm font-medium text-brand-700 hover:text-brand-800"
                >
                  Oublié ?
                </a>
              </div>

              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-brand-900/40" />

                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" className="group">
              Se connecter
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-brand-900/70">
            Pas encore de compte ?{" "}
            <Link
              to="/inscription"
              className="font-semibold text-brand-700 hover:text-brand-800 transition-colors"
            >
              Créer un compte pro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}