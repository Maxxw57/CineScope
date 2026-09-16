import { useEffect, useMemo, useState } from "react"
import SeriesCard from "../components/SeriesCard"
import { useTmdbSeries } from "../hooks/useTmdbSeries"
import { DiscoverSeriesFilters } from "../services/tmdb"

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 60 }, (_, i) => currentYear - i)

export default function SeriesPage() {
  const [page, setPage] = useState(1); const [genreId, setGenreId] = useState(0); const [year, setYear] = useState(0); const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState<DiscoverSeriesFilters["sortBy"]>("popularity.desc")
  const filters = useMemo(() => ({ genreId: genreId || undefined, year: year || undefined, minRating: minRating || undefined, sortBy }), [genreId, year, minRating, sortBy])
  const { series, genres, totalPages, totalResults, loading, error, retry } = useTmdbSeries(page, filters)
  useEffect(() => setPage(1), [genreId, year, minRating, sortBy])
  useEffect(() => window.scrollTo({ top: 0, behavior: "smooth" }), [page])
  const selectClass = "mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold outline-none dark:border-gray-700 dark:bg-gray-900"

  return <main className="page-enter mx-auto min-h-[calc(100vh-72px)] max-w-7xl px-4 py-10 sm:px-6">
    <div className="mb-8"><p className="cine-eyebrow">Catalogue TMDB</p><h1 className="mt-1 text-4xl font-black sm:text-5xl">Séries</h1><p className="mt-3 max-w-2xl text-gray-500 dark:text-gray-400">Découvrez des séries, filtrez le catalogue et explorez leurs saisons et épisodes.</p></div>
    <section className="cine-panel mb-8"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-sm font-bold">Genre<select value={genreId} onChange={e => setGenreId(Number(e.target.value))} className={selectClass}><option value={0}>Tous les genres</option>{genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
      <label className="text-sm font-bold">Année<select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClass}><option value={0}>Toutes les années</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></label>
      <label className="text-sm font-bold">Note minimum<select value={minRating} onChange={e => setMinRating(Number(e.target.value))} className={selectClass}><option value={0}>Toutes les notes</option><option value={6}>6/10 et +</option><option value={7}>7/10 et +</option><option value={8}>8/10 et +</option></select></label>
      <label className="text-sm font-bold">Trier par<select value={sortBy} onChange={e => setSortBy(e.target.value as DiscoverSeriesFilters["sortBy"])} className={selectClass}><option value="popularity.desc">Popularité</option><option value="vote_average.desc">Mieux notées</option><option value="first_air_date.desc">Plus récentes</option><option value="name.asc">Titre A → Z</option></select></label>
    </div></section>
    {!loading && !error && <p className="mb-5 text-sm font-semibold text-gray-500">{totalResults.toLocaleString("fr-FR")} séries trouvées</p>}
    {loading && <div className="py-20 text-center font-bold">Chargement des séries...</div>}
    {!loading && error && <div className="cine-panel text-center"><p className="font-bold text-red-600">{error}</p><button onClick={retry} className="cine-button-primary mt-4">Réessayer</button></div>}
    {!loading && !error && <><div className="cine-movie-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">{series.map(s => <SeriesCard key={s.id} series={s}/>)}</div>{totalPages > 1 && <div className="mt-10 flex justify-center gap-4"><button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="cine-button-secondary disabled:opacity-40">← Précédente</button><span className="self-center text-sm font-bold">Page {page} / {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="cine-button-secondary disabled:opacity-40">Suivante →</button></div>}</>}
  </main>
}
