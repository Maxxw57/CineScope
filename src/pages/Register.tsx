import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { checkPassword } from "../utils/password"

const STRENGTH_COLORS = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"]

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const strength = checkPassword(password, [username.trim(), email.split("@")[0] ?? ""])

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const normalizedEmail = email.trim().toLowerCase()
    const cleanUsername = username.trim()

    if (!normalizedEmail || !cleanUsername || !password || !confirmPassword) {
      setError("Tous les champs sont obligatoires.")
      return
    }
    if (cleanUsername.length < 3) {
      setError("Le nom d’utilisateur doit contenir au moins 3 caractères.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("L’adresse mail n’est pas valide.")
      return
    }
    if (strength.errors.length) {
      setError(`Mot de passe refusé : ${strength.errors.join(", ")}.`)
      return
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    setSubmitting(true)
    const result = await register(normalizedEmail, cleanUsername, password)
    setSubmitting(false)
    if (!result.success) {
      setError(result.message || "Impossible de créer le compte.")
      return
    }
    navigate("/login")
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="mb-7 text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Bienvenue</p>
        <h1 className="mt-1 text-4xl font-black">Créer un compte</h1>
        <p className="mt-2 text-gray-500">Crée ton profil CineScope en quelques secondes.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900" noValidate>
        {error && <div role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>}

        <label className="block text-sm font-bold">Email<input type="email" autoComplete="email" required className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950" value={email} onChange={e => setEmail(e.target.value)} placeholder="nom@exemple.com" /></label>
        <label className="mt-4 block text-sm font-bold">Nom d’utilisateur<input type="text" autoComplete="username" required minLength={3} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950" value={username} onChange={e => setUsername(e.target.value)} placeholder="Ton pseudo" /></label>
        <label className="mt-4 block text-sm font-bold">Mot de passe<input type="password" autoComplete="new-password" required minLength={8} aria-describedby="password-strength" className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950" value={password} onChange={e => setPassword(e.target.value)} placeholder="8 caractères, une lettre et un chiffre" /></label>
        {password && (
          <div id="password-strength" className="mt-2" aria-live="polite">
            <div className="flex gap-1" aria-hidden="true">
              {[0, 1, 2, 3].map(i => (
                <span key={i} className={`h-1.5 flex-1 rounded-full ${i < Math.max(1, strength.score) ? STRENGTH_COLORS[strength.score] : "bg-gray-200 dark:bg-gray-700"}`} />
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Robustesse : <strong>{strength.label}</strong>
              {strength.errors.length > 0 && <> · {strength.errors.join(", ")}</>}
            </p>
          </div>
        )}
        <label className="mt-4 block text-sm font-bold">Confirmer le mot de passe<input type="password" autoComplete="new-password" required minLength={8} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Répète ton mot de passe" /></label>

        <button type="submit" disabled={submitting} className="mt-6 w-full rounded-xl bg-blue-600 p-3 font-bold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-70">{submitting ? "Création du compte…" : "Créer mon compte"}</button>
        <p className="mt-5 text-center text-sm text-gray-500">Déjà un compte ? <Link to="/login" className="font-bold text-blue-600 hover:underline dark:text-blue-400">Se connecter</Link></p>
      </form>
    </main>
  )
}
