import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Barcode,
  CheckCircle2,
  Cpu,
  Leaf,
  Package,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Truck,
} from "lucide-react";

import type { Product } from "../types/product";
import { getProductBySlug } from "../services/woocommerce";
import { addToCart } from "../services/cart";
import { formatPrice } from "../utils/formatPrice";

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    if (!slug) {
      setError("Produit introuvable.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    getProductBySlug(slug)
      .then((data) => {
        if (!data) {
          setProduct(null);
          setError("Produit introuvable.");
          return;
        }

        setProduct(data);
        setSelectedImage(data.image || "/placeholder-product.png");
      })
      .catch((err) => {
        console.error("Erreur lors du chargement du produit :", err);
        setError("Impossible de charger la fiche produit.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  async function handleAddToCart() {
    if (!product || !product.stock) return;

    try {
      setAddingToCart(true);
      setCartSuccess(false);
      setCartError("");

      await addToCart(product.id, 1);

      setCartSuccess(true);
    } catch (err) {
      console.error("Erreur ajout panier :", err);
      setCartError("Impossible d'ajouter ce produit au panier.");
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return (
      <main className="pt-32 min-h-screen bg-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-900/60">Chargement du produit…</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="pt-32 min-h-screen bg-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/boutique"
            className="inline-flex items-center gap-2 text-brand-700 hover:text-brand-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la boutique
          </Link>

          <div className="bg-white rounded-2xl border border-brand-100 p-8">
            <h1 className="text-2xl font-bold text-brand-950 mb-2">
              Produit introuvable
            </h1>

            <p className="text-brand-900/60">
              {error || "Impossible d’afficher cette fiche produit."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || "/placeholder-product.png"];

  const technicalInfos = [
    { label: "Marque", value: product.manufacturer, icon: Tags },
    {
      label: "État",
      value: product.conditionLabel || product.status,
      icon: CheckCircle2,
    },
    { label: "Catégorie", value: product.category, icon: Package },
    { label: "Famille produit", value: product.productGroup, icon: Cpu },
    { label: "Référence EcoLiz", value: product.sku, icon: Barcode },
    {
      label: "Référence constructeur",
      value: product.manufacturerPartNumber,
      icon: Barcode,
    },
    { label: "EAN", value: product.ean, icon: Barcode },
    { label: "Système", value: product.os, icon: Cpu },
  ].filter((item) => Boolean(item.value));

  return (
    <main className="pt-32 pb-24 min-h-screen bg-brand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/boutique"
          className="inline-flex items-center gap-2 text-brand-700 hover:text-brand-800 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la boutique
        </Link>

        <section className="bg-white border border-brand-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="grid lg:grid-cols-[42%_1fr]">
            <div className="p-6 lg:p-8 bg-brand-50/60 border-b lg:border-b-0 lg:border-r border-brand-100">
              <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden aspect-[4/3]">
                <img
                  src={selectedImage || "/placeholder-product.png"}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {images.slice(0, 5).map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`aspect-square rounded-xl border overflow-hidden bg-white transition-all ${
                        selectedImage === image
                          ? "border-brand-700 ring-2 ring-brand-700/20"
                          : "border-brand-100 hover:border-brand-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 lg:p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <StatusPill
                  label={product.stock ? "En stock" : "Rupture de stock"}
                  variant={product.stock ? "success" : "warning"}
                />

                {product.conditionLabel &&
                  product.conditionLabel !== "Non renseigné" && (
                    <StatusPill label={product.conditionLabel} variant="brand" />
                  )}

                <StatusPill label="Garantie sur devis" variant="info" />
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-brand-950 tracking-tight mb-4 leading-tight">
                {product.name}
              </h1>

              {product.specs && (
                <p className="text-brand-900/60 leading-relaxed mb-6 line-clamp-3">
                  {product.specs}
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {technicalInfos.slice(0, 6).map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-brand-50 border border-brand-100 p-4"
                    >
                      <div className="flex items-center gap-2 text-xs text-brand-900/50 mb-1">
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </div>

                      <p className="font-semibold text-brand-950 break-words">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mb-8 pb-8 border-b border-brand-200">
                <p className="text-4xl font-bold text-brand-950">
                  {formatPrice(product.price)} HT
                </p>

                {product.priceTTC && (
                  <p className="text-lg text-brand-900/60 mt-2">
                    {formatPrice(product.priceTTC)} TTC
                  </p>
                )}
              </div>

              {cartSuccess && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-950">
                      Produit ajouté au panier.
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

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  type="button"
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
                  Demander un devis
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-brand-200">
                <TrustItem icon={ShieldCheck} text="Garantie sur devis" />
                <TrustItem icon={Truck} text="Livraison professionnelle" />
                <TrustItem icon={Leaf} text="Matériel reconditionné" />
              </div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 mt-8">
          <section className="bg-white border border-brand-100 rounded-3xl p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-brand-950 mb-4">
              Description produit
            </h2>

            <p className="text-brand-900/70 leading-relaxed whitespace-pre-line">
              {product.description ||
                "Aucune description détaillée n’est disponible pour ce produit."}
            </p>
          </section>

          <section className="bg-white border border-brand-100 rounded-3xl p-6 lg:p-8 h-fit">
            <h2 className="text-2xl font-bold text-brand-950 mb-5">
              Informations techniques
            </h2>

            {technicalInfos.length > 0 ? (
              <div className="divide-y divide-brand-100">
                {technicalInfos.map((item) => (
                  <div
                    key={item.label}
                    className="py-3 flex justify-between gap-4 text-sm"
                  >
                    <span className="text-brand-900/50">{item.label}</span>
                    <span className="font-medium text-brand-950 text-right break-words">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-brand-900/50">
                Les caractéristiques techniques seront complétées prochainement.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function TrustItem({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-brand-900/70">
      <Icon className="w-5 h-5 text-brand-600" />
      <span>{text}</span>
    </div>
  );
}

function StatusPill({
  label,
  variant,
}: {
  label: string;
  variant: "success" | "warning" | "brand" | "info";
}) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    brand: "bg-brand-50 text-brand-700 border-brand-100",
    info: "bg-cyan-50 text-cyan-700 border-cyan-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {label}
    </span>
  );
}