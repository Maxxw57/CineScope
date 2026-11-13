import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { readStored, useStoredState } from "../hooks/useStoredState"
import { Movie } from "../types/Movie"
import { useAuth } from "./AuthContext"
import { useToast } from "./ToastContext"
import { CinePreferences, defaultPreferences } from "../types/Preferences"

export type LibraryStatus = "watchlist" | "watching" | "watched"
export type LibraryMovie = Movie & { status: LibraryStatus }
export type HistoryEntry = { movie: Movie; source: "tmdb" | "local"; viewedAt: number }
export type AccentColor = "blue" | "violet" | "red" | "emerald" | "amber"

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
  reviews: Record<string, string>
  rateMovie: (movieKey: string, rating: number) => void
  removeRating: (movieKey: string) => void
  getMovieRating: (movieKey: string) => number | null
  saveReview: (movieKey: string, review: string) => void
  removeReview: (movieKey: string) => void
  getReview: (movieKey: string) => string
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

const ACCENTS: AccentColor[] = ["blue", "violet", "red", "emerald", "amber"]

const reviveArray = <T,>(value: unknown): T[] | undefined => (Array.isArray(value) ? (value as T[]) : undefined)
const reviveRecord = <T,>(value: unknown): Record<string, T> | undefined =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, T>) : undefined
const reviveLibrary = (value: unknown): LibraryMovie[] | undefined =>
  reviveArray<Movie & { status?: LibraryStatus }>(value)?.map(movie => ({ ...movie, status: movie.status ?? "watchlist" }))

function loadPreferences(): CinePreferences {
  const parsed = readStored<Partial<CinePreferences>>("cinePreferences")
  if (!parsed || typeof parsed !== "object") return defaultPreferences
  return {
    ...defaultPreferences,
    ...parsed,
    recommendations: { ...defaultPreferences.recommendations, ...parsed.recommendations },
    notifications: { ...defaultPreferences.notifications, ...parsed.notifications },
    playback: { ...defaultPreferences.playback, ...parsed.playback },
    library: { ...defaultPreferences.library, ...parsed.library },
  }
}

function loadAccent(): AccentColor {
  const saved = localStorage.getItem("accentColor") as AccentColor | null
  return saved && ACCENTS.includes(saved) ? saved : "blue"
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const isLoggedIn = !!user
  // Données propres à chaque compte : `null` quand personne n'est connecté.
  const userKey = (name: string) => (user ? `${name}:${user.email}` : null)

  const [favorites, setFavorites] = useStoredState<Movie[]>(userKey("favorites"), [], { revive: reviveArray, legacyKey: "favorites" })
  const [library, setLibrary] = useStoredState<LibraryMovie[]>(userKey("library"), [], { revive: reviveLibrary, legacyKey: "library" })
  const [ratings, setRatings] = useStoredState<Record<string, number>>(userKey("ratings"), {}, { revive: reviveRecord })
  const [reviews, setReviews] = useStoredState<Record<string, string>>(userKey("reviews"), {}, { revive: reviveRecord })
  const [history, setHistory] = useStoredState<HistoryEntry[]>(userKey("history"), [], { revive: reviveArray })

  const [movies, setMovies] = useState<Movie[]>([])
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") ?? "light")
  const [accentColor, setAccentColorState] = useState<AccentColor>(loadAccent)
  const [preferences, setPreferences] = useState<CinePreferences>(loadPreferences)

  useEffect(() => {
    fetch("/movies.json")
      .then(res => {
        if (!res.ok) throw new Error("Impossible de charger les films")
        return res.json()
      })
      .then(data => setMovies(data))
      .catch(error => console.error("Erreur de chargement des films :", error))
  }, [])

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
    document.documentElement.dataset.effectIntensity = preferences.motionLevel
    document.documentElement.dataset.density = preferences.cardDensity
    localStorage.setItem("cinePreferences", JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    document.documentElement.dataset.accent = accentColor
  }, [accentColor])

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
    setFavorites(current => current.some(item => item.id === movie.id) ? current : [...current, movie])
    showToast(`« ${movie.title} » ajouté aux favoris.`)
  }

  const removeFavorite = (id: number) => {
    const movie = favorites.find(item => item.id === id)
    setFavorites(current => current.filter(item => item.id !== id))
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
    if (rating < 0 || rating > 5) return
    if (Object.prototype.hasOwnProperty.call(ratings, movieKey)) {
      showToast("Supprimez votre note actuelle avant d'en enregistrer une nouvelle.", "info")
      return
    }
    setRatings(current => ({ ...current, [movieKey]: rating }))
    showToast(`Note enregistrée : ${rating}/5.`)
  }

  const removeRating = (movieKey: string) => {
    setRatings(current => {
      const next = { ...current }
      delete next[movieKey]
      return next
    })
    setReviews(current => {
      const next = { ...current }
      delete next[movieKey]
      return next
    })
    showToast("Votre note et votre critique ont été supprimées.", "info")
  }

  const getMovieRating = (movieKey: string) => ratings[movieKey] ?? null

  const saveReview = (movieKey: string, review: string) => {
    if (!isLoggedIn) {
      showToast("Vous devez être connecté pour écrire une critique.", "error")
      return
    }
    if (!Object.prototype.hasOwnProperty.call(ratings, movieKey)) {
      showToast("Enregistrez d'abord votre note avant d'écrire une critique.", "info")
      return
    }
    const cleanReview = review.trim()
    if (!cleanReview) return
    setReviews(current => ({ ...current, [movieKey]: cleanReview }))
    showToast("Votre critique a été enregistrée.")
  }

  const removeReview = (movieKey: string) => {
    setReviews(current => {
      const next = { ...current }
      delete next[movieKey]
      return next
    })
    showToast("Votre critique a été supprimée.", "info")
  }

  const getReview = (movieKey: string) => reviews[movieKey] ?? ""

  const recordMovieView = useCallback((movie: Movie, source: "tmdb" | "local") => {
    if (!isLoggedIn) return
    const key = `${source}:${movie.id}`
    setHistory(current => [
      { movie, source, viewedAt: Date.now() },
      ...current.filter(entry => `${entry.source}:${entry.movie.id}` !== key),
    ].slice(0, 20))
  }, [isLoggedIn, setHistory])

  const clearFavorites = useCallback(() => {
    setFavorites([])
    showToast("Favoris vidés.", "info")
  }, [showToast, setFavorites])

  const clearLibrary = useCallback(() => {
    setLibrary([])
    showToast("Bibliothèque vidée.", "info")
  }, [showToast, setLibrary])

  const clearRatings = useCallback(() => {
    setRatings({})
    setReviews({})
    showToast("Toutes vos notes et critiques ont été supprimées.", "info")
  }, [showToast, setRatings, setReviews])

  const clearHistory = useCallback(() => {
    setHistory([])
    showToast("Historique des films consultés effacé.", "info")
  }, [showToast, setHistory])

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
      reviews,
      rateMovie,
      removeRating,
      getMovieRating,
      saveReview,
      removeReview,
      getReview,
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
