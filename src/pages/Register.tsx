import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Register() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = (e: React.FormEvent) => {
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
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    const savedAccount = localStorage.getItem("account")
    if (savedAccount) {
      try {
        const existing = JSON.parse(savedAccount)
        if (existing.email?.trim().toLowerCase() === normalizedEmail) {
          setError("Un compte existe déjà avec cette adresse mail.")
          return
        }
      } catch {
        // Le compte local invalide sera remplacé par le nouveau compte.
      }
    }

    localStorage.setItem("account", JSON.stringify({ email: normalizedEmail, username: cleanUsername, password }))
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
        <label className="mt-4 block text-sm font-bold">Mot de passe<input type="password" autoComplete="new-password" required minLength={6} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950" value={password} onChange={e => setPassword(e.target.value)} placeholder="6 caractères minimum" /></label>
        <label className="mt-4 block text-sm font-bold">Confirmer le mot de passe<input type="password" autoComplete="new-password" required minLength={6} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Répète ton mot de passe" /></label>

        <button type="submit" className="mt-6 w-full rounded-xl bg-blue-600 p-3 font-bold text-white transition hover:bg-blue-500">Créer mon compte</button>
        <p className="mt-5 text-center text-sm text-gray-500">Déjà un compte ? <Link to="/login" className="font-bold text-blue-600 hover:underline dark:text-blue-400">Se connecter</Link></p>
      </form>
    </main>
  )
}
