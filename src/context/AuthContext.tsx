import { createContext, useContext, useState, ReactNode } from "react"
import { hashPassword, verifyPassword, type PasswordHash } from "../utils/password"

type User = {
  email: string
  username: string
}

/** Compte enregistré : le mot de passe n'est jamais stocké, seulement son hash. */
type Account = User & {
  passwordHash?: PasswordHash
  /** Ancien format (mot de passe en clair) : migré automatiquement à la connexion. */
  password?: string
}

type AuthResult = { success: boolean; message?: string }

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<AuthResult>
  register: (email: string, username: string, password: string) => Promise<AuthResult>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Protection contre les essais en série : 5 échecs → blocage temporaire.
const MAX_ATTEMPTS = 5
const LOCK_MS = 60_000
const ATTEMPTS_KEY = "loginAttempts"
const GENERIC_ERROR = "Adresse mail ou mot de passe incorrect."

type Attempts = { count: number; lockedUntil: number }

function readAttempts(): Attempts {
  try {
    const parsed = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || "null") as Attempts | null
    if (parsed && typeof parsed.count === "number" && typeof parsed.lockedUntil === "number") return parsed
  } catch { /* valeur corrompue : on repart de zéro */ }
  return { count: 0, lockedUntil: 0 }
}

function writeAttempts(value: Attempts) {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(value))
}

function getSavedUser(): User | null {
  const savedUser = localStorage.getItem("user")
  if (!savedUser) return null

  try {
    const parsed = JSON.parse(savedUser) as User
    if (!parsed?.email || !parsed?.username) {
      localStorage.removeItem("user")
      return null
    }
    return { email: parsed.email, username: parsed.username }
  } catch {
    localStorage.removeItem("user")
    return null
  }
}

function getSavedAccount(): Account | null {
  const saved = localStorage.getItem("account")
  if (!saved) return null
  try {
    const parsed = JSON.parse(saved) as Account
    return parsed?.email ? parsed : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lecture immédiate de la session : évite d'afficher /login pendant un refresh.
  const [user, setUser] = useState<User | null>(() => getSavedUser())

  const register = async (email: string, username: string, password: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase()
    const existing = getSavedAccount()
    if (existing && existing.email.trim().toLowerCase() === normalizedEmail) {
      return { success: false, message: "Un compte existe déjà avec cette adresse mail." }
    }
    try {
      const passwordHash = await hashPassword(password)
      const account: Account = { email: normalizedEmail, username: username.trim(), passwordHash }
      localStorage.setItem("account", JSON.stringify(account))
      return { success: true }
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Impossible de créer le compte." }
    }
  }

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      return { success: false, message: "Veuillez renseigner votre adresse mail et votre mot de passe." }
    }

    const attempts = readAttempts()
    const now = Date.now()
    if (attempts.lockedUntil > now) {
      const seconds = Math.ceil((attempts.lockedUntil - now) / 1000)
      return { success: false, message: `Trop de tentatives. Réessayez dans ${seconds} s.` }
    }

    const account = getSavedAccount()
    let valid = false

    if (account && account.email.trim().toLowerCase() === normalizedEmail) {
      try {
        if (account.passwordHash) {
          valid = await verifyPassword(password, account.passwordHash)
        } else if (typeof account.password === "string") {
          // Migration : un ancien compte en clair est re-enregistré avec un hash.
          valid = account.password === password
          if (valid) {
            const migrated: Account = { email: account.email, username: account.username, passwordHash: await hashPassword(password) }
            localStorage.setItem("account", JSON.stringify(migrated))
          }
        }
      } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Connexion impossible." }
      }
    }

    if (!valid) {
      const count = attempts.count + 1
      const locked = count >= MAX_ATTEMPTS
      writeAttempts({ count: locked ? 0 : count, lockedUntil: locked ? now + LOCK_MS : 0 })
      // Même message que le compte existe ou non : on ne révèle pas quelles adresses sont inscrites.
      return {
        success: false,
        message: locked ? "Trop de tentatives. Réessayez dans 60 s." : GENERIC_ERROR,
      }
    }

    localStorage.removeItem(ATTEMPTS_KEY)
    const loggedUser: User = { email: account!.email, username: account!.username }
    setUser(loggedUser)
    localStorage.setItem("user", JSON.stringify(loggedUser))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
