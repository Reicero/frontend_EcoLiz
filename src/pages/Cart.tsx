import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { getCart, updateCartItem, removeCartItem, applyCoupon, removeCoupon } from '../services/cart'

type WooCartItem = {
  key: string
  id: number
  sku?: string
  name: string
  quantity: number
  images?: {
    src?: string
    thumbnail?: string
    alt?: string
  }[]
  prices?: {
    price?: string
    regular_price?: string
    currency_minor_unit?: number
  }
  totals?: {
    line_total?: string
    line_subtotal?: string
    currency_minor_unit?: number
  }
}

type WooCartCoupon = {
  code: string
  totals?: {
    total_discount?: string
    currency_minor_unit?: number
  }
}

type WooCart = {
  items: WooCartItem[]
  items_count: number
  coupons?: WooCartCoupon[]
  totals?: {
    total_price?: string
    total_items?: string
    total_discount?: string
    total_fees?: string
    total_fees_tax?: string
    currency_minor_unit?: number
  }
}

const CART_PRODUCT_METADATA_STORAGE_KEY = "ecoliz_cart_product_metadata_v1"

const QUOTE_ONLY_SERVICE_PRODUCT_IDS = new Set([
  16878,
  16879,
  16880,
  16881,
  16882,
  16883,
  16884,
  16885,
  16886,
  16887,
  16888,
  16889,
])

const QUOTE_ONLY_SERVICE_NAMES = new Set([
  "mco wi-fi / waas",
  "mco lan / wlan",
  "firewall as a service",
  "mco server / iaas",
  "stockage objet s3 & sauvegarde",
  "cybersecurite bitdefender edr / xdr / mdr",
  "conseil en licences microsoft",
  "operateur lan to lan / fibre xdsl",
  "helpdesk / assistance utilisateur",
  "design et conseil infrastructure si",
  "audit et conseil wi-fi",
  "integration et support",
])

function normalizeCartText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

function isQuoteOnlyCartItem(item: WooCartItem) {
  const sku = item.sku?.toUpperCase() ?? ""

  return (
    sku.startsWith("HABEUM-SVC-") ||
    QUOTE_ONLY_SERVICE_PRODUCT_IDS.has(item.id) ||
    QUOTE_ONLY_SERVICE_NAMES.has(normalizeCartText(item.name))
  )
}

type CartProductTag = {
  name: string
  value: string
}

type CartProductMetadata = {
  tags?: CartProductTag[]
  category?: string
  productGroup?: string
  keyboardLayout?: string
  thermocollageEligible?: boolean
  thermocollageRequested?: boolean
}

function getCartProductMetadata(productId: number): CartProductMetadata | null {
  try {
    const raw = localStorage.getItem(CART_PRODUCT_METADATA_STORAGE_KEY)
    if (!raw) return null

    const data = JSON.parse(raw)
    return data[String(productId)] ?? null
  } catch {
    return null
  }
}

const PC_DELIVERY_CATEGORY_NAMES = new Set([
  "notebook",
  "notebooks",
  "pc fixe",
  "pc fixes",
  "pc-fixe",
  "pc-fixes",
  "workstation",
  "workstations fixes",
  "workstation mobile",
  "workstations mobiles",
  "workstation-mobile",
  "workstations-mobiles",
  "chromebooks",
  "chromebooks-pc",
  "tablettes",
  "tablettes-pc",
  "all-in-one",
  "all-in-one-pc",
])

function getCartMetadataTagValue(
  metadata: CartProductMetadata | null,
  label: string
): string {
  return (
    metadata?.tags?.find(
      (tag) => normalizeCartText(tag.name) === normalizeCartText(label)
    )?.value ?? ""
  )
}

function getCartItemDeliveryCategory(item: WooCartItem): string {
  const metadata = getCartProductMetadata(item.id)

  return (
    metadata?.category ||
    getCartMetadataTagValue(metadata, "Catégorie")
  )
}

const PC_DELIVERY_TAG_LABELS = new Set([
  "processeur",
  "ram",
  "stockage",
  "taille ecran",
  "clavier",
  "resolution",
])

