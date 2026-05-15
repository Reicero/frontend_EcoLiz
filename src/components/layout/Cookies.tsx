import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Settings2, Check } from 'lucide-react'
const STORAGE_KEY = 'ecoliz_cookie_consent_v1'
type ConsentChoice = 'all' | 'essential' | 'custom'
interface CookiePreferences {
  essential: boolean // always true
  analytics: boolean
  marketing: boolean
}
interface StoredConsent {
  choice: ConsentChoice
  preferences: CookiePreferences
  timestamp: number
}
const DEFAULT_PREFS: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
}
export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFS)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        // Slight delay for less abrupt entrance
        const t = setTimeout(() => setIsVisible(true), 800)
        return () => clearTimeout(t)
      }
    } catch {
      setIsVisible(true)
    }
  }, [])
  const persist = (choice: ConsentChoice, preferences: CookiePreferences) => {
    const data: StoredConsent = {
      choice,
      preferences,
      timestamp: Date.now(),
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // ignore
    }
    setIsVisible(false)
  }
  const acceptAll = () => {
    persist('all', {
      essential: true,
      analytics: true,
      marketing: true,
    })
  }
  const rejectAll = () => {
    persist('essential', {
      essential: true,
      analytics: false,
      marketing: false,
    })
  }
  const saveCustom = () => {
    persist('custom', prefs)
  }
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: 40,
          }}
          transition={{
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 pointer-events-none"
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-description"
        >
          <div className="pointer-events-auto max-w-5xl mx-auto bg-white rounded-2xl border border-brand-100 shadow-2xl shadow-brand-950/10 overflow-hidden">
            {!showCustomize ? (
              <div className="p-6 sm:p-7">
                <div className="flex items-start gap-5">
                  <div className="hidden sm:flex flex-shrink-0 w-12 h-12 bg-brand-50 rounded-xl items-center justify-center">
                    <Cookie className="w-6 h-6 text-brand-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2
                      id="cookie-banner-title"
                      className="text-lg font-bold text-brand-950 mb-2 tracking-tight"
                    >
                      Votre vie privée,{' '}
                      <span className="font-display italic text-accent-500">
                        notre priorité
                      </span>
                    </h2>
                    <p
                      id="cookie-banner-description"
                      className="text-sm text-brand-900/70 leading-relaxed mb-5 max-w-2xl"
                    >
                      Nous utilisons des cookies pour assurer le bon
                      fonctionnement du site, mesurer son audience et améliorer
                      votre expérience. Vous pouvez accepter, refuser ou
                      personnaliser vos choix à tout moment.{' '}
                      <Link
                        to="/cookies"
                        className="text-brand-700 hover:text-brand-800 font-medium underline underline-offset-2"
                      >
                        En savoir plus
                      </Link>
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={acceptAll}
                        className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-brand-900/15"
                      >
                        <Check className="w-4 h-4" />
                        Tout accepter
                      </button>
                      <button
                        onClick={rejectAll}
                        className="inline-flex items-center gap-2 bg-white hover:bg-brand-50 text-brand-900 border border-brand-200 hover:border-brand-300 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                      >
                        Tout refuser
                      </button>
                      <button
                        onClick={() => setShowCustomize(true)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800 px-2 py-2.5"
                      >
                        <Settings2 className="w-4 h-4" />
                        Personnaliser
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={rejectAll}
                    aria-label="Fermer et refuser"
                    className="flex-shrink-0 text-brand-900/40 hover:text-brand-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-brand-700 font-semibold tracking-wide uppercase text-xs mb-2">
                      Préférences
                    </p>
                    <h2 className="text-lg font-bold text-brand-950 tracking-tight">
                      Personnaliser mes{' '}
                      <span className="font-display italic text-accent-500">
                        cookies
                      </span>
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowCustomize(false)}
                    aria-label="Retour"
                    className="flex-shrink-0 text-brand-900/40 hover:text-brand-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  {/* Essential — always on */}
                  <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-brand-50 border border-brand-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-brand-950 text-sm">
                          Essentiels
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-700 text-white px-1.5 py-0.5 rounded">
                          Requis
                        </span>
                      </div>
                      <p className="text-xs text-brand-900/70 leading-relaxed">
                        Nécessaires au fonctionnement du site (panier, session,
                        sécurité).
                      </p>
                    </div>
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-10 h-6 bg-brand-700 rounded-full relative opacity-60 cursor-not-allowed">
                        <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Analytics */}
                  <label className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white border border-brand-100 hover:border-brand-200 transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-950 text-sm mb-1">
                        Mesure d'audience
                      </h3>
                      <p className="text-xs text-brand-900/70 leading-relaxed">
                        Nous aident à comprendre comment vous utilisez le site
                        pour l'améliorer (Plausible, Matomo).
                      </p>
                    </div>
                    <div className="flex-shrink-0 mt-0.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={prefs.analytics}
                        onClick={() =>
                          setPrefs((p) => ({
                            ...p,
                            analytics: !p.analytics,
                          }))
                        }
                        className={`w-10 h-6 rounded-full relative transition-colors ${prefs.analytics ? 'bg-brand-700' : 'bg-brand-200'}`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${prefs.analytics ? 'right-0.5' : 'left-0.5'}`}
                        />
                      </button>
                    </div>
                  </label>

                  {/* Marketing */}
                  <label className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white border border-brand-100 hover:border-brand-200 transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-950 text-sm mb-1">
                        Personnalisation & marketing
                      </h3>
                      <p className="text-xs text-brand-900/70 leading-relaxed">
                        Permettent de personnaliser le contenu et de mesurer
                        l'efficacité de nos campagnes.
                      </p>
                    </div>
                    <div className="flex-shrink-0 mt-0.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={prefs.marketing}
                        onClick={() =>
                          setPrefs((p) => ({
                            ...p,
                            marketing: !p.marketing,
                          }))
                        }
                        className={`w-10 h-6 rounded-full relative transition-colors ${prefs.marketing ? 'bg-brand-700' : 'bg-brand-200'}`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${prefs.marketing ? 'right-0.5' : 'left-0.5'}`}
                        />
                      </button>
                    </div>
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-brand-100">
                  <button
                    onClick={saveCustom}
                    className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-brand-900/15"
                  >
                    <Check className="w-4 h-4" />
                    Enregistrer mes choix
                  </button>
                  <button
                    onClick={acceptAll}
                    className="inline-flex items-center gap-2 bg-white hover:bg-brand-50 text-brand-900 border border-brand-200 hover:border-brand-300 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                  >
                    Tout accepter
                  </button>
                  <Link
                    to="/cookies"
                    className="text-sm font-medium text-brand-700 hover:text-brand-800 px-2 py-2.5 ml-auto"
                  >
                    Politique cookies &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}