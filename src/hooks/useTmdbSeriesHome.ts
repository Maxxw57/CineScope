import { useCallback, useEffect, useState } from "react"
import { discoverSeries } from "../services/tmdb"
import { Series } from "../types/Series"

export function useTmdbSeriesHome() {
  const [popular, setPopular] = useState<Series[]>([])
  const [topRated, setTopRated] = useState<Series[]>([])
  const [recent, setRecent] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const retry = useCallback(() => setReloadKey(key => key + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      discoverSeries({ sortBy: "popularity.desc" }, 1),
      discoverSeries({ sortBy: "vote_average.desc", minRating: 7 }, 1),
      discoverSeries({
        sortBy: "first_air_date.desc",
        firstAirDateGte: "2026-01-01",
        firstAirDateLte: "2027-12-31",
        minVotes: 20,
      }, 1),
    ])
      .then(([popularData, topRatedData, recentData]) => {
        if (cancelled) return
        setPopular(popularData.series.slice(0, 4))
        setTopRated(topRatedData.series.slice(0, 4))
        setRecent(
          recentData.series
            .filter(series => series.year >= 2026 && series.year <= 2027 && Boolean(series.poster))
            .slice(0, 4)
        )
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de récupérer les séries depuis TMDB.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [reloadKey])

  return { popular, topRated, recent, loading, error, retry }
}
