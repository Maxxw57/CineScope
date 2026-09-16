import { createContext, useCallback, useContext, useEffect, useReducer, useState } from "react"
import { Movie } from "../types/Movie"
import { useAuth } from "./AuthContext"
import { useToast } from "./ToastContext"
import { CinePreferences, defaultPreferences } from "../types/Preferences"

export type LibraryStatus = "watchlist" | "watching" | "watched"
export type LibraryMovie = Movie & { status: LibraryStatus }
export type HistoryEntry = { movie: Movie; source: "tmdb" | "local"; viewedAt: number }
export type AccentColor = "blue" | "violet" | "red" | "emerald" | "amber"

type FavoriteAction =
  | { type: "LOAD"; payload: Movie[] }
  | { type: "ADD"; payload: Movie }
  | { type: "REMOVE"; payload: number }

type AppContextType = {
  favorites: Movie[]
  library: LibraryMovie[]
  movies: Movie[]
  addFavorite: (movie: Movie) => void
  removeFavorite: (id: number) => void
  isFavorite: (id: number) => boolean
  addToLibrary: (movie: Movie) => void
  removeFromLibrary: (id: number) => void
  updateLibraryStatus: (id: number, status: LibraryStatus) => void
  theme: string
  toggleTheme: () => void
  accentColor: AccentColor
  setAccentColor: (accent: AccentColor) => void
  isLoggedIn: boolean
  ratings: Record<string, number>
  rateMovie: (movieKey: string, rating: number) => void
  removeRating: (movieKey: string) => void
  getMovieRating: (movieKey: string) => number | null
  history: HistoryEntry[]
  recordMovieView: (movie: Movie, source: "tmdb" | "local") => void
  clearHistory: () => void
  clearFavorites: () => void
  clearLibrary: () => void
  clearRatings: () => void
  preferences: CinePreferences
  updatePreferences: (patch: Partial<CinePreferences>) => void
  resetPreferences: () => void
}

const AppContext = createContext<AppContextType | null>(null)

