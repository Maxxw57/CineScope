import { useCallback, useEffect, useMemo, useState } from "react"
import { useApp } from "../context/AppContext"
import { getRandomMovie } from "../services/tmdb"
import type { Movie } from "../types/Movie"

function movieGenres(movie: Movie) {
  if (movie.genres?.length) return movie.genres
  return movie.genre.split(",").map(genre => genre.trim()).filter(Boolean)
}

export function useRandomMovie() {
  const { library } = useApp()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const preferredGenres = useMemo(() => {
    const scores = new Map<string, number>()
    library.forEach(item => {
      const weight = item.status === "watched" ? 3 : item.status === "watching" ? 2 : 1
      movieGenres(item).forEach(genre => scores.set(genre, (scores.get(genre) ?? 0) + weight))
    })
    return [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([genre]) => genre)
  }, [library])

  const draw = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getRandomMovie(
        preferredGenres,
        library.map(item => item.id)
      )
      if (!result) throw new Error("Aucun film disponible pour ce tirage.")
      setMovie(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de tirer un film.")
    } finally {
      setLoading(false)
    }
  }, [library, preferredGenres])

  useEffect(() => { void draw() }, [draw])

  return { movie, loading, error, draw, preferredGenres, personalized: library.length > 0 }
}
