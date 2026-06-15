import { useEffect, useState } from "react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BadgePercent,
  Briefcase,
  ChevronDown,
  Filter,
  Grid3X3,
  KeyRound,
  Laptop,
  List,
  Monitor,
  Network,
  RotateCcw,
  Search,
  Server,
  ShoppingCart,
  SlidersHorizontal,
  Wifi,
} from "lucide-react";

import type { Product } from "../types/product";
import {
  listCategories,
  listProductFilterGroups,
  listProducts,
  type ProductFilterKey,
  type SelectedProductFilters,
  type WooCategory,
  type WooFilterGroup,
  type WooFilterOption,
} from "../services/woocommerce";
import { formatPrice } from "../utils/formatPrice";

const PRODUCTS_PER_PAGE_OPTIONS = [12, 24, 48, 96] as const;
const WOOCOMMERCE_CART_URL =
  import.meta.env.VITE_WOOCOMMERCE_CART_URL ??
  "http://90.51.128.107:12443/index.php/panier";

type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

type SelectedFilters = SelectedProductFilters;

type CategoryGroup = {
  title: string;
  children: WooCategory[];
};

const CATEGORY_ORDER = [
  "Notebooks",
  "Workstations",
  "Réseau",
  "Wi-Fi",
  "Server / Stockage",
  "Licence",
  "Écrans",
] as const;

const FILTERS_BY_CATEGORY: Record<string, string[]> = {
  notebooks: [
    "marque",
    "etat",
    "processeur",
    "ram",
    "stockage",
    "type-de-stockage",
    "os",
    "taille-ecran",
    "carte-graphique",
  ],
  workstations: [
    "marque",
    "etat",
    "processeur",
    "ram",
    "stockage",
    "type-de-stockage",
    "os",
    "taille-ecran",
    "carte-graphique",
  ],
  reseau: [
    "marque",
    "etat",
    "type-equipement",
    "nombre-de-ports",
    "debit-reseau",
    "poe",
    "ports",
    "switch",
  ],
  wifi: ["marque", "etat", "norme-wifi", "wifi", "debit-reseau", "poe"],
  serveur: [
    "marque",
    "etat",
    "processeur",
    "ram",
    "stockage",
    "type-de-stockage",
    "raid",
    "serveur",
  ],
  licence: ["marque", "type-licence", "licence", "os"],
  ecrans: [
    "marque",
    "etat",
    "taille-ecran",
    "resolution",
    "technologie-dalle",
  ],
};

const PROMOTION_CARDS = [
  {
    badge: "-15%",
    title: "Promotion notebooks",
    description: "Une sélection de PC portables professionnels reconditionnés.",
    accent: "from-brand-950 to-sky-700",
  },
  {
    badge: "-10%",
    title: "Stations de travail",
    description: "Workstations performantes pour les usages professionnels.",
    accent: "from-sky-700 to-cyan-500",
  },
  {
    badge: "-20%",
    title: "Écrans reconditionnés",
    description: "Écrans, accessoires et périphériques à prix réduits.",
    accent: "from-brand-800 to-brand-600",
  },
] as const;

const CATEGORY_ICONS = {
  Notebooks: Laptop,
  Workstations: Briefcase,
  Réseau: Network,
  "Server / Stockage": Server,
  "Wi-Fi": Wifi,
  Licence: KeyRound,
  Écrans: Monitor,
} as const;

const CATEGORY_DETAILS: Record<
  string,
  {
    description: string;
    color: string;
    icon: string;
  }
