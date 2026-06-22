import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  FileText,
  Home,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Settings,
  ShieldCheck,
  ShoppingBag,
  User,
} from "lucide-react";
import { fetchMyOrders } from "../services/ecoliz-api";
import { formatPrice } from "../utils/formatPrice";

type AccountTab =
  | "overview"
  | "infos"
  | "addresses"
  | "commandes"
  | "security";

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
  phone?: string;

  address_1?: string;
  address_2?: string;
  postcode?: string;
  city?: string;
  country?: string;

  billing_address_1?: string;
  billing_address_2?: string;
  billing_postcode?: string;
  billing_city?: string;
  billing_country?: string;

  shipping_address_1?: string;
  shipping_address_2?: string;
  shipping_postcode?: string;
  shipping_city?: string;
  shipping_country?: string;
};

const navItems: Array<{
  key: AccountTab;
  label: string;
  icon: typeof User;
}> = [
  { key: "overview", label: "Vue d’ensemble", icon: User },
  { key: "infos", label: "Mes informations", icon: Building2 },
  { key: "addresses", label: "Mes adresses", icon: MapPin },
  { key: "commandes", label: "Commandes & devis", icon: FileText },
  { key: "security", label: "Sécurité", icon: Settings },
];

export function Account() {
  const navigate = useNavigate();

  const [active, setActive] = useState<AccountTab>("overview");
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

    setOrdersLoading(true);

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

  function handleLogout() {
    localStorage.removeItem("ecoliz_user");
    navigate("/connexion", { replace: true });
  }

  const fullName = useMemo(() => {
    if (!user) return "";
    return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  }, [user]);

  const initials = useMemo(() => {
    if (!user) return "CL";

    const first = user.firstName?.[0] ?? "";
    const last = user.lastName?.[0] ?? "";

    return `${first}${last}`.trim().toUpperCase() || "CL";
  }, [user]);

  const pendingOrders = orders.filter((order) =>
    normalizeStatus(order.status).includes("attente")
  );

  const totalOrdersAmount = orders.reduce(
    (total, order) => total + Number(order.total || 0),
    0
  );

  if (!user) {
    return (
      <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-brand-900/60">
          Chargement de votre espace client…
        </div>
      </section>
    );
  }

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
              Retrouvez vos informations client, vos adresses, vos commandes et
              vos demandes de devis EcoLiz.
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

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="bg-white rounded-2xl border border-brand-100 p-4 h-fit shadow-sm">
            <div className="p-4 mb-4 rounded-xl bg-brand-50 border border-brand-100">
              <div className="w-14 h-14 rounded-full bg-brand-700 text-white flex items-center justify-center mb-3 font-bold">
                {initials}
              </div>

              <p className="font-bold text-brand-950">
                {fullName || "Compte client"}
              </p>

              <p className="text-sm text-brand-900/60 break-all">
                {user.email}
              </p>

              {user.company && (
                <p className="mt-2 text-xs font-medium text-brand-700">
                  {user.company}
                </p>
              )}
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
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard
                    label="Commandes"
                    value={String(orders.length)}
                    icon={ShoppingBag}
                  />

                  <StatCard
                    label="En attente"
                    value={String(pendingOrders.length)}
                    icon={FileText}
                  />

                  <StatCard
                    label="Total demandes"
                    value={formatPrice(totalOrdersAmount)}
                    icon={PackageCheck}
                  />

                  <StatCard
                    label="Statut compte"
                    value="Actif"
                    icon={ShieldCheck}
                  />
                </div>

                <div className="grid xl:grid-cols-2 gap-6">
                  <InfoPanel title="Informations client">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <InfoItem
                        icon={Building2}
                        label="Entreprise"
                        value={user.company || "Non renseignée"}
                      />
                      <InfoItem
                        icon={User}
                        label="Contact"
                        value={fullName || "Non renseigné"}
                      />
                      <InfoItem
                        icon={Mail}
                        label="Email"
                        value={user.email}
                      />
                      <InfoItem
                        icon={ShieldCheck}
                        label="SIRET"
                        value={user.siret || "Non renseigné"}
                      />
                    </div>
                  </InfoPanel>

                  <InfoPanel title="Adresse principale">
                    <AddressPreview
                      lines={[
                        user.address_1 || user.billing_address_1,
                        user.address_2 || user.billing_address_2,
                        [
                          user.postcode || user.billing_postcode,
                          user.city || user.billing_city,
                        ]
                          .filter(Boolean)
                          .join(" "),
                        user.country || user.billing_country,
                      ]}
                    />
                  </InfoPanel>
                </div>

                <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
                    <div>
                      <h2 className="font-bold text-brand-950">
                        Dernières commandes / demandes
                      </h2>
                      <p className="text-sm text-brand-900/60 mt-1">
                        Les dernières demandes envoyées depuis la boutique.
                      </p>
                    </div>

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

            {active === "infos" && (
              <InfoPanel title="Mes informations">
                <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  La modification des informations client pourra ensuite être
                  reliée à l’API WordPress. Pour l’instant, cette page affiche
                  les données du compte connecté.
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <InfoItem
                    icon={User}
                    label="Prénom"
                    value={user.firstName || "Non renseigné"}
                  />
                  <InfoItem
                    icon={User}
                    label="Nom"
                    value={user.lastName || "Non renseigné"}
                  />
                  <InfoItem
                    icon={Building2}
                    label="Entreprise"
                    value={user.company || "Non renseignée"}
                  />
                  <InfoItem
                    icon={ShieldCheck}
                    label="SIRET"
                    value={user.siret || "Non renseigné"}
                  />
                  <InfoItem icon={Mail} label="Email" value={user.email} />
                  <InfoItem
                    icon={Phone}
                    label="Téléphone"
                    value={user.phone || "Non renseigné"}
                  />
                </div>
              </InfoPanel>
            )}

            {active === "addresses" && (
              <div className="grid xl:grid-cols-2 gap-6">
                <AddressCard
                  title="Adresse de facturation"
                  description="Adresse utilisée pour les documents commerciaux et les demandes."
                  lines={[
                    user.billing_address_1 || user.address_1,
                    user.billing_address_2 || user.address_2,
                    [user.billing_postcode || user.postcode, user.billing_city || user.city]
                      .filter(Boolean)
                      .join(" "),
                    user.billing_country || user.country,
                  ]}
                />

                <AddressCard
                  title="Adresse de livraison"
                  description="Adresse utilisée pour l’expédition du matériel."
                  lines={[
                    user.shipping_address_1 || user.address_1,
                    user.shipping_address_2 || user.address_2,
                    [user.shipping_postcode || user.postcode, user.shipping_city || user.city]
                      .filter(Boolean)
                      .join(" "),
                    user.shipping_country || user.country,
                  ]}
                />
              </div>
            )}

            {active === "commandes" && (
              <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-brand-100">
                  <h2 className="font-bold text-brand-950">
                    Mes commandes et demandes de devis
                  </h2>
                  <p className="text-sm text-brand-900/60 mt-1">
                    Historique des commandes liées à votre compte EcoLiz.
                  </p>
                </div>

                <OrdersList
                  orders={orders}
                  loading={ordersLoading}
                  error={ordersError}
                />
              </div>
            )}

            {active === "security" && (
              <InfoPanel title="Sécurité du compte">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-brand-100 flex items-center justify-center text-brand-700 mb-4">
                      <KeyRound className="w-5 h-5" />
                    </div>

                    <h3 className="font-bold text-brand-950 mb-2">
                      Mot de passe
                    </h3>

                    <p className="text-sm text-brand-900/60 mb-4">
                      Le changement de mot de passe sera relié ensuite au
                      système WordPress.
                    </p>

                    <button
                      type="button"
                      disabled
                      className="inline-flex rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-900/50 cursor-not-allowed"
                    >
                      Modification bientôt disponible
                    </button>
                  </div>

                  <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-red-100 flex items-center justify-center text-red-600 mb-4">
                      <LogOut className="w-5 h-5" />
                    </div>

                    <h3 className="font-bold text-brand-950 mb-2">
                      Déconnexion
                    </h3>

                    <p className="text-sm text-brand-900/60 mb-4">
                      Déconnectez-vous de votre espace client EcoLiz sur cet
                      appareil.
                    </p>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </InfoPanel>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof User;
}) {
  return (
    <div className="bg-white rounded-2xl border border-brand-100 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-brand-900/60 mb-1">{label}</p>
          <p className="text-2xl font-bold text-brand-950">{value}</p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function InfoPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-brand-100 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-brand-950 mb-6">{title}</h2>
      {children}
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
      <div className="flex items-center gap-2 text-brand-700 mb-2">
        <Icon className="w-4 h-4" />
        <p className="text-sm font-semibold">{label}</p>
      </div>

      <p className="text-brand-950 font-medium break-words">{value}</p>
    </div>
  );
}

function AddressPreview({ lines }: { lines: Array<string | undefined> }) {
  const cleanLines = lines.map((line) => line?.trim()).filter(Boolean);

  if (cleanLines.length === 0) {
    return (
      <div className="rounded-xl bg-brand-50 border border-brand-100 p-5 text-brand-900/60 text-sm">
        Aucune adresse renseignée pour le moment.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-brand-50 border border-brand-100 p-5 text-brand-950">
      {cleanLines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function AddressCard({
  title,
  description,
  lines,
}: {
  title: string;
  description: string;
  lines: Array<string | undefined>;
}) {
  const cleanLines = lines.map((line) => line?.trim()).filter(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-brand-100 p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700">
          <Home className="w-5 h-5" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-950">{title}</h2>
          <p className="text-sm text-brand-900/60 mt-1">{description}</p>
        </div>
      </div>

      {cleanLines.length > 0 ? (
        <div className="rounded-xl bg-brand-50 border border-brand-100 p-5 text-brand-950">
          {cleanLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-brand-50 border border-brand-100 p-5 text-sm text-brand-900/60">
          Aucune adresse renseignée pour le moment.
        </div>
      )}
    </div>
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
          Les commandes ou demandes de devis passées depuis la boutique
          apparaîtront ici.
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
      {orders.map((order) => (
        <div
          key={order.id}
          className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <p className="font-medium text-brand-950 text-sm">
              Commande #{order.id}
            </p>

            <p className="text-xs text-brand-900/60">
              {formatOrderDate(order.date)} · {order.items} article
              {Number(order.items) > 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <StatusBadge status={order.status} />

            <p className="font-bold text-brand-950">
              {formatPrice(Number(order.total || 0))}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status);

  const style = normalized.includes("termine")
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : normalized.includes("annule")
      ? "bg-red-50 text-red-700 border-red-100"
      : normalized.includes("attente") || normalized.includes("pending")
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-brand-50 text-brand-700 border-brand-100";

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${style}`}>
      {formatOrderStatus(status)}
    </span>
  );
}

function normalizeStatus(value: string) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatOrderStatus(value: string) {
  const normalized = normalizeStatus(value);

  if (normalized.includes("pending") || normalized.includes("attente")) {
    return "En attente";
  }

  if (normalized.includes("processing") || normalized.includes("traitement")) {
    return "En traitement";
  }

  if (normalized.includes("completed") || normalized.includes("termine")) {
    return "Terminée";
  }

  if (normalized.includes("cancelled") || normalized.includes("annule")) {
    return "Annulée";
  }

  return value || "Statut inconnu";
}

function formatOrderDate(value: string) {
  if (!value) return "Date inconnue";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
