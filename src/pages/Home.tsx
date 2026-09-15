import { Link } from "react-router-dom"
import MovieCard from "../components/MovieCard"
import { useApp } from "../context/AppContext"
import { useTmdbHome } from "../hooks/useTmdbHome"
import { Movie } from "../types/Movie"


function MovieSection({ title, eyebrow, movies }: { title: string; eyebrow: string; movies: Movie[] }) {
  if (!movies.length) return null
  return (
    <section className="mb-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">{title}</h2>
        </div>
        <Link to="/films" className="text-sm font-bold text-blue-600 hover:underline dark:text-blue-400">Voir tout →</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
      </div>
    </section>
  )
}

export default function Home() {
  const { movies: localMovies } = useApp()
  const { popular, topRated, upcoming, loading, error, retry } = useTmdbHome()
  const featured = popular[0]
  const cineScopeSelection = [...localMovies].sort((a, b) => b.rating - a.rating).slice(0, 4)

  return (
    <main>
      {featured ? (
        <section className="relative isolate overflow-hidden border-b border-gray-200 dark:border-gray-800">
          <div className="absolute inset-0 -z-20">
            {featured.poster && <img src={featured.poster} alt="" className="h-full w-full scale-110 object-cover object-center opacity-25 blur-sm dark:opacity-20" />}
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/95 to-white/50 dark:from-gray-950 dark:via-gray-950/95 dark:to-gray-950/60" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_260px] md:py-16 lg:py-20">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">Populaire sur TMDB</span>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{featured.title}</h1>
              <p className="mt-3 font-medium text-gray-600 dark:text-gray-300">{featured.year || "Année inconnue"} · {featured.genre} · ★ {featured.rating}</p>
              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-700 sm:text-lg dark:text-gray-300">{featured.synopsis}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to={`/films/${featured.id}`} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">Voir la fiche</Link>
                <Link to="/search" className="rounded-xl border border-gray-300 bg-white/80 px-5 py-3 font-bold backdrop-blur transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/70 dark:hover:bg-gray-800">Rechercher un film</Link>
              </div>
            </div>
            {featured.poster && <img src={featured.poster} alt={`Affiche de ${featured.title}`} className="hidden aspect-[2/3] w-full rounded-2xl object-cover shadow-2xl md:block" />}
          </div>
        </section>
      ) : (
        <section className="border-b border-gray-200 bg-gradient-to-br from-blue-50 to-white dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">CineScope</p>
            <h1 className="mt-2 text-4xl font-black sm:text-5xl">Découvrez votre prochain film</h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">Explorez des films, trouvez vos favoris et construisez votre bibliothèque personnelle.</p>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {loading && (
          <div className="mb-12 rounded-2xl border border-gray-200 bg-white p-8 text-center font-semibold dark:border-gray-800 dark:bg-gray-900">Chargement des sélections TMDB...</div>
        )}

        {!loading && error && (
          <div className="mb-12 rounded-2xl border border-red-200 bg-red-50 p-7 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="font-bold">{error}</p>
            <button type="button" onClick={retry} className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-500">Réessayer</button>
          </div>
        )}

        {!loading && !error && (
          <>
            <MovieSection eyebrow="Tendances" title="Films populaires" movies={popular.slice(0, 4)} />
            <MovieSection eyebrow="Les incontournables" title="Les mieux notés" movies={topRated} />
            <MovieSection eyebrow="À découvrir bientôt" title="Prochainement" movies={upcoming} />
          </>
        )}

        {cineScopeSelection.length > 0 && (
          <section className="mb-14 rounded-3xl border border-gray-200 bg-gray-50 p-5 sm:p-7 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="mb-5">
              <p className="text-sm font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Sélection CineScope</p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">Les films ajoutés manuellement</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cette sélection conserve les films locaux du projet.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {cineScopeSelection.map(movie => <MovieCard key={movie.id} movie={movie} localSource />)}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
