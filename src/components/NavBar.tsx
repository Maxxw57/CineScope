import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const navItems = [
  { to: "/", label: "Accueil" },
  { to: "/films", label: "Films" },
  { to: "/pour-vous", label: "Pour vous" },
  { to: "/film-aleatoire", label: "🎲 Aléatoire" },
  { to: "/search", label: "Recherche" },
  { to: "/favorites", label: "Favoris" },
  { to: "/library", label: "Bibliothèque" },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-xl px-4 py-2.5 text-base font-semibold transition-all duration-200 ${
      isActive
        ? "bg-blue-600/15 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-blue-400"
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95">

      <nav className="flex min-h-[76px] w-full items-center px-6 lg:px-10">

        {/* LOGO */}
        <div className="flex shrink-0 items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-2xl font-black text-white shadow-md shadow-blue-600/20">
            C
          </span>

          <span className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">
            CineScope
          </span>
        </div>

        {/* NAVIGATION DESKTOP */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* AUTHENTIFICATION DESKTOP */}
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          {user ? (
            <>
              <NavLink
                to="/profile"
                className={linkClass}
              >
                👤 {user.username}
              </NavLink>

              <NavLink
                to="/settings"
                className={linkClass}
                aria-label="Paramètres"
              >
                ⚙️
              </NavLink>

              <button
                onClick={logout}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-base font-semibold text-white transition hover:bg-red-500"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-5 py-2.5 text-base font-semibold text-gray-800 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                Connexion
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-base font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>

        {/* BOUTON MOBILE */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="ml-auto grid h-11 w-11 place-items-center rounded-xl border border-gray-200 text-2xl lg:hidden dark:border-gray-700"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* MENU MOBILE */}
      {menuOpen && (
        <div className="border-t border-gray-200 px-5 pb-5 pt-4 lg:hidden dark:border-gray-800">

          <div className="flex flex-col gap-2">

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            <div className="my-2 border-t border-gray-200 dark:border-gray-800" />

            {user ? (
              <>
                <NavLink
                  to="/profile"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  👤 {user.username}
                </NavLink>

                <NavLink
                  to="/settings"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  ⚙️ Paramètres
                </NavLink>

                <button
                  onClick={() => {
                    logout()
                    setMenuOpen(false)
                  }}
                  className="mt-1 rounded-xl bg-red-600 px-4 py-3 text-left text-base font-semibold text-white"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Connexion
                </NavLink>

                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-base font-semibold text-white"
                >
                  Créer un compte
                </Link>
              </>
            )}

          </div>
        </div>
      )}
    </header>
  )
}