import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = login(email, password)

    if (!result.success) {
      setError(result.message || "Impossible de se connecter.")
      return
    }

    navigate("/profile")
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Connexion</h1>

      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded max-w-md">
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Adresse mail"
          required
          autoComplete="email"
          className="w-full p-2 mb-4 bg-gray-700 rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          required
          autoComplete="current-password"
          className="w-full p-2 mb-4 bg-gray-700 rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 p-2 rounded"
        >
          Se connecter
        </button>
      </form>
    </div>
  )
}
