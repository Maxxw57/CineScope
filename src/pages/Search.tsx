import { FormEvent, useEffect, useRef, useState } from "react"
import MovieCard from "../components/MovieCard"
import SeriesCard from "../components/SeriesCard"
import { searchMovies, searchSeries } from "../services/tmdb"
import { Movie } from "../types/Movie"
import { Series } from "../types/Series"

const RECENT_KEY = "cinescope:recent-searches"
type SearchMode = "movies" | "series"

export default function Search() {
  const [query, setQuery] = useState(""); const [mode, setMode] = useState<SearchMode>("movies"); const [movies, setMovies] = useState<Movie[]>([]); const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null); const [searched, setSearched] = useState(false); const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1); const [totalResults, setTotalResults] = useState(0); const [lastQuery, setLastQuery] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null); const [recent, setRecent] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") } catch { return [] } })
  const cancel = () => { if (timerRef.current) clearTimeout(timerRef.current) }
  const remember = (value: string) => { const next = [value, ...recent.filter(x => x.toLowerCase() !== value.toLowerCase())].slice(0, 6); setRecent(next); localStorage.setItem(RECENT_KEY, JSON.stringify(next)) }

  const runSearch = async (value: string, nextPage = 1, nextMode = mode) => {
    if (!value.trim()) return; setLoading(true); setError(null); setSearched(true); setLastQuery(value); setPage(nextPage)
    try {
      if (nextMode === "movies") { const data = await searchMovies(value, nextPage); setMovies(data.movies); setSeries([]); setTotalPages(data.totalPages); setTotalResults(data.totalResults) }
      else { const data = await searchSeries(value, nextPage); setSeries(data.series); setMovies([]); setTotalPages(data.totalPages); setTotalResults(data.totalResults) }
    } catch { setError("Impossible d'effectuer la recherche TMDB.") } finally { setLoading(false) }
  }

  useEffect(() => { cancel(); const value = query.trim(); if (value.length < 2) { if (!value) { setMovies([]); setSeries([]); setSearched(false) } return }; timerRef.current = setTimeout(() => runSearch(value, 1), 450); return cancel }, [query, mode])
  const submit = (e: FormEvent) => { e.preventDefault(); const value = query.trim(); if (!value) return; cancel(); remember(value); runSearch(value, 1) }
  const switchMode = (next: SearchMode) => { setMode(next); setPage(1); if (query.trim()) runSearch(query.trim(), 1, next) }
  const count = mode === "movies" ? movies.length : series.length

  return <main className="page-enter min-h-[calc(100vh-72px)]">
    <section className="cine-search-hero relative isolate border-b border-gray-200 py-16 text-white dark:border-white/10 sm:py-20"><div className="mx-auto max-w-4xl px-4 text-center sm:px-6"><p className="text-sm font-black uppercase tracking-[.22em] text-blue-400">Recherche CineScope</p><h1 className="mt-3 text-4xl font-black sm:text-6xl">Films ou séries ?</h1><p className="mx-auto mt-4 max-w-2xl text-white/60">Recherchez dans les catalogues Films et Séries de TMDB.</p>
      <div className="mt-6 inline-flex rounded-2xl border border-white/10 bg-white/5 p-1"><button onClick={() => switchMode("movies")} className={`rounded-xl px-5 py-2.5 text-sm font-black ${mode === "movies" ? "bg-blue-600 text-white" : "text-white/60"}`}>🎬 Films</button><button onClick={() => switchMode("series")} className={`rounded-xl px-5 py-2.5 text-sm font-black ${mode === "series" ? "bg-blue-600 text-white" : "text-white/60"}`}>📺 Séries</button></div>
      <form onSubmit={submit} className="mx-auto mt-6 max-w-3xl"><div className="flex rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-2xl"><span className="grid w-12 place-items-center text-xl text-white/50">⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder={mode === "movies" ? "Interstellar, Dune, Avatar..." : "Breaking Bad, Dark, The Last of Us..."} className="min-w-0 flex-1 bg-transparent px-2 py-3 text-lg font-semibold text-white outline-none placeholder:text-white/35"/><button disabled={!query.trim() || loading} className="rounded-xl bg-blue-600 px-5 font-black text-white disabled:opacity-50">Rechercher</button></div></form>
      {!query && recent.length > 0 && <div className="mt-6 flex flex-wrap justify-center gap-2">{recent.map(item => <button key={item} onClick={() => setQuery(item)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/70">↻ {item}</button>)}</div>}
    </div></section>
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {loading && count === 0 && <div className="py-20 text-center font-bold">Recherche en cours...</div>}
      {!loading && error && <div className="cine-panel text-center font-bold text-red-600">{error}</div>}
      {!loading && !error && searched && count === 0 && <div className="py-16 text-center"><h2 className="text-2xl font-black">Aucun {mode === "movies" ? "film" : "série"} trouvé pour « {lastQuery} »</h2></div>}
      {!error && searched && count > 0 && <><div className="mb-7"><p className="cine-eyebrow">Résultats · {mode === "movies" ? "Films" : "Séries"}</p><h2 className="mt-1 text-3xl font-black">« {lastQuery} »</h2><p className="mt-1 text-sm text-gray-500">{totalResults.toLocaleString("fr-FR")} résultats</p></div><div className={`cine-movie-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6 ${loading ? "opacity-50" : ""}`}>{mode === "movies" ? movies.map(m => <MovieCard key={m.id} movie={m}/>) : series.map(s => <SeriesCard key={s.id} series={s}/>)}</div>{totalPages > 1 && <div className="mt-10 flex justify-center gap-3"><button disabled={page <= 1 || loading} onClick={() => runSearch(lastQuery, page - 1)} className="cine-button-secondary disabled:opacity-40">← Précédente</button><span className="self-center text-sm font-bold">Page {page} / {totalPages}</span><button disabled={page >= totalPages || loading} onClick={() => runSearch(lastQuery, page + 1)} className="cine-button-secondary disabled:opacity-40">Suivante →</button></div>}</>}
    </div>
  </main>
}