function hasPcDeliveryMetadataTags(metadata: CartProductMetadata | null): boolean {
  const matchingTags =
    metadata?.tags?.filter((tag) =>
      PC_DELIVERY_TAG_LABELS.has(normalizeCartText(tag.name))
    ) ?? []

  return matchingTags.length >= 2
}

function isPcDeliveryCartItem(item: WooCartItem): boolean {
  if (isQuoteOnlyCartItem(item)) {
    return false
  }

  const metadata = getCartProductMetadata(item.id)
  const category = normalizeCartText(getCartItemDeliveryCategory(item))

  return (
    PC_DELIVERY_CATEGORY_NAMES.has(category) ||
    hasPcDeliveryMetadataTags(metadata)
  )
}

function updateCartProductThermocollage(
  productId: number,
  requested: boolean
): void {
  const raw = localStorage.getItem(CART_PRODUCT_METADATA_STORAGE_KEY)
  const data = raw ? JSON.parse(raw) : {}
  const currentMetadata = data[String(productId)] ?? {}

  data[String(productId)] = {
    ...currentMetadata,
    thermocollageEligible: true,
    thermocollageRequested: requested,
  }

  localStorage.setItem(
    CART_PRODUCT_METADATA_STORAGE_KEY,
    JSON.stringify(data)
  )
}

