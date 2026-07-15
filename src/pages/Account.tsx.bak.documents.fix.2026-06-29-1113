import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
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
  Save,
  Settings,
  ShieldCheck,
  ShoppingBag,
  User,
  type LucideIcon,
} from "lucide-react";
import { fetchMyOrders } from "../services/ecoliz-api";
import {
  changeCustomerPassword,
  getCurrentCustomer,
  logoutCustomer,
  updateCustomerAddresses,
  updateCustomerProfile,
} from "../services/auth";
import { formatPrice } from "../utils/formatPrice";

type AccountTab =
  | "overview"
  | "infos"
  | "addresses"
  | "commandes"
  | "security";

type OrderProduct = {
  name: string;
  quantity: number;
  subtotal: number;
  total: number;
  sku?: string;
  product_id?: number;
};

type OrderAddress = {
  first_name?: string;
  last_name?: string;
  company?: string;
  email?: string;
  phone?: string;
  address_1?: string;
  address_2?: string;
  postcode?: string;
  city?: string;
  country?: string;
};

type Order = {
  id: string | number;
  date: string;
  total: number;
  items: number;
  status: string;
  products?: OrderProduct[];
  billing?: OrderAddress;
  shipping?: OrderAddress;
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

type ProfileForm = {
  firstName: string;
  lastName: string;
  company: string;
  siret: string;
  phone: string;
};

type AddressesForm = {
  billing_address_1: string;
  billing_address_2: string;
  billing_postcode: string;
  billing_city: string;
  billing_country: string;
  shipping_address_1: string;
  shipping_address_2: string;
  shipping_postcode: string;
  shipping_city: string;
  shipping_country: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const navItems: Array<{
  key: AccountTab;
  label: string;
  icon: LucideIcon;
}> = [
  { key: "overview", label: "Vue d’ensemble", icon: User },
  { key: "infos", label: "Mes informations", icon: Building2 },
  { key: "addresses", label: "Mes adresses", icon: MapPin },
  { key: "commandes", label: "Commandes & devis", icon: FileText },
  { key: "security", label: "Sécurité", icon: Settings },
];

const emptyProfileForm: ProfileForm = {
  firstName: "",
  lastName: "",
  company: "",
  siret: "",
  phone: "",
};

const emptyAddressesForm: AddressesForm = {
  billing_address_1: "",
  billing_address_2: "",
  billing_postcode: "",
  billing_city: "",
  billing_country: "FR",
  shipping_address_1: "",
  shipping_address_2: "",
  shipping_postcode: "",
  shipping_city: "",
  shipping_country: "FR",
};

const emptyPasswordForm: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function Account() {
  const navigate = useNavigate();

  const [active, setActive] = useState<AccountTab>("overview");
  const [user, setUser] = useState<EcolizUser | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm);
  const [addressesForm, setAddressesForm] =
    useState<AddressesForm>(emptyAddressesForm);
  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(emptyPasswordForm);

  const [profileLoading, setProfileLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [addressesMessage, setAddressesMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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
      const parsedUser = JSON.parse(storedUser);
      applyUser(parsedUser);
    } catch {
      localStorage.removeItem("ecoliz_user");
      navigate("/connexion", { replace: true });
      return;
    }

    getCurrentCustomer()
      .then((data) => {
        if (data?.user) {
          applyUser(data.user);
        }
      })
      .catch((error) => {
        console.warn("Session WordPress non récupérée :", error);
      });
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

  function applyUser(nextUser: EcolizUser) {
    setUser(nextUser);
    localStorage.setItem("ecoliz_user", JSON.stringify(nextUser));

    setProfileForm({
      firstName: nextUser.firstName ?? "",
      lastName: nextUser.lastName ?? "",
      company: nextUser.company ?? "",
      siret: nextUser.siret ?? "",
      phone: nextUser.phone ?? "",
    });

    setAddressesForm({
      billing_address_1:
        nextUser.billing_address_1 ?? nextUser.address_1 ?? "",
      billing_address_2:
        nextUser.billing_address_2 ?? nextUser.address_2 ?? "",
      billing_postcode:
        nextUser.billing_postcode ?? nextUser.postcode ?? "",
      billing_city: nextUser.billing_city ?? nextUser.city ?? "",
      billing_country: nextUser.billing_country ?? nextUser.country ?? "FR",

      shipping_address_1:
        nextUser.shipping_address_1 ?? nextUser.address_1 ?? "",
      shipping_address_2:
        nextUser.shipping_address_2 ?? nextUser.address_2 ?? "",
      shipping_postcode:
        nextUser.shipping_postcode ?? nextUser.postcode ?? "",
      shipping_city: nextUser.shipping_city ?? nextUser.city ?? "",
      shipping_country: nextUser.shipping_country ?? nextUser.country ?? "FR",
    });
  }

  async function handleLogout() {
    await logoutCustomer();
    navigate("/connexion", { replace: true });
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setProfileLoading(true);
    setProfileMessage(null);
    setProfileError(null);

    try {
      const data = await updateCustomerProfile(profileForm);

      if (data?.user) {
        applyUser(data.user);
      }

      setProfileMessage("Vos informations ont bien été mises à jour.");
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour vos informations."
      );
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleAddressesSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAddressesLoading(true);
    setAddressesMessage(null);
    setAddressesError(null);

    try {
      const data = await updateCustomerAddresses(addressesForm);

      if (data?.user) {
        applyUser(data.user);
      }

      setAddressesMessage("Vos adresses ont bien été mises à jour.");
    } catch (error) {
      setAddressesError(
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour vos adresses."
      );
    } finally {
      setAddressesLoading(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPasswordLoading(true);
    setPasswordMessage(null);
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Les deux nouveaux mots de passe ne correspondent pas.");
      setPasswordLoading(false);
      return;
    }

    try {
      await changeCustomerPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm(emptyPasswordForm);
      setPasswordMessage("Votre mot de passe a bien été modifié.");
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Impossible de modifier le mot de passe."
      );
    } finally {
      setPasswordLoading(false);
    }
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
                      <InfoItem icon={Mail} label="Email" value={user.email} />
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
                        user.billing_address_1 || user.address_1,
                        user.billing_address_2 || user.address_2,
                        [
                          user.billing_postcode || user.postcode,
                          user.billing_city || user.city,
                        ]
                          .filter(Boolean)
                          .join(" "),
                        user.billing_country || user.country,
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
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <FeedbackMessage message={profileMessage} error={profileError} />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField
                      label="Prénom"
                      value={profileForm.firstName}
                      onChange={(value) =>
                        setProfileForm((current) => ({
                          ...current,
                          firstName: value,
                        }))
                      }
                      required
                    />

                    <TextField
                      label="Nom"
                      value={profileForm.lastName}
                      onChange={(value) =>
                        setProfileForm((current) => ({
                          ...current,
                          lastName: value,
                        }))
                      }
                      required
                    />

                    <TextField
                      label="Entreprise"
                      value={profileForm.company}
                      onChange={(value) =>
                        setProfileForm((current) => ({
                          ...current,
                          company: value,
                        }))
                      }
                      required
                    />

                    <TextField
                      label="SIRET"
                      value={profileForm.siret}
                      onChange={(value) =>
                        setProfileForm((current) => ({
                          ...current,
                          siret: value,
                        }))
                      }
                    />

                    <TextField
                      label="Email"
                      value={user.email}
                      onChange={() => undefined}
                      disabled
                    />

                    <TextField
                      label="Téléphone"
                      value={profileForm.phone}
                      onChange={(value) =>
                        setProfileForm((current) => ({
                          ...current,
                          phone: value,
                        }))
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-white font-semibold hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {profileLoading ? "Enregistrement…" : "Enregistrer les informations"}
                  </button>
                </form>
              </InfoPanel>
            )}

            {active === "addresses" && (
              <InfoPanel title="Mes adresses">
                <form onSubmit={handleAddressesSubmit} className="space-y-8">
                  <FeedbackMessage
                    message={addressesMessage}
                    error={addressesError}
                  />

                  <div className="grid xl:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-brand-100 flex items-center justify-center text-brand-700">
                          <Home className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-brand-950">
                            Adresse de facturation
                          </h3>
                          <p className="text-sm text-brand-900/60">
                            Utilisée pour les documents commerciaux.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <TextField
                          label="Adresse"
                          value={addressesForm.billing_address_1}
                          onChange={(value) =>
                            setAddressesForm((current) => ({
                              ...current,
                              billing_address_1: value,
                            }))
                          }
                        />

                        <TextField
                          label="Complément d’adresse"
                          value={addressesForm.billing_address_2}
                          onChange={(value) =>
                            setAddressesForm((current) => ({
                              ...current,
                              billing_address_2: value,
                            }))
                          }
                        />

                        <div className="grid sm:grid-cols-2 gap-4">
                          <TextField
                            label="Code postal"
                            value={addressesForm.billing_postcode}
                            onChange={(value) =>
                              setAddressesForm((current) => ({
                                ...current,
                                billing_postcode: value,
                              }))
                            }
                          />

                          <TextField
                            label="Ville"
                            value={addressesForm.billing_city}
                            onChange={(value) =>
                              setAddressesForm((current) => ({
                                ...current,
                                billing_city: value,
                              }))
                            }
                          />
                        </div>

                        <TextField
                          label="Pays"
                          value={addressesForm.billing_country}
                          onChange={(value) =>
                            setAddressesForm((current) => ({
                              ...current,
                              billing_country: value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-brand-100 flex items-center justify-center text-brand-700">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-brand-950">
                            Adresse de livraison
                          </h3>
                          <p className="text-sm text-brand-900/60">
                            Utilisée pour l’expédition du matériel.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <TextField
                          label="Adresse"
                          value={addressesForm.shipping_address_1}
                          onChange={(value) =>
                            setAddressesForm((current) => ({
                              ...current,
                              shipping_address_1: value,
                            }))
                          }
                        />

                        <TextField
                          label="Complément d’adresse"
                          value={addressesForm.shipping_address_2}
                          onChange={(value) =>
                            setAddressesForm((current) => ({
                              ...current,
                              shipping_address_2: value,
                            }))
                          }
                        />

                        <div className="grid sm:grid-cols-2 gap-4">
                          <TextField
                            label="Code postal"
                            value={addressesForm.shipping_postcode}
                            onChange={(value) =>
                              setAddressesForm((current) => ({
                                ...current,
                                shipping_postcode: value,
                              }))
                            }
                          />

                          <TextField
                            label="Ville"
                            value={addressesForm.shipping_city}
                            onChange={(value) =>
                              setAddressesForm((current) => ({
                                ...current,
                                shipping_city: value,
                              }))
                            }
                          />
                        </div>

                        <TextField
                          label="Pays"
                          value={addressesForm.shipping_country}
                          onChange={(value) =>
                            setAddressesForm((current) => ({
                              ...current,
                              shipping_country: value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={addressesLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-white font-semibold hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {addressesLoading ? "Enregistrement…" : "Enregistrer les adresses"}
                  </button>
                </form>
              </InfoPanel>
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
                      Modifiez le mot de passe associé à votre compte client.
                    </p>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <FeedbackMessage
                        message={passwordMessage}
                        error={passwordError}
                      />

                      <TextField
                        label="Mot de passe actuel"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(value) =>
                          setPasswordForm((current) => ({
                            ...current,
                            currentPassword: value,
                          }))
                        }
                        required
                      />

                      <TextField
                        label="Nouveau mot de passe"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(value) =>
                          setPasswordForm((current) => ({
                            ...current,
                            newPassword: value,
                          }))
                        }
                        required
                      />

                      <TextField
                        label="Confirmer le nouveau mot de passe"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(value) =>
                          setPasswordForm((current) => ({
                            ...current,
                            confirmPassword: value,
                          }))
                        }
                        required
                      />

                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="inline-flex rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {passwordLoading
                          ? "Modification…"
                          : "Modifier le mot de passe"}
                      </button>
                    </form>
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
  icon: LucideIcon;
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

function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
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
  icon: LucideIcon;
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

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-brand-900 mb-2">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-brand-950 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100 disabled:bg-brand-50 disabled:text-brand-900/50"
      />
    </label>
  );
}

function FeedbackMessage({
  message,
  error,
}: {
  message: string | null;
  error: string | null;
}) {
  if (!message && !error) return null;

  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm ${
        error
          ? "border border-red-100 bg-red-50 text-red-700"
          : "border border-emerald-100 bg-emerald-50 text-emerald-700"
      }`}
    >
      {error || message}
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

function OrdersList({
  orders,
  loading,
  error,
}: {
  orders: Order[];
  loading: boolean;
  error: string | null;
}) {
  const [openOrderId, setOpenOrderId] = useState<string | number | null>(null);

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
      {orders.map((order) => {
        const isOpen = openOrderId === order.id;
        const products = order.products ?? [];

        return (
          <div key={order.id}>
            <button
              type="button"
              onClick={() => setOpenOrderId(isOpen ? null : order.id)}
              className="w-full px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left hover:bg-brand-50/60 transition-colors"
            >
              <div>
                <p className="font-medium text-brand-950 text-sm">
                  Commande #{order.id}
                </p>

                <p className="text-xs text-brand-900/60">
                  {formatOrderDate(order.date)} · {order.items} article
                  {Number(order.items) > 1 ? "s" : ""}
                </p>

                <p className="text-xs font-medium text-brand-700 mt-1">
                  {isOpen ? "Masquer le détail" : "Voir le détail"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <StatusBadge status={order.status} />

                <p className="font-bold text-brand-950">
                  {formatPrice(Number(order.total || 0))}
                </p>
              </div>
            </button>

            {isOpen && (
              <div className="px-6 pb-6 bg-brand-50/40">
                <div className="rounded-2xl border border-brand-100 bg-white overflow-hidden">
                  <div className="px-5 py-4 border-b border-brand-100">
                    <p className="font-semibold text-brand-950">
                      Détail de la commande
                    </p>
                    <p className="text-xs text-brand-900/60">
                      Produits commandés, quantités et montants.
                    </p>
                  </div>

                  {products.length > 0 ? (
                    <div className="divide-y divide-brand-50">
                      {products.map((product, index) => (
                        <div
                          key={`${product.product_id ?? product.sku ?? index}-${index}`}
                          className="px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-brand-950">
                              {product.name}
                            </p>

                            <p className="text-xs text-brand-900/60 mt-1">
                              SKU : {product.sku || "Non renseigné"} · Quantité :{" "}
                              {product.quantity}
                            </p>
                          </div>

                          <div className="text-sm font-bold text-brand-950">
                            {formatPrice(Number(product.total || 0))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-4 text-sm text-brand-900/60">
                      Aucun détail produit disponible pour cette commande.
                    </div>
                  )}

                  <div className="px-5 py-4 border-t border-brand-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-brand-900/70">
                      Total commande
                    </span>
                    <span className="text-lg font-bold text-brand-950">
                      {formatPrice(Number(order.total || 0))}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <OrderAddressCard title="Adresse de facturation" address={order.billing} />
                  <OrderAddressCard title="Adresse de livraison" address={order.shipping} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderAddressCard({
  title,
  address,
}: {
  title: string;
  address?: OrderAddress;
}) {
  if (!address) {
    return null;
  }

  const fullName = `${address.first_name ?? ""} ${address.last_name ?? ""}`.trim();
  const cityLine = `${address.postcode ?? ""} ${address.city ?? ""}`.trim();

  const lines = [
    address.company,
    fullName,
    address.address_1,
    address.address_2,
    cityLine,
    address.country,
    address.phone ? `Téléphone : ${address.phone}` : "",
    address.email ? `Email : ${address.email}` : "",
  ].filter((line): line is string => Boolean(line));

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <p className="text-sm font-semibold text-brand-950 mb-3">{title}</p>

      <div className="space-y-1">
        {lines.map((line, index) => (
          <p key={`${title}-${index}`} className="text-xs text-brand-900/60">
            {line}
          </p>
        ))}
      </div>
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