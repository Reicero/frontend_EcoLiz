import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { getCart, updateCartItem, removeCartItem } from '../services/cart'
import { config } from '../config/env'

type WooCartItem = {
  key: string
  id: number
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

type WooCart = {
  items: WooCartItem[]
  items_count: number
  totals?: {
    total_price?: string
    total_items?: string
    currency_minor_unit?: number
  }
}

const WOO_API_URL = config.wooApiUrl.replace(/\/+$/, '')

function decodeHtmlEntities(value?: string): string {
  if (!value) return ''

  const textarea = document.createElement('textarea')
  textarea.innerHTML = value
  return textarea.value
}

function formatWooPrice(value?: string, minorUnit = 2): string {
  if (!value) return '0,00 €'

  const num = Number(value) / Math.pow(10, minorUnit)

  return (
    num.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' €'
  )
}

function getItemMinorUnit(item: WooCartItem, cartMinorUnit = 2): number {
  return (
    item.prices?.currency_minor_unit ??
    item.totals?.currency_minor_unit ??
    cartMinorUnit
  )
}

function getItemUnitPrice(item: WooCartItem, cartMinorUnit = 2): string {
  const minorUnit = getItemMinorUnit(item, cartMinorUnit)

  if (item.prices?.price) {
    return formatWooPrice(item.prices.price, minorUnit)
  }

  if (item.totals?.line_total && item.quantity > 0) {
    const unitPrice = Math.round(Number(item.totals.line_total) / item.quantity)
    return formatWooPrice(String(unitPrice), minorUnit)
  }

  return '0,00 €'
}

function getItemLinePrice(item: WooCartItem, cartMinorUnit = 2): string {
  const minorUnit = getItemMinorUnit(item, cartMinorUnit)
  return formatWooPrice(item.totals?.line_total, minorUnit)
}

function getCartItemImage(item: WooCartItem, resolvedImages: Record<number, string>): string {
  return decodeHtmlEntities(
    item.images?.[0]?.src ||
      item.images?.[0]?.thumbnail ||
      resolvedImages[item.id] ||
      ''
  )
}

async function fetchProductImage(productId: number): Promise<string> {
  const response = await fetch(`${WOO_API_URL}/products/${productId}`)

  if (!response.ok) {
    return ''
  }

  const product = await response.json()
  return decodeHtmlEntities(product?.images?.[0]?.src || '')
}

async function resolveMissingImages(items: WooCartItem[]): Promise<Record<number, string>> {
  const itemsWithoutImage = items.filter(
    (item) => !item.images?.[0]?.src && !item.images?.[0]?.thumbnail
  )

  if (itemsWithoutImage.length === 0) {
    return {}
  }

  const resolvedEntries = await Promise.all(
    itemsWithoutImage.map(async (item) => {
      const image = await fetchProductImage(item.id)
      return [item.id, image] as const
    })
  )

  return Object.fromEntries(resolvedEntries.filter(([, image]) => image))
}

function buildQuantityInputs(cart: WooCart): Record<string, string> {
  return Object.fromEntries(cart.items.map((item) => [item.key, String(item.quantity)]))
}

export function Cart() {
  const [cart, setCart] = useState<WooCart | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({})
  const [resolvedImages, setResolvedImages] = useState<Record<number, string>>({})

  async function refreshCartState(data: WooCart) {
    setCart(data)
    setQuantityInputs(buildQuantityInputs(data))

    const images = await resolveMissingImages(data.items)

    if (Object.keys(images).length > 0) {
      setResolvedImages((previous) => ({
        ...previous,
        ...images,
      }))
    }
  }

  async function loadCart() {
    try {
      setLoading(true)
      setError(null)

      const data = await getCart()
      await refreshCartState(data)
    } catch (err) {
      console.error('Erreur chargement panier :', err)
      setError('Impossible de charger le panier.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCart()
  }, [])

  async function handleUpdateQuantity(item: WooCartItem, quantity: number) {
    if (quantity < 1) return

    try {
      setUpdatingKey(item.key)
      setError(null)

      const updatedCart = await updateCartItem(item.key, quantity)
      await refreshCartState(updatedCart)
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
      await refreshCartState(updatedCart)
    } catch (err) {
      console.error('Erreur suppression produit :', err)
      setError('Impossible de supprimer ce produit.')
    } finally {
      setUpdatingKey(null)
    }
  }

  const items = cart?.items ?? []
  const minorUnit = cart?.totals?.currency_minor_unit ?? 2

  const totalHT =
    items.reduce((sum, item) => {
      const lineTotal = item.totals?.line_total
      return sum + (lineTotal ? Number(lineTotal) : 0)
    }, 0) / Math.pow(10, minorUnit)

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/boutique" className="mb-8 inline-flex items-center gap-2 text-brand-700 hover:text-brand-800">
          <ArrowLeft className="h-4 w-4" />
          Retour à la boutique
        </Link>

        <h1 className="text-4xl sm:text-5xl font-bold text-brand-950 mb-8">Votre panier</h1>

        {loading ? (
          <div className="text-center text-brand-900/50 py-16">Chargement du panier...</div>
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
                const image = getCartItemImage(item, resolvedImages)
                const isUpdating = updatingKey === item.key

                return (
                  <div key={item.key} className="bg-white rounded-3xl border border-brand-100 p-5 shadow-sm flex flex-col sm:flex-row gap-5">
                    <div className="w-full sm:w-32 h-32 bg-brand-50 rounded-2xl overflow-hidden border border-brand-100 flex-shrink-0">
                      {image ? (
                        <img src={image} alt={item.images?.[0]?.alt || item.name} className="w-full h-full object-contain p-3" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-900/30 text-sm">Image indisponible</div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-brand-950 mb-3">{item.name}</h2>
                          <div className="space-y-1 text-sm text-brand-900/70">
                            <p>
                              Prix unitaire HT :{' '}
                              <span className="font-semibold text-brand-950">
                                {getItemUnitPrice(item, minorUnit)}
                              </span>
                            </p>
                            <p>
                              Total ligne HT :{' '}
                              <span className="font-semibold text-brand-950">
                                {getItemLinePrice(item, minorUnit)}
                              </span>
                            </p>
                          </div>
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
                    </div>
                  </div>
                )
              })}
            </div>

            <aside className="lg:col-span-1">
              <div className="rounded-2xl border border-brand-100 bg-white p-8 sticky top-24">
                <h2 className="text-xl font-bold text-brand-950 mb-6">Récapitulatif</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-brand-200">
                  <div className="flex items-center justify-between text-brand-900/70">
                    <span>Articles</span>
                    <span>{cart?.items_count ?? items.length}</span>
                  </div>

                  <div className="flex items-center justify-between text-brand-950 font-bold text-xl">
                    <span>Total HT</span>
                    <span>{formatWooPrice(String(totalHT * Math.pow(10, minorUnit)), minorUnit)}</span>
                  </div>
                </div>

                <Link to="/checkout" className="mt-6 w-full inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3 text-white font-semibold hover:bg-brand-800 transition-colors">
                  Passer commande
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
