import { FormEvent, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import MovieCard from "../components/MovieCard"
import { useTmdbSearch } from "../hooks/useTmdbSearch"
import { searchMovies } from "../services/tmdb"
import { Movie } from "../types/Movie"

const RECENT_KEY = "cinescope:recent-searches"

export default function Search() {
  const [query, setQuery] = useState(""); const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [suggestions, setSuggestions] = useState<Movie[]>([]); const [recent, setRecent] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") } catch { return [] } })
  const { movies, loading, error, searched, page, totalPages, totalResults, lastQuery, search, reset } = useTmdbSearch()
  const cancelPendingSearch = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null } }
  const remember = (value: string) => { const next = [value, ...recent.filter(item => item.toLowerCase() !== value.toLowerCase())].slice(0, 6); setRecent(next); localStorage.setItem(RECENT_KEY, JSON.stringify(next)) }

  useEffect(() => {
    cancelPendingSearch(); const value = query.trim(); if (!value) { reset(); setSuggestions([]); return } if (value.length < 2) return
    timerRef.current = setTimeout(async () => { search(value, 1); try { const data = await searchMovies(value, 1); setSuggestions(data.movies.slice(0, 5)) } catch { setSuggestions([]) } }, 450)
    return cancelPendingSearch
  }, [query, reset, search])

  const submit = async (event: FormEvent) => { event.preventDefault(); const value = query.trim(); if (!value) return; cancelPendingSearch(); remember(value); setSuggestions([]); await search(value, 1) }
  const clearSearch = () => { cancelPendingSearch(); setQuery(""); setSuggestions([]); reset() }
  const changePage = async (next: number) => { if (!lastQuery || next < 1 || next > totalPages) return; await search(lastQuery, next); window.scrollTo({ top: 0, behavior: "smooth" }) }
  const useRecent = (value: string) => { setQuery(value); remember(value); search(value, 1) }

  return <main className="page-enter min-h-[calc(100vh-72px)]">
    <section className="relative isolate overflow-visible border-b border-gray-200 bg-slate-950 py-16 text-white dark:border-white/10 sm:py-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.28),transparent_45%)]"/>
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6"><p className="text-sm font-black uppercase tracking-[.22em] text-blue-400">Recherche CineScope</p><h1 className="mt-3 text-4xl font-black sm:text-6xl">Quel film cherchez-vous ?</h1><p className="mx-auto mt-4 max-w-2xl text-white/60">Recherchez instantanément dans le catalogue TMDB et retrouvez vos dernières recherches.</p>
        <form onSubmit={submit} className="relative mx-auto mt-8 max-w-3xl text-left"><div className="flex rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-2xl focus-within:border-blue-400/70"><span className="grid w-12 place-items-center text-xl text-white/50">⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Interstellar, Dune, Avatar..." autoComplete="off" className="min-w-0 flex-1 bg-transparent px-2 py-3 text-lg font-semibold text-white outline-none placeholder:text-white/35"/>{query && <button type="button" onClick={clearSearch} className="px-3 text-white/50 hover:text-white">✕</button>}<button disabled={!query.trim() || loading} className="rounded-xl bg-blue-600 px-5 font-black text-white hover:bg-blue-500 disabled:opacity-50">Rechercher</button></div>
          {query.trim().length >= 2 && suggestions.length > 0 && <div className="absolute inset-x-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 text-gray-900 shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:text-white">{suggestions.map(movie => <Link key={movie.id} to={`/films/${movie.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800">{movie.poster ? <img src={movie.poster} alt="" className="h-16 w-11 rounded-lg object-cover"/> : <div className="h-16 w-11 rounded-lg bg-gray-200 dark:bg-gray-800"/>}<div className="min-w-0"><p className="truncate font-black">{movie.title}</p><p className="mt-1 text-xs text-gray-500">{movie.year} · ★ {movie.rating}</p></div></Link>)}</div>}
        </form>
        {!query && recent.length > 0 && <div className="mt-6 flex flex-wrap justify-center gap-2"><span className="py-2 text-xs font-bold uppercase tracking-wider text-white/40">Récentes</span>{recent.map(item => <button key={item} onClick={() => useRecent(item)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white">↻ {item}</button>)}<button onClick={() => { setRecent([]); localStorage.removeItem(RECENT_KEY) }} className="px-2 text-xs font-bold text-white/40 hover:text-white">Effacer</button></div>}
      </div>
    </section>

    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {loading && movies.length === 0 && <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">{[1,2,3,4].map(i => <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"/>)}</div>}
      {!loading && error && <div className="cine-panel text-center"><p className="font-bold text-red-600">{error}</p>{lastQuery && <button onClick={() => search(lastQuery, page)} className="cine-button-primary mt-4">Réessayer</button>}</div>}
      {!loading && !error && searched && movies.length === 0 && <div className="py-16 text-center"><h2 className="text-2xl font-black">Aucun film trouvé pour « {lastQuery} »</h2><p className="mt-2 text-gray-500">Essayez un autre titre ou une orthographe différente.</p></div>}
      {!error && searched && movies.length > 0 && <><div className="mb-7 flex items-end justify-between gap-4"><div><p className="cine-eyebrow">Résultats</p><h2 className="mt-1 text-3xl font-black">« {lastQuery} »</h2><p className="mt-1 text-sm text-gray-500">{totalResults.toLocaleString("fr-FR")} films trouvés</p></div>{totalPages > 1 && <span className="text-sm font-bold text-gray-500">Page {page} / {totalPages}</span>}</div><div className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6 ${loading ? "opacity-50" : ""}`}>{movies.map(movie => <MovieCard key={movie.id} movie={movie}/>)}</div>{totalPages > 1 && <div className="mt-10 flex justify-center gap-3"><button disabled={page <= 1 || loading} onClick={() => changePage(page-1)} className="cine-button-secondary disabled:opacity-40">← Précédente</button><button disabled={page >= totalPages || loading} onClick={() => changePage(page+1)} className="cine-button-secondary disabled:opacity-40">Suivante →</button></div>}</>}
    </div>
  </main>
}
