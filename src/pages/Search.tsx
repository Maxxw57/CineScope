import { FormEvent, useEffect, useRef, useState } from "react"
import MovieCard from "../components/MovieCard"
import { useTmdbSearch } from "../hooks/useTmdbSearch"

export default function Search() {
  const [query, setQuery] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { movies, loading, error, searched, page, totalPages, totalResults, lastQuery, search, reset } = useTmdbSearch()

  const cancelPendingSearch = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    cancelPendingSearch()
    const value = query.trim()

    if (!value) {
      reset()
      return
    }

    if (value.length < 2) return

    timerRef.current = setTimeout(() => {
      search(value, 1)
    }, 500)

    return cancelPendingSearch
  }, [query, reset, search])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const value = query.trim()
    if (!value) return
    cancelPendingSearch()
    await search(value, 1)
  }

  const clearSearch = () => {
    cancelPendingSearch()
    setQuery("")
    reset()
  }

  const changePage = async (nextPage: number) => {
    if (!lastQuery || nextPage < 1 || nextPage > totalPages) return
    await search(lastQuery, nextPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Recherche TMDB</p>
        <h1 className="mt-1 text-4xl font-black">Trouver un film</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Saisissez un titre : la recherche se lance automatiquement après quelques instants.</p>
      </div>

      <form onSubmit={submit} className="flex max-w-3xl gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Rechercher un film</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ex. Interstellar, Avatar, Dune..."
            autoComplete="off"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900"
          />
          {query && (
            <button type="button" onClick={clearSearch} aria-label="Effacer la recherche" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200">×</button>
          )}
        </label>
        <button disabled={!query.trim() || loading} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? "Recherche..." : "Rechercher"}
        </button>
      </form>

      {query.trim().length === 1 && !searched && <p className="mt-3 text-sm text-gray-500">Saisissez au moins 2 caractères pour lancer la recherche automatique.</p>}

      {loading && movies.length === 0 && <p className="py-16 text-center text-lg font-semibold">Recherche en cours...</p>}

      {!loading && error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
          <p className="font-semibold text-red-700 dark:text-red-300">{error}</p>
          {lastQuery && <button onClick={() => search(lastQuery, page)} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500">Réessayer</button>}
        </div>
      )}

      {!loading && !error && searched && movies.length === 0 && (
        <div className="py-16 text-center">
          <h2 className="text-2xl font-black">Aucun film trouvé pour « {lastQuery} »</h2>
          <p className="mt-2 text-gray-500">Vérifiez l'orthographe ou essayez avec un autre titre.</p>
        </div>
      )}

      {!error && searched && movies.length > 0 && (
        <>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 pb-4 dark:border-gray-800">
            <div>
              <h2 className="text-2xl font-black">Résultats pour « {lastQuery} »</h2>
              <p className="mt-1 text-sm text-gray-500">{totalResults.toLocaleString("fr-FR")} film{totalResults > 1 ? "s" : ""} trouvé{totalResults > 1 ? "s" : ""}</p>
            </div>
            {totalPages > 1 && <span className="text-sm font-semibold text-gray-500">Page {page} sur {totalPages}</span>}
          </div>

          <div className={`mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6 ${loading ? "opacity-50" : ""}`}>
            {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button disabled={page <= 1 || loading} onClick={() => changePage(page - 1)} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700">Page précédente</button>
              <span className="text-sm font-semibold">{page} / {totalPages}</span>
              <button disabled={page >= totalPages || loading} onClick={() => changePage(page + 1)} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700">Page suivante</button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
