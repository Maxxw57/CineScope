import { useCallback, useEffect, useState } from "react"
import { getActorDetails } from "../services/tmdb"
import { Actor } from "../types/Actor"

export function useTmdbActor(id: number | null) {
  const [actor, setActor] = useState<Actor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => setAttempt(value => value + 1), [])

  useEffect(() => {
    let cancelled = false
    if (!id) { setLoading(false); setError("not-found"); return }
    setLoading(true); setError(null)
    getActorDetails(id)
      .then(data => { if (!cancelled) setActor(data) })
      .catch(() => { if (!cancelled) setError("network") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, attempt])

  return { actor, loading, error, retry }
}
