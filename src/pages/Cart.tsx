import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { getCart, updateCartItem, removeCartItem } from "../services/cart";

type WooCartItem = {
  key: string;
  id: number;
  name: string;
  quantity: number;
  images?: {
    src?: string;
    thumbnail?: string;
    alt?: string;
  }[];
  prices?: {
    price?: string;
    regular_price?: string;
    currency_minor_unit?: number;
  };
  totals?: {
    line_total?: string;
    line_subtotal?: string;
    currency_minor_unit?: number;
  };
};

type WooCart = {
  items: WooCartItem[];
  items_count: number;
  totals?: {
    total_price?: string;
    total_items?: string;
    currency_minor_unit?: number;
  };
};

function formatWooPrice(value?: string, minorUnit = 2) {
  const numberValue = Number(value ?? 0) / Math.pow(10, minorUnit);

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(numberValue);
}

function buildQuantityInputs(cart: WooCart) {
  const inputs: Record<string, string> = {};

  for (const item of cart.items ?? []) {
    inputs[item.key] = String(item.quantity);
  }

  return inputs;
}

export default function Cart() {
  const [cart, setCart] = useState<WooCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>(
    {}
  );

  async function loadCart() {
    try {
      setLoading(true);
      setError(null);

      const data = await getCart();
      setCart(data);
      setQuantityInputs(buildQuantityInputs(data));
    } catch (error) {
      console.error("Erreur chargement panier :", error);
      setError("Impossible de charger le panier.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function handleUpdateQuantity(item: WooCartItem, quantity: number) {
    if (quantity < 1) return;

    try {
      setUpdatingKey(item.key);
      setError(null);

      const updatedCart = await updateCartItem(item.key, quantity);
      setCart(updatedCart);
      setQuantityInputs(buildQuantityInputs(updatedCart));
    } catch (error) {
      console.error("Erreur mise à jour quantité :", error);
      setError("Impossible de modifier la quantité.");

      setQuantityInputs((previous) => ({
        ...previous,
        [item.key]: String(item.quantity),
      }));
    } finally {
      setUpdatingKey(null);
    }
  }

  function handleQuantityInputChange(item: WooCartItem, value: string) {
    if (/^\d*$/.test(value)) {
      setQuantityInputs((previous) => ({
        ...previous,
        [item.key]: value,
      }));
    }
  }

  function handleQuantityInputValidate(item: WooCartItem) {
    const value = quantityInputs[item.key];

    if (!value) {
      setQuantityInputs((previous) => ({
        ...previous,
        [item.key]: String(item.quantity),
      }));
      return;
    }

    const quantity = Number(value);

    if (Number.isNaN(quantity) || quantity < 1) {
      setQuantityInputs((previous) => ({
        ...previous,
        [item.key]: String(item.quantity),
      }));
      return;
    }

    if (quantity !== item.quantity) {
      handleUpdateQuantity(item, quantity);
    }
  }

  async function handleRemoveItem(item: WooCartItem) {
    try {
      setUpdatingKey(item.key);
      setError(null);

      const updatedCart = await removeCartItem(item.key);
      setCart(updatedCart);
      setQuantityInputs(buildQuantityInputs(updatedCart));
    } catch (error) {
      console.error("Erreur suppression produit :", error);
      setError("Impossible de supprimer ce produit.");
    } finally {
      setUpdatingKey(null);
    }
  }

const items = cart?.items ?? [];
const minorUnit = cart?.totals?.currency_minor_unit ?? 2;

const totalHT =
  cart?.totals?.total_items ??
  String(
    items.reduce((sum, item) => {
      const itemMinorUnit =
        item.totals?.currency_minor_unit ??
        item.prices?.currency_minor_unit ??
        minorUnit;

      const lineTotal =
        item.totals?.line_total ?? item.totals?.line_subtotal ?? "0";

      if (itemMinorUnit !== minorUnit) {
        return sum;
      }

      return sum + Number(lineTotal ?? 0);
    }, 0)
  );

  if (loading) {
    return (
      <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-brand-900/60">
          Chargement du panier…
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/boutique"
          className="inline-flex items-center gap-2 text-brand-700 hover:text-brand-800 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Continuer mes achats
        </Link>

        <header className="mb-10">
          <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
            Panier
          </p>

          <h1 className="text-5xl font-bold text-brand-950 tracking-tight mb-4">
            Votre panier{" "}
            <span className="font-display italic text-accent-500">EcoLiz</span>
          </h1>

          <p className="text-lg text-brand-900/70 max-w-2xl">
            Vérifiez vos articles avant de passer à l’étape de commande.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 font-medium">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-brand-100 p-10 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-brand-50 mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="w-9 h-9 text-brand-700" />
            </div>

            <h2 className="text-2xl font-bold text-brand-950 mb-3">
              Votre panier est vide
            </h2>

            <p className="text-brand-900/60 mb-8">
              Ajoutez un produit depuis la boutique pour commencer une commande.
            </p>

            <Link
              to="/boutique"
              className="inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3 text-white font-semibold hover:bg-brand-800 transition-colors"
            >
              Retour à la boutique
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-4">
              {items.map((item) => {
                const image =
                  item.images?.[0]?.thumbnail || item.images?.[0]?.src || "";

                const itemMinorUnit =
                  item.totals?.currency_minor_unit ??
                  item.prices?.currency_minor_unit ??
                  minorUnit;

                const lineTotal =
                  item.totals?.line_total ?? item.totals?.line_subtotal ?? "0";

                const unitPrice = item.prices?.price ?? "0";
                const isUpdating = updatingKey === item.key;

                return (
                  <div
                    key={item.key}
                    className="bg-white rounded-3xl border border-brand-100 p-5 shadow-sm flex flex-col sm:flex-row gap-5"
                  >
                    <div className="w-full sm:w-32 h-32 bg-brand-50 rounded-2xl overflow-hidden border border-brand-100 flex-shrink-0">
                      {image ? (
                        <img
                          src={image}
                          alt={item.images?.[0]?.alt || item.name}
                          className="w-full h-full object-cover mix-blend-multiply"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-900/30 text-sm">
                          Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-brand-950 mb-2">
                            {item.name}
                          </h2>

                          <p className="text-brand-900/60">
                            Prix unitaire HT :{" "}
                            <span className="font-semibold text-brand-950">
                            {formatWooPrice(totalHT, minorUnit)}
                            </span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </div>

                      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 w-fit">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateQuantity(item, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1 || isUpdating}
                            className="w-10 h-10 inline-flex items-center justify-center disabled:opacity-40"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={
                              quantityInputs[item.key] ?? String(item.quantity)
                            }
                            onChange={(event) =>
                              handleQuantityInputChange(
                                item,
                                event.target.value
                              )
                            }
                            onBlur={() => handleQuantityInputValidate(item)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.currentTarget.blur();
                              }
                            }}
                            disabled={isUpdating}
                            className="w-16 h-10 bg-transparent text-center font-semibold text-brand-950 outline-none disabled:opacity-50"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateQuantity(item, item.quantity + 1)
                            }
                            disabled={isUpdating}
                            className="w-10 h-10 inline-flex items-center justify-center disabled:opacity-40"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-brand-900/50">
                            Sous-total HT
                          </p>
                          <p className="text-xl font-bold text-brand-950">
                            {formatWooPrice(lineTotal, itemMinorUnit)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="bg-white rounded-3xl border border-brand-100 p-6 shadow-sm h-fit">
              <h2 className="text-2xl font-bold text-brand-950 mb-6">
                Total panier HT
              </h2>

              <div className="space-y-4 pb-6 border-b border-brand-100">
                <div className="flex items-center justify-between text-brand-900/70">
                  <span>Articles</span>
                  <span>{cart?.items_count ?? items.length}</span>
                </div>

                <div className="flex items-center justify-between text-brand-950 font-bold text-xl">
                  <span>Total HT</span>
                  <span>{formatWooPrice(totalHT, minorUnit)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-6 w-full inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3 text-white font-semibold hover:bg-brand-800 transition-colors"
              >
                Passer commande
              </Link>

              <Link
                to="/boutique"
                className="mt-3 w-full inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-6 py-3 text-brand-900 font-semibold hover:bg-brand-50 transition-colors"
              >
                Continuer mes achats
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