> = {
  Notebooks: {
    description: "PC portables, docks, tablettes et mobilité pro.",
    color: "from-sky-500 to-cyan-400",
    icon: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  Workstations: {
    description: "Postes fixes et stations puissantes pour le bureau.",
    color: "from-brand-800 to-sky-600",
    icon: "bg-brand-50 text-brand-800 ring-brand-100",
  },
  Réseau: {
    description: "Switchs, routeurs, firewalls et équipements réseau.",
    color: "from-cyan-500 to-sky-700",
    icon: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  },
  "Wi-Fi": {
    description: "Bornes, contrôleurs et solutions sans fil.",
    color: "from-sky-400 to-blue-600",
    icon: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  "Server / Stockage": {
    description: "Serveurs, stockage, RAID et pièces datacenter.",
    color: "from-brand-950 to-brand-700",
    icon: "bg-brand-50 text-brand-800 ring-brand-100",
  },
  Licence: {
    description: "Logiciels, licences et systèmes professionnels.",
    color: "from-cyan-600 to-brand-700",
    icon: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  },
  Écrans: {
    description: "Moniteurs, résolutions et formats de travail.",
    color: "from-sky-600 to-brand-700",
    icon: "bg-sky-50 text-sky-700 ring-sky-100",
  },
};

function getCategorySlug(title: string) {
  const slugMap: Record<string, string> = {
    Notebooks: "notebooks",
    Workstations: "workstations",
    Réseau: "reseau",
    "Wi-Fi": "wifi",
    "Server / Stockage": "serveur",
    Licence: "licence",
    Écrans: "ecrans",
  };

  return slugMap[title] ?? normalizeText(title).replace(/\s+/g, "-");
}

function getSortParams(sortOption: SortOption) {
  switch (sortOption) {
    case "price-asc":
      return { orderby: "price" as const, order: "asc" as const };
    case "price-desc":
      return { orderby: "price" as const, order: "desc" as const };
    case "name-asc":
      return { orderby: "title" as const, order: "asc" as const };
    case "name-desc":
      return { orderby: "title" as const, order: "desc" as const };
    default:
      return {};
  }
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeFilterValue(value: unknown) {
  return normalizeText(decodeHtmlEntities(String(value ?? "")))
    .replace(/[’']/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function decodeHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    "#039": "'",
    rsquo: "’",
    Prime: "″",
    prime: "′",
    eacute: "é",
    egrave: "è",
    ecirc: "ê",
    agrave: "à",
    ugrave: "ù",
    ccedil: "ç",
  };

  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hexadecimal: string) =>
      String.fromCodePoint(Number.parseInt(hexadecimal, 16))
    )
    .replace(/&#(\d+);/g, (_, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10))
    )
    .replace(/&([a-zA-Z0-9#]+);/g, (match, entity: string) => {
      return namedEntities[entity] ?? match;
    });
}

function getCategoryDisplayName(name: string) {
  const decodedName = decodeHtmlEntities(name);

  const labels: Record<string, string> = {
    "Ordinateurs portables & Mobilité": "Notebooks",
    "PC fixes & Workstations": "Workstations",
    "Réseau & Wi-Fi": "Réseau",
    "Serveurs & Stockage": "Server / Stockage",
    "Licences & Logiciels": "Licence",
    "Écrans & accessoires": "Écrans",
    "Docks et stations d'accueil": "Docks / stations d’accueil",
    "Sacs et housses": "Accessoires mobilité",
    "Routeurs & Firewalls": "Routeurs / Firewalls",
    "Rails et accessoires rack": "Rails / accessoires rack",
  };

  return labels[decodedName] ?? decodedName;
}

function getParentGroupTitle(category: WooCategory) {
  const name = normalizeText(decodeHtmlEntities(category.name));

  if (name.includes("ordinateurs portables")) return "Notebooks";

  if (name.includes("pc fixes") || name.includes("workstations")) {
    return "Workstations";
  }

  if (name.includes("reseau")) return "Réseau";

  if (name.includes("serveurs") || name.includes("stockage")) {
    return "Server / Stockage";
  }

  if (name.includes("licences") || name.includes("logiciels")) {
    return "Licence";
  }

  if (name.includes("ecrans")) return "Écrans";

  return null;
}

function isWifiCategory(category: WooCategory) {
  const name = normalizeText(decodeHtmlEntities(category.name));
  return name.includes("wi-fi") || name.includes("wifi");
}

function getCategoryGroups(categories: WooCategory[]) {
  const visibleCategories = categories.filter(
    (category) => (category.count ?? 0) > 0
  );

  const parentCategories = visibleCategories.filter(
    (category) => category.parent === 0
  );

  const childCategories = visibleCategories.filter(
    (category) => category.parent !== 0
  );

  const parentsById = new Map(
    parentCategories.map((category) => [category.id, category])
  );

  const groups = new Map<string, CategoryGroup>();

  CATEGORY_ORDER.forEach((title) => {
    groups.set(title, {
      title,
      children: [],
    });
  });

  function addChild(groupTitle: string, category: WooCategory) {
    const group = groups.get(groupTitle);

    if (!group) return;

    const alreadyExists = group.children.some(
      (child) => child.id === category.id
    );

    if (!alreadyExists) {
      group.children.push(category);
    }
  }

  childCategories.forEach((category) => {
    const parent = parentsById.get(category.parent);

    if (!parent) return;

    const parentTitle = getParentGroupTitle(parent);

    if (!parentTitle) return;

    if (parentTitle === "Réseau" && isWifiCategory(category)) {
      addChild("Wi-Fi", category);
      return;
    }

    addChild(parentTitle, category);
  });

  parentCategories.forEach((category) => {
    const hasVisibleChildren = childCategories.some(
      (child) => child.parent === category.id
    );

    if (hasVisibleChildren) return;

    const parentTitle = getParentGroupTitle(category);

    if (!parentTitle) return;

    addChild(parentTitle, category);
  });

  return CATEGORY_ORDER.map((title) => groups.get(title)).filter(
    (group): group is CategoryGroup =>
      Boolean(group && group.children.length > 0)
  );
}

function getVisibleFilterGroups(
  filterGroups: WooFilterGroup[],
  selectedMainCategoryTitle: string | null
) {
  if (!selectedMainCategoryTitle) return [];

  const categorySlug = getCategorySlug(selectedMainCategoryTitle);
  const allowedFilterKeys = FILTERS_BY_CATEGORY[categorySlug] ?? [];

  return filterGroups.filter((group) => {
    const normalizedKey = normalizeText(group.key).replace(/_/g, "-");
    const normalizedTitle = normalizeText(group.title).replace(/\s+/g, "-");

    return allowedFilterKeys.some((key) => {
      const normalizedAllowedKey = normalizeText(key);
      return (
        normalizedKey.includes(normalizedAllowedKey) ||
        normalizedTitle.includes(normalizedAllowedKey)
      );
    });
  });
}

function getProductAttributeValues(product: Product, group: WooFilterGroup) {
  const productAttributes = product.attributes ?? [];
  const normalizedTitle = normalizeText(group.title);
  const normalizedKey = normalizeText(group.key).replace(/_/g, "-");

  return productAttributes.flatMap((attribute) => {
    const normalizedAttributeName = normalizeText(attribute.name).replace(
      /\s+/g,
      "-"
    );

    const matchesGroup =
      normalizedAttributeName === normalizedTitle.replace(/\s+/g, "-") ||
      normalizedAttributeName.includes(normalizedTitle.replace(/\s+/g, "-")) ||
      normalizedTitle.includes(normalizedAttributeName) ||
      normalizedAttributeName.includes(normalizedKey);

    return matchesGroup ? attribute.values : [];
  });
}

function buildContextualFilterGroups(
  filterGroups: WooFilterGroup[],
  products: Product[],
  selectedMainCategoryTitle: string | null
) {
  const visibleGroups = getVisibleFilterGroups(
    filterGroups,
    selectedMainCategoryTitle
  );

  if (products.length === 0) {
    return visibleGroups;
  }

  return visibleGroups
    .map((group) => {
      const availableValues = new Set<string>();

      products.forEach((product) => {
        getProductAttributeValues(product, group).forEach((value) => {
          availableValues.add(normalizeFilterValue(value));
        });
      });

      return {
        ...group,
        options: group.options.filter((option) =>
          availableValues.has(normalizeFilterValue(option.name))
        ),
      };
    })
    .filter((group) => group.options.length > 0);
}

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<WooCategory[]>([]);
  const [filterGroups, setFilterGroups] = useState<WooFilterGroup[]>([]);
  const [categoryFilterProducts, setCategoryFilterProducts] = useState<
    Product[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [filterGroupsLoading, setFilterGroupsLoading] = useState(false);
  const [contextualFiltersLoading, setContextualFiltersLoading] =
    useState(false);

  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [expandedCategoryGroup, setExpandedCategoryGroup] = useState<
    string | null
  >(null);
  const [expandedFilterGroup, setExpandedFilterGroup] = useState<string | null>(
    null
  );

  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [productsPerPage, setProductsPerPage] = useState(24);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedMainCategoryTitle, setSelectedMainCategoryTitle] = useState<
    string | null
  >(null);
  const [selectedStockStatuses, setSelectedStockStatuses] = useState<
    Array<"instock" | "outofstock">
  >([]);

  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const selectedCategoryKey = selectedCategoryIds.join(",");

  useEffect(() => {
    setCategoriesLoading(true);

    listCategories()
      .then(setCategories)
      .catch((error) => {
        console.error("Erreur lors de la récupération des catégories :", error);
        setCategories([]);
      })
      .finally(() => {
        setCategoriesLoading(false);
      });
  }, []);

  useEffect(() => {
    setFilterGroupsLoading(true);

    listProductFilterGroups()
      .then(setFilterGroups)
      .catch((error) => {
        console.error(
          "Erreur lors de la récupération des filtres WooCommerce :",
          error
        );
        setFilterGroups([]);
      })
      .finally(() => {
        setFilterGroupsLoading(false);
      });
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCurrentPage(1);
      setSearchTerm(searchInput.trim());
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    if (
      searchTerm ||
      !selectedMainCategoryTitle ||
      selectedCategoryIds.length === 0
    ) {
      setCategoryFilterProducts([]);
      setContextualFiltersLoading(false);
      return;
    }

    async function loadCategoryProductsForFilters() {
      setContextualFiltersLoading(true);

      try {
        const firstPage = await listProducts({
          page: 1,
          perPage: 100,
          categoryIds: selectedCategoryIds,
        });

        const extraPages = Array.from(
          { length: Math.max(firstPage.totalPages - 1, 0) },
          (_, index) => index + 2
        );

        const extraResults = await Promise.all(
          extraPages.map((page) =>
            listProducts({
              page,
              perPage: 100,
              categoryIds: selectedCategoryIds,
            })
          )
        );

        const allProducts = [
          ...firstPage.products,
          ...extraResults.flatMap((result) => result.products),
        ];

        if (!cancelled) {
          setCategoryFilterProducts(allProducts);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des filtres de catégorie :",
          error
        );

        if (!cancelled) {
          setCategoryFilterProducts([]);
        }
      } finally {
        if (!cancelled) {
          setContextualFiltersLoading(false);
        }
      }
    }

    loadCategoryProductsForFilters();

    return () => {
      cancelled = true;
    };
  }, [searchTerm, selectedMainCategoryTitle, selectedCategoryKey]);

  useEffect(() => {
    let cancelled = false;
    const isSearching = searchTerm.length > 0;

    setLoading(true);

    if (!isSearching && selectedCategoryIds.length === 0) {
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    const stockStatus =
      !isSearching && selectedStockStatuses.length === 1
        ? selectedStockStatuses[0]
        : null;

    listProducts({
      page: currentPage,
      perPage: productsPerPage,
      search: searchTerm || undefined,
      categoryIds: isSearching ? undefined : selectedCategoryIds,
      stockStatus,
      attributeFilters: isSearching ? {} : selectedFilters,
      ...getSortParams(sortOption),
    })
      .then((result) => {
        if (cancelled) return;

        setProducts(result.products);
        setTotalProducts(result.total);
        setTotalPages(Math.max(result.totalPages, 1));
      })
      .catch((error) => {
        if (cancelled) return;

        console.error("Erreur lors de la récupération des produits :", error);
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    currentPage,
    searchTerm,
    selectedCategoryIds,
    selectedStockStatuses,
    selectedFilters,
    sortOption,
    productsPerPage,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  function toggleNumberFilter(
    value: number,
    selectedValues: number[],
    setSelectedValues: Dispatch<SetStateAction<number[]>>
  ) {
    setCurrentPage(1);

    setSelectedValues(
      selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value]
    );
  }

  function toggleStockFilter(value: "instock" | "outofstock") {
    setCurrentPage(1);

    setSelectedStockStatuses((currentStatuses) =>
      currentStatuses.includes(value)
        ? currentStatuses.filter((item) => item !== value)
        : [...currentStatuses, value]
    );
  }

  function toggleTextFilter(filterKey: ProductFilterKey, optionSlug: string) {
    setCurrentPage(1);

    setSelectedFilters((currentFilters) => {
      const currentOptions = currentFilters[filterKey] ?? [];

      return {
        ...currentFilters,
        [filterKey]: currentOptions.includes(optionSlug)
          ? currentOptions.filter((item) => item !== optionSlug)
          : [...currentOptions, optionSlug],
      };
    });
  }

  function toggleFilterGroup(groupKey: string) {
    setExpandedFilterGroup((currentGroup) =>
      currentGroup === groupKey ? null : groupKey
    );
  }

  function resetFilters() {
    setSearchInput("");
    setSearchTerm("");
    setSelectedCategoryIds([]);
    setSelectedMainCategoryTitle(null);
    setSelectedStockStatuses([]);
    setSelectedFilters({});
    setExpandedCategoryGroup(null);
    setExpandedFilterGroup(null);
    setSortOption("default");
    setProductsPerPage(24);
    setCurrentPage(1);
  }

  function selectMainCategory(group: CategoryGroup) {
    setSearchInput("");
    setSearchTerm("");
    setSelectedMainCategoryTitle(group.title);
    setSelectedCategoryIds(group.children.map((category) => category.id));
    setSelectedStockStatuses([]);
    setSelectedFilters({});
    setExpandedCategoryGroup(group.title);
    setExpandedFilterGroup(null);
    setCurrentPage(1);
  }

  function returnToCategories() {
    setSelectedMainCategoryTitle(null);
    setSelectedCategoryIds([]);
    setSelectedStockStatuses([]);
    setSelectedFilters({});
    setExpandedCategoryGroup(null);
    setExpandedFilterGroup(null);
    setCurrentPage(1);
  }

  function handleAddToCart(event: MouseEvent, product: Product) {
    event.preventDefault();
    event.stopPropagation();

    window.location.href = `${WOOCOMMERCE_CART_URL}?add-to-cart=${product.id}`;
  }

  function getPaginationPages() {
    const pages: Array<number | "..."> = [];

    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }

      return pages;
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  }

  const categoryGroups = getCategoryGroups(categories);
  const selectedMainCategory =
    categoryGroups.find((group) => group.title === selectedMainCategoryTitle) ??
    null;
  const visibleFilterGroups = buildContextualFilterGroups(
    filterGroups,
    categoryFilterProducts,
    selectedMainCategoryTitle
  );
  const paginationPages = getPaginationPages();
  const shouldShowProductArea = Boolean(selectedMainCategory || searchTerm);
  const pageTitle = searchTerm
    ? `Résultats pour "${searchTerm}"`
    : selectedMainCategory?.title ?? "Résultats de recherche";

  const textFilterCount = Object.values(selectedFilters).reduce(
    (total, values) => total + (values?.length ?? 0),
    0
  );
  const selectedSubcategoryCount =
    selectedMainCategory &&
    selectedCategoryIds.length !== selectedMainCategory.children.length
      ? selectedCategoryIds.length
      : 0;
  const activeFilterCount =
    selectedSubcategoryCount +
    selectedStockStatuses.length +
    textFilterCount +
    (searchTerm ? 1 : 0);

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dff6ff_0,#ffffff_34%,#f7fbfa_72%)] pb-24 pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-[0_18px_50px_rgba(3,64,45,0.08)]">
          <div className="h-2 bg-gradient-to-r from-brand-800 via-sky-500 to-cyan-400" />
          <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-sky-700">
                Boutique EcoLiz
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-brand-950 lg:text-4xl">
                Catégories, promotions et catalogue professionnel
              </h1>
            </div>

            <div className="relative min-w-0 flex-1 lg:max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-900/40" />

              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Rechercher un produit, une marque, une référence…"
                className="w-full rounded-2xl border border-sky-100 bg-sky-50/70 py-4 pl-12 pr-4 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
        </header>

        <PromotionSection />

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                Navigation
              </p>
              <h2 className="text-2xl font-bold text-brand-950">
                Choisir une catégorie
              </h2>
            </div>

            {selectedMainCategory && (
              <button
                type="button"
                onClick={returnToCategories}
                className="hidden rounded-full border border-brand-100 bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-sm transition hover:bg-brand-50 sm:inline-flex"
              >
                Voir toutes les catégories
              </button>
            )}
          </div>

          {categoriesLoading ? (
            <div className="rounded-2xl border border-brand-100 bg-white py-10 text-center text-brand-900/50">
              Chargement des catégories…
            </div>
          ) : categoryGroups.length === 0 ? (
            <div className="rounded-2xl border border-brand-100 bg-white py-10 text-center text-brand-900/50">
              Aucune catégorie disponible.
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-5">
              {categoryGroups.map((group) => (
                <CategorySelectionCard
                  key={group.title}
                  group={group}
                  isSelected={selectedMainCategoryTitle === group.title}
                  onSelect={() => selectMainCategory(group)}
                />
              ))}
            </div>
          )}
        </section>

        {shouldShowProductArea && (
          <div className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
            <div className="border-b border-brand-100 bg-brand-50/70 px-5 py-4 text-sm text-brand-900/60">
              <span>Boutique</span>
              <span className="mx-2">›</span>
              <span className="font-semibold text-brand-950">{pageTitle}</span>
            </div>

            <div className="grid items-start lg:grid-cols-[300px_minmax(0,1fr)]">
              <aside
                className="
                  self-start border-b border-brand-100 bg-white p-5
                  lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)]
                  lg:overflow-y-auto lg:overscroll-contain lg:border-b-0 lg:border-r
                "
              >
                {!searchTerm && (
                  <button
                    type="button"
                    onClick={returnToCategories}
                    className="mb-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Retour aux catégories
                  </button>
                )}

                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-brand-900/60" />
                    <h2 className="font-semibold text-brand-950">Filtres</h2>
                  </div>

                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-brand-100 px-2 py-1 text-xs text-brand-700">
                      {activeFilterCount}
                    </span>
                  )}
                </div>

                {searchTerm ? (
                  <p className="mb-5 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-brand-900/60">
                    La recherche parcourt toute la boutique. Les filtres de
                    catégorie sont masqués pendant la recherche.
                  </p>
                ) : (
                  <>
                    {selectedMainCategory ? (
                      <div className="mb-5 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
                        <h3 className="mb-3 text-sm font-semibold text-brand-950">
                          Sous-catégories
                        </h3>

                        <div className="space-y-2">
                          {selectedMainCategory.children.map((category) => (
                            <label
                              key={category.id}
                              className="flex cursor-pointer items-center justify-between gap-2 rounded-xl px-2 py-2 text-sm text-brand-900/70 transition hover:bg-white"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedCategoryIds.includes(
                                    category.id
                                  )}
                                  onChange={() =>
                                    toggleNumberFilter(
                                      category.id,
                                      selectedCategoryIds,
                                      setSelectedCategoryIds
                                    )
                                  }
                                  className="rounded border-brand-300 text-brand-700 focus:ring-brand-700"
                                />

                                <span className="break-words">
                                  {getCategoryDisplayName(category.name)}
                                </span>
                              </span>

                              {typeof category.count === "number" && (
                                <span className="shrink-0 text-xs text-brand-900/40">
                                  {category.count}
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <FilterGroup
                      title="Disponibilité"
                      options={["En stock", "Rupture de stock"]}
                      selectedOptions={selectedStockStatuses.map((status) =>
                        status === "instock" ? "En stock" : "Rupture de stock"
                      )}
                      isOpen={expandedFilterGroup === "availability"}
                      onToggleGroup={() => toggleFilterGroup("availability")}
                      onToggle={(option) =>
                        toggleStockFilter(
                          option === "En stock" ? "instock" : "outofstock"
                        )
                      }
                    />

                    {filterGroupsLoading || contextualFiltersLoading ? (
                      <p className="mb-3 text-sm text-brand-900/50">
                        Chargement des filtres adaptés…
                      </p>
                    ) : (
                      visibleFilterGroups.map((group) => (
                        <FilterGroup
                          key={group.key}
                          title={group.title}
                          options={group.options}
                          selectedOptions={selectedFilters[group.key] ?? []}
                          isOpen={expandedFilterGroup === group.key}
                          onToggleGroup={() => toggleFilterGroup(group.key)}
                          onToggle={(optionSlug) =>
                            toggleTextFilter(group.key, optionSlug)
                          }
                        />
                      ))
                    )}
                  </>
                )}

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-2 inline-flex items-center gap-2 text-sm text-brand-700 underline hover:text-brand-800"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Réinitialiser les filtres
                  </button>
                )}
              </aside>

              <main className="min-w-0 bg-white p-5 lg:p-7">
                <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-3xl font-bold text-brand-950">
                      {pageTitle}
                    </h2>
                    <p className="mt-1 text-sm text-brand-900/60">
                      {loading
                        ? "Chargement des produits…"
                        : "Catalogue filtré selon votre sélection"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="flex items-center justify-between gap-2 text-sm text-brand-900/60 sm:justify-start">
                      <span className="whitespace-nowrap">Trier par</span>

                      <select
                        value={sortOption}
                        onChange={(event) => {
                          setCurrentPage(1);
                          setSortOption(event.target.value as SortOption);
                        }}
                        className="min-w-0 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-950 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                      >
                        <option value="default">Défaut</option>
                        <option value="price-asc">Prix croissant</option>
                        <option value="price-desc">Prix décroissant</option>
                        <option value="name-asc">Nom A-Z</option>
                        <option value="name-desc">Nom Z-A</option>
                      </select>
                    </label>

                    <label className="flex items-center justify-between gap-2 text-sm text-brand-900/60 sm:justify-start">
                      <span className="whitespace-nowrap">Afficher</span>

                      <select
                        value={productsPerPage}
                        onChange={(event) => {
                          setCurrentPage(1);
                          setProductsPerPage(Number(event.target.value));
                        }}
                        className="min-w-0 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-950 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                      >
                        {PRODUCTS_PER_PAGE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option} / page
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="flex shrink-0 items-center gap-1 rounded-xl border border-brand-100 bg-brand-50 p-1">
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className={`rounded-lg p-2 transition-colors ${
                          viewMode === "list"
                            ? "bg-white text-brand-700 shadow-sm"
                            : "text-brand-900/40 hover:text-brand-900"
                        }`}
                        aria-label="Vue liste"
                      >
                        <List className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        className={`rounded-lg p-2 transition-colors ${
                          viewMode === "grid"
                            ? "bg-white text-brand-700 shadow-sm"
                            : "text-brand-900/40 hover:text-brand-900"
                        }`}
                        aria-label="Vue grille"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex min-w-0 items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900/60">
                  <SlidersHorizontal className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    Page {currentPage} / {totalPages} — filtres appliqués à la
                    catégorie complète
                  </span>
                </div>

                {loading ? (
                  <div className="rounded-2xl border border-brand-100 bg-white py-20 text-center text-brand-900/50">
                    Chargement du catalogue…
                  </div>
                ) : products.length === 0 ? (
                  <div className="rounded-2xl border border-brand-100 bg-white py-20 text-center text-brand-900/50">
                    Aucun produit ne correspond aux filtres sélectionnés.
                  </div>
                ) : viewMode === "list" ? (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <ProductListItem
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <ProductGridItem
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                )}

                {!loading && totalPages > 1 && (
                  <nav
                    className="mt-12 flex flex-wrap items-center justify-center gap-2"
                    aria-label="Pagination du catalogue"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(page - 1, 1))
                      }
                      disabled={currentPage === 1 || loading}
                      className="rounded-full border border-sky-200 bg-white/70 px-4 py-2 text-brand-900 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Précédent
                    </button>

                    {paginationPages.map((page, index) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-3 py-2 text-brand-900/50"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(Number(page))}
                          disabled={loading}
                          aria-current={
                            currentPage === Number(page) ? "page" : undefined
                          }
                          className={`h-11 w-11 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                            currentPage === page
                              ? "border-brand-700 bg-brand-700 text-white"
                              : "border-sky-200 bg-white/70 text-brand-900 hover:bg-sky-50"
                          }`}
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
                      className="rounded-full border border-sky-200 bg-white/70 px-4 py-2 text-brand-900 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Suivant
                    </button>
                  </nav>
                )}
              </main>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PromotionSection() {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
          <BadgePercent className="h-5 w-5" />
        </span>
        <h2 className="text-2xl font-bold text-brand-950">Promotions</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {PROMOTION_CARDS.map((card) => (
          <article
            key={card.title}
            className="group overflow-hidden rounded-[1.5rem] border border-sky-100 bg-white shadow-[0_12px_30px_rgba(3,64,45,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(3,64,45,0.14)]"
          >
            <div className={`h-2 bg-gradient-to-r ${card.accent}`} />
            <div className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <span className={`mb-4 inline-flex rounded-full bg-gradient-to-r ${card.accent} px-3 py-1 text-sm font-bold text-white shadow-sm`}>
                  {card.badge}
                </span>

                <h3 className="mb-2 text-lg font-bold text-brand-950">
                  {card.title}
                </h3>

                <p className="mb-5 text-sm text-brand-900/65">
                  {card.description}
                </p>

                <span className="inline-flex rounded-xl bg-brand-950 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-sky-700">
                  Découvrir
                </span>
              </div>

              <div className={`flex h-24 w-28 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-inner`}>
                <Laptop className="h-12 w-12" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CategorySelectionCard({
  group,
  isSelected,
  onSelect,
}: {
  group: CategoryGroup;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon =
    CATEGORY_ICONS[group.title as keyof typeof CATEGORY_ICONS] ?? Grid3X3;
  const details = CATEGORY_DETAILS[group.title] ?? {
    description: "Matériel professionnel reconditionné.",
    color: "from-brand-800 to-sky-600",
    icon: "bg-brand-50 text-brand-800 ring-brand-100",
  };
  const productCount = group.children.reduce(
    (total, category) => total + (category.count ?? 0),
    0
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-full overflow-hidden rounded-2xl border bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(3,64,45,0.12)] sm:w-[calc(50%-0.625rem)] xl:w-[calc(25%-0.9375rem)] ${
        isSelected
          ? "border-brand-800 ring-2 ring-sky-200"
          : "border-sky-100 hover:border-sky-300"
      }`}
    >
      <span className={`block h-2 bg-gradient-to-r ${details.color}`} />
      <span className="flex min-h-[178px] flex-col p-5">
        <span className="mb-4 flex items-start justify-between gap-3">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${details.icon}`}
          >
            <Icon className="h-7 w-7" />
          </span>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            {productCount} produit{productCount > 1 ? "s" : ""}
          </span>
        </span>

        <span className="text-lg font-bold text-brand-950">{group.title}</span>
        <span className="mt-2 min-h-[42px] text-sm leading-5 text-brand-900/65">
          {details.description}
        </span>
        <span className="mt-auto pt-4 text-sm font-semibold text-sky-700 transition group-hover:text-brand-800">
          Explorer la catégorie →
        </span>
      </span>
    </button>
  );
}

function FilterGroup({
  title,
  options,
  selectedOptions,
  isOpen,
  onToggleGroup,
  onToggle,
}: {
  title: string;
  options: Array<WooFilterOption | string>;
  selectedOptions: string[];
  isOpen: boolean;
  onToggleGroup: () => void;
  onToggle: (optionSlug: string) => void;
}) {
  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-brand-100 bg-white">
      <button
        type="button"
        onClick={onToggleGroup}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-brand-50"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-brand-950">
            {title}
          </span>

          {selectedOptions.length > 0 && (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
              {selectedOptions.length}
            </span>
          )}
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-brand-900/50 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="space-y-2 border-t border-brand-100 bg-brand-50/40 px-3 py-3">
          {options.map((option) => {
            const optionValue =
              typeof option === "string" ? option : option.slug;
            const optionLabel =
              typeof option === "string" ? option : option.name;

            return (
              <label
                key={optionValue}
                className="flex cursor-pointer items-center gap-2 text-sm text-brand-900/70"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(optionValue)}
                    onChange={() => onToggle(optionValue)}
                    className="rounded border-brand-300 text-brand-700 focus:ring-brand-700"
                  />

                  <span className="break-words">{optionLabel}</span>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProductListItem({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (event: MouseEvent, product: Product) => void;
}) {
  const productName = decodeHtmlEntities(product.name);

  return (
    <article className="group flex min-w-0 flex-col gap-5 overflow-hidden rounded-2xl border border-brand-100 bg-white p-4 transition-all hover:shadow-lg hover:shadow-brand-900/10 sm:flex-row">
      <Link to={`/produit/${product.slug}`} className="block shrink-0">
        <div className="h-48 w-full overflow-hidden rounded-xl border border-brand-100 bg-brand-50 sm:h-32 sm:w-40">
          <img
            src={product.image || "/placeholder-product.png"}
            alt={productName}
            loading="lazy"
            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <Link to={`/produit/${product.slug}`} className="block">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusPill
              label={product.stock ? "En stock" : "Rupture"}
              variant={product.stock ? "success" : "warning"}
            />

            {product.conditionLabel &&
              product.conditionLabel !== "Non renseigné" && (
                <StatusPill label={product.conditionLabel} variant="brand" />
              )}

            {product.manufacturer && (
              <span className="break-words text-xs text-brand-900/50">
                {decodeHtmlEntities(product.manufacturer)}
              </span>
            )}
          </div>

          <h3 className="mb-2 line-clamp-3 break-words text-lg font-bold text-brand-950 [overflow-wrap:anywhere] transition-colors group-hover:text-brand-700">
            {productName}
          </h3>
        </Link>

        <div className="mb-3 grid min-w-0 gap-x-4 gap-y-1 text-xs text-brand-900/60 sm:grid-cols-2 xl:grid-cols-4">
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
          <p className="line-clamp-2 break-words text-sm text-brand-900/60 [overflow-wrap:anywhere]">
            {decodeHtmlEntities(product.specs)}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-end justify-between gap-4 border-t border-brand-100 pt-4 sm:w-full md:w-auto md:min-w-[190px] md:flex-col md:items-end md:border-l md:border-t-0 md:pl-4 md:pt-0">
        <div className="text-right">
          <p className="text-xl font-bold text-brand-950 sm:text-2xl">
            {formatPrice(product.price)} HT
          </p>

          {product.priceTTC && (
            <p className="text-sm text-brand-900/50">
              {formatPrice(product.priceTTC)} TTC
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={(event) => onAddToCart(event, product)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            <ShoppingCart className="h-4 w-4" />
            Ajouter
          </button>

          <Link
            to={`/produit/${product.slug}`}
            className="inline-flex items-center rounded-xl border border-brand-100 px-4 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
          >
            Détails
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProductGridItem({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (event: MouseEvent, product: Product) => void;
}) {
  const productName = decodeHtmlEntities(product.name);

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white transition-all hover:shadow-lg hover:shadow-brand-900/10">
      <Link to={`/produit/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
          <img
            src={product.image || "/placeholder-product.png"}
            alt={productName}
            loading="lazy"
            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.03]"
          />

          <div className="absolute right-3 top-3">
            <StatusPill
              label={product.stock ? "En stock" : "Rupture"}
              variant={product.stock ? "success" : "warning"}
            />
          </div>
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <Link to={`/produit/${product.slug}`} className="block flex-1">
          <h3 className="mb-2 line-clamp-3 break-words text-lg font-bold text-brand-950 [overflow-wrap:anywhere] transition-colors group-hover:text-brand-700">
            {productName}
          </h3>

          <div className="mb-4 min-w-0 space-y-1 text-xs text-brand-900/60">
            {product.manufacturer && (
              <InfoLine label="Marque" value={product.manufacturer} />
            )}

            {product.conditionLabel && (
              <InfoLine label="État" value={product.conditionLabel} />
            )}

            {product.sku && <InfoLine label="SKU" value={product.sku} />}
          </div>
        </Link>

        <div className="mt-auto">
          <p className="text-2xl font-bold text-brand-950">
            {formatPrice(product.price)} HT
          </p>

          {product.priceTTC && (
            <p className="text-sm text-brand-900/50">
              {formatPrice(product.priceTTC)} TTC
            </p>
          )}

          <button
            type="button"
            onClick={(event) => onAddToCart(event, product)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            <ShoppingCart className="h-4 w-4" />
            Ajouter au panier
          </button>
        </div>
      </div>
    </article>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="min-w-0 break-words [overflow-wrap:anywhere]">
      <span className="font-medium text-brand-900/70">{label} :</span>{" "}
      <span>{decodeHtmlEntities(value)}</span>
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
    success: "border-sky-200 bg-sky-50 text-sky-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    brand: "border-brand-100 bg-brand-50 text-brand-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {decodeHtmlEntities(label)}
    </span>
  );
}
