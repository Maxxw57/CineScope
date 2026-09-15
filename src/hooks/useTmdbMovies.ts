import { useCallback, useEffect, useState } from "react"
import { Movie } from "../types/Movie"
import { discoverMovies, DiscoverMovieFilters, getMovieGenres, TmdbGenre } from "../services/tmdb"

export function useTmdbMovies(page: number, filters: DiscoverMovieFilters) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [genres, setGenres] = useState<TmdbGenre[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const retry = useCallback(() => setReloadKey(key => key + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([discoverMovies(filters, page), getMovieGenres()])
      .then(([data, genreList]) => {
        if (cancelled) return
        setMovies(data.movies)
        setGenres(genreList)
        setTotalPages(data.totalPages)
        setTotalResults(data.totalResults)
      })
      .catch(() => {
        if (!cancelled) setError("Une erreur est survenue lors de la récupération des données. Veuillez réessayer.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [page, filters.genreId, filters.year, filters.minRating, filters.sortBy, reloadKey])

  return { movies, genres, totalPages, totalResults, loading, error, retry }
}
