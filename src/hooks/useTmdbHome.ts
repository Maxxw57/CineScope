import { useCallback, useEffect, useState } from "react"
import { Movie } from "../types/Movie"
import { getPopularMovies, getTopRatedMovies, getUpcomingMovies } from "../services/tmdb"

type HomeMovies = {
  popular: Movie[]
  topRated: Movie[]
  upcoming: Movie[]
}

const emptyData: HomeMovies = { popular: [], topRated: [], upcoming: [] }

export function useTmdbHome() {
  const [data, setData] = useState<HomeMovies>(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const retry = useCallback(() => setReloadKey(key => key + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([getPopularMovies(1), getTopRatedMovies(1), getUpcomingMovies(1)])
      .then(([popular, topRated, upcoming]) => {
        if (cancelled) return
        setData({
          popular: popular.movies.slice(0, 8),
          topRated: topRated.movies.slice(0, 4),
          upcoming: upcoming.movies.slice(0, 4),
        })
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger les sélections TMDB pour le moment.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [reloadKey])

  return { ...data, loading, error, retry }
}
