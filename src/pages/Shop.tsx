import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Link } from "react-router-dom";
import {
  Filter,
  Grid3X3,
  List,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import type { Product } from "../types/product";
import {
  listCategories,
  listProducts,
  type WooCategory,
} from "../services/woocommerce";
import { formatPrice } from "../utils/formatPrice";

const PRODUCTS_PER_PAGE_OPTIONS = [12, 24, 48, 96] as const;

type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

function getSortParams(sortOption: SortOption) {
  if (sortOption === "price-asc") {
    return { orderby: "price" as const, order: "asc" as const };
  }

  if (sortOption === "price-desc") {
    return { orderby: "price" as const, order: "desc" as const };
  }

  if (sortOption === "name-asc") {
    return { orderby: "title" as const, order: "asc" as const };
  }

  if (sortOption === "name-desc") {
    return { orderby: "title" as const, order: "desc" as const };
  }

  return {};
}

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<WooCategory[]>([]);

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [productsPerPage, setProductsPerPage] = useState(24);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedStockStatuses, setSelectedStockStatuses] = useState<
    Array<"instock" | "outofstock">
  >([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setCategoriesLoading(true);

    listCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des catégories :", error);
        setCategories([]);
      })
      .finally(() => {
        setCategoriesLoading(false);
      });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      setSearchTerm(searchInput.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);

    const stockStatus =
      selectedStockStatuses.length === 1 ? selectedStockStatuses[0] : null;

    listProducts({
      page: currentPage,
      perPage: productsPerPage,
      search: searchTerm,
      categoryIds: selectedCategoryIds,
      stockStatus,
      ...getSortParams(sortOption),
    })
      .then((result) => {
        setProducts(result.products);
        setTotalProducts(result.total);
        setTotalPages(result.totalPages);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des produits :", error);
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
  currentPage,
  searchTerm,
  selectedCategoryIds,
  selectedStockStatuses,
  sortOption,
  productsPerPage,
]);

  function toggleNumberFilter(
    value: number,
    selectedValues: number[],
    setSelectedValues: Dispatch<SetStateAction<number[]>>
  ) {
    setCurrentPage(1);

    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((item) => item !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  }

  function toggleStockFilter(value: "instock" | "outofstock") {
    setCurrentPage(1);

    if (selectedStockStatuses.includes(value)) {
      setSelectedStockStatuses(
        selectedStockStatuses.filter((item) => item !== value)
      );
    } else {
      setSelectedStockStatuses([...selectedStockStatuses, value]);
    }
  }

function resetFilters() {
  setSearchInput("");
  setSearchTerm("");
  setSelectedCategoryIds([]);
  setSelectedStockStatuses([]);
  setSortOption("default");
  setProductsPerPage(24);
  setCurrentPage(1);
}
  function getPaginationPages() {
    const pages: Array<number | "..."> = [];

    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page++) {
        pages.push(page);
      }

      return pages;
    }

    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
      return pages;
    }

    if (currentPage >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
      return pages;
    }

    pages.push(
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages
    );

    return pages;
  }

  const activeFilterCount =
    selectedCategoryIds.length +
    selectedStockStatuses.length +
    (searchTerm ? 1 : 0);

  const paginationPages = getPaginationPages();

  return (
    <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-brand-700 font-semibold uppercase tracking-wide text-sm mb-3">
            Catalogue professionnel
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-brand-950 tracking-tight mb-4">
                Boutique{" "}
                <span className="font-display italic text-accent-500">
                  EcoLiz
                </span>
              </h1>

              <p className="text-lg text-brand-900/70 max-w-3xl">
                Matériel informatique professionnel, neuf et reconditionné, avec
                prix HT/TTC, disponibilité et informations techniques.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-brand-100 px-5 py-4 shadow-sm">
              <p className="text-sm text-brand-900/60">Produits trouvés</p>
              <p className="text-2xl font-bold text-brand-950">
                {totalProducts}
              </p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[290px_1fr] gap-8">
          <aside className="bg-white rounded-2xl border border-brand-100 p-5 h-fit sticky top-28">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-900/60" />
                <h2 className="font-semibold text-brand-950">Filtres</h2>
              </div>

              {activeFilterCount > 0 && (
                <span className="text-xs bg-brand-100 text-brand-700 rounded-full px-2 py-1">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-brand-950 mb-3">
                Catégorie
              </h3>

              {categoriesLoading ? (
                <p className="text-sm text-brand-900/50">
                  Chargement des catégories…
                </p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-brand-900/50">
                  Aucune catégorie disponible.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center justify-between gap-2 text-sm text-brand-900/70 cursor-pointer"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(category.id)}
                          onChange={() =>
                            toggleNumberFilter(
                              category.id,
                              selectedCategoryIds,
                              setSelectedCategoryIds
                            )
                          }
                          className="rounded border-brand-300 text-brand-700 focus:ring-brand-700"
                        />
                        <span className="truncate">{category.name}</span>
                      </span>

                      {typeof category.count === "number" && (
                        <span className="text-xs text-brand-900/40">
                          {category.count}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-brand-950 mb-3">
                Disponibilité
              </h3>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-brand-900/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStockStatuses.includes("instock")}
                    onChange={() => toggleStockFilter("instock")}
                    className="rounded border-brand-300 text-brand-700 focus:ring-brand-700"
                  />
                  <span>En stock</span>
                </label>

                <label className="flex items-center gap-2 text-sm text-brand-900/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStockStatuses.includes("outofstock")}
                    onChange={() => toggleStockFilter("outofstock")}
                    className="rounded border-brand-300 text-brand-700 focus:ring-brand-700"
                  />
                  <span>Rupture de stock</span>
                </label>
              </div>
            </div>

            <div className="mb-6 rounded-2xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-900/60">
              <p className="font-semibold text-brand-950 mb-2">
                Filtres avancés
              </p>

              <p>
                Les filtres Marque, État, OS et Product Group seront ajoutés
                quand les attributs seront synchronisés proprement dans
                WooCommerce.
              </p>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 text-sm text-brand-700 hover:text-brand-800 underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Réinitialiser les filtres
              </button>
            )}
          </aside>

          <div>
<div className="bg-white border border-brand-100 rounded-2xl p-4 mb-6 flex flex-col gap-4">
  <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
    <div className="relative flex-1 max-w-xl">
      <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-900/40" />

      <input
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Rechercher par nom, marque, référence..."
        className="w-full rounded-xl border border-brand-100 bg-brand-50 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
      />
    </div>

    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-brand-900/60">
        <span>Trier par</span>

        <select
          value={sortOption}
          onChange={(event) => {
            setCurrentPage(1);
            setSortOption(event.target.value as SortOption);
          }}
          className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-950 outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
        >
          <option value="default">Défaut</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="name-asc">Nom A-Z</option>
          <option value="name-desc">Nom Z-A</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-brand-900/60">
        <span>Afficher</span>

        <select
          value={productsPerPage}
          onChange={(event) => {
            setCurrentPage(1);
            setProductsPerPage(Number(event.target.value));
          }}
          className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-950 outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
        >
          {PRODUCTS_PER_PAGE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} / page
            </option>
          ))}
        </select>
      </label>
    </div>
  </div>

  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-2 text-sm text-brand-900/60">
      <SlidersHorizontal className="w-4 h-4" />
      Page {currentPage} / {totalPages}
    </div>

          <div className="flex items-center gap-1 bg-brand-50 border border-brand-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-brand-900/40 hover:text-brand-900"
              }`}
              aria-label="Vue liste"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-brand-900/40 hover:text-brand-900"
              }`}
              aria-label="Vue grille"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-brand-100 py-20 text-center text-brand-900/50">
                Chargement du catalogue…
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-brand-100 py-20 text-center text-brand-900/50">
                Aucun produit ne correspond aux filtres sélectionnés.
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-3">
                {products.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductGridItem key={product.id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 rounded-full border border-emerald-200 bg-white/70 text-brand-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                >
                  Précédent
                </button>

                {paginationPages.map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-2 text-brand-900/50"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                      className={`w-11 h-11 rounded-full border transition-colors ${
                        currentPage === page
                          ? "bg-brand-700 text-white border-brand-700"
                          : "bg-white/70 text-brand-900 border-emerald-200 hover:bg-emerald-50"
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || loading}
                  className="px-4 py-2 rounded-full border border-emerald-200 bg-white/70 text-brand-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductListItem({ product }: { product: Product }) {
  return (
    <Link
      to={`/produit/${product.slug}`}
      className="group bg-white border border-brand-100 rounded-2xl p-4 flex gap-5 hover:shadow-lg hover:shadow-brand-900/10 transition-all"
    >
      <div className="w-32 h-28 sm:w-40 sm:h-32 bg-brand-50 rounded-xl border border-brand-100 overflow-hidden flex-shrink-0">
        <img
          src={product.image || "/placeholder-product.png"}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-[1.03] transition-transform duration-300"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <StatusPill
            label={product.stock ? "En stock" : "Rupture"}
            variant={product.stock ? "success" : "warning"}
          />

          {product.conditionLabel &&
            product.conditionLabel !== "Non renseigné" && (
              <StatusPill label={product.conditionLabel} variant="brand" />
            )}

          {product.manufacturer && (
            <span className="text-xs text-brand-900/50">
              {product.manufacturer}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-brand-950 mb-2 line-clamp-2 group-hover:text-brand-700 transition-colors">
          {product.name}
        </h3>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-1 text-xs text-brand-900/60 mb-3">
          {product.sku && <InfoLine label="SKU" value={product.sku} />}

          {product.manufacturerPartNumber && (
            <InfoLine label="Réf." value={product.manufacturerPartNumber} />
          )}

          {product.category && (
            <InfoLine label="Catégorie" value={product.category} />
          )}

          {product.productGroup && (
            <InfoLine label="Famille" value={product.productGroup} />
          )}
        </div>

        {product.specs && (
          <p className="text-sm text-brand-900/60 line-clamp-2">
            {product.specs}
          </p>
        )}
      </div>

      <div className="hidden md:flex flex-col items-end justify-between min-w-[150px]">
        <div className="text-right">
          <p className="text-2xl font-bold text-brand-950">
            {formatPrice(product.price)} HT
          </p>

          {product.priceTTC && (
            <p className="text-sm text-brand-900/50">
              {formatPrice(product.priceTTC)} TTC
            </p>
          )}
        </div>

        <span className="text-sm font-medium text-brand-700 group-hover:underline">
          Voir le produit →
        </span>
      </div>
    </Link>
  );
}

function ProductGridItem({ product }: { product: Product }) {
  return (
    <Link
      to={`/produit/${product.slug}`}
      className="group bg-white border border-brand-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-brand-900/10 transition-all flex flex-col"
    >
      <div className="relative aspect-[4/3] bg-brand-50">
        <img
          src={product.image || "/placeholder-product.png"}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-[1.03] transition-transform duration-300"
        />

        <div className="absolute top-3 right-3">
          <StatusPill
            label={product.stock ? "En stock" : "Rupture"}
            variant={product.stock ? "success" : "warning"}
          />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-brand-950 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <div className="space-y-1 text-xs text-brand-900/60 mb-4">
          {product.manufacturer && (
            <InfoLine label="Marque" value={product.manufacturer} />
          )}

          {product.conditionLabel && (
            <InfoLine label="État" value={product.conditionLabel} />
          )}

          {product.sku && <InfoLine label="SKU" value={product.sku} />}
        </div>

        <div className="mt-auto">
          <p className="text-2xl font-bold text-brand-950">
            {formatPrice(product.price)} HT
          </p>

          {product.priceTTC && (
            <p className="text-sm text-brand-900/50">
              {formatPrice(product.priceTTC)} TTC
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="truncate">
      <span className="font-medium text-brand-900/70">{label} :</span>{" "}
      <span>{value}</span>
    </p>
  );
}

function StatusPill({
  label,
  variant,
}: {
  label: string;
  variant: "success" | "warning" | "brand";
}) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    brand: "bg-brand-50 text-brand-700 border-brand-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {label}
    </span>
  );
}