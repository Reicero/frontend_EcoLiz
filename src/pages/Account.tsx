import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  PenTool,
  ShieldCheck,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { formatPrice } from "../utils/formatPrice";

const WORDPRESS_URL = "http://90.51.128.107:12443/index.php";

type Order = {
  id: string;
  date: string;
  total: number;
  items: number;
  status: string;
};

const equipment = [
  {
    id: "1",
    model: 'MacBook Pro 14"',
    sn: "C02F8M2KQ6L4",
    status: "Actif",
    warranty: "12 mois restants",
  },
  {
    id: "2",
    model: "Dell Latitude 7420",
    sn: "DL8920238FR",
    status: "En réparation",
    warranty: "8 mois restants",
  },
  {
    id: "3",
    model: "Lenovo ThinkPad T14",
    sn: "TP441-X22",
    status: "Actif",
    warranty: "24 mois restants",
  },
];

const navItems = [
  { key: "parc", label: "Parc IT", icon: LayoutDashboard },
  { key: "commandes", label: "Commandes", icon: FileText },
  { key: "reparations", label: "Réparations", icon: PenTool },
  { key: "garanties", label: "Garanties", icon: ShieldCheck },
  { key: "parametres", label: "Paramètres", icon: Settings },
];

export function Account() {
  const [active, setActive] = useState("parc");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    fetch("/wp-api/ecoliz/v1/my-orders")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur API commandes");
        }

        return res.json();
      })
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Erreur récupération commandes :", error);
        setOrders([]);
      })
      .finally(() => {
        setOrdersLoading(false);
      });
  }, []);

  return (
    <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
              Espace client
            </p>

            <h1 className="text-4xl font-bold text-brand-950 tracking-tight mb-2">
              Portail client{" "}
              <span className="font-display italic text-accent-500">
                EcoLiz
              </span>
            </h1>

            <p className="text-brand-900/70 max-w-2xl">
              Cette interface présente la vision future de l’espace client :
              parc informatique, commandes, garanties et suivi SAV.
            </p>
          </div>

          <a
            href={`${WORDPRESS_URL}/mon-compte`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-brand-900/20"
          >
            Accéder à mon compte
            <ExternalLink className="w-4 h-4" />
          </a>
        </header>

        <div className="bg-white border border-brand-100 rounded-2xl p-5 mb-8">
          <p className="text-sm text-brand-900/70">
            Les commandes affichées ci-dessous sont récupérées depuis
            WooCommerce via une API WordPress personnalisée. La sécurisation
            définitive par client connecté sera finalisée avec le domaine et
            l’authentification.
          </p>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          <aside className="bg-white rounded-2xl border border-brand-100 p-4 h-fit">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
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

              <a
                href={`${WORDPRESS_URL}/mon-compte/customer-logout`}
                target="_blank"
                rel="noreferrer"
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 text-brand-900/60 hover:bg-brand-50 mt-4 border-t border-brand-100 pt-4"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </a>
            </nav>
          </aside>

          <div className="space-y-8">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-brand-100 p-6">
                <p className="text-sm text-brand-900/60 mb-1">
                  Équipements actifs
                </p>
                <p className="text-3xl font-bold text-brand-950">
                  {equipment.length}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-brand-100 p-6">
                <p className="text-sm text-brand-900/60 mb-1">
                  Tickets en cours
                </p>
                <p className="text-3xl font-bold text-brand-950">2</p>
              </div>

              <div className="bg-white rounded-2xl border border-brand-100 p-6">
                <p className="text-sm text-brand-900/60 mb-1">
                  Commandes récentes
                </p>
                <p className="text-3xl font-bold text-brand-950">
                  {orders.length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
                <h2 className="font-bold text-brand-950">
                  Mon parc informatique
                </h2>

                <a
                  href={`${WORDPRESS_URL}/mon-compte`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-brand-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold"
                >
                  Déclarer un incident
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-brand-50 text-left text-xs uppercase text-brand-900/60">
                      <th className="px-6 py-3 font-semibold">Modèle</th>
                      <th className="px-6 py-3 font-semibold">N° de série</th>
                      <th className="px-6 py-3 font-semibold">Statut</th>
                      <th className="px-6 py-3 font-semibold">Garantie</th>
                    </tr>
                  </thead>

                  <tbody>
                    {equipment.map((e) => (
                      <tr key={e.id} className="border-t border-brand-50">
                        <td className="px-6 py-4 font-medium text-brand-950">
                          {e.model}
                        </td>

                        <td className="px-6 py-4 text-brand-900/60 font-mono text-xs">
                          {e.sn}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              e.status === "Actif"
                                ? "bg-brand-50 text-brand-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {e.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-brand-900/70 text-xs">
                          {e.warranty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
                <h2 className="font-bold text-brand-950">
                  Mes commandes récentes
                </h2>

                <a
                  href={`${WORDPRESS_URL}/mon-compte/orders`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-brand-700 font-medium hover:underline"
                >
                  Voir dans WooCommerce
                </a>
              </div>

              <div className="divide-y divide-brand-50">
                {ordersLoading ? (
                  <div className="px-6 py-8 text-sm text-brand-900/60">
                    Chargement des commandes…
                  </div>
                ) : orders.length === 0 ? (
                  <div className="px-6 py-8 text-sm text-brand-900/60">
                    Aucune commande trouvée pour le moment.
                  </div>
                ) : (
                  orders.map((o) => (
                    <div
                      key={o.id}
                      className="px-6 py-4 flex items-center justify-between"
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

                        <a
                          href={`${WORDPRESS_URL}/mon-compte/orders`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-brand-700 hover:underline font-medium"
                        >
                          Détails
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}