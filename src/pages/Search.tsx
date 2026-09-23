import { FormEvent, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import MovieCard from "../components/MovieCard"
import SeriesCard from "../components/SeriesCard"
import { ActorSearchResult, searchActors, searchMovies, searchSeries } from "../services/tmdb"
import { Movie } from "../types/Movie"
import { Series } from "../types/Series"

const RECENT_KEY = "cinescope:recent-searches"

export default function Search() {
  const [query, setQuery] = useState("")
  const [movies, setMovies] = useState<Movie[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [actors, setActors] = useState<ActorSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [lastQuery, setLastQuery] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") } catch { return [] }
  })

  const cancel = () => { if (timerRef.current) clearTimeout(timerRef.current) }
  const remember = (value: string) => {
    const next = [value, ...recent.filter(x => x.toLowerCase() !== value.toLowerCase())].slice(0, 6)
    setRecent(next)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  }

  const runSearch = async (value: string) => {
    const clean = value.trim()
    if (!clean) return
    setLoading(true)
    setError(null)
    setSearched(true)
    setLastQuery(clean)

    try {
      const [movieData, seriesData, actorData] = await Promise.all([
        searchMovies(clean, 1),
        searchSeries(clean, 1),
        searchActors(clean, 1),
      ])
      setMovies(movieData.movies)
      setSeries(seriesData.series)
      setActors(actorData.actors)
    } catch {
      setError("Impossible d'effectuer la recherche TMDB.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cancel()
    const value = query.trim()
    if (value.length < 2) {
      if (!value) {
        setMovies([])
        setSeries([])
        setActors([])
        setSearched(false)
      }
      return
    }
    timerRef.current = setTimeout(() => runSearch(value), 450)
    return cancel
  }, [query])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const value = query.trim()
    if (!value) return
    cancel()
    remember(value)
    runSearch(value)
  }

  const totalShown = movies.length + series.length + actors.length

  return <main className="page-enter min-h-[calc(100vh-72px)]">
    <section className="cine-search-hero relative isolate border-b border-gray-200 py-16 text-white dark:border-white/10 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p className="text-sm font-black uppercase tracking-[.22em] text-blue-400">Recherche CineScope</p>
        <h1 className="mt-3 text-4xl font-black sm:text-6xl">Tout CineScope en une recherche</h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/60">Recherchez simultanément des films, des séries et des acteurs dans TMDB.</p>
        <form onSubmit={submit} className="mx-auto mt-8 max-w-3xl">
          <div className="flex rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-2xl">
            <span className="grid w-12 place-items-center text-xl text-white/50">⌕</span>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Dune, Breaking Bad, Leonardo DiCaprio..." className="min-w-0 flex-1 bg-transparent px-2 py-3 text-lg font-semibold text-white outline-none placeholder:text-white/35"/>
            <button disabled={!query.trim() || loading} className="rounded-xl bg-blue-600 px-5 font-black text-white disabled:opacity-50">Rechercher</button>
          </div>
        </form>
        {!query && recent.length > 0 && <div className="mt-6 flex flex-wrap justify-center gap-2">{recent.map(item => <button key={item} onClick={() => setQuery(item)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/70">↻ {item}</button>)}</div>}
      </div>
    </section>

    <div className="mx-auto max-w-7xl space-y-14 px-4 py-10 sm:px-6">
      {loading && totalShown === 0 && <div className="py-20 text-center font-bold">Recherche en cours...</div>}
      {!loading && error && <div className="cine-panel text-center font-bold text-red-600">{error}</div>}
      {!loading && !error && searched && totalShown === 0 && <div className="py-16 text-center"><h2 className="text-2xl font-black">Aucun résultat trouvé pour « {lastQuery} »</h2></div>}

      {!error && searched && totalShown > 0 && <>
        <div><p className="cine-eyebrow">Résultats de recherche</p><h2 className="mt-1 text-3xl font-black">« {lastQuery} »</h2><p className="mt-1 text-sm text-gray-500">Films, séries et acteurs réunis sur une seule page.</p></div>

        {movies.length > 0 && <section>
          <div className="mb-6 flex items-end justify-between"><div><p className="cine-eyebrow">Cinéma</p><h2 className="mt-1 text-3xl font-black">🎬 Films</h2></div><span className="text-sm font-bold text-gray-500">{movies.length} affichés</span></div>
          <div className={`cine-movie-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6 ${loading ? "opacity-50" : ""}`}>{movies.slice(0, 8).map(movie => <MovieCard key={movie.id} movie={movie}/>)}</div>
        </section>}

        {series.length > 0 && <section>
          <div className="mb-6 flex items-end justify-between"><div><p className="cine-eyebrow">Télévision</p><h2 className="mt-1 text-3xl font-black">📺 Séries</h2></div><span className="text-sm font-bold text-gray-500">{series.length} affichées</span></div>
          <div className={`cine-movie-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6 ${loading ? "opacity-50" : ""}`}>{series.slice(0, 8).map(item => <SeriesCard key={item.id} series={item}/>)}</div>
        </section>}

        {actors.length > 0 && <section>
          <div className="mb-6"><p className="cine-eyebrow">Personnalités</p><h2 className="mt-1 text-3xl font-black">🎭 Acteurs</h2></div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">{actors.slice(0, 8).map(actor => <Link key={actor.id} to={`/acteurs/${actor.id}`} className="group overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white/70 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[.04]"><div className="aspect-[4/5] overflow-hidden bg-gray-200 dark:bg-gray-800">{actor.profile ? <img src={actor.profile} alt={actor.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105"/> : <div className="grid h-full place-items-center text-5xl">👤</div>}</div><div className="p-4"><h3 className="truncate text-lg font-black">{actor.name}</h3><p className="mt-1 text-sm text-gray-500">Acteur / Actrice</p></div></Link>)}</div>
        </section>}
      </>}
    </div>
  </main>
}
