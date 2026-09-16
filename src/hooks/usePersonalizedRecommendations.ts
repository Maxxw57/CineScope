import { useEffect, useMemo, useState } from "react"
import { useApp } from "../context/AppContext"
import { getPersonalizedRecommendations } from "../services/tmdb"
import type { Movie } from "../types/Movie"

export type RecommendationSection = {
  id: "library" | "favorites" | "discovery"
  title: string
  subtitle: string
  movies: Movie[]
}

function movieGenres(movie: Movie) {
  if (movie.genres?.length) return movie.genres
  return movie.genre.split(",").map(genre => genre.trim()).filter(Boolean)
}

function topGenres(movies: Movie[], limit = 3) {
  const scores = new Map<string, number>()
  movies.forEach(movie => {
    movieGenres(movie).forEach(genre => scores.set(genre, (scores.get(genre) ?? 0) + 1))
  })
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([genre]) => genre)
}

function uniqueMovies(movies: Movie[], excluded: Set<number>) {
  return movies.filter(movie => {
    if (excluded.has(movie.id)) return false
    excluded.add(movie.id)
    return true
  })
}

export function usePersonalizedRecommendations() {
  const { library, favorites, history, ratings, preferences } = useApp()
  const [sections, setSections] = useState<RecommendationSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [ignoredIds, setIgnoredIds] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("recommendations:ignored") ?? "[]")
    } catch {
      return []
    }
  })

  const profile = useMemo(() => {
    const librarySource = preferences.recommendations.useLibrary ? library : []
    const favoriteSource = preferences.recommendations.useFavorites ? favorites : []
    const historySource = preferences.recommendations.useHistory ? history.slice(0, 10).map(entry => entry.movie) : []
    const highlyRated = preferences.recommendations.useRatings
      ? [...library, ...favorites].filter(movie => (ratings[`tmdb:${movie.id}`] ?? ratings[`local:${movie.id}`] ?? 0) >= 4)
      : []
    const libraryGenres = topGenres([...librarySource, ...highlyRated])
    const favoriteGenres = topGenres([...favoriteSource, ...highlyRated])
    const recentGenres = topGenres(historySource, 2)
    const preferredGenres = [...new Set([...preferences.favoriteGenres, ...libraryGenres, ...favoriteGenres, ...recentGenres])]
      .filter(genre => !preferences.avoidedGenres.includes(genre)).slice(0, 5)
    const watchedIds = preferences.recommendations.hideWatched ? library.filter(movie => movie.status === "watched").map(movie => movie.id) : []
    const knownIds = [...new Set([
      ...librarySource.map(movie => movie.id),
      ...favoriteSource.map(movie => movie.id),
      ...historySource.map(movie => movie.id),
      ...watchedIds,
      ...ignoredIds,
    ])]

    return { libraryGenres, favoriteGenres, preferredGenres, knownIds }
  }, [library, favorites, history, ignoredIds, preferences, ratings])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError("")

      try {
        const page = (refreshKey % 15) + 1
        const requests: Promise<{ id: RecommendationSection["id"]; title: string; subtitle: string; movies: Movie[] }>[] = []

        if (preferences.recommendations.useLibrary && library.length > 0) {
          requests.push(
            getPersonalizedRecommendations(profile.libraryGenres, profile.knownIds, page).then(result => ({
              id: "library" as const,
              title: "Inspiré de votre bibliothèque",
              subtitle: `Selon vos films ${profile.libraryGenres.length ? `et vos goûts pour ${profile.libraryGenres.join(", ")}` : "enregistrés"}.`,
              movies: result.movies,
            }))
          )
        }

        if (preferences.recommendations.useFavorites && favorites.length > 0) {
          requests.push(
            getPersonalizedRecommendations(profile.favoriteGenres, profile.knownIds, ((page + 4) % 15) + 1).then(result => ({
              id: "favorites" as const,
              title: "Parce que vous aimez ces genres",
              subtitle: profile.favoriteGenres.length ? profile.favoriteGenres.join(" • ") : "Basé sur vos favoris",
              movies: result.movies,
            }))
          )
        }

        requests.push(
          getPersonalizedRecommendations(
            profile.preferredGenres,
            profile.knownIds,
            library.length || favorites.length ? ((page + 8) % 15) + 1 : page
          ).then(result => ({
            id: "discovery" as const,
            title: library.length || favorites.length ? "À découvrir aussi" : "Découvrez votre prochain film",
            subtitle: library.length || favorites.length
              ? "Une sélection plus large pour ne pas rester dans les mêmes habitudes."
              : "Ajoutez les films qui vous plaisent à votre bibliothèque : CineScope affinera ensuite cette page.",
            movies: result.movies,
          }))
        )

        const results = await Promise.all(requests)
        if (cancelled) return

        const alreadyShown = new Set(profile.knownIds)
        setSections(results.map(section => ({
          ...section,
          movies: uniqueMovies(section.movies, alreadyShown)
            .filter(movie => movie.rating >= preferences.minimumTmdbRating)
            .filter(movie => !movieGenres(movie).some(genre => preferences.avoidedGenres.includes(genre)))
            .filter(movie => preferences.languages.length === 0 || !movie.originalLanguage || preferences.languages.includes(movie.originalLanguage))
            .slice(0, 8),
        })).filter(section => section.movies.length > 0))
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Impossible de charger les recommandations.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [profile, refreshKey, library.length, favorites.length, preferences])

  const ignoreMovie = (id: number) => {
    setIgnoredIds(current => {
      const next = [...new Set([...current, id])]
      localStorage.setItem("recommendations:ignored", JSON.stringify(next))
      return next
    })
    setSections(current => current.map(section => ({
      ...section,
      movies: section.movies.filter(movie => movie.id !== id),
    })))
  }

  return {
    sections,
    preferredGenres: profile.preferredGenres,
    hasPersonalData: profile.preferredGenres.length > 0,
    loading,
    error,
    ignoreMovie,
    refresh: () => setRefreshKey(value => value + 1),
    retry: () => setRefreshKey(value => value + 1),
  }
}
