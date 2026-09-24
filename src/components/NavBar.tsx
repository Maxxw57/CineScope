import { useEffect, useMemo, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const navItems = [
  { to: "/", label: "Accueil", icon: "⌂" },
  { to: "/films", label: "Films", icon: "▣" },
  { to: "/series", label: "Séries", icon: "▦" },
  { to: "/calendrier", label: "Calendrier", icon: "◫" },
  { to: "/pour-vous", label: "Pour vous", icon: "✦" },
  { to: "/film-aleatoire", label: "Aléatoire", icon: "⤨" },
  { to: "/search", label: "Recherche", icon: "⌕" },
  { to: "/favorites", label: "Favoris", icon: "♡" },
  { to: "/library", label: "Bibliothèque", icon: "▤" },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 18)

    fn()

    window.addEventListener("scroll", fn, { passive: true })

    return () => window.removeEventListener("scroll", fn)
  }, [])

  const initials = useMemo(
    () => user?.username.slice(0, 2).toUpperCase() || "CS",
    [user]
  )

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `cine-nav-link ${isActive ? "cine-nav-link-active" : ""}`

  return (
    <header
      className={`cine-navbar ${
        scrolled ? "cine-navbar-scrolled" : ""
      }`}
    >
      {/* NAVBAR */}
      <nav className="flex min-h-[72px] w-full items-center px-4 lg:px-5">

        {/* LOGO CINESCOPE - ALIGNÉ À GAUCHE */}
        <div className="flex shrink-0 items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-600/25">
            C
          </span>

          <span className="text-2xl font-black tracking-tight">
            CineScope
          </span>
        </div>

        {/* NAVIGATION CENTRALE */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={linkClass}
              >
                <span className="text-base opacity-70">
                  {item.icon}
                </span>

                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* COMPTE */}
        <div className="relative hidden shrink-0 lg:block">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white/70 p-1.5 pr-3 shadow-sm backdrop-blur-xl hover:border-blue-400 dark:border-white/10 dark:bg-white/5"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-black text-white">
                  {initials}
                </span>

                <span className="max-w-28 truncate text-sm font-bold">
                  {user.username}
                </span>

                <span className="text-xs text-gray-400">
                  ⌄
                </span>
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                  <NavLink
                    to="/profile"
                    onClick={() => setAccountOpen(false)}
                    className="cine-menu-item"
                  >
                    👤 Mon profil
                  </NavLink>

                  <NavLink
                    to="/settings"
                    onClick={() => setAccountOpen(false)}
                    className="cine-menu-item"
                  >
                    ⚙️ Paramètres
                  </NavLink>

                  <div className="my-1 border-t border-gray-200 dark:border-gray-800" />

                  <button
                    onClick={() => {
                      logout()
                      setAccountOpen(false)
                    }}
                    className="cine-menu-item w-full text-left text-red-600"
                  >
                    ↪ Déconnexion
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="cine-button-secondary"
              >
                Connexion
              </Link>

              <Link
                to="/register"
                className="cine-button-primary"
              >
                Créer un compte
              </Link>
            </div>
          )}
        </div>

        {/* MENU MOBILE */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="cine-icon-button ml-auto lg:hidden"
          aria-label="Menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* NAVIGATION MOBILE */}
      {menuOpen && (
        <div className="border-t border-gray-200/70 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/95 lg:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}

            <div className="my-2 border-t border-gray-200 dark:border-gray-800" />

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
                >
                  ⚙️ Paramètres
                </NavLink>

                <button
                  onClick={logout}
                  className="mt-2 rounded-xl bg-red-600 px-4 py-3 text-left font-bold text-white"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={linkClass}
                >
                  Connexion
                </NavLink>

                <Link
                  to="/register"
                  className="cine-button-primary mt-2 text-center"
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