function formatWooPrice(value?: string, minorUnit = 2): string {
  if (!value) return '0,00 €'
  const num = Number(value) / Math.pow(10, minorUnit)
  return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function normalizeWooImageUrl(value?: string): string {
  if (!value) return ""

  return value.replace(
    /^https?:\/\/90\.51\.128\.107:12443/i,
    ""
  )
}

function buildQuantityInputs(cart: WooCart): Record<string, string> {
  return Object.fromEntries(cart.items.map((item) => [item.key, String(item.quantity)]))
}

export function Cart() {
  const [cart, setCart] = useState<WooCart | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponMessage, setCouponMessage] = useState<string | null>(null)
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({})

  async function loadCart() {
    try {
      setLoading(true)
      setError(null)

      const data = await getCart()
      setCart(data)
      setQuantityInputs(buildQuantityInputs(data))
    } catch (err) {
      console.error('Erreur chargement panier :', err)
      setError('Impossible de charger le panier.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  function handleThermocollageChange(
    item: WooCartItem,
    requested: boolean
  ) {
    try {
      setError(null)
      updateCartProductThermocollage(item.id, requested)

      // Force le réaffichage après la modification du localStorage.
      setCart((currentCart) =>
        currentCart ? { ...currentCart } : currentCart
      )
    } catch (err) {
      console.error("Erreur modification thermocollage :", err)
      setError("Impossible de modifier l’option de thermocollage.")
    }
  }

  async function handleUpdateQuantity(item: WooCartItem, quantity: number) {
    if (quantity < 1) return

    try {
      setUpdatingKey(item.key)
      setError(null)

      const updatedCart = await updateCartItem(item.key, quantity)
      setCart(updatedCart)
      setQuantityInputs(buildQuantityInputs(updatedCart))
    } catch (err) {
      console.error('Erreur mise à jour quantité :', err)
      setError('Impossible de modifier la quantité.')

      setQuantityInputs((previous) => ({
        ...previous,
        [item.key]: String(item.quantity),
      }))
    } finally {
      setUpdatingKey(null)
    }
  }

  function handleQuantityInputChange(item: WooCartItem, value: string) {
    setQuantityInputs((previous) => ({
      ...previous,
      [item.key]: value,
    }))
  }

  function handleQuantityInputValidate(item: WooCartItem) {
    const value = quantityInputs[item.key] || ''
    const quantity = parseInt(value, 10)

    if (Number.isNaN(quantity) || quantity < 1) {
      setQuantityInputs((previous) => ({
        ...previous,
        [item.key]: String(item.quantity),
      }))
      return
    }

    if (quantity !== item.quantity) {
      void handleUpdateQuantity(item, quantity)
    }
  }

  async function handleRemoveItem(item: WooCartItem) {
    try {
      setUpdatingKey(item.key)
      setError(null)

      const updatedCart = await removeCartItem(item.key)
      setCart(updatedCart)
      setQuantityInputs(buildQuantityInputs(updatedCart))
    } catch (err) {
      console.error('Erreur suppression produit :', err)
      setError('Impossible de supprimer ce produit.')
    } finally {
      setUpdatingKey(null)
    }
  }

  async function handleApplyCoupon(event: React.FormEvent) {
    event.preventDefault()

    const code = couponCode.trim()

    if (!code) {
      setCouponMessage("Merci d’indiquer un code promo.")
      return
    }

    try {
      setCouponLoading(true)
      setError(null)
      setCouponMessage(null)

      const updatedCart = await applyCoupon(code)
      setCart(updatedCart)
      setCouponCode("")
      setCouponMessage("Code promo appliqué.")
    } catch (err) {
      console.error("Erreur code promo :", err)
      setCouponMessage("Code promo invalide ou non applicable.")
    } finally {
      setCouponLoading(false)
    }
  }

  async function handleRemoveCoupon(code: string) {
    try {
      setCouponLoading(true)
      setError(null)
      setCouponMessage(null)

      const updatedCart = await removeCoupon(code)
      setCart(updatedCart)
      setCouponMessage("Code promo retiré.")
    } catch (err) {
      console.error("Erreur suppression code promo :", err)
      setCouponMessage("Impossible de retirer le code promo.")
    } finally {
      setCouponLoading(false)
    }
  }


  const items = cart?.items ?? []
  const minorUnit = cart?.totals?.currency_minor_unit ?? 2

  const quoteItems = items.filter(isQuoteOnlyCartItem)
  const paidItems = items.filter((item) => !isQuoteOnlyCartItem(item))
  const quoteItemsCount = quoteItems.reduce((sum, item) => sum + item.quantity, 0)
  const paidItemsCount = paidItems.reduce((sum, item) => sum + item.quantity, 0)
  const hasQuoteItems = quoteItems.length > 0
  const hasPaidItems = paidItems.length > 0

  const totalHT =
    paidItems.reduce((sum, item) => {
      const lineTotal = item.totals?.line_total
      return sum + (lineTotal ? Number(lineTotal) : 0)
    }, 0) / Math.pow(10, minorUnit)

  const coupons = cart?.coupons ?? []
  const couponDiscountHT =
    coupons.reduce((sum, coupon) => {
      const discount = coupon.totals?.total_discount
      return sum + (discount ? Number(discount) : 0)
    }, 0) / Math.pow(10, minorUnit)

  const totalAfterDiscountHT = Math.max(totalHT - couponDiscountHT, 0)

  const deliveryFeeHT =
    Number(cart?.totals?.total_fees ?? 0) / Math.pow(10, minorUnit)

  const pcItemsCount = paidItems.reduce(
    (sum, item) => sum + (isPcDeliveryCartItem(item) ? item.quantity : 0),
    0
  )

  const hasNonPcPaidItems = paidItems.some(
    (item) => !isPcDeliveryCartItem(item)
  )

  const hasAutomaticDeliveryFee = deliveryFeeHT > 0
  const deliveryOnQuote = hasNonPcPaidItems && !hasAutomaticDeliveryFee
  const deliveryIsFree =
    hasPaidItems && !deliveryOnQuote && deliveryFeeHT <= 0 && pcItemsCount > 10

  const totalWithDeliveryHT =
    totalAfterDiscountHT + (deliveryOnQuote ? 0 : deliveryFeeHT)

  const checkoutLabel = "Valider mon panier"

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/boutique" className="mb-8 inline-flex items-center gap-2 text-brand-700 hover:text-brand-800">
          <ArrowLeft className="h-4 w-4" />
          Retour à la boutique
        </Link>

        <h1 className="text-4xl sm:text-5xl font-bold text-brand-950 mb-8">Votre panier</h1>

        {loading ? (
          <div className="text-center text-brand-900/50 py-16">Chargement du panier…</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-brand-100 bg-white p-8 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-brand-900/30 mb-4" />
            <h2 className="text-xl font-bold text-brand-950 mb-2">Panier vide</h2>
            <p className="text-brand-900/60 mb-6">Commencez à ajouter des produits pour remplir votre panier.</p>
            <Link to="/boutique" className="inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3 text-white font-semibold hover:bg-brand-800 transition-colors">
              Voir la boutique
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              {items.map((item) => {
                const image = normalizeWooImageUrl(item.images?.[0]?.src || item.images?.[0]?.thumbnail)
                const lineTotal = item.totals?.line_total
                const isUpdating = updatingKey === item.key
                const metadata = getCartProductMetadata(item.id)
                const productTags = metadata?.tags ?? []
                const isQuoteOnly = isQuoteOnlyCartItem(item)

                return (
                  <div key={item.key} className="bg-white rounded-3xl border border-brand-100 p-5 shadow-sm flex flex-col sm:flex-row gap-5">
                    <div className="w-full sm:w-32 h-32 bg-brand-50 rounded-2xl overflow-hidden border border-brand-100 flex-shrink-0">
                      {image ? (
                        <img src={image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-900/30 text-sm">Image</div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-brand-950 mb-2">{item.name}</h2>

                          {productTags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {productTags.map((tag) => (
                                <span
                                  key={`${item.key}-${tag.name}`}
                                  className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800"
                                >
                                  {tag.name} : {tag.value}
                                </span>
                              ))}
                            </div>
                          )}

                          {metadata?.thermocollageEligible && (
                            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-900">
                              <input
                                type="checkbox"
                                checked={Boolean(metadata.thermocollageRequested)}
                                onChange={(event) =>
                                  handleThermocollageChange(
                                    item,
                                    event.target.checked
                                  )
                                }
                                className="h-4 w-4 accent-brand-700"
                              />

                              <span>
                                Thermocollage AZERTY offert
                              </span>
                            </label>
                          )}

                          {isQuoteOnly ? (
                            <div className="mt-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm">
                              <p className="font-bold text-brand-950">Sur devis</p>
                              <p className="mt-1 text-brand-900/60">
                                Ce service fera l’objet d’un devis personnalisé.
                              </p>
                            </div>
                          ) : (
                            <p className="mt-3 text-brand-900/60">
                              {formatWooPrice(item.totals?.line_total, minorUnit)}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleRemoveItem(item)}
                          disabled={isUpdating}
                          className="inline-flex items-center justify-center rounded-lg bg-red-50 p-3 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {isQuoteOnly ? (
                        <div className="mt-4 inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800">
                          Demande de devis
                          {item.quantity > 1 ? ` · quantité : ${item.quantity}` : ""}
                        </div>
                      ) : (
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleUpdateQuantity(item, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                            className="inline-flex items-center justify-center rounded-lg border border-brand-200 p-2 hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Diminuer la quantité"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <input
                            type="number"
                            min="1"
                            value={quantityInputs[item.key] || ''}
                            onChange={(e) => handleQuantityInputChange(item, e.target.value)}
                            onBlur={() => handleQuantityInputValidate(item)}
                            disabled={isUpdating}
                            className="w-16 rounded-lg border border-brand-200 px-2 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Quantité"
                          />

                          <button
                            type="button"
                            onClick={() => void handleUpdateQuantity(item, item.quantity + 1)}
                            disabled={isUpdating}
                            className="inline-flex items-center justify-center rounded-lg border border-brand-200 p-2 hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Augmenter la quantité"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <aside className="lg:col-span-1">
              <div className="rounded-2xl border border-brand-100 bg-white p-8 sticky top-24">
                <h2 className="text-xl font-bold text-brand-950 mb-6">Récapitulatif</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-brand-200">
                  {paidItemsCount > 0 && (
                    <div className="flex items-center justify-between text-brand-900/70">
                      <span>Articles payants</span>
                      <span>{paidItemsCount}</span>
                    </div>
                  )}

                  {quoteItemsCount > 0 && (
                    <div className="flex items-center justify-between text-brand-900/70">
                      <span>Demandes sur devis</span>
                      <span>{quoteItemsCount}</span>
                    </div>
                  )}

                  {coupons.length > 0 && (
                    <div className="space-y-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      {coupons.map((coupon) => (
                        <div key={coupon.code} className="flex items-center justify-between gap-3">
                          <span>
                            Code promo <strong>{coupon.code}</strong>
                            {couponDiscountHT > 0 && (
                              <> · -{formatWooPrice(String(couponDiscountHT * Math.pow(10, minorUnit)), minorUnit)} HT</>
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => void handleRemoveCoupon(coupon.code)}
                            disabled={couponLoading}
                            className="text-xs font-semibold underline disabled:opacity-50"
                          >
                            Retirer
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {hasPaidItems && (
                    <div className="flex items-center justify-between text-brand-900/70">
                      <span>Sous-total produits</span>
                      <span>
                        {formatWooPrice(
                          String(totalHT * Math.pow(10, minorUnit)),
                          minorUnit
                        )} HT
                      </span>
                    </div>
                  )}

                  {couponDiscountHT > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Remise</span>
                      <span>
                        -{formatWooPrice(
                          String(couponDiscountHT * Math.pow(10, minorUnit)),
                          minorUnit
                        )} HT
                      </span>
                    </div>
                  )}

                  {paidItemsCount > 0 && (
                    <div className="flex items-center justify-between text-brand-900/70">
                      <span>Frais de livraison</span>
                      <span>
                        {deliveryOnQuote
                          ? "Sur devis"
                          : deliveryIsFree
                            ? "Offert"
                            : `${formatWooPrice(
                                String(deliveryFeeHT * Math.pow(10, minorUnit)),
                                minorUnit
                              )} HT`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-brand-950 font-bold text-xl">
                    <span>
                      {deliveryOnQuote
                        ? "Total HT hors livraison"
                        : "Total HT"}
                    </span>

                    <span>
                      {hasPaidItems
                        ? formatWooPrice(
                            String(totalWithDeliveryHT * Math.pow(10, minorUnit)),
                            minorUnit
                          )
                        : "Sur devis"}
                    </span>
                  </div>

                  {(deliveryOnQuote || deliveryIsFree) && (
                    <p className="text-xs text-brand-900/50">
                      {deliveryOnQuote
                        ? "Les frais de livraison des produits hors PC seront confirmés sur devis avant paiement."
                        : "Livraison offerte pour plus de 10 PC."}
                    </p>
                  )}
                </div>

                {hasPaidItems && (
                  <details className="mb-5">
                    <summary className="cursor-pointer text-sm font-medium text-brand-900/60 underline underline-offset-4 hover:text-brand-700">
                      Ajouter un code promo
                    </summary>

                    <form onSubmit={handleApplyCoupon} className="mt-3 rounded-2xl border border-brand-100 bg-brand-50 p-4">
                    <label className="mb-2 block text-sm font-semibold text-brand-950">
                      Code promo
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value)}
                        className="min-w-0 flex-1 rounded-xl border border-brand-200 px-4 py-2 text-sm uppercase outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        placeholder="Saisir le code"
                        disabled={couponLoading}
                      />

                      <button
                        type="submit"
                        disabled={couponLoading}
                        className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
                      >
                        {couponLoading ? "..." : "Appliquer"}
                      </button>
                    </div>

                    {couponMessage && (
                      <p className="mt-2 text-xs text-brand-900/60">
                        {couponMessage}
                      </p>
                    )}
                    </form>
                  </details>
                )}

                {hasQuoteItems && (
                  <div className="mb-5 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-brand-900/70">
                    Les services sélectionnés seront traités comme une demande de devis personnalisée.
                  </div>
                )}

                <Link to="/checkout" className="mt-6 w-full inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3 text-white font-semibold hover:bg-brand-800 transition-colors">
                  {checkoutLabel}
                </Link>

                <Link to="/boutique" className="mt-3 w-full inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-6 py-3 text-brand-900 font-semibold hover:bg-brand-50 transition-colors">
                  Continuer mes achats
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}
