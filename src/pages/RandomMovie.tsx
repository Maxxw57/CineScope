import { Link } from "react-router-dom"
import MovieCard from "../components/MovieCard"
import { useRandomMovie } from "../hooks/useRandomMovie"

export default function RandomMovie() {
  const { movie, loading, error, draw, preferredGenres, personalized } = useRandomMovie()

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-blue-700 to-cyan-600 p-7 text-white shadow-xl sm:p-10">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-white/75">Je ne sais pas quoi regarder</p>
        <h1 className="mt-2 text-4xl font-black sm:text-5xl">🎲 Film aléatoire</h1>
        <p className="mt-4 max-w-2xl text-base font-medium text-white/85">
          {personalized
            ? "Le tirage privilégie les genres de ta bibliothèque et évite les films qui s’y trouvent déjà."
            : "Ta bibliothèque est vide : CineScope te fait découvrir un film populaire et bien noté. Ajoute des films à ta bibliothèque pour personnaliser les prochains tirages."}
        </p>

        {preferredGenres.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {preferredGenres.map(genre => (
              <span key={genre} className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold backdrop-blur">{genre}</span>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        {loading && (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="text-5xl">🎲</div>
            <p className="mt-4 text-lg font-bold">CineScope choisit ton prochain film...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-900 dark:bg-red-950/30">
            <h2 className="text-xl font-black">Le tirage a échoué</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{error}</p>
            <button type="button" onClick={draw} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500">Réessayer</button>
          </div>
        )}

        {!loading && !error && movie && (
          <div className="mx-auto max-w-sm">
            <div className="mb-5 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Ton tirage</p>
              <h2 className="mt-1 text-2xl font-black">Et si tu regardais celui-ci ?</h2>
            </div>
            <MovieCard movie={movie} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={draw} className="rounded-xl bg-blue-600 px-5 py-3 font-black text-white transition hover:bg-blue-500">🎲 Un autre film</button>
              <Link to={`/films/${movie.id}`} className="rounded-xl border border-gray-300 px-5 py-3 text-center font-black transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">Voir la fiche</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
