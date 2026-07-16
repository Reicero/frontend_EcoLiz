import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { confirmPasswordReset } from '../services/auth'

export function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const key = searchParams.get('key') || ''
  const login = searchParams.get('login') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!key || !login) {
      setError('Le lien de réinitialisation est invalide ou incomplet.')
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    try {
      setLoading(true)

      await confirmPasswordReset({
        login,
        key,
        password,
      })

      setSuccess(
        'Votre mot de passe a bien été modifié. Redirection vers la connexion...'
      )

      setTimeout(() => {
        navigate(`/connexion?email=${encodeURIComponent(login)}`, {
          replace: true,
        })
      }, 1800)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de réinitialiser le mot de passe.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <Link to="/" className="inline-block mb-8">
          <img
            src="/logo.png"
            alt="EcoLiz"
            className="h-14 w-auto object-contain"
          />
        </Link>

        <h1 className="text-3xl font-bold text-brand-950 mb-3">
          Nouveau mot de passe
        </h1>

        <p className="text-brand-900/70 mb-8">
          Choisissez votre nouveau mot de passe pour votre compte EcoLiz.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-brand-900 mb-2"
            >
              Nouveau mot de passe
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-900/40" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                placeholder="Nouveau mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-900/40 hover:text-brand-700 transition-colors"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-brand-900 mb-2"
            >
              Confirmer le mot de passe
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-900/40" />
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                placeholder="Confirmez le mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-900/40 hover:text-brand-700 transition-colors"
                aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showConfirmPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            className="group"
            disabled={loading || Boolean(success)}
          >
            {loading
              ? 'Modification en cours...'
              : 'Enregistrer le nouveau mot de passe'}

            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/connexion"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}
