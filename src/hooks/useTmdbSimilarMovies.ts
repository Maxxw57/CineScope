import { useEffect, useState } from "react"
import { Movie } from "../types/Movie"
import { getSimilarMovies } from "../services/tmdb"

export function useTmdbSimilarMovies(id: number | null, enabled = true) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled || id === null || !Number.isFinite(id)) {
      setMovies([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    getSimilarMovies(id)
      .then(data => {
        if (!cancelled) setMovies(data.movies.slice(0, 4))
      })
      .catch(() => {
        if (!cancelled) setMovies([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id, enabled])

  return { movies, loading }
}
