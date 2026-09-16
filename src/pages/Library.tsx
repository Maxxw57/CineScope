import { useMemo, useState } from "react"
import MovieCard from "../components/MovieCard"
import { LibraryMovie, LibraryStatus, useApp } from "../context/AppContext"

type FilterStatus = "all" | LibraryStatus
type SortOption = "recent" | "title" | "rating" | "year"

const statusLabels: Record<LibraryStatus, string> = {
  watchlist: "À regarder",
  watching: "En cours",
  watched: "Vus",
}

const statusStyles: Record<LibraryStatus, string> = {
  watchlist: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  watching: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  watched: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
}

function LibraryCard({ movie }: { movie: LibraryMovie }) {
  const { updateLibraryStatus, removeFromLibrary } = useApp()

  return (
    <div className="group relative">
      <MovieCard movie={movie} />
      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${statusStyles[movie.status]}`}>
            {statusLabels[movie.status]}
          </span>
          <button
            type="button"
            onClick={() => removeFromLibrary(movie.id)}
            className="rounded-lg px-2 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            title="Retirer de la bibliothèque"
          >
            Retirer
          </button>
        </div>
        <select
          aria-label={`Changer le statut de ${movie.title}`}
          value={movie.status}
          onChange={event => updateLibraryStatus(movie.id, event.target.value as LibraryStatus)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950"
        >
          <option value="watchlist">À regarder</option>
          <option value="watching">En cours</option>
          <option value="watched">Vu</option>
        </select>
      </div>
    </div>
  )
}

export default function Library() {
  const { library, preferences } = useApp()
  const [activeStatus, setActiveStatus] = useState<FilterStatus>("all")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortOption>(() => preferences.library.defaultSort)
  const [view, setView] = useState<"grid" | "list">(() => preferences.library.defaultView)

  const counts = useMemo(() => ({
    all: library.length,
    watchlist: library.filter(movie => movie.status === "watchlist").length,
    watching: library.filter(movie => movie.status === "watching").length,
    watched: library.filter(movie => movie.status === "watched").length,
  }), [library])

  const watchedPercent = library.length === 0 ? 0 : Math.round((counts.watched / library.length) * 100)

  const filteredMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr")
    const result = library.filter(movie => {
      const matchesStatus = activeStatus === "all" || movie.status === activeStatus
      const matchesQuery = !normalizedQuery || `${movie.title} ${movie.genre} ${movie.year}`.toLocaleLowerCase("fr").includes(normalizedQuery)
      return matchesStatus && matchesQuery
    })

    if (sort === "title") return [...result].sort((a, b) => a.title.localeCompare(b.title, "fr"))
    if (sort === "rating") return [...result].sort((a, b) => b.rating - a.rating)
    if (sort === "year") return [...result].sort((a, b) => b.year - a.year)
    return result
  }, [activeStatus, library, query, sort])

  const filters: Array<{ value: FilterStatus; label: string; count: number }> = [
    { value: "all", label: "Tous", count: counts.all },
    { value: "watchlist", label: "À regarder", count: counts.watchlist },
    { value: "watching", label: "En cours", count: counts.watching },
    { value: "watched", label: "Vus", count: counts.watched },
  ]

  return (
    <main className="page-enter mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="cine-premium-header mb-8 p-7 sm:p-9">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-pink-400/20 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-blue-100">Ma collection</p>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">Ma bibliothèque</h1>
          <p className="mt-3 max-w-2xl text-blue-100">Retrouvez vos films, suivez votre progression et organisez ce que vous voulez regarder.</p>

          <div className="mt-7 max-w-xl">
            <div className="mb-2 flex justify-between text-sm font-bold">
              <span>Progression de la bibliothèque</span>
              <span>{watchedPercent}% vus</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${watchedPercent}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {filters.map(item => (
          <button
            key={item.value}
            type="button"
            onClick={() => setActiveStatus(item.value)}
            className={`rounded-2xl border p-4 text-left transition ${activeStatus === item.value ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-500/10 dark:bg-blue-950/30" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"}`}
          >
            <span className="block text-3xl font-black">{item.count}</span>
            <span className={`mt-1 block text-sm font-bold ${activeStatus === item.value ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>{item.label}</span>
          </button>
        ))}
      </section>

      <section className="mb-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-xl">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Rechercher dans ma bibliothèque..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-9 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setView("grid")} className={`rounded-xl border px-3 py-2 font-black ${view === "grid" ? "border-blue-500 text-blue-600" : "border-gray-200 dark:border-gray-700"}`}>▦</button>
            <button type="button" onClick={() => setView("list")} className={`rounded-xl border px-3 py-2 font-black ${view === "list" ? "border-blue-500 text-blue-600" : "border-gray-200 dark:border-gray-700"}`}>☷</button>
          </div>
          <select
            value={sort}
            onChange={event => setSort(event.target.value as SortOption)}
            aria-label="Trier la bibliothèque"
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-semibold outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950"
          >
            <option value="recent">Ajout récent</option>
            <option value="title">Titre A-Z</option>
            <option value="rating">Meilleure note TMDB</option>
            <option value="year">Plus récent</option>
          </select>
        </div>
      </section>

      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">{filters.find(item => item.value === activeStatus)?.label}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filteredMovies.length} {filteredMovies.length > 1 ? "films affichés" : "film affiché"}
          </p>
        </div>
        {(query || activeStatus !== "all") && (
          <button
            type="button"
            onClick={() => { setQuery(""); setActiveStatus("all") }}
            className="text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {library.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900/50">
          <div className="text-5xl">🎬</div>
          <h2 className="mt-4 text-2xl font-black">Votre bibliothèque est vide</h2>
          <p className="mx-auto mt-2 max-w-md text-gray-500 dark:text-gray-400">Ajoutez des films depuis le catalogue pour commencer à construire votre collection.</p>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 px-6 py-12 text-center dark:border-gray-700">
          <h2 className="text-xl font-black">Aucun film trouvé</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Essayez une autre recherche ou un autre statut.</p>
        </div>
      ) : (
        <div className={view === "grid" ? "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4" : "grid gap-5 md:grid-cols-2"}>
          {filteredMovies.map(movie => <LibraryCard key={movie.id} movie={movie} />)}
        </div>
      )}
    </main>
  )
}
