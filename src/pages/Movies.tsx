import { useEffect, useMemo, useState } from "react"
import MovieCard from "../components/MovieCard"
import { useTmdbMovies } from "../hooks/useTmdbMovies"
import { DiscoverMovieFilters } from "../services/tmdb"

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 50 }, (_, index) => currentYear - index)

export default function Movies() {
  const [page, setPage] = useState(1)
  const [genreId, setGenreId] = useState(0)
  const [year, setYear] = useState(0)
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState<DiscoverMovieFilters["sortBy"]>("popularity.desc")

  const filters = useMemo(() => ({
    genreId: genreId || undefined,
    year: year || undefined,
    minRating: minRating || undefined,
    sortBy,
  }), [genreId, year, minRating, sortBy])

  const { movies, genres, totalPages, totalResults, loading, error, retry } = useTmdbMovies(page, filters)
  const hasFilters = genreId !== 0 || year !== 0 || minRating !== 0 || sortBy !== "popularity.desc"

  useEffect(() => { setPage(1) }, [genreId, year, minRating, sortBy])
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }) }, [page])

  const resetFilters = () => {
    setGenreId(0)
    setYear(0)
    setMinRating(0)
    setSortBy("popularity.desc")
  }

  const selectClass = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900"

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">TMDB</p>
        <h1 className="mt-1 text-4xl font-black">Catalogue de films</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Explore les films et affine le catalogue avec les filtres.</p>
      </div>

      <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black">Filtrer les films</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Genre, année, note minimale et ordre d'affichage.</p>
          </div>
          {hasFilters && <button type="button" onClick={resetFilters} className="shrink-0 text-sm font-bold text-blue-600 hover:underline dark:text-blue-400">Réinitialiser</button>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-bold">Genre
            <select value={genreId} onChange={e => setGenreId(Number(e.target.value))} className={`${selectClass} mt-2`}>
              <option value={0}>Tous les genres</option>
              {genres.map(genre => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
            </select>
          </label>

          <label className="text-sm font-bold">Année
            <select value={year} onChange={e => setYear(Number(e.target.value))} className={`${selectClass} mt-2`}>
              <option value={0}>Toutes les années</option>
              {years.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>

          <label className="text-sm font-bold">Note minimale
            <select value={minRating} onChange={e => setMinRating(Number(e.target.value))} className={`${selectClass} mt-2`}>
              <option value={0}>Toutes les notes</option>
              <option value={5}>5/10 et +</option>
              <option value={6}>6/10 et +</option>
              <option value={7}>7/10 et +</option>
              <option value={8}>8/10 et +</option>
            </select>
          </label>

          <label className="text-sm font-bold">Trier par
            <select value={sortBy} onChange={e => setSortBy(e.target.value as DiscoverMovieFilters["sortBy"])} className={`${selectClass} mt-2`}>
              <option value="popularity.desc">Popularité</option>
              <option value="vote_average.desc">Mieux notés</option>
              <option value="primary_release_date.desc">Plus récents</option>
              <option value="title.asc">Titre A → Z</option>
            </select>
          </label>
        </div>
      </section>

      {!loading && !error && <p className="mb-5 text-sm font-semibold text-gray-500 dark:text-gray-400">{totalResults.toLocaleString("fr-FR")} film{totalResults > 1 ? "s" : ""} trouvé{totalResults > 1 ? "s" : ""}</p>}

      {loading && <div className="py-20 text-center text-lg font-semibold">Chargement des films...</div>}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
          <h2 className="text-xl font-black">Impossible de charger les films.</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{error}</p>
          <button onClick={retry} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500">Réessayer</button>
        </div>
      )}

      {!loading && !error && movies.length === 0 && (
        <div className="rounded-2xl border border-gray-200 p-10 text-center dark:border-gray-800">
          <h2 className="text-xl font-black">Aucun film ne correspond à ces filtres.</h2>
          <button type="button" onClick={resetFilters} className="mt-4 font-bold text-blue-600 hover:underline dark:text-blue-400">Réinitialiser les filtres</button>
        </div>
      )}

      {!loading && !error && movies.length > 0 && (
        <>
          <div className="cine-movie-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700">Page précédente</button>
            <span className="text-sm font-semibold">Page {page} sur {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700">Page suivante</button>
          </div>
        </>
      )}
    </main>
  )
}
