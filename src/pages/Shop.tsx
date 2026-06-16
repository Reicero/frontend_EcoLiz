import { useEffect, useRef, useState } from "react";
import type {
  Dispatch,
  FormEvent,
  SetStateAction,
  SyntheticEvent,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
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
    color: "from-sky-900 to-sky-600",
    icon: "bg-sky-50 text-sky-800 ring-sky-100",
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
    color: "from-sky-950 to-blue-700",
    icon: "bg-sky-50 text-sky-800 ring-sky-100",
  },
  Licence: {
    description: "Logiciels, licences et systèmes professionnels.",
    color: "from-cyan-600 to-sky-800",
    icon: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  },
  Écrans: {
    description: "Moniteurs, résolutions et formats de travail.",
    color: "from-sky-600 to-cyan-600",
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

function handleProductImageError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  const originalSrc = image.dataset.originalSrc || image.src;

  if (
    image.dataset.retryDone === "true" ||
    originalSrc.includes("/placeholder-product.png")
  ) {
    return;
  }

  const retryUrl = new URL(originalSrc, window.location.href);

  retryUrl.searchParams.set("ecoliz_image_retry", Date.now().toString());
  image.dataset.retryDone = "true";
  image.src = retryUrl.toString();
}

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterProductsCache = useRef<Record<string, Product[]>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [promotionProducts, setPromotionProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<WooCategory[]>([]);
  const [filterGroups, setFilterGroups] = useState<WooFilterGroup[]>([]);
  const [categoryFilterProducts, setCategoryFilterProducts] = useState<
    Product[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [promotionsLoading, setPromotionsLoading] = useState(false);
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
  const categoryGroups = getCategoryGroups(categories);
  const selectedMainCategory =
    categoryGroups.find((group) => group.title === selectedMainCategoryTitle) ??
    null;

  function updateShopUrl(nextParams: Record<string, string>) {
    const params = new URLSearchParams();

    Object.entries(nextParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    setSearchParams(params);
  }

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
    let cancelled = false;

    setPromotionsLoading(true);

    listProducts({
      page: 1,
      perPage: 6,
    } as Parameters<typeof listProducts>[0] & { onSale: boolean })
      .then((result) => {
        if (cancelled) return;
        setPromotionProducts(result.products);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error(
          "Erreur lors de la récupération des produits en promotion :",
          error
        );
        setPromotionProducts([]);
      })
      .finally(() => {
        if (!cancelled) {
          setPromotionsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
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
    const querySearch = searchParams.get("recherche")?.trim() ?? "";
    const queryCategory = searchParams.get("categorie")?.trim() ?? "";

    if (querySearch) {
      if (searchInput !== querySearch) {
        setSearchInput(querySearch);
      }

      if (searchTerm !== querySearch) {
        setSearchTerm(querySearch);
      }

      setSelectedMainCategoryTitle(null);
      setSelectedCategoryIds([]);
      setSelectedStockStatuses([]);
      setSelectedFilters({});
      setCurrentPage(1);
      return;
    }

    if (queryCategory && categoryGroups.length > 0) {
      const group = categoryGroups.find(
        (item) => getCategorySlug(item.title) === queryCategory
      );

      if (group && selectedMainCategoryTitle !== group.title) {
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

      return;
    }

    if (!queryCategory && !querySearch) {
      setSearchInput("");
      setSearchTerm("");
      setSelectedMainCategoryTitle(null);
      setSelectedCategoryIds([]);
      setSelectedStockStatuses([]);
      setSelectedFilters({});
      setExpandedCategoryGroup(null);
      setExpandedFilterGroup(null);
      setCurrentPage(1);
    }
  }, [searchParams, categories]);

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

    const cachedProducts = filterProductsCache.current[selectedCategoryKey];

    if (cachedProducts) {
      setCategoryFilterProducts(cachedProducts);
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
          filterProductsCache.current[selectedCategoryKey] = allProducts;
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
    updateShopUrl({});
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
    updateShopUrl({
      categorie: getCategorySlug(group.title),
    });
  }

  function returnToCategories() {
    setSelectedMainCategoryTitle(null);
    setSelectedCategoryIds([]);
    setSelectedStockStatuses([]);
    setSelectedFilters({});
    setExpandedCategoryGroup(null);
    setExpandedFilterGroup(null);
    setCurrentPage(1);
    updateShopUrl({});
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const term = searchInput.trim();

    setCurrentPage(1);
    setSearchTerm(term);

    if (term) {
      setSelectedMainCategoryTitle(null);
      setSelectedCategoryIds([]);
      setSelectedStockStatuses([]);
      setSelectedFilters({});
      updateShopUrl({ recherche: term });
      return;
    }

    updateShopUrl({});
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
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,#9fe8ff_0,#d8f5ff_34%,#eefbff_72%,#dff3ff_100%)] pb-24 pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="relative mb-8 overflow-hidden rounded-[2rem] border border-cyan-200 bg-sky-950 text-white shadow-[0_24px_70px_rgba(12,74,110,0.28)]">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/25 blur-3xl" />
          <div className="absolute -bottom-24 left-16 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute right-10 top-8 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_22px_rgba(103,232,249,0.95)] animate-pulse" />
          <div className="absolute right-24 bottom-8 h-2 w-2 rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.8)] animate-ping" />

          <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
            <div className="min-w-0 max-w-3xl">
              <p className="mb-3 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                Boutique EcoLiz
              </p>
              <h1 className="text-4xl font-black tracking-tight text-white lg:text-6xl">
                Trouve le bon matériel pro.
                <span className="block text-cyan-200">
                  Reconditionné, filtré, prêt à travailler.
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-sky-100/80">
                Parcourez les catégories, repérez les offres du moment et filtrez
                le catalogue selon vos besoins réels.
              </p>
            </div>

            <form
              onSubmit={submitSearch}
              className="relative min-w-0 flex-1 lg:max-w-md"
            >
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-900/45" />

              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Rechercher un produit, une marque, une référence…"
                className="w-full rounded-2xl border border-white/40 bg-white py-4 pl-12 pr-4 text-sm text-sky-950 outline-none shadow-[0_14px_35px_rgba(8,47,73,0.22)] transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/30"
              />
            </form>
          </div>
        </header>

        {!shouldShowProductArea && (
          <>
            <PromotionSection
              products={promotionProducts}
              loading={promotionsLoading}
            />

            <section className="mb-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                Accès rapide
              </p>
              <h2 className="text-2xl font-bold text-sky-950">
                Choisir votre univers matériel
              </h2>
            </div>

            {selectedMainCategory && (
              <button
                type="button"
                onClick={returnToCategories}
                className="hidden rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-sky-700 shadow-sm transition hover:bg-sky-50 sm:inline-flex"
              >
                Voir toutes les catégories
              </button>
            )}
          </div>

          {categoriesLoading ? (
            <div className="rounded-2xl border border-sky-100 bg-white py-10 text-center text-sky-900/50">
              Chargement des catégories…
            </div>
          ) : categoryGroups.length === 0 ? (
            <div className="rounded-2xl border border-sky-100 bg-white py-10 text-center text-sky-900/50">
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
          </>
        )}

        {shouldShowProductArea && (
          <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-[0_18px_50px_rgba(3,105,161,0.12)]">
            <div className="border-b border-sky-100 bg-sky-50 px-5 py-4 text-sm text-sky-900/60">
              <span>Boutique</span>
              <span className="mx-2">›</span>
              <span className="font-semibold text-sky-950">{pageTitle}</span>
            </div>

            <div>
              <main className="min-w-0 bg-white p-5 lg:p-7">
                {!searchTerm && (
                  <button
                    type="button"
                    onClick={returnToCategories}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition hover:text-sky-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Retour aux catégories
                  </button>
                )}

                {!searchTerm && selectedMainCategory ? (
                  <div className="mb-6">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-sky-700">
                      Sous-catégories
                    </p>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {selectedMainCategory.children.map((category) => {
                        const checked = selectedCategoryIds.includes(
                          category.id
                        );

                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() =>
                              toggleNumberFilter(
                                category.id,
                                selectedCategoryIds,
                                setSelectedCategoryIds
                              )
                            }
                            className={`min-w-[150px] rounded-2xl border px-4 py-3 text-left text-sm transition ${
                              checked
                                ? "border-sky-700 bg-sky-950 text-white"
                                : "border-sky-100 bg-sky-50 text-sky-950 hover:border-sky-300 hover:bg-white"
                            }`}
                          >
                            <span className="block font-semibold">
                              {getCategoryDisplayName(category.name)}
                            </span>
                            {typeof category.count === "number" && (
                              <span
                                className={`mt-1 block text-xs ${
                                  checked ? "text-white/70" : "text-sky-900/45"
                                }`}
                              >
                                {category.count} produits
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="mb-6 rounded-2xl border border-sky-100 bg-white p-4 shadow-[0_12px_30px_rgba(3,105,161,0.08)]">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-sky-900/60" />
                      <h2 className="font-semibold text-sky-950">Filtres</h2>
                      {activeFilterCount > 0 && (
                        <span className="rounded-full bg-sky-100 px-2 py-1 text-xs text-sky-700">
                          {activeFilterCount}
                        </span>
                      )}
                    </div>

                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="inline-flex items-center gap-2 text-sm text-sky-700 underline hover:text-sky-900"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Réinitialiser
                      </button>
                    )}
                  </div>

                  {searchTerm ? (
                    <p className="text-sm text-sky-900/60">
                      La recherche parcourt toute la boutique.
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-start gap-3">
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

                      {filterGroupsLoading ? (
                        <p className="text-sm text-sky-900/50">
                          Chargement des filtres…
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

                      {contextualFiltersLoading && !filterGroupsLoading && (
                        <span className="self-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                          Filtres en cours d’affinage…
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-3xl font-bold text-sky-950">
                      {pageTitle}
                    </h2>
                    <p className="mt-1 text-sm text-sky-900/60">
                      {loading
                        ? "Chargement des produits…"
                        : "Catalogue filtré selon votre sélection"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="flex items-center justify-between gap-2 text-sm text-sky-900/60 sm:justify-start">
                      <span className="whitespace-nowrap">Trier par</span>

                      <select
                        value={sortOption}
                        onChange={(event) => {
                          setCurrentPage(1);
                          setSortOption(event.target.value as SortOption);
                        }}
                        className="min-w-0 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-sky-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      >
                        <option value="default">Défaut</option>
                        <option value="price-asc">Prix croissant</option>
                        <option value="price-desc">Prix décroissant</option>
                        <option value="name-asc">Nom A-Z</option>
                        <option value="name-desc">Nom Z-A</option>
                      </select>
                    </label>

                    <label className="flex items-center justify-between gap-2 text-sm text-sky-900/60 sm:justify-start">
                      <span className="whitespace-nowrap">Afficher</span>

                      <select
                        value={productsPerPage}
                        onChange={(event) => {
                          setCurrentPage(1);
                          setProductsPerPage(Number(event.target.value));
                        }}
                        className="min-w-0 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-sky-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      >
                        {PRODUCTS_PER_PAGE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option} / page
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="flex shrink-0 items-center gap-1 rounded-xl border border-sky-100 bg-sky-50 p-1">
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className={`rounded-lg p-2 transition-colors ${
                          viewMode === "list"
                            ? "bg-white text-sky-700 shadow-sm"
                            : "text-sky-900/40 hover:text-sky-900"
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
                            ? "bg-white text-sky-700 shadow-sm"
                            : "text-sky-900/40 hover:text-sky-900"
                        }`}
                        aria-label="Vue grille"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex min-w-0 items-center justify-between gap-3 border-b border-sky-100 pb-4 text-sm text-sky-900/60">
                  <SlidersHorizontal className="h-4 w-4 shrink-0" />
                  <span className="mr-auto truncate">
                    Page {currentPage} / {totalPages}
                  </span>
                  <span className="shrink-0">
                    {totalProducts} produit{totalProducts > 1 ? "s" : ""}
                  </span>
                </div>

                {loading ? (
                  <div className="rounded-2xl border border-sky-100 bg-white py-20 text-center text-sky-900/50">
                    Chargement du catalogue…
                  </div>
                ) : products.length === 0 ? (
                  <div className="rounded-2xl border border-sky-100 bg-white py-20 text-center text-sky-900/50">
                    Aucun produit ne correspond aux filtres sélectionnés.
                  </div>
                ) : viewMode === "list" ? (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <ProductListItem
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <ProductGridItem
                        key={product.id}
                        product={product}
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
                      className="rounded-full border border-sky-200 bg-white/70 px-4 py-2 text-sky-900 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Précédent
                    </button>

                    {paginationPages.map((page, index) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-3 py-2 text-sky-900/50"
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
                              ? "border-sky-700 bg-sky-700 text-white"
                              : "border-sky-200 bg-white/70 text-sky-900 hover:bg-sky-50"
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
                      className="rounded-full border border-sky-200 bg-white/70 px-4 py-2 text-sky-900 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
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

function getPromotionDiscountPercent(product: Product) {
  const originalPrice = Number(
    (product as Product & { originalPrice?: number }).originalPrice ?? 0
  );
  const salePrice = Number(product.price ?? 0);

  if (!originalPrice || !salePrice || salePrice >= originalPrice) {
    return null;
  }

  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

function PromotionSection({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const activeProduct = products[currentProductIndex];
  const hasMultiplePromotions = products.length > 1;

  useEffect(() => {
    setCurrentProductIndex(0);
  }, [products.length]);

  function showPreviousPromotion() {
    setCurrentProductIndex((currentIndex) =>
      currentIndex === 0 ? products.length - 1 : currentIndex - 1
    );
  }

  function showNextPromotion() {
    setCurrentProductIndex((currentIndex) =>
      currentIndex === products.length - 1 ? 0 : currentIndex + 1
    );
  }

  return (
    <section className="relative mb-12 overflow-hidden rounded-[2rem] border border-cyan-300/40 bg-gradient-to-br from-sky-950 via-blue-950 to-cyan-800 p-6 text-white shadow-[0_28px_80px_rgba(8,47,73,0.34)]">
      <div className="absolute -left-20 top-8 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute -right-16 -bottom-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute left-8 top-8 h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(165,243,252,0.9)] animate-ping" />

      <div className="relative mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100 shadow-[0_0_24px_rgba(103,232,249,0.18)]">
            <BadgePercent className="h-4 w-4" />
            Offres à saisir
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            Promotions du moment
          </p>
          <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
            Des prix qui bougent, du matériel qui tient.
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
            Stocks limités
          </span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
            Sélection pro
          </span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
            Prix réduits
          </span>
        </div>
      </div>

      <div className="relative grid gap-4 lg:grid-cols-3">
        {loading && (
          <div className="col-span-full rounded-[1.5rem] border border-white/15 bg-white/10 px-5 py-8 text-center text-sm text-sky-100/80">
            Chargement des promotions…
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="col-span-full rounded-[1.5rem] border border-white/15 bg-white/10 px-5 py-8 text-center text-sm text-sky-100/80">
            Aucune promotion active pour le moment.
          </div>
        )}

        {!loading && activeProduct && (
          <div className="col-span-full">
            <div className="relative mx-auto max-w-5xl px-10 sm:px-14">
              {hasMultiplePromotions && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousPromotion}
                    className="absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-3xl leading-none text-white shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur transition hover:bg-cyan-300 hover:text-sky-950"
                    aria-label="Promotion précédente"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={showNextPromotion}
                    className="absolute right-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-3xl leading-none text-white shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur transition hover:bg-cyan-300 hover:text-sky-950"
                    aria-label="Promotion suivante"
                  >
                    ›
                  </button>
                </>
              )}

              {(() => {
                const product = activeProduct;
                const productName = decodeHtmlEntities(product.name);
                const discountPercent = getPromotionDiscountPercent(product);
                const originalPrice = Number(
                  (product as Product & { originalPrice?: number })
                    .originalPrice ?? 0
                );

                return (
                  <article className="group grid min-h-[340px] overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 shadow-[0_18px_48px_rgba(0,0,0,0.2)] backdrop-blur transition duration-300 hover:border-cyan-200/70 hover:bg-white/15 md:grid-cols-[0.95fr_1.25fr]">
                    <Link
                      to={`/produit/${product.slug}`}
                      className="relative flex min-h-[260px] items-center justify-center bg-white/95 p-6"
                    >
                      {discountPercent && (
                        <span className="absolute left-5 top-5 rounded-2xl bg-cyan-300 px-4 py-3 text-4xl font-black leading-none text-sky-950 shadow-[0_0_34px_rgba(103,232,249,0.5)]">
                          -{discountPercent}%
                        </span>
                      )}

                      <img
                        src={product.image || "/placeholder-product.png"}
                        alt={productName}
                        loading="lazy"
                        data-original-src={
                          product.image || "/placeholder-product.png"
                        }
                        onError={handleProductImageError}
                        className="h-full max-h-72 w-full object-contain mix-blend-multiply transition duration-300 group-hover:scale-105"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8">
                      <p className="mb-3 inline-flex w-fit rounded-full border border-cyan-200/40 bg-cyan-300 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-sky-950 shadow-[0_0_28px_rgba(103,232,249,0.28)]">
                        En promotion
                      </p>

                      <h3 className="max-w-2xl break-words text-2xl font-black leading-tight text-white [overflow-wrap:anywhere] sm:text-4xl">
                        {productName}
                      </h3>

                      <div className="mt-5">
                        <p className="text-4xl font-black text-white">
                          {formatPrice(product.price)} HT
                        </p>

                        {originalPrice > product.price && (
                          <p className="mt-1 text-lg text-sky-100/65 line-through">
                            {formatPrice(originalPrice)} HT
                          </p>
                        )}
                      </div>

                      <Link
                        to={`/produit/${product.slug}`}
                        className="mt-7 inline-flex w-fit rounded-xl bg-white px-5 py-3 text-sm font-bold text-sky-950 transition group-hover:bg-cyan-100 group-hover:shadow-[0_0_24px_rgba(103,232,249,0.28)]"
                      >
                        Voir l’offre
                      </Link>
                    </div>
                  </article>
                );
              })()}
            </div>

            {hasMultiplePromotions && (
              <div className="mt-5 flex justify-center gap-2">
                {products.map((product, index) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setCurrentProductIndex(index)}
                    aria-label={`Voir la promotion ${index + 1}`}
                    className={`h-3 rounded-full transition-all ${
                      index === currentProductIndex
                        ? "w-8 bg-cyan-300"
                        : "w-3 bg-white/45 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
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
    color: "from-sky-800 to-cyan-500",
    icon: "bg-sky-50 text-sky-800 ring-sky-100",
  };
  const productCount = group.children.reduce(
    (total, category) => total + (category.count ?? 0),
    0
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-full overflow-hidden rounded-2xl border bg-white text-left shadow-[0_10px_28px_rgba(3,105,161,0.08)] transition-all duration-300 hover:-translate-y-1 hover:rotate-[0.25deg] hover:shadow-[0_18px_42px_rgba(3,105,161,0.22)] sm:w-[calc(50%-0.625rem)] xl:w-[calc(25%-0.9375rem)] ${
        isSelected
          ? "border-sky-800 ring-2 ring-sky-300"
          : "border-sky-100 hover:border-sky-300"
      }`}
    >
      <span className={`block h-2 bg-gradient-to-r ${details.color}`} />
      <span className="flex min-h-[178px] flex-col p-5">
        <span className="mb-4 flex items-start justify-between gap-3">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 transition duration-300 group-hover:scale-110 group-hover:-rotate-3 ${details.icon}`}
          >
            <Icon className="h-7 w-7" />
          </span>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            {productCount} produit{productCount > 1 ? "s" : ""}
          </span>
        </span>

        <span className="text-lg font-bold text-sky-950">{group.title}</span>
        <span className="mt-2 min-h-[42px] text-sm leading-5 text-sky-900/65">
          {details.description}
        </span>
        <span className="mt-auto pt-4 text-sm font-semibold text-sky-700 transition group-hover:translate-x-1 group-hover:text-sky-950">
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
    <div className="relative w-full self-start sm:w-[180px]">
      <button
        type="button"
        onClick={onToggleGroup}
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-left transition-colors hover:bg-sky-50 ${
          isOpen ? "border-sky-200 bg-sky-50 shadow-sm" : ""
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-sky-950">
            {title}
          </span>

          {selectedOptions.length > 0 && (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
              {selectedOptions.length}
            </span>
          )}
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-sky-900/50 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-sky-100 bg-white px-3 py-3 shadow-[0_18px_42px_rgba(3,105,161,0.18)]">
          {options.map((option) => {
            const optionValue =
              typeof option === "string" ? option : option.slug;
            const optionLabel =
              typeof option === "string" ? option : option.name;

            return (
              <label
                key={optionValue}
                className="flex cursor-pointer items-center gap-2 text-sm text-sky-900/70"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(optionValue)}
                    onChange={() => onToggle(optionValue)}
                    className="rounded border-sky-300 text-sky-700 focus:ring-sky-700"
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

function ProductListItem({ product }: { product: Product }) {
  const productName = decodeHtmlEntities(product.name);
  const discountPercent = getPromotionDiscountPercent(product);

  return (
    <article className="group flex min-w-0 flex-col gap-5 overflow-hidden rounded-2xl border border-sky-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_18px_42px_rgba(3,105,161,0.16)] sm:flex-row">
      <Link to={`/produit/${product.slug}`} className="block shrink-0">
        <div className="h-48 w-full overflow-hidden rounded-xl border border-sky-100 bg-sky-50 sm:h-32 sm:w-40">
          <img
            src={product.image || "/placeholder-product.png"}
            alt={productName}
            loading="lazy"
            data-original-src={product.image || "/placeholder-product.png"}
            onError={handleProductImageError}
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

            {discountPercent && (
              <StatusPill label={`Promo -${discountPercent}%`} variant="promo" />
            )}

            {product.manufacturer && (
              <span className="break-words text-xs text-sky-900/50">
                {decodeHtmlEntities(product.manufacturer)}
              </span>
            )}
          </div>

          <h3 className="mb-2 line-clamp-3 break-words text-lg font-bold text-sky-950 [overflow-wrap:anywhere] transition-colors group-hover:text-sky-700">
            {productName}
          </h3>
        </Link>

        <div className="mb-3 grid min-w-0 gap-x-4 gap-y-1 text-xs text-sky-900/60 sm:grid-cols-2 xl:grid-cols-4">
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
          <p className="line-clamp-2 break-words text-sm text-sky-900/60 [overflow-wrap:anywhere]">
            {decodeHtmlEntities(product.specs)}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-end justify-between gap-4 border-t border-sky-100 pt-4 sm:w-full md:w-auto md:min-w-[190px] md:flex-col md:items-end md:border-l md:border-t-0 md:pl-4 md:pt-0">
        <div className="text-right">
          <p className="text-xl font-bold text-sky-950 sm:text-2xl">
            {formatPrice(product.price)} HT
          </p>

          {discountPercent &&
            (product as Product & { originalPrice?: number }).originalPrice && (
              <p className="text-sm text-sky-900/45 line-through">
                {formatPrice(
                  Number(
                    (product as Product & { originalPrice?: number })
                      .originalPrice
                  )
                )}{" "}
                HT
              </p>
            )}

          {product.priceTTC && (
            <p className="text-sm text-sky-900/50">
              {formatPrice(product.priceTTC)} TTC
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Link
            to={`/produit/${product.slug}`}
            className="inline-flex items-center rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 hover:shadow-[0_10px_24px_rgba(3,105,161,0.22)]"
          >
            Voir la fiche →
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProductGridItem({ product }: { product: Product }) {
  const productName = decodeHtmlEntities(product.name);
  const discountPercent = getPromotionDiscountPercent(product);

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-[0_18px_42px_rgba(3,105,161,0.16)]">
      <Link to={`/produit/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-sky-50">
          <img
            src={product.image || "/placeholder-product.png"}
            alt={productName}
            loading="lazy"
            data-original-src={product.image || "/placeholder-product.png"}
            onError={handleProductImageError}
            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.03]"
          />

          <div className="absolute right-3 top-3">
            <StatusPill
              label={product.stock ? "En stock" : "Rupture"}
              variant={product.stock ? "success" : "warning"}
            />
          </div>

          {discountPercent && (
            <div className="absolute left-3 top-3">
              <StatusPill
                label={`Promo -${discountPercent}%`}
                variant="promo"
              />
            </div>
          )}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <Link to={`/produit/${product.slug}`} className="block flex-1">
          <h3 className="mb-2 line-clamp-3 break-words text-lg font-bold text-sky-950 [overflow-wrap:anywhere] transition-colors group-hover:text-sky-700">
            {productName}
          </h3>

          <div className="mb-4 min-w-0 space-y-1 text-xs text-sky-900/60">
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
          <p className="text-2xl font-bold text-sky-950">
            {formatPrice(product.price)} HT
          </p>

          {discountPercent &&
            (product as Product & { originalPrice?: number }).originalPrice && (
              <p className="text-sm text-sky-900/45 line-through">
                {formatPrice(
                  Number(
                    (product as Product & { originalPrice?: number })
                      .originalPrice
                  )
                )}{" "}
                HT
              </p>
            )}

          {product.priceTTC && (
            <p className="text-sm text-sky-900/50">
              {formatPrice(product.priceTTC)} TTC
            </p>
          )}

          <Link
            to={`/produit/${product.slug}`}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 hover:shadow-[0_10px_24px_rgba(3,105,161,0.22)]"
          >
            Voir la fiche →
          </Link>
        </div>
      </div>
    </article>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="min-w-0 break-words [overflow-wrap:anywhere]">
      <span className="font-medium text-sky-900/70">{label} :</span>{" "}
      <span>{decodeHtmlEntities(value)}</span>
    </p>
  );
}

function StatusPill({
  label,
  variant,
}: {
  label: string;
  variant: "success" | "warning" | "brand" | "promo";
}) {
  const styles = {
    success: "border-sky-200 bg-sky-50 text-sky-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    brand: "border-cyan-100 bg-cyan-50 text-cyan-700",
    promo: "border-cyan-200 bg-cyan-300 text-sky-950",
  };
  const baseClass =
    variant === "promo"
      ? "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-black uppercase tracking-wide shadow-[0_0_18px_rgba(103,232,249,0.35)]"
      : "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`${baseClass} ${styles[variant]}`}
    >
      {decodeHtmlEntities(label)}
    </span>
  );
}
