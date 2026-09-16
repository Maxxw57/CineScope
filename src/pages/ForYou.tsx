  import { Link } from "react-router-dom"
import MovieCard from "../components/MovieCard"
import { usePersonalizedRecommendations } from "../hooks/usePersonalizedRecommendations"

export default function ForYou() {
  const {
    sections,
    preferredGenres,
    hasPersonalData,
    loading,
    error,
    retry,
    refresh,
    ignoreMovie,
  } = usePersonalizedRecommendations()
  const heroBackdrop = sections.flatMap(section => section.movies).find(movie => movie.backdrop)?.backdrop

  return (
    <main className="page-enter mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 p-8 text-white shadow-2xl sm:p-10">{heroBackdrop && <><img src={heroBackdrop} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35"/><div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/95 via-blue-950/80 to-indigo-900/45"/></>}
        <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-100">Sélection personnalisée</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Pour vous</h1>
        <p className="mt-4 max-w-3xl text-base text-blue-100 sm:text-lg">
          {hasPersonalData
            ? "Vos suggestions évoluent automatiquement avec votre bibliothèque, vos favoris et les films que vous consultez."
            : "Commencez par découvrir quelques films. Dès que vous en ajoutez à votre bibliothèque ou à vos favoris, CineScope adapte automatiquement ses suggestions."}
        </p>

        {preferredGenres.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {preferredGenres.map(genre => (
              <span key={genre} className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">{genre}</span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="mt-7 rounded-xl bg-white px-5 py-3 font-black text-indigo-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          ↻ Nouvelle sélection
        </button>
      </section>

      {!hasPersonalData && !loading && !error && (
        <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
          <h2 className="text-xl font-black">Construisez vos recommandations</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Pour l'instant, cette sélection sert à découvrir CineScope. Ajoutez simplement les films qui vous intéressent : cette page changera automatiquement selon vos goûts.
          </p>
          <Link to="/films" className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500">
            Explorer le catalogue
          </Link>
        </section>
      )}

      {loading && (
        <section className="mt-10">
          <div className="mb-5 h-8 w-72 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="aspect-[2/3] animate-pulse bg-gray-200 dark:bg-gray-800" />
                <div className="space-y-3 p-4">
                  <div className="h-5 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && error && (
        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
          <h2 className="text-xl font-black">Impossible de créer vos recommandations.</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{error}</p>
          <button type="button" onClick={retry} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500">Réessayer</button>
        </div>
      )}

      {!loading && !error && sections.length === 0 && (
        <div className="mt-10 rounded-2xl border border-gray-200 p-8 text-center dark:border-gray-800">
          <h2 className="text-xl font-black">Pas de suggestion disponible pour le moment.</h2>
          <button type="button" onClick={refresh} className="mt-4 font-bold text-blue-600 hover:underline dark:text-blue-400">Essayer une autre sélection</button>
        </div>
      )}

      {!loading && !error && sections.map(section => (
        <section key={section.id} className="mt-12">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Recommandations CineScope</p>
            <h2 className="mt-1 text-2xl font-black">{section.title}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{section.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {section.movies.map(movie => (
              <div key={movie.id} className="group/recommendation">
                <MovieCard movie={movie} />
                <button
                  type="button"
                  onClick={() => ignoreMovie(movie.id)}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-800 dark:hover:border-red-900 dark:hover:bg-red-950/30"
                >
                  Pas intéressé
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
