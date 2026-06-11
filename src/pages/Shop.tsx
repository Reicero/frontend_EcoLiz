import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
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

type FilterKey =
  | "brand"
  | "condition"
  | "os"
  | "screen"
  | "cpu"
  | "ram"
  | "storage"
  | "storageType"
  | "gpu"
  | "ports"
  | "speed"
  | "poe";

type SelectedFilters = Record<FilterKey, string[]>;

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

const EMPTY_FILTERS: SelectedFilters = {
  brand: [],
  condition: [],
  os: [],
  screen: [],
  cpu: [],
  ram: [],
  storage: [],
  storageType: [],
  gpu: [],
  ports: [],
  speed: [],
  poe: [],
};

const FILTER_GROUPS: Array<{
  key: FilterKey;
  title: string;
  options: string[];
}> = [
  {
    key: "brand",
    title: "Marque",
    options: ["HP / HPE", "Dell", "Lenovo", "Apple", "Cisco", "Autres marques"],
  },
  {
    key: "condition",
    title: "État",
    options: ["Neuf", "Reconditionné", "Grade B", "Autre"],
  },
  {
    key: "os",
    title: "OS",
    options: [
      "Windows 11 Pro",
      "Windows 10 Pro",
      "Windows 11 Home",
      "Windows 11 SE",
      "Chrome OS",
      "macOS",
      "Linux",
      "FreeDOS",
      "Non renseigné",
    ],
  },
  {
    key: "screen",
    title: "Taille écran",
    options: [
      "13 pouces",
      "14 pouces",
      "15 pouces",
      "16 pouces",
      "24 pouces",
      "27 pouces",
      "32 pouces",
    ],
  },
  {
    key: "cpu",
    title: "Processeur",
    options: [
      "Intel Core i3",
      "Intel Core i5",
      "Intel Core i7",
      "Intel Xeon",
      "AMD Ryzen",
      "Autre",
    ],
  },
  {
    key: "ram",
    title: "RAM",
    options: ["8 Go", "16 Go", "32 Go", "64 Go", "128 Go et plus"],
  },
  {
    key: "storage",
    title: "Stockage",
    options: ["128 Go", "256 Go", "512 Go", "1 To", "2 To et plus"],
  },
  {
    key: "storageType",
    title: "Type de stockage",
    options: ["HDD", "SSD", "SAS", "SATA", "NVMe"],
  },
  {
    key: "gpu",
    title: "Carte graphique",
    options: ["Intel Graphics", "NVIDIA", "AMD Radeon", "Autre"],
  },
  {
    key: "ports",
    title: "Nombre de ports",
    options: ["8 ports", "24 ports", "48 ports"],
  },
  {
    key: "speed",
    title: "Débit",
    options: ["1G", "10G", "25G", "40G"],
  },
  {
    key: "poe",
    title: "PoE",
    options: ["PoE", "Non PoE"],
  },
];

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