function favoritesReducer(state: Movie[], action: FavoriteAction): Movie[] {
  switch (action.type) {
    case "LOAD":
      return action.payload
    case "ADD":
      return state.some(movie => movie.id === action.payload.id)
        ? state
        : [...state, action.payload]
    case "REMOVE":
      return state.filter(movie => movie.id !== action.payload)
    default:
      return state
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, dispatchFavorites] = useReducer(favoritesReducer, [])
  const [library, setLibrary] = useState<LibraryMovie[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [theme, setTheme] = useState("light")
  const [accentColor, setAccentColorState] = useState<AccentColor>("blue")
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [preferences, setPreferences] = useState<CinePreferences>(defaultPreferences)
  const { user } = useAuth()
  const { showToast } = useToast()
  const isLoggedIn = !!user

  useEffect(() => {
    const fav = localStorage.getItem("favorites")
    const lib = localStorage.getItem("library")
    const savedTheme = localStorage.getItem("theme")
    const savedAccent = localStorage.getItem("accentColor") as AccentColor | null
    const savedPreferences = localStorage.getItem("cinePreferences")

    if (fav) {
      try {
        dispatchFavorites({ type: "LOAD", payload: JSON.parse(fav) })
      } catch {
        localStorage.removeItem("favorites")
      }
    }

    if (lib) {
      try {
        const savedLibrary = JSON.parse(lib) as Array<Movie & { status?: LibraryStatus }>
        // Compatibilité avec l'ancienne bibliothèque : les films existants deviennent "À regarder".
        setLibrary(savedLibrary.map(movie => ({ ...movie, status: movie.status ?? "watchlist" })))
      } catch {
        localStorage.removeItem("library")
      }
    }

    if (savedTheme) setTheme(savedTheme)
    if (savedAccent && ["blue", "violet", "red", "emerald", "amber"].includes(savedAccent)) setAccentColorState(savedAccent)
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences) as Partial<CinePreferences>
        setPreferences({ ...defaultPreferences, ...parsed, recommendations: { ...defaultPreferences.recommendations, ...parsed.recommendations }, notifications: { ...defaultPreferences.notifications, ...parsed.notifications }, playback: { ...defaultPreferences.playback, ...parsed.playback }, library: { ...defaultPreferences.library, ...parsed.library } })
      } catch { localStorage.removeItem("cinePreferences") }
    }

    fetch("/movies.json")
      .then(res => {
        if (!res.ok) throw new Error("Impossible de charger les films")
        return res.json()
      })
      .then(data => setMovies(data))
      .catch(error => console.error("Erreur de chargement des films :", error))
  }, [])

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem("library", JSON.stringify(library))
  }, [library])

  useEffect(() => {
    const applyTheme = () => {
      const mode = preferences.themeMode ?? (theme === "dark" ? "dark" : "light")
      const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      document.documentElement.classList.toggle("dark", dark)
      setTheme(dark ? "dark" : "light")
    }
    applyTheme()
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    media.addEventListener("change", applyTheme)
    return () => media.removeEventListener("change", applyTheme)
  }, [preferences.themeMode])

  useEffect(() => {
    document.documentElement.dataset.motion = preferences.animations ? preferences.motionLevel : "off"
    // L’intensité visuelle reste indépendante du bouton Animations :
    // elle pilote notamment la puissance du dégradé global CineScope.
    document.documentElement.dataset.effectIntensity = preferences.motionLevel
    document.documentElement.dataset.density = preferences.cardDensity
    localStorage.setItem("cinePreferences", JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    document.documentElement.dataset.accent = accentColor
  }, [accentColor])

  useEffect(() => {
    if (!user) {
      setRatings({})
      return
    }

    const storageKey = `ratings:${user.email}`
    const savedRatings = localStorage.getItem(storageKey)
    if (!savedRatings) {
      setRatings({})
      return
    }

    try {
      setRatings(JSON.parse(savedRatings) as Record<string, number>)
    } catch {
      localStorage.removeItem(storageKey)
      setRatings({})
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(`ratings:${user.email}`, JSON.stringify(ratings))
  }, [ratings, user])

  useEffect(() => {
    if (!user) {
      setHistory([])
      return
    }

    const storageKey = `history:${user.email}`
    const savedHistory = localStorage.getItem(storageKey)
    if (!savedHistory) {
      setHistory([])
      return
    }

    try {
      setHistory(JSON.parse(savedHistory) as HistoryEntry[])
    } catch {
      localStorage.removeItem(storageKey)
      setHistory([])
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(`history:${user.email}`, JSON.stringify(history))
  }, [history, user])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    setPreferences(current => ({ ...current, themeMode: newTheme }))
    localStorage.setItem("theme", newTheme)
  }

  const updatePreferences = (patch: Partial<CinePreferences>) => {
    setPreferences(current => ({ ...current, ...patch }))
  }

  const resetPreferences = () => {
    setPreferences(defaultPreferences)
    showToast("Préférences CineScope réinitialisées.", "info")
  }

  const setAccentColor = (accent: AccentColor) => {
    setAccentColorState(accent)
    localStorage.setItem("accentColor", accent)
    showToast("Couleur CineScope mise à jour.", "info")
  }

  const addFavorite = (movie: Movie) => {
    if (!isLoggedIn) {
      showToast("Vous devez être connecté pour ajouter un favori.", "error")
      return
    }
    if (favorites.some(item => item.id === movie.id)) return
    dispatchFavorites({ type: "ADD", payload: movie })
    showToast(`« ${movie.title} » ajouté aux favoris.`)
  }

  const removeFavorite = (id: number) => {
    const movie = favorites.find(item => item.id === id)
    dispatchFavorites({ type: "REMOVE", payload: id })
    showToast(movie ? `« ${movie.title} » retiré des favoris.` : "Film retiré des favoris.", "info")
  }

  const isFavorite = (id: number) => favorites.some(movie => movie.id === id)

  const addToLibrary = (movie: Movie) => {
    if (!isLoggedIn) {
      showToast("Vous devez être connecté pour ajouter un film à la bibliothèque.", "error")
      return
    }

    if (library.some(item => item.id === movie.id)) return
    setLibrary(current => [...current, { ...movie, status: preferences.library.defaultStatus }])
    showToast(`« ${movie.title} » ajouté à la bibliothèque.`)
  }

  const removeFromLibrary = (id: number) => {
    const movie = library.find(item => item.id === id)
    setLibrary(current => current.filter(item => item.id !== id))
    showToast(movie ? `« ${movie.title} » retiré de la bibliothèque.` : "Film retiré de la bibliothèque.", "info")
  }

  const updateLibraryStatus = (id: number, status: LibraryStatus) => {
    setLibrary(current =>
      current.map(movie => movie.id === id ? { ...movie, status } : movie)
    )
    const labels: Record<LibraryStatus, string> = { watchlist: "À regarder", watching: "En cours", watched: "Vu" }
    showToast(`Statut mis à jour : ${labels[status]}.`)
  }

  const rateMovie = (movieKey: string, rating: number) => {
    if (!isLoggedIn) {
      showToast("Vous devez être connecté pour noter un film.", "error")
      return
    }
    if (rating < 1 || rating > 5) return
    setRatings(current => ({ ...current, [movieKey]: rating }))
    showToast(`Note enregistrée : ${rating}/5.`)
  }

  const removeRating = (movieKey: string) => {
    setRatings(current => {
      const next = { ...current }
      delete next[movieKey]
      return next
    })
    showToast("Votre note a été supprimée.", "info")
  }

  const getMovieRating = (movieKey: string) => ratings[movieKey] ?? null

  const recordMovieView = useCallback((movie: Movie, source: "tmdb" | "local") => {
    if (!isLoggedIn) return
    const key = `${source}:${movie.id}`
    setHistory(current => [
      { movie, source, viewedAt: Date.now() },
      ...current.filter(entry => `${entry.source}:${entry.movie.id}` !== key),
    ].slice(0, 20))
  }, [isLoggedIn])

  const clearFavorites = useCallback(() => {
    dispatchFavorites({ type: "LOAD", payload: [] })
    showToast("Favoris vidés.", "info")
  }, [showToast])

  const clearLibrary = useCallback(() => {
    setLibrary([])
    showToast("Bibliothèque vidée.", "info")
  }, [showToast])

  const clearRatings = useCallback(() => {
    setRatings({})
    if (user) localStorage.removeItem(`ratings:${user.email}`)
    showToast("Toutes vos notes ont été supprimées.", "info")
  }, [showToast, user])

  const clearHistory = useCallback(() => {
    setHistory([])
    showToast("Historique des films consultés effacé.", "info")
  }, [showToast])

  return (
    <AppContext.Provider value={{
      favorites,
      library,
      movies,
      theme,
      toggleTheme,
      accentColor,
      setAccentColor,
      isLoggedIn,
      addFavorite,
      removeFavorite,
      isFavorite,
      addToLibrary,
      removeFromLibrary,
      updateLibraryStatus,
      ratings,
      rateMovie,
      removeRating,
      getMovieRating,
      history,
      recordMovieView,
      clearHistory,
      clearFavorites,
      clearLibrary,
      clearRatings,
      preferences,
      updatePreferences,
      resetPreferences,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp doit être utilisé dans AppProvider")
  return context
}
