import { useCallback, useState } from "react"
import { Movie } from "../types/Movie"
import { searchMovies } from "../services/tmdb"

export function useTmdbSearch() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [lastQuery, setLastQuery] = useState("")

  const search = useCallback(async (query: string, requestedPage = 1) => {
    const value = query.trim()
    if (!value) return

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const data = await searchMovies(value, requestedPage)
      setMovies(data.movies)
      setPage(data.page)
      setTotalPages(data.totalPages)
      setTotalResults(data.totalResults)
      setLastQuery(value)
    } catch {
      setMovies([])
      setTotalResults(0)
      setError("Impossible d'effectuer la recherche. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setMovies([])
    setError(null)
    setSearched(false)
    setPage(1)
    setTotalPages(1)
    setTotalResults(0)
    setLastQuery("")
  }, [])

  return { movies, loading, error, searched, page, totalPages, totalResults, lastQuery, search, reset }
}
