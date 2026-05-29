import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Settings,
  LogOut,
  AlertCircle,
  User,
  Building2,
  Mail,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { fetchMyOrders } from "../services/ecoliz-api";
import { formatPrice } from "../utils/formatPrice";

type Order = {
  id: string | number;
  date: string;
  total: number;
  items: number;
  status: string;
};

type EcolizUser = {
  id?: number | string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  siret?: string;
};

const navItems = [
  { key: "overview", label: "Vue d’ensemble", icon: User },
  { key: "commandes", label: "Commandes", icon: FileText },
  { key: "parametres", label: "Paramètres", icon: Settings },
];

export function Account() {
  const navigate = useNavigate();

  const [active, setActive] = useState("overview");
  const [user, setUser] = useState<EcolizUser | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("ecoliz_user");

    if (!storedUser) {
      navigate("/connexion", { replace: true });
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("ecoliz_user");
      navigate("/connexion", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    fetchMyOrders()
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setOrdersError(null);
      })
      .catch((error) => {
        console.error("Erreur récupération commandes :", error);
        setOrdersError("Impossible de charger les commandes pour le moment.");
        setOrders([]);
      })
      .finally(() => {
        setOrdersLoading(false);
      });
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("ecoliz_user");
    navigate("/connexion", { replace: true });
  };

  if (!user) {
    return (
      <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-brand-900/60">
          Chargement de votre espace client…
        </div>
      </section>
    );
  }

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  return (
    <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
              Espace client
            </p>

            <h1 className="text-4xl font-bold text-brand-950 tracking-tight mb-2">
              Bonjour{" "}
              <span className="font-display italic text-accent-500">
                {user.firstName || "client"}
              </span>
            </h1>

            <p className="text-brand-900/70 max-w-2xl">
              Retrouvez vos informations client, vos commandes et le suivi de
              votre compte EcoLiz.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-brand-50 text-brand-900 border border-brand-200 px-6 py-3 rounded-xl font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </header>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          <aside className="bg-white rounded-2xl border border-brand-100 p-4 h-fit">
            <div className="p-4 mb-4 rounded-xl bg-brand-50 border border-brand-100">
              <div className="w-12 h-12 rounded-full bg-brand-700 text-white flex items-center justify-center mb-3">
                <User className="w-6 h-6" />
              </div>

              <p className="font-bold text-brand-950">
                {fullName || "Compte client"}
              </p>

              <p className="text-sm text-brand-900/60 break-all">
                {user.email}
              </p>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActive(item.key)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                      active === item.key
                        ? "bg-brand-700 text-white"
                        : "text-brand-900/70 hover:bg-brand-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 text-red-600 hover:bg-red-50 mt-4 border-t border-brand-100 pt-4"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </nav>
          </aside>

          <div className="space-y-8">
            {active === "overview" && (
              <>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-brand-100 p-6">
                    <p className="text-sm text-brand-900/60 mb-1">
                      Commandes
                    </p>
                    <p className="text-3xl font-bold text-brand-950">
                      {orders.length}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-brand-100 p-6">
                    <p className="text-sm text-brand-900/60 mb-1">
                      Statut compte
                    </p>
                    <p className="text-lg font-bold text-brand-700">
                      Actif
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-brand-100 p-6">
                    <p className="text-sm text-brand-900/60 mb-1">
                      Type client
                    </p>
                    <p className="text-lg font-bold text-brand-950">
                      Professionnel
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-brand-100 p-6">
                  <h2 className="text-xl font-bold text-brand-950 mb-6">
                    Informations du compte
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
                      <div className="flex items-center gap-2 text-brand-700 mb-2">
                        <Building2 className="w-4 h-4" />
                        <p className="text-sm font-semibold">Entreprise</p>
                      </div>
                      <p className="text-brand-950 font-medium">
                        {user.company || "Non renseignée"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
                      <div className="flex items-center gap-2 text-brand-700 mb-2">
                        <User className="w-4 h-4" />
                        <p className="text-sm font-semibold">Contact</p>
                      </div>
                      <p className="text-brand-950 font-medium">
                        {fullName || "Non renseigné"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
                      <div className="flex items-center gap-2 text-brand-700 mb-2">
                        <Mail className="w-4 h-4" />
                        <p className="text-sm font-semibold">Email</p>
                      </div>
                      <p className="text-brand-950 font-medium break-all">
                        {user.email}
                      </p>
                    </div>

                    <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
                      <div className="flex items-center gap-2 text-brand-700 mb-2">
                        <ShieldCheck className="w-4 h-4" />
                        <p className="text-sm font-semibold">SIRET</p>
                      </div>
                      <p className="text-brand-950 font-medium">
                        {user.siret || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
                    <h2 className="font-bold text-brand-950">
                      Dernières commandes
                    </h2>

                    <button
                      type="button"
                      onClick={() => setActive("commandes")}
                      className="text-sm text-brand-700 font-medium hover:underline"
                    >
                      Voir toutes
                    </button>
                  </div>

                  <OrdersList
                    orders={orders.slice(0, 3)}
                    loading={ordersLoading}
                    error={ordersError}
                  />
                </div>
              </>
            )}

            {active === "commandes" && (
              <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-brand-100">
                  <h2 className="font-bold text-brand-950">
                    Mes commandes
                  </h2>
                  <p className="text-sm text-brand-900/60 mt-1">
                    Historique des commandes liées à votre compte.
                  </p>
                </div>

                <OrdersList
                  orders={orders}
                  loading={ordersLoading}
                  error={ordersError}
                />
              </div>
            )}

            {active === "parametres" && (
              <div className="bg-white rounded-2xl border border-brand-100 p-6">
                <h2 className="text-xl font-bold text-brand-950 mb-4">
                  Paramètres du compte
                </h2>

                <p className="text-brand-900/70 mb-6">
                  Cette section permettra ensuite de modifier les informations
                  du compte, l’adresse de facturation et les préférences client.
                </p>

                <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
                  <p className="font-semibold text-brand-950 mb-2">
                    Informations actuelles
                  </p>

                  <div className="space-y-2 text-sm text-brand-900/70">
                    <p>
                      <strong>Email :</strong> {user.email}
                    </p>
                    <p>
                      <strong>Entreprise :</strong>{" "}
                      {user.company || "Non renseignée"}
                    </p>
                    <p>
                      <strong>SIRET :</strong>{" "}
                      {user.siret || "Non renseigné"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {active !== "overview" &&
              active !== "commandes" &&
              active !== "parametres" && (
                <div className="bg-white rounded-2xl border border-brand-100 p-8 text-brand-900/60">
                  Section en cours de préparation.
                </div>
              )}
          </div>
        </div>
      </div>
    </section>
  );
}

function OrdersList({
  orders,
  loading,
  error,
}: {
  orders: Order[];
  loading: boolean;
  error: string | null;
}) {
  if (error) {
    return (
      <div className="px-6 py-6 text-sm text-amber-700 bg-amber-50 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Erreur de chargement</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-6 py-8 text-sm text-brand-900/60">
        Chargement des commandes…
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="px-6 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-50 mx-auto mb-4 flex items-center justify-center">
          <ShoppingBag className="w-7 h-7 text-brand-700" />
        </div>

        <p className="font-semibold text-brand-950 mb-2">
          Aucune commande pour le moment
        </p>

        <p className="text-sm text-brand-900/60 mb-5">
          Les commandes passées depuis la boutique apparaîtront ici.
        </p>

        <Link
          to="/boutique"
          className="inline-flex items-center justify-center rounded-full bg-brand-700 px-5 py-2.5 text-white font-semibold hover:bg-brand-800 transition-colors"
        >
          Aller à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-brand-50">
      {orders.map((o) => (
        <div
          key={o.id}
          className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <p className="font-medium text-brand-950 text-sm">
              Commande #{o.id}
            </p>

            <p className="text-xs text-brand-900/60">
              {o.date} · {o.items} article(s)
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-brand-50 text-brand-700">
              {o.status}
            </span>

            <p className="font-bold text-brand-950">
              {formatPrice(o.total)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
