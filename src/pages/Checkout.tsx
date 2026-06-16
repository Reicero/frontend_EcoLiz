import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Lock, ShieldCheck, User, UserPlus } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { getCart } from '../services/cart'
import { placeOrder } from '../services/checkout'
import { config } from '../config/env'

type EcolizUser = {
  id?: number | string
  email: string
  firstName?: string
  lastName?: string
  company?: string
}

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

function getStoredUser(): EcolizUser | null {
  const storedUser = localStorage.getItem('ecoliz_user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch {
    return null
  }
}

export default function Checkout() {
  const user = getStoredUser()

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    company: user?.company || '',
    email: user?.email || '',
    phone: '',
    address1: '',
    address2: '',
    postcode: '',
    city: '',
    country: 'FR',
    note: '',
  })

  const [cart, setCart] = useState<WooCart | null>(null)
  const [cartLoading, setCartLoading] = useState(true)
  const [resolvedImages, setResolvedImages] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successOrder, setSuccessOrder] = useState<unknown>(null)

  useEffect(() => {
    async function loadCartSummary() {
      try {
        setCartLoading(true)

        const data = await getCart()
        setCart(data)

        const images = await resolveMissingImages(data.items ?? [])

        if (Object.keys(images).length > 0) {
          setResolvedImages(images)
        }
      } catch (err) {
        console.error('Erreur chargement récapitulatif panier :', err)
      } finally {
        setCartLoading(false)
      }
    }

    void loadCartSummary()
  }, [])

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'Le prénom est obligatoire.'
    if (!formData.lastName.trim()) return 'Le nom est obligatoire.'
    if (!formData.email.trim()) return "L'adresse email est obligatoire."
    if (!formData.phone.trim()) return 'Le téléphone est obligatoire.'
    if (!formData.address1.trim()) return "L'adresse est obligatoire."
    if (!formData.postcode.trim()) return 'Le code postal est obligatoire.'
    if (!formData.city.trim()) return 'La ville est obligatoire.'
    if ((cart?.items ?? []).length === 0) return 'Votre panier est vide.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)

      const address = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        company: formData.company,
        address_1: formData.address1,
        address_2: formData.address2,
        city: formData.city,
        state: '',
        postcode: formData.postcode,
        country: formData.country,
        email: formData.email,
        phone: formData.phone,
      }

      const result = await placeOrder({
        billing_address: address,
        shipping_address: address,
        customer_note: formData.note,
        create_account: false,
        payment_method: 'cheque',
        payment_data: [],
      })

      setSuccessOrder(result)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Impossible de valider la commande.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/panier" className="mb-8 inline-flex items-center gap-2 text-brand-700 hover:text-brand-800">
            <ArrowLeft className="h-4 w-4" />
            Retour au panier
          </Link>

          <Card variant="elevated" className="p-8 lg:p-12">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6">
              <Lock className="h-9 w-9 text-brand-700" />
            </div>
            <h1 className="text-3xl font-bold text-brand-950 mb-4">Connexion requise</h1>
            <p className="text-brand-900/70 mb-8">Connectez-vous ou créez un compte pour finaliser votre commande.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                to="/connexion"
                state={{ redirectTo: '/checkout' }}
                className="group rounded-2xl border border-brand-100 bg-brand-700 text-white p-6 hover:bg-brand-800 transition-all shadow-lg shadow-brand-900/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-5 w-5" />
                  <h2 className="text-xl font-bold">Se connecter</h2>
                </div>
                <p className="text-white/80 mb-5">J'ai déjà un compte EcoLiz.</p>
                <span className="inline-flex items-center gap-2 font-semibold">
                  Connexion
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                to="/inscription"
                state={{ redirectTo: '/checkout' }}
                className="group rounded-2xl border border-brand-100 bg-white p-6 hover:bg-brand-50 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <UserPlus className="h-5 w-5 text-brand-700" />
                  <h2 className="text-xl font-bold text-brand-950">Créer un compte</h2>
                </div>
                <p className="text-brand-900/70 mb-5">Je souhaite créer mon compte avant de commander.</p>
                <span className="inline-flex items-center gap-2 font-semibold text-brand-700">
                  Inscription
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    )
  }

  if (successOrder) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="elevated" className="p-10 lg:p-14 text-center">
            <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-9 w-9 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-brand-950 mb-4">Commande validée</h1>
            <p className="text-brand-900/70 mb-8">Votre commande a bien été transmise.</p>

            <div className="rounded-2xl bg-brand-50 border border-brand-100 p-5 mb-8 text-left">
              <p className="text-brand-900/70">Numéro de commande :</p>
              <p className="text-2xl font-bold text-brand-950">
                #{successOrder && typeof successOrder === 'object' && 'order_number' in successOrder ? (successOrder as { order_number?: unknown }).order_number : 'N/A'}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/compte" className="inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3 text-white font-semibold hover:bg-brand-800 transition-colors">
                Voir mon compte
              </Link>
              <Link to="/boutique" className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-6 py-3 text-brand-900 font-semibold hover:bg-brand-50 transition-colors">
                Retour boutique
              </Link>
            </div>
          </Card>
        </div>
      </section>
    )
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
        <Link to="/panier" className="mb-8 inline-flex items-center gap-2 text-brand-700 hover:text-brand-800">
          <ArrowLeft className="h-4 w-4" />
          Retour au panier
        </Link>

        <h1 className="text-4xl sm:text-5xl font-bold text-brand-950 mb-8">Finaliser votre commande</h1>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
          <Card variant="elevated" className="p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-brand-900 mb-2">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-900 mb-2">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-brand-900 mb-2">Entreprise</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-brand-900 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-900 mb-2">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-900 mb-2">Ville *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-brand-900 mb-2">Adresse *</label>
                  <input
                    type="text"
                    required
                    value={formData.address1}
                    onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                    placeholder="Numéro et nom de rue"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-brand-900 mb-2">Complément</label>
                  <input
                    type="text"
                    value={formData.address2}
                    onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-900 mb-2">Code postal *</label>
                  <input
                    type="text"
                    required
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-brand-900 mb-2">Note de commande</label>
                  <textarea
                    rows={3}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none resize-none"
                    placeholder="Informations complémentaires"
                  />
                </div>
              </div>

              <Button type="submit" fullWidth size="lg" className="group" disabled={loading || cartLoading || items.length === 0}>
                {loading ? 'Validation en cours...' : 'Valider la commande'}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </Card>

          <aside className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-brand-950 mb-5">Résumé de commande</h2>

            {cartLoading ? (
              <p className="text-sm text-brand-900/60">Chargement du panier...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-brand-900/60">Votre panier est vide.</p>
            ) : (
              <>
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  {items.map((item) => {
                    const image = getCartItemImage(item, resolvedImages)

                    return (
                      <div key={item.key} className="flex gap-3 border-b border-brand-100 pb-4 last:border-b-0">
                        <div className="h-16 w-16 rounded-xl border border-brand-100 bg-brand-50 overflow-hidden flex-shrink-0">
                          {image ? (
                            <img src={image} alt={item.images?.[0]?.alt || item.name} className="h-full w-full object-contain p-2" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-brand-900/30">Image</div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-brand-950 leading-snug line-clamp-2">{item.name}</p>
                          <p className="mt-1 text-xs text-brand-900/60">
                            {item.quantity} x {getItemUnitPrice(item, minorUnit)} HT
                          </p>
                          <p className="mt-1 text-sm font-bold text-brand-950">
                            {getItemLinePrice(item, minorUnit)} HT
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-5 pt-5 border-t border-brand-200 space-y-3">
                  <div className="flex items-center justify-between text-brand-900/70">
                    <span>Articles</span>
                    <span>{cart?.items_count ?? items.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xl font-bold text-brand-950">
                    <span>Total HT</span>
                    <span>{formatWooPrice(String(totalHT * Math.pow(10, minorUnit)), minorUnit)}</span>
                  </div>
                  <p className="text-xs text-brand-900/50">
                    Les frais éventuels et conditions de paiement sont confirmés à la validation.
                  </p>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}
