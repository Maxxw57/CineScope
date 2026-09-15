import { createContext, useContext, useState, ReactNode, useEffect } from "react"

type User = {
  email: string
  username: string
}

type Account = User & {
  password: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => { success: boolean; message?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("user")
      }
    }
  }, [])

  const login = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      return { success: false, message: "Veuillez renseigner votre adresse mail et votre mot de passe." }
    }

    const savedAccount = localStorage.getItem("account")

    if (!savedAccount) {
      return { success: false, message: "Aucun compte n'existe. Veuillez d'abord créer un compte." }
    }

    let account: Account

    try {
      account = JSON.parse(savedAccount)
    } catch {
      return { success: false, message: "Les informations du compte sont invalides." }
    }

    if (account.email.trim().toLowerCase() !== normalizedEmail) {
      return { success: false, message: "Adresse mail ou mot de passe incorrect." }
    }

    if (account.password !== password) {
      return { success: false, message: "Adresse mail ou mot de passe incorrect." }
    }

    const loggedUser: User = {
      email: account.email,
      username: account.username,
    }

    setUser(loggedUser)
    localStorage.setItem("user", JSON.stringify(loggedUser))

    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
