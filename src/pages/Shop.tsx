import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Filter } from "lucide-react";
import { formatPrice, calculateDiscount } from "../utils/formatPrice";
import { Badge } from "../components/ui/Badge";
import type { Product } from "../types/product";
import { listProducts } from "../services/woocommerce";

export function Shop() {
  const [activeCategory, setActiveCategory] = useState<string>("Tous");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    listProducts()
      .then((data) => setProducts(data))
      .catch((error) => {
        console.error("Erreur lors de la récupération des produits :", error);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const productCategories = [
    { value: "Tous", label: "Tous" },
    ...Array.from(new Set(products.map((product) => product.category))).map(
      (category) => ({ value: category, label: category })
    ),
  ];

  const filteredProducts =
    activeCategory === "Tous"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
            Catalogue
          </p>

          <h1 className="text-5xl font-bold text-brand-950 tracking-tight mb-4">
            Boutique{" "}
            <span className="font-display italic text-accent-500">
              reconditionnée
            </span>
          </h1>

          <p className="text-lg text-brand-900/70 max-w-2xl">
            Découvrez notre sélection complète de matériel informatique
            professionnel reconditionné en France.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b border-brand-200">
          <Filter className="w-4 h-4 text-brand-900/60 mr-2" />

          {productCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.value
                  ? "bg-brand-700 text-white"
                  : "bg-white text-brand-900/70 hover:bg-brand-100 border border-brand-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-brand-900/50">
            Chargement du catalogue…
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-brand-900/50">
            Aucun produit trouvé dans cette catégorie.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/produit/${product.slug}`}
                className="group flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-white rounded-2xl overflow-hidden mb-5 border border-brand-100 group-hover:shadow-lg group-hover:shadow-brand-900/10 transition-all duration-300">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-[1.02] transition-transform duration-500"
                  />

                  <div className="absolute top-3 right-3">
                    <Badge tone={product.stock ? "success" : "warning"} outline>
                      {product.stock ? "En stock" : "Sur commande"}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-brand-950 mb-1">
                  {product.name}
                </h3>

                <p className="text-sm text-brand-900/60 mb-1">
                  {product.specs}
                </p>

                {product.grade && (
                  <p className="text-xs text-brand-700 font-medium mb-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    {product.grade}
                  </p>
                )}

                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-brand-950">
                    {formatPrice(product.price)}
                  </span>

                  {product.originalPrice > product.price && (
                    <>
                      <span className="text-sm text-brand-900/40 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>

                      <span className="text-xs font-medium text-brand-700 bg-brand-100 px-2 py-1 rounded">
                        -
                        {calculateDiscount(
                          product.price,
                          product.originalPrice
                        )}
                        %
                      </span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}