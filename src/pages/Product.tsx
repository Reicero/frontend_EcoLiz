import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
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

function decodeHtmlEntities(value: unknown) {
  let result = String(value ?? "");

  const namedEntities: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    "#039": "'",
    nbsp: " ",
    rsquo: "’",
    lsquo: "‘",
    rdquo: "”",
    ldquo: "“",
    ndash: "–",
    mdash: "—",
    hellip: "…",
    laquo: "«",
    raquo: "»",
    times: "×",
    prime: "′",
    Prime: "″",
  };

  for (let pass = 0; pass < 4; pass += 1) {
    const previousResult = result;

    result = result
      .replace(/&#x([0-9a-f]+);/gi, (_, hexadecimal: string) =>
        String.fromCodePoint(Number.parseInt(hexadecimal, 16))
      )
      .replace(/&#(\d+);/g, (_, decimal: string) =>
        String.fromCodePoint(Number.parseInt(decimal, 10))
      )
      .replace(/&([a-zA-Z0-9#]+);/g, (match, entity: string) => {
        return namedEntities[entity] ?? match;
      });

    if (result === previousResult) {
      break;
    }
  }

  return result;
}

function displayText(value: unknown) {
  return decodeHtmlEntities(value).trim();
}

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
    if (!product || !product.stock) {
      return;
    }

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

  const technicalInfos = useMemo(() => {
    if (!product) {
      return [];
    }

    return [
      {
        label: "Marque",
        value: displayText(product.manufacturer),
        icon: Tags,
      },
      {
        label: "État",
        value: displayText(product.conditionLabel || product.status),
        icon: CheckCircle2,
      },
      {
        label: "Catégorie",
        value: displayText(product.category),
        icon: Package,
      },
      {
        label: "Famille produit",
        value: displayText(product.productGroup),
        icon: Cpu,
      },
      {
        label: "Référence EcoLiz",
        value: displayText(product.sku),
        icon: Barcode,
      },
      {
        label: "Référence constructeur",
        value: displayText(product.manufacturerPartNumber),
        icon: Barcode,
      },
      {
        label: "EAN",
        value: displayText(product.ean),
        icon: Barcode,
      },
      {
        label: "Système",
        value: displayText(product.os),
        icon: Cpu,
      },
    ].filter((item) => Boolean(item.value));
  }, [product]);

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-50 pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-brand-900/60">Chargement du produit…</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-brand-50 pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/boutique"
            className="mb-6 inline-flex items-center gap-2 text-brand-700 hover:text-brand-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la boutique
          </Link>

          <div className="rounded-2xl border border-brand-100 bg-white p-8">
            <h1 className="mb-2 text-2xl font-bold text-brand-950">
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

  const productName = displayText(product.name);
  const productSpecs = displayText(product.specs);
  const productDescription = displayText(product.description);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || "/placeholder-product.png"];

  return (
    <main className="min-h-screen overflow-x-hidden bg-brand-50 pb-24 pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/boutique"
          className="mb-8 inline-flex items-center gap-2 font-medium text-brand-700 hover:text-brand-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la boutique
        </Link>

        <section className="min-w-0 overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
          <div className="grid min-w-0 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
            <div className="min-w-0 border-b border-brand-100 bg-brand-50/60 p-4 sm:p-6 xl:border-b-0 xl:border-r xl:p-8">
              <div className="aspect-[4/3] min-w-0 overflow-hidden rounded-2xl border border-brand-100 bg-white">
                <img
                  src={selectedImage || "/placeholder-product.png"}
                  alt={productName}
                  loading="lazy"
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              </div>

              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {images.slice(0, 5).map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`aspect-square min-w-0 overflow-hidden rounded-xl border bg-white transition-all ${
                        selectedImage === image
                          ? "border-brand-700 ring-2 ring-brand-700/20"
                          : "border-brand-100 hover:border-brand-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={productName}
                        className="h-full w-full object-contain mix-blend-multiply"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="min-w-0 overflow-hidden p-4 sm:p-6 xl:p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                <StatusPill
                  label={product.stock ? "En stock" : "Rupture de stock"}
                  variant={product.stock ? "success" : "warning"}
                />

                {product.conditionLabel &&
                  product.conditionLabel !== "Non renseigné" && (
                    <StatusPill
                      label={displayText(product.conditionLabel)}
                      variant="brand"
                    />
                  )}

                <StatusPill label="Garantie sur devis" variant="info" />
              </div>

              <h1 className="mb-4 max-w-full whitespace-normal break-words text-2xl font-bold leading-tight tracking-tight text-brand-950 [overflow-wrap:anywhere] sm:text-3xl xl:text-4xl">
                {productName}
              </h1>

              {productSpecs && (
                <p className="mb-6 max-w-full break-words text-sm leading-relaxed text-brand-900/60 [overflow-wrap:anywhere] sm:text-base">
                  {productSpecs}
                </p>
              )}

              <div className="mb-8 grid min-w-0 gap-3 sm:grid-cols-2">
                {technicalInfos.slice(0, 6).map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="min-w-0 rounded-2xl border border-brand-100 bg-brand-50 p-4"
                    >
                      <div className="mb-1 flex min-w-0 items-center gap-2 text-xs text-brand-900/50">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <p className="max-w-full break-words font-semibold text-brand-950 [overflow-wrap:anywhere]">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mb-8 border-b border-brand-200 pb-8">
                <p className="text-3xl font-bold text-brand-950 sm:text-4xl">
                  {formatPrice(product.price)} HT
                </p>

                {product.priceTTC && (
                  <p className="mt-2 text-base text-brand-900/60 sm:text-lg">
                    {formatPrice(product.priceTTC)} TTC
                  </p>
                )}
              </div>

              {cartSuccess && (
                <div className="mb-6 flex min-w-0 flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-950">
                      Produit ajouté au panier.
                    </p>
                    <p className="break-words text-sm text-brand-900/60">
                      Vous pouvez continuer vos achats ou consulter votre panier.
                    </p>
                  </div>

                  <Link
                    to="/panier"
                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800"
                  >
                    Voir le panier
                  </Link>
                </div>
              )}

              {cartError && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                  <p className="break-words font-semibold text-red-700">
                    {cartError}
                  </p>
                </div>
              )}

              <div className="mb-8 grid min-w-0 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.stock || addingToCart}
                  className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-4 text-center text-base font-medium text-white shadow-lg shadow-brand-900/20 transition-all hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4 shrink-0" />
                  <span className="break-words">
                    {addingToCart
                      ? "Ajout en cours..."
                      : product.stock
                        ? "Ajouter au panier"
                        : "Produit indisponible"}
                  </span>
                </button>

                <Link
                  to="/contact"
                  className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-5 py-4 text-center text-base font-medium text-brand-900 transition-all hover:bg-brand-50"
                >
                  Demander un devis
                </Link>
              </div>

              <div className="grid min-w-0 gap-3 border-t border-brand-200 pt-6 sm:grid-cols-2 xl:grid-cols-3">
                <TrustItem icon={ShieldCheck} text="Garantie sur devis" />
                <TrustItem icon={Truck} text="Livraison professionnelle" />
                <TrustItem icon={Leaf} text="Matériel reconditionné" />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
          <section className="min-w-0 rounded-3xl border border-brand-100 bg-white p-6 xl:p-8">
            <h2 className="mb-4 text-2xl font-bold text-brand-950">
              Description produit
            </h2>

            <p className="max-w-full whitespace-pre-line break-words leading-relaxed text-brand-900/70 [overflow-wrap:anywhere]">
              {productDescription ||
                "Aucune description détaillée n’est disponible pour ce produit."}
            </p>
          </section>

          <section className="h-fit min-w-0 rounded-3xl border border-brand-100 bg-white p-6 xl:p-8">
            <h2 className="mb-5 text-2xl font-bold text-brand-950">
              Informations techniques
            </h2>

            {technicalInfos.length > 0 ? (
              <div className="divide-y divide-brand-100">
                {technicalInfos.map((item) => (
                  <div
                    key={item.label}
                    className="grid min-w-0 grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-4 py-3 text-sm"
                  >
                    <span className="min-w-0 break-words text-brand-900/50">
                      {item.label}
                    </span>

                    <span className="min-w-0 break-words text-right font-medium text-brand-950 [overflow-wrap:anywhere]">
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
  icon: ElementType;
  text: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2 text-sm text-brand-900/70">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
      <span className="min-w-0 break-words">{text}</span>
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
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    brand: "border-brand-100 bg-brand-50 text-brand-700",
    info: "border-cyan-100 bg-cyan-50 text-cyan-700",
  };

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-3 py-1 text-xs font-medium ${styles[variant]}`}
    >
      <span className="break-words [overflow-wrap:anywhere]">
        {displayText(label)}
      </span>
    </span>
  );
}