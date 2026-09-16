import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useApp } from "../context/AppContext"
import { getMovieGenres, getRandomMovie } from "../services/tmdb"
import type { Movie } from "../types/Movie"

export type RandomMode = "surprise" | "tastes" | "library" | "short" | "top"

export type RandomFilters = {
  genreId?: number
  genreName?: string
  maxDuration?: number
  minRating?: number
}

function movieGenres(movie: Movie) {
  if (movie.genres?.length) return movie.genres
  return movie.genre.split(",").map(genre => genre.trim()).filter(Boolean)
}

export function useRandomMovie() {
  const { library, preferences } = useApp()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<RandomMode>(() => preferences.randomDefaultMode)
  const [filters, setFilters] = useState<RandomFilters>(() => ({
    maxDuration: preferences.randomMaxDuration,
    minRating: preferences.randomMinRating || preferences.minimumTmdbRating,
  }))
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([])

  const hasLibrary = library.length > 0
  const librarySignature = useMemo(() => library.map(item => `${item.id}:${item.status}`).join("|"), [library])
  const previousLibrarySignature = useRef(librarySignature)

  const preferredGenres = useMemo(() => {
    const scores = new Map<string, number>()
    library.forEach(item => {
      const weight = item.status === "watched" ? 5 : item.status === "watching" ? 3 : 1
      movieGenres(item).forEach(genre => scores.set(genre, (scores.get(genre) ?? 0) + weight))
    })
    preferences.favoriteGenres.forEach(genre => scores.set(genre, (scores.get(genre) ?? 0) + 6))
    return [...scores.entries()].filter(([genre]) => !preferences.avoidedGenres.includes(genre)).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([genre]) => genre)
  }, [library, preferences.favoriteGenres, preferences.avoidedGenres])

  useEffect(() => {
    getMovieGenres().then(setGenres).catch(() => setGenres([]))
  }, [])

  const draw = useCallback(async () => {
    const startedAt = Date.now()
    setLoading(true)
    setError(null)
    try {
      if (mode === "library") {
        if (!library.length) {
          setMovie(null)
          throw new Error("Ta bibliothèque est vide. Ajoute d’abord des films pour utiliser ce mode.")
        }

        const candidates = library.filter(item => {
          const genreOk = !filters.genreName || movieGenres(item).some(g => g.toLowerCase() === filters.genreName?.toLowerCase())
          const durationOk = !filters.maxDuration || !item.duration || item.duration <= filters.maxDuration
          const ratingOk = !filters.minRating || item.rating >= filters.minRating
          return genreOk && durationOk && ratingOk
        })
        if (!candidates.length) throw new Error("Aucun film de ta bibliothèque ne correspond à ces filtres.")
        setMovie(candidates[Math.floor(Math.random() * candidates.length)])
        return
      }

      const result = await getRandomMovie({
        preferredGenres: mode === "tastes" ? preferredGenres : [],
        excludedIds: preferences.randomExcludeWatched ? library.filter(item => item.status === "watched").map(item => item.id) : library.map(item => item.id),
        genreId: filters.genreId,
        maxDuration: mode === "short" ? Math.min(filters.maxDuration ?? 100, 100) : filters.maxDuration,
        minRating: mode === "top" ? Math.max(filters.minRating ?? 7.5, 7.5) : Math.max(filters.minRating ?? 0, preferences.minimumTmdbRating),
      })
      if (!result) throw new Error("Aucun film disponible pour ce tirage. Essaie avec moins de filtres.")
      setMovie(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de tirer un film.")
    } finally {
      const remaining = 500 - (Date.now() - startedAt)
      if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining))
      setLoading(false)
    }
  }, [filters, library, mode, preferredGenres, preferences.minimumTmdbRating, preferences.randomExcludeWatched])

  useEffect(() => { void draw() }, [draw])

  useEffect(() => {
    if (previousLibrarySignature.current === librarySignature) return
    previousLibrarySignature.current = librarySignature

    // Si la bibliothèque change pendant que ce mode est actif, on invalide
    // immédiatement l'ancienne sélection puis on refait un tirage.
    if (mode === "library") {
      setMovie(null)
      setError(null)
      void draw()
    }
  }, [draw, librarySignature, mode])

  const updateGenre = (genreId?: number) => {
    const genre = genres.find(item => item.id === genreId)
    setFilters(current => ({ ...current, genreId, genreName: genre?.name }))
  }

  const resetFilters = () => setFilters({})

  return { movie, loading, error, draw, preferredGenres, hasLibrary, mode, setMode, filters, setFilters, genres, updateGenre, resetFilters }
}
