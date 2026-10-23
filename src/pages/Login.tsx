import { useState } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950"

/** N'accepte qu'un chemin interne (« /profile ») pour éviter les redirections vers un autre site. */
function safeRedirect(value: unknown): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/profile"
}

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = safeRedirect((location.state as { from?: string } | null)?.from)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    const result = await login(email, password)
    setSubmitting(false)

    if (!result.success) {
      setError(result.message || "Impossible de se connecter.")
      setPassword("")
      return
    }
    navigate(redirectTo, { replace: true })
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="mb-7 text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Bon retour</p>
        <h1 className="mt-1 text-4xl font-black">Connexion</h1>
        <p className="mt-2 text-gray-500">Retrouve ta bibliothèque, tes favoris et tes recommandations.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900" noValidate>
        {error && <div role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>}

        <label className="block text-sm font-bold">
          Email
          <input type="email" autoComplete="email" required className={inputClass} value={email} onChange={e => setEmail(e.target.value)} placeholder="nom@exemple.com" />
        </label>

        <label className="mt-4 block text-sm font-bold">
          Mot de passe
          <span className="relative mt-2 block">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className={`${inputClass} mt-0 pr-24`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ton mot de passe"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-pressed={showPassword}
            >
              {showPassword ? "Masquer" : "Afficher"}
            </button>
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-blue-600 p-3 font-bold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? "Vérification…" : "Se connecter"}
        </button>
        <p className="mt-5 text-center text-sm text-gray-500">
          Pas encore de compte ? <Link to="/register" className="font-bold text-blue-600 hover:underline dark:text-blue-400">Créer un compte</Link>
        </p>
      </form>
    </main>
  )
}
