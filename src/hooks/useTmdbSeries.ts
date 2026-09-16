import { useCallback, useEffect, useState } from "react"
import { DiscoverSeriesFilters, discoverSeries, getSeriesGenres, TmdbGenre } from "../services/tmdb"
import { Series } from "../types/Series"

export function useTmdbSeries(page: number, filters: DiscoverSeriesFilters) {
  const [series, setSeries] = useState<Series[]>([])
  const [genres, setGenres] = useState<TmdbGenre[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const retry = useCallback(() => setReloadKey(k => k + 1), [])

  useEffect(() => {
    let cancelled = false; setLoading(true); setError(null)
    Promise.all([discoverSeries(filters, page), getSeriesGenres()]).then(([data, genreList]) => {
      if (cancelled) return
      setSeries(data.series); setGenres(genreList); setTotalPages(data.totalPages); setTotalResults(data.totalResults)
    }).catch(() => !cancelled && setError("Impossible de récupérer les séries depuis TMDB.")).finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [page, filters.genreId, filters.year, filters.minRating, filters.sortBy, reloadKey])

  return { series, genres, totalPages, totalResults, loading, error, retry }
}
