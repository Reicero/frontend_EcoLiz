import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Filter } from "lucide-react";
import { formatPrice, calculateDiscount } from "../utils/formatPrice";
import { Badge } from "../components/ui/Badge";
import type { Product } from "../types/product";
import { listProducts } from "../services/woocommerce";

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);

  const PRODUCTS_PER_PAGE = 12;

  useEffect(() => {
    setLoading(true);
listProducts()
  .then((data) => {
    console.log("Produits récupérés :", data);
    console.log("Premier produit :", data[0]);

    console.log(
      "Marques trouvées :",
      data.map((p) => p.manufacturer).filter(Boolean)
    );

    console.log(
      "États trouvés :",
      data.map((p) => p.status).filter(Boolean)
    );

    console.log(
      "OS trouvés :",
      data.map((p) => p.os).filter(Boolean)
    );

    setProducts(data);
  })
  .catch((error) => {
    console.error("Erreur lors de la récupération des produits :", error);
    setProducts([]);
  })
  .finally(() => setLoading(false));
  }, []);

  function getUniqueValues(values: (string | undefined)[]) {
    return Array.from(
      new Set(values.filter((value): value is string => Boolean(value)))
    ).sort();
  }

  function toggleFilter(
    value: string,
    selectedValues: string[],
    setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    setCurrentPage(1);

    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((item) => item !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  }

  const categoryFilters = getUniqueValues(
    products.map((product) => product.category)
  );

  const manufacturerFilters = getUniqueValues(
    products.map((product) => product.manufacturer)
  );

  const statusFilters = getUniqueValues(
    products.map((product) => product.status)
  );

  const availabilityFilters = ["En stock", "Rupture de stock"];

  const filteredProducts = products.filter((product) => {
    const matchCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);

    const matchManufacturer =
      selectedManufacturers.length === 0 ||
      (product.manufacturer &&
        selectedManufacturers.includes(product.manufacturer));

    const matchStatus =
      selectedStatuses.length === 0 ||
      (product.status && selectedStatuses.includes(product.status));

    const matchAvailability =
      selectedAvailability.length === 0 ||
      selectedAvailability.includes(product.stock ? "En stock" : "Rupture de stock");

    return matchCategory && matchManufacturer && matchStatus && matchAvailability;
  });

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const getPaginationPages = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 8) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, "...", totalPages - 2, totalPages - 1, totalPages);
      return pages;
    }

    if (currentPage >= totalPages - 3) {
      pages.push(1, 2, 3, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      return pages;
    }

    pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    return pages;
  };

  const paginationPages = getPaginationPages();

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

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          <aside className="bg-white rounded-2xl border border-brand-100 p-5 h-fit">
            <div className="flex items-center gap-2 mb-5">
              <Filter className="w-4 h-4 text-brand-900/60" />
              <h2 className="font-semibold text-brand-950">Filtres</h2>
            </div>

            <FilterGroup
              title="Catégorie"
              values={categoryFilters}
              selectedValues={selectedCategories}
              onToggle={(value) =>
                toggleFilter(value, selectedCategories, setSelectedCategories)
              }
            />

            <FilterGroup
              title="Marque"
              values={manufacturerFilters}
              selectedValues={selectedManufacturers}
              onToggle={(value) =>
                toggleFilter(value, selectedManufacturers, setSelectedManufacturers)
              }
            />

            <FilterGroup
              title="État"
              values={statusFilters}
              selectedValues={selectedStatuses}
              onToggle={(value) =>
                toggleFilter(value, selectedStatuses, setSelectedStatuses)
              }
            />

            <FilterGroup
              title="Disponibilité"
              values={availabilityFilters}
              selectedValues={selectedAvailability}
              onToggle={(value) =>
                toggleFilter(value, selectedAvailability, setSelectedAvailability)
              }
            />

            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedManufacturers([]);
                setSelectedStatuses([]);
                setSelectedAvailability([]);
                setCurrentPage(1);
              }}
              className="mt-2 text-sm text-brand-700 hover:text-brand-800 underline"
            >
              Réinitialiser les filtres
            </button>
          </aside>

          <div>
            {loading ? (
              <div className="text-center py-20 text-brand-900/50">
                Chargement du catalogue…
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-brand-900/50">
                Aucun produit ne correspond aux filtres sélectionnés.
              </div>
            ) : (
              <>
                <div className="mb-6 text-sm text-brand-900/60">
                  {filteredProducts.length} produit
                  {filteredProducts.length > 1 ? "s" : ""} trouvé
                  {filteredProducts.length > 1 ? "s" : ""}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {paginatedProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/produit/${product.slug}`}
                      className="group flex flex-col"
                    >
                      <div className="relative aspect-[4/3] bg-white rounded-2xl overflow-hidden mb-5 border border-brand-100 group-hover:shadow-lg group-hover:shadow-brand-900/10 transition-all duration-300">
                        <img
                          src={product.image || "/placeholder-product.png"}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover mix-blend-multiply group-hover:scale-[1.02] transition-transform duration-500"
                        />

                        <div className="absolute top-3 right-3">
                          <Badge tone={product.stock ? "success" : "warning"} outline>
                            {product.availability ??
                              (product.stock ? "En stock" : "Rupture de stock")}
                          </Badge>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-brand-950 mb-1">
                        {product.name}
                      </h3>

                      {product.specs && (
                        <p className="text-sm text-brand-900/60 mb-1 line-clamp-2">
                          {product.specs}
                        </p>
                      )}

                      {product.manufacturer && (
                        <p className="text-xs text-brand-900/50 mb-1">
                          Marque : {product.manufacturer}
                        </p>
                      )}

                      {product.grade && product.grade !== "Non renseigné" && (
                        <p className="text-xs text-brand-700 font-medium mb-3 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                          {product.grade}
                        </p>
                      )}

                      <div className="mt-auto">
                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-bold text-brand-950">
                            {formatPrice(product.price)} HT
                          </span>

                          {product.originalPrice > product.price && (
                            <>
                              <span className="text-sm text-brand-900/40 line-through">
                                {formatPrice(product.originalPrice)} HT
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

                        {product.priceTTC && (
                          <p className="text-sm text-brand-900/60 mt-1">
                            {formatPrice(product.priceTTC)} TTC
                          </p>
                        )}

                        <p className="text-xs text-brand-900/50 mt-2">
                          Garantie : sur devis
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
                    <button
                      onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-full border border-emerald-200 bg-white/70 text-brand-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                    >
                      Précédent
                    </button>

                    {paginationPages.map((page, index) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-3 py-2 text-brand-900/60"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-11 h-11 rounded-full border transition-colors ${
                            currentPage === page
                              ? "bg-brand-700 text-white border-brand-700"
                              : "bg-white/70 text-brand-900 border-emerald-200 hover:bg-emerald-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((page) => Math.min(page + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-full border border-emerald-200 bg-white/70 text-brand-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterGroup({
  title,
  values,
  selectedValues,
  onToggle,
}: {
  title: string;
  values: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}) {
  if (values.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-brand-950 mb-3">{title}</h3>

      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {values.map((value) => (
          <label
            key={value}
            className="flex items-center gap-2 text-sm text-brand-900/70 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(value)}
              onChange={() => onToggle(value)}
              className="rounded border-brand-300 text-brand-700 focus:ring-brand-700"
            />
            <span>{value}</span>
          </label>
        ))}
      </div>
    </div>
  );
}