import { useEffect, useMemo, useState } from "react";
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
import { listProducts } from "../services/woocommerce";
import { formatPrice } from "../utils/formatPrice";

const PRODUCTS_PER_PAGE = 20;

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedProductGroups, setSelectedProductGroups] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);

    listProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des produits :", error);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function getUniqueValues(values: Array<string | undefined>) {
    return Array.from(
      new Set(values.filter((value): value is string => Boolean(value)))
    ).sort((a, b) => a.localeCompare(b));
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

  function resetFilters() {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedManufacturers([]);
    setSelectedStatuses([]);
    setSelectedProductGroups([]);
    setSelectedAvailability([]);
    setCurrentPage(1);
  }

  const categoryFilters = useMemo(
    () => getUniqueValues(products.map((product) => product.category)),
    [products]
  );

  const manufacturerFilters = useMemo(
    () => getUniqueValues(products.map((product) => product.manufacturer)),
    [products]
  );

  const statusFilters = useMemo(
    () =>
      getUniqueValues(
        products.map((product) => product.conditionLabel || product.status)
      ),
    [products]
  );

  const productGroupFilters = useMemo(
    () => getUniqueValues(products.map((product) => product.productGroup)),
    [products]
  );

  const availabilityFilters = ["En stock", "Rupture de stock"];

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase().trim();

    const searchContent = [
      product.name,
      product.sku,
      product.manufacturer,
      product.manufacturerPartNumber,
      product.category,
      product.productGroup,
      product.os,
      product.specs,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchSearch = search.length === 0 || searchContent.includes(search);

    const matchCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);

    const matchManufacturer =
      selectedManufacturers.length === 0 ||
      (product.manufacturer &&
        selectedManufacturers.includes(product.manufacturer));

    const productStatus = product.conditionLabel || product.status;

    const matchStatus =
      selectedStatuses.length === 0 ||
      (productStatus && selectedStatuses.includes(productStatus));

    const matchProductGroup =
      selectedProductGroups.length === 0 ||
      (product.productGroup &&
        selectedProductGroups.includes(product.productGroup));

    const availability = product.stock ? "En stock" : "Rupture de stock";

    const matchAvailability =
      selectedAvailability.length === 0 ||
      selectedAvailability.includes(availability);

    return (
      matchSearch &&
      matchCategory &&
      matchManufacturer &&
      matchStatus &&
      matchProductGroup &&
      matchAvailability
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const activeFilterCount =
    selectedCategories.length +
    selectedManufacturers.length +
    selectedStatuses.length +
    selectedProductGroups.length +
    selectedAvailability.length +
    (searchTerm ? 1 : 0);

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
              <p className="text-sm text-brand-900/60">Produits affichés</p>
              <p className="text-2xl font-bold text-brand-950">
                {filteredProducts.length}
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
                toggleFilter(
                  value,
                  selectedManufacturers,
                  setSelectedManufacturers
                )
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
              title="Famille produit"
              values={productGroupFilters}
              selectedValues={selectedProductGroups}
              onToggle={(value) =>
                toggleFilter(
                  value,
                  selectedProductGroups,
                  setSelectedProductGroups
                )
              }
            />

            <FilterGroup
              title="Disponibilité"
              values={availabilityFilters}
              selectedValues={selectedAvailability}
              onToggle={(value) =>
                toggleFilter(
                  value,
                  selectedAvailability,
                  setSelectedAvailability
                )
              }
            />

            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 inline-flex items-center gap-2 text-sm text-brand-700 hover:text-brand-800 underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          </aside>

          <div>
            <div className="bg-white border border-brand-100 rounded-2xl p-4 mb-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-xl">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-900/40" />

                <input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Rechercher par nom, marque, référence..."
                  className="w-full rounded-xl border border-brand-100 bg-brand-50 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                />
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-4">
                <div className="flex items-center gap-2 text-sm text-brand-900/60">
                  <SlidersHorizontal className="w-4 h-4" />
                  {filteredProducts.length} produit
                  {filteredProducts.length > 1 ? "s" : ""} trouvé
                  {filteredProducts.length > 1 ? "s" : ""}
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
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-brand-100 py-20 text-center text-brand-900/50">
                Aucun produit ne correspond à votre recherche.
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-3">
                {paginatedProducts.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductGridItem key={product.id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-full border border-emerald-200 bg-white/70 text-brand-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                >
                  Précédent
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .slice(Math.max(0, currentPage - 3), currentPage + 2)
                  .map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-11 h-11 rounded-full border transition-colors ${
                        currentPage === page
                          ? "bg-brand-700 text-white border-brand-700"
                          : "bg-white/70 text-brand-900 border-emerald-200 hover:bg-emerald-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  type="button"
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

          {product.conditionLabel && product.conditionLabel !== "Non renseigné" && (
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