function getProductSearchText(product: Product) {
  return normalizeText(
    decodeHtmlEntities(
      [
        product.name,
        product.sku,
        product.ean,
        product.manufacturerPartNumber,
        product.category,
        product.manufacturer,
        product.status,
        product.conditionLabel,
        product.os,
        product.productGroup,
        product.specs,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
    )
  );
}

function optionMatchesProduct(
  product: Product,
  filterKey: FilterKey,
  option: string
) {
  const text = getProductSearchText(product);
  const optionText = normalizeText(option);

  if (filterKey === "brand") {
    const brand = normalizeText(product.manufacturer || "");

    if (option === "HP / HPE") {
      return (
        brand === "hp" ||
        brand.includes("hpe") ||
        brand.includes("hewlett") ||
        text.includes("hewlett packard")
      );
    }

    if (option === "Autres marques") {
      return (
        brand.length > 0 &&
        !["dell", "lenovo", "apple", "cisco", "hp", "hpe"].some(
          (knownBrand) => brand.includes(knownBrand)
        )
      );
    }

    return brand.includes(optionText) || text.includes(optionText);
  }

  if (filterKey === "condition") {
    const condition = normalizeText(
      product.conditionLabel || product.status || ""
    );

    if (option === "Autre") {
      return (
        condition.length > 0 &&
        !["neuf", "reconditionne", "grade b"].some((knownCondition) =>
          condition.includes(knownCondition)
        )
      );
    }

    return condition.includes(optionText) || text.includes(optionText);
  }

  if (filterKey === "os") {
    const os = normalizeText(product.os || "");

    if (option === "Windows 11 Pro") {
      return os.includes("w11p") || os.includes("windows 11 pro");
    }

    if (option === "Windows 10 Pro") {
      return os.includes("w10p") || os.includes("windows 10 pro");
    }

    if (option === "Windows 11 Home") {
      return os.includes("w11h") || os.includes("windows 11 home");
    }

    if (option === "Windows 11 SE") {
      return os.includes("w11 se") || os.includes("windows 11 se");
    }

    if (option === "Non renseigné") {
      return !product.os;
    }

    return os.includes(optionText) || text.includes(optionText);
  }

  if (filterKey === "screen") {
    const screenValue = option.replace(" pouces", "");
    const screenRegex = new RegExp(
      `\\b${screenValue}(?:[.,]\\d+)?\\s*(?:\\"|″|inch(?:es)?|pouces?)\\b`,
      "i"
    );

    return screenRegex.test(text);
  }

  if (filterKey === "cpu") {
    if (option === "Intel Core i3") return /\b(?:core\s*)?i3\b/.test(text);
    if (option === "Intel Core i5") return /\b(?:core\s*)?i5\b/.test(text);
    if (option === "Intel Core i7") return /\b(?:core\s*)?i7\b/.test(text);
    if (option === "Intel Xeon") return /\bxeon\b/.test(text);
    if (option === "AMD Ryzen") return /\bryzen\b/.test(text);

    return (
      (text.includes("cpu") || text.includes("processeur")) &&
      !["i3", "i5", "i7", "xeon", "ryzen"].some((cpu) =>
        text.includes(cpu)
      )
    );
  }

  if (filterKey === "ram") {
    if (option === "128 Go et plus") {
      return /\b(?:128|192|256|512)\s*(?:gb|go)\b/.test(text);
    }

    const ramValue = option.replace(" Go", "");
    const ramRegex = new RegExp(`\\b${ramValue}\\s*(?:gb|go)\\b`, "i");

    return ramRegex.test(text);
  }

  if (filterKey === "storage") {
    if (option === "1 To") {
      return /\b(?:1\s*(?:tb|to)|1000\s*(?:gb|go))\b/.test(text);
    }

    if (option === "2 To et plus") {
      return /\b(?:2|3|4|6|8|10|12|16)\s*(?:tb|to)\b/.test(text);
    }

    const storageValue = option.replace(" Go", "");
    const storageRegex = new RegExp(
      `\\b${storageValue}\\s*(?:gb|go)\\b`,
      "i"
    );

    return storageRegex.test(text);
  }

  if (filterKey === "storageType") {
    return new RegExp(`\\b${optionText}\\b`, "i").test(text);
  }

  if (filterKey === "gpu") {
    if (option === "Intel Graphics") {
      return (
        text.includes("intel graphics") ||
        text.includes("uhd graphics") ||
        text.includes("iris xe")
      );
    }

    if (option === "NVIDIA") {
      return (
        text.includes("nvidia") ||
        text.includes("quadro") ||
        text.includes("geforce") ||
        text.includes("rtx")
      );
    }

    if (option === "AMD Radeon") {
      return text.includes("radeon");
    }

    return (
      (text.includes("graphics") || text.includes("gpu")) &&
      ![
        "intel graphics",
        "uhd graphics",
        "iris xe",
        "nvidia",
        "quadro",
        "geforce",
        "rtx",
        "radeon",
      ].some((gpu) => text.includes(gpu))
    );
  }

  if (filterKey === "ports") {
    const portValue = option.replace(" ports", "");
    const portRegex = new RegExp(
      `\\b${portValue}\\s*(?:ports?|port)|\\b${portValue}x\\b`,
      "i"
    );

    return portRegex.test(text);
  }

  if (filterKey === "speed") {
    if (option === "1G") {
      return /\b1\s*(?:g|gbe|gbps)\b/.test(text) || text.includes("gigabit");
    }

    if (option === "10G") return /\b10\s*(?:g|gbe|gbps)\b/.test(text);
    if (option === "25G") return /\b25\s*(?:g|gbe|gbps)\b/.test(text);
    if (option === "40G") return /\b40\s*(?:g|gbe|gbps)\b/.test(text);
  }

  if (filterKey === "poe") {
    if (option === "PoE") {
      return /\bpoe(?:\+|\+\+)?\b/.test(text);
    }

    return !/\bpoe(?:\+|\+\+)?\b/.test(text);
  }

  return text.includes(optionText);
}

function productMatchesSelectedFilters(
  product: Product,
  selectedFilters: SelectedFilters
) {
  return Object.entries(selectedFilters).every(([key, selectedOptions]) => {
    if (selectedOptions.length === 0) return true;

    return selectedOptions.some((option) =>
      optionMatchesProduct(product, key as FilterKey, option)
    );
  });
}

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<WooCategory[]>([]);

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
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
  const [selectedStockStatuses, setSelectedStockStatuses] = useState<
    Array<"instock" | "outofstock">
  >([]);

  const [selectedFilters, setSelectedFilters] =
    useState<SelectedFilters>(EMPTY_FILTERS);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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
    const timeout = window.setTimeout(() => {
      setCurrentPage(1);
      setSearchTerm(searchInput.trim());
    }, 400);

    return () => window.clearTimeout(timeout);
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
        setTotalPages(Math.max(result.totalPages, 1));
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

  function toggleTextFilter(filterKey: FilterKey, option: string) {
    setCurrentPage(1);

    setSelectedFilters((currentFilters) => {
      const currentOptions = currentFilters[filterKey];

      return {
        ...currentFilters,
        [filterKey]: currentOptions.includes(option)
          ? currentOptions.filter((item) => item !== option)
          : [...currentOptions, option],
      };
    });
  }

  function toggleCategoryGroup(title: string) {
    setExpandedCategoryGroup((currentGroup) =>
      currentGroup === title ? null : title
    );
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
    setSelectedStockStatuses([]);
    setSelectedFilters(EMPTY_FILTERS);
    setExpandedCategoryGroup(null);
    setExpandedFilterGroup(null);
    setSortOption("default");
    setProductsPerPage(24);
    setCurrentPage(1);
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

  const textFilterCount = Object.values(selectedFilters).reduce(
    (total, values) => total + values.length,
    0
  );

  const activeFilterCount =
    selectedCategoryIds.length +
    selectedStockStatuses.length +
    textFilterCount +
    (searchTerm ? 1 : 0);

  const categoryGroups = getCategoryGroups(categories);
  const paginationPages = getPaginationPages();

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        productMatchesSelectedFilters(product, selectedFilters)
      ),
    [products, selectedFilters]
  );

  return (
    <section className="min-h-screen bg-brand-50 pb-24 pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">
            Catalogue professionnel
          </p>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-brand-950 lg:text-5xl">
                Boutique{" "}
                <span className="font-display italic text-accent-500">
                  EcoLiz
                </span>
              </h1>

              <p className="max-w-3xl text-lg text-brand-900/70">
                Matériel informatique professionnel, neuf et reconditionné, avec
                prix HT/TTC, disponibilité et informations techniques.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-brand-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-sm text-brand-900/60">Produits trouvés</p>
              <p className="text-2xl font-bold text-brand-950">
                {totalProducts}
              </p>
            </div>
          </div>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside
            className="
              self-start rounded-2xl border border-brand-100 bg-white p-5
              lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)]
              lg:overflow-y-auto lg:overscroll-contain
            "
          >
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

            <div className="mb-5">
              <h3 className="mb-3 text-sm font-semibold text-brand-950">
                Catégorie
              </h3>

              {categoriesLoading ? (
                <p className="text-sm text-brand-900/50">
                  Chargement des catégories…
                </p>
              ) : categoryGroups.length === 0 ? (
                <p className="text-sm text-brand-900/50">
                  Aucune catégorie disponible.
                </p>
              ) : (
                <div className="space-y-2">
                  {categoryGroups.map((group) => (
                    <CategoryFilterGroup
                      key={group.title}
                      group={group}
                      isOpen={expandedCategoryGroup === group.title}
                      selectedCategoryIds={selectedCategoryIds}
                      onToggleGroup={() => toggleCategoryGroup(group.title)}
                      onToggleCategory={(categoryId) =>
                        toggleNumberFilter(
                          categoryId,
                          selectedCategoryIds,
                          setSelectedCategoryIds
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>

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

            {FILTER_GROUPS.map((group) => (
              <FilterGroup
                key={group.key}
                title={group.title}
                options={group.options}
                selectedOptions={selectedFilters[group.key]}
                isOpen={expandedFilterGroup === group.key}
                onToggleGroup={() => toggleFilterGroup(group.key)}
                onToggle={(option) => toggleTextFilter(group.key, option)}
              />
            ))}

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

          <main className="min-w-0">
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-brand-100 bg-white p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative min-w-0 flex-1 xl:max-w-xl">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-900/40" />

                  <input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Rechercher par nom, marque, référence…"
                    className="w-full rounded-xl border border-brand-100 bg-brand-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                  />
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
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2 text-sm text-brand-900/60">
                  <SlidersHorizontal className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    Page {currentPage} / {totalPages}
                  </span>
                </div>

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

            {loading ? (
              <div className="rounded-2xl border border-brand-100 bg-white py-20 text-center text-brand-900/50">
                Chargement du catalogue…
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-brand-100 bg-white py-20 text-center text-brand-900/50">
                Aucun produit ne correspond aux filtres sélectionnés.
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="grid min-w-0 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductGridItem key={product.id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
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
                  className="rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-brand-900 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                      aria-current={currentPage === Number(page) ? "page" : undefined}
                      className={`h-11 w-11 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        currentPage === page
                          ? "border-brand-700 bg-brand-700 text-white"
                          : "border-emerald-200 bg-white/70 text-brand-900 hover:bg-emerald-50"
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
                  className="rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-brand-900 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Suivant
                </button>
              </nav>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}

function CategoryFilterGroup({
  group,
  isOpen,
  selectedCategoryIds,
  onToggleGroup,
  onToggleCategory,
}: {
  group: CategoryGroup;
  isOpen: boolean;
  selectedCategoryIds: number[];
  onToggleGroup: () => void;
  onToggleCategory: (categoryId: number) => void;
}) {
  const selectedCount = group.children.filter((category) =>
    selectedCategoryIds.includes(category.id)
  ).length;

  const productCount = group.children.reduce(
    (total, category) => total + (category.count ?? 0),
    0
  );

  return (
    <div className="overflow-hidden rounded-xl border border-brand-100 bg-white">
      <button
        type="button"
        onClick={onToggleGroup}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-brand-50"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-brand-950">
            {group.title}
          </span>

          {selectedCount > 0 && (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
              {selectedCount}
            </span>
          )}
        </span>

        <span className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-brand-900/40">{productCount}</span>

          <ChevronDown
            className={`h-4 w-4 text-brand-900/50 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <div className="space-y-2 border-t border-brand-100 bg-brand-50/40 px-3 py-3">
          {group.children.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center justify-between gap-2 text-sm text-brand-900/70"
            >
              <span className="flex min-w-0 items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(category.id)}
                  onChange={() => onToggleCategory(category.id)}
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
      )}
    </div>
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
  options: string[];
  selectedOptions: string[];
  isOpen: boolean;
  onToggleGroup: () => void;
  onToggle: (option: string) => void;
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
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 text-sm text-brand-900/70"
            >
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={() => onToggle(option)}
                className="rounded border-brand-300 text-brand-700 focus:ring-brand-700"
              />

              <span className="break-words">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductListItem({ product }: { product: Product }) {
  const productName = decodeHtmlEntities(product.name);

  return (
    <Link
      to={`/produit/${product.slug}`}
      className="group flex min-w-0 flex-col gap-5 overflow-hidden rounded-2xl border border-brand-100 bg-white p-4 transition-all hover:shadow-lg hover:shadow-brand-900/10 sm:flex-row"
    >
      <div className="h-48 w-full shrink-0 overflow-hidden rounded-xl border border-brand-100 bg-brand-50 sm:h-32 sm:w-40">
        <img
          src={product.image || "/placeholder-product.png"}
          alt={productName}
          loading="lazy"
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="min-w-0 flex-1">
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

      <div className="flex shrink-0 items-end justify-between gap-4 border-t border-brand-100 pt-4 sm:w-full md:w-auto md:min-w-[150px] md:flex-col md:items-end md:border-l md:border-t-0 md:pl-4 md:pt-0">
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

        <span className="text-sm font-medium text-brand-700 group-hover:underline">
          Voir le produit →
        </span>
      </div>
    </Link>
  );
}

function ProductGridItem({ product }: { product: Product }) {
  const productName = decodeHtmlEntities(product.name);

  return (
    <Link
      to={`/produit/${product.slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white transition-all hover:shadow-lg hover:shadow-brand-900/10"
    >
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

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-3 break-words text-lg font-bold text-brand-950 [overflow-wrap:anywhere]">
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
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
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
