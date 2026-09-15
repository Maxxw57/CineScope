import { useCallback, useEffect, useState } from "react"
import { getMovieDetails } from "../services/tmdb"
import { Movie } from "../types/Movie"

type MovieError = "not-found" | "network" | null

export function useTmdbMovie(id: number | null, enabled = true) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<MovieError>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const retry = useCallback(() => setReloadKey(key => key + 1), [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      setError(null)
      return
    }

    if (id === null || !Number.isFinite(id)) {
      setMovie(null)
      setError("not-found")
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getMovieDetails(id)
      .then(data => {
        if (!cancelled) setMovie(data)
      })
      .catch(err => {
        if (cancelled) return
        setMovie(null)
        setError(err instanceof Error && err.message.includes("404") ? "not-found" : "network")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id, enabled, reloadKey])

  return { movie, loading, error, retry }
}
