import { useEffect } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { useApp } from "../context/AppContext"
import { useTmdbMovie } from "../hooks/useTmdbMovie"
import { useTmdbSimilarMovies } from "../hooks/useTmdbSimilarMovies"
import MovieCard from "../components/MovieCard"

function formatDuration(minutes?: number) {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours ? `${hours} h ${rest.toString().padStart(2, "0")}` : `${rest} min`
}

export default function MovieDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { movies, favorites, library, addFavorite, removeFavorite, addToLibrary, removeFromLibrary, isLoggedIn, rateMovie, removeRating, getMovieRating, recordMovieView } = useApp()
  const movieId = id ? Number(id) : null
  const isLocal = searchParams.get("source") === "local"
  const localMovie = isLocal && movieId !== null ? movies.find(item => item.id === movieId) ?? null : null

  const tmdb = useTmdbMovie(movieId, !isLocal)
  const similar = useTmdbSimilarMovies(movieId, !isLocal)
  const movie = isLocal ? localMovie : tmdb.movie
  const loading = isLocal ? movies.length === 0 : tmdb.loading
  const error = isLocal ? (!loading && !localMovie ? "not-found" : null) : tmdb.error

  useEffect(() => {
    if (!movie || loading || error) return
    recordMovieView(movie, isLocal ? "local" : "tmdb")
  }, [movie, loading, error, isLocal, recordMovieView])

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="animate-pulse grid gap-8 md:grid-cols-[260px_1fr]">
          <div className="aspect-[2/3] rounded-3xl bg-gray-200 dark:bg-gray-800" />
          <div className="space-y-5 py-6"><div className="h-7 w-28 rounded-full bg-gray-200 dark:bg-gray-800"/><div className="h-12 w-3/4 rounded bg-gray-200 dark:bg-gray-800"/><div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-gray-800"/><div className="h-28 rounded bg-gray-200 dark:bg-gray-800"/></div>
        </div>
      </main>
    )
  }

  if (!movie || error) {
    return <main className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6"><p className="text-5xl">🎞️</p><h1 className="mt-4 text-3xl font-black">{error === "not-found" ? "Film introuvable" : "Impossible de charger ce film."}</h1><p className="mt-2 text-gray-500">{error === "not-found" ? "Le film demandé n'existe pas ou n'est plus disponible." : "Une erreur réseau ou serveur est survenue."}</p><div className="mt-6 flex flex-wrap justify-center gap-3">{error === "network" && <button type="button" onClick={tmdb.retry} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Réessayer</button>}<Link to="/films" className="rounded-xl border border-gray-300 px-5 py-3 font-bold dark:border-gray-700">Retour aux films</Link></div></main>
  }

  const isFavorite = favorites.some(item => item.id === movie.id)
  const isInLibrary = library.some(item => item.id === movie.id)
  const duration = formatDuration(movie.duration)
  const genres = movie.genres?.length ? movie.genres : movie.genre.split(",").map(g => g.trim()).filter(Boolean)
  const ratingKey = `${isLocal ? "local" : "tmdb"}:${movie.id}`
  const personalRating = getMovieRating(ratingKey)

  return (
    <main className="pb-14">
      <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-b from-gray-100 to-white dark:border-gray-800 dark:from-gray-950 dark:to-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Link to="/films" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-blue-600 dark:text-gray-400">← Retour aux films</Link>
        </div>
        <div className="mx-auto grid max-w-6xl gap-9 px-4 pb-12 sm:px-6 md:grid-cols-[280px_1fr] md:pb-16">
          <div>
            {movie.poster ? <img src={movie.poster} alt={`Affiche du film ${movie.title}`} className="mx-auto aspect-[2/3] w-full max-w-[280px] rounded-3xl object-cover shadow-2xl md:mx-0" /> : <div className="grid aspect-[2/3] w-full max-w-[280px] place-items-center rounded-3xl bg-gray-200 px-6 text-center font-bold text-gray-500 dark:bg-gray-800">Affiche indisponible</div>}
          </div>

          <div className="self-center">
            <div className="flex flex-wrap gap-2">{genres.map(genre => <span key={genre} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{genre}</span>)}</div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{movie.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <span>{movie.year || "Date inconnue"}</span><span className="text-gray-300 dark:text-gray-700">•</span>{duration && <><span>{duration}</span><span className="text-gray-300 dark:text-gray-700">•</span></>}<span className="rounded-lg bg-yellow-100 px-2.5 py-1 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">★ {movie.rating}/10</span><span className="font-normal text-gray-500">{movie.voteCount?.toLocaleString("fr-FR") ?? 0} votes</span>
            </div>

            <p className="mt-7 max-w-3xl text-base leading-8 text-gray-700 sm:text-lg dark:text-gray-300">{movie.synopsis}</p>

            <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/70"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Langue originale</p><p className="mt-1 font-bold">{movie.originalLanguage?.toUpperCase() || "Inconnue"}</p></div>
              <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/70"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Pays de production</p><p className="mt-1 font-bold">{movie.productionCountries?.join(", ") || "Inconnu"}</p></div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => isFavorite ? removeFavorite(movie.id) : addFavorite(movie)} className={`rounded-xl px-5 py-3 font-bold transition ${isFavorite ? "bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-950 dark:text-pink-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}>{isFavorite ? "♥ Dans les favoris" : "♡ Ajouter aux favoris"}</button>
              <button type="button" onClick={() => isInLibrary ? removeFromLibrary(movie.id) : addToLibrary(movie)} className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-bold transition hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900">{isInLibrary ? "✓ Dans ma bibliothèque" : "+ Ajouter à ma bibliothèque"}</button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Votre avis</p>
          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black">Ma note</h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {isLoggedIn
                  ? personalRating
                    ? `Vous avez noté ce film ${personalRating}/5.`
                    : "Cliquez sur une étoile pour noter ce film."
                  : "Connectez-vous pour attribuer une note personnelle."}
              </p>
              <div className="mt-4 flex items-center gap-1" aria-label="Notation personnelle sur 5 étoiles">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => rateMovie(ratingKey, star)}
                    disabled={!isLoggedIn}
                    aria-label={`Noter ${star} sur 5`}
                    className={`text-4xl leading-none transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40 ${star <= (personalRating ?? 0) ? "text-yellow-400" : "text-gray-300 dark:text-gray-700"}`}
                  >
                    ★
                  </button>
                ))}
                {personalRating && <span className="ml-3 rounded-lg bg-yellow-100 px-3 py-1.5 font-black text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">{personalRating}/5</span>}
              </div>
            </div>
            {personalRating && (
              <button type="button" onClick={() => removeRating(ratingKey)} className="self-start rounded-xl border border-gray-300 px-4 py-2.5 font-bold text-gray-600 transition hover:border-red-300 hover:text-red-600 dark:border-gray-700 dark:text-gray-300 sm:self-auto">
                Supprimer ma note
              </button>
            )}
          </div>
        </section>
        {movie.cast && movie.cast.length > 0 && <section><div><p className="text-sm font-bold uppercase tracking-widest text-blue-600">Distribution</p><h2 className="mt-1 text-3xl font-black">Casting principal</h2><p className="mt-2 text-gray-500 dark:text-gray-400">Cliquez sur un acteur pour découvrir sa fiche et ses films.</p></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{movie.cast.map((actor, index) => { const details = movie.castDetails?.[index]; const content = <><div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">{details?.profile ? <img src={details.profile} alt={actor} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-lg">👤</div>}</div><div className="min-w-0"><span className="block truncate font-bold">{actor}</span>{details?.character && <span className="mt-0.5 block truncate text-sm text-gray-500 dark:text-gray-400">{details.character}</span>}</div></>; return details ? <Link key={details.id} to={`/acteurs/${details.id}`} className="flex items-center gap-3 rounded-2xl border border-gray-200 p-3 transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:border-gray-800 dark:hover:border-blue-600">{content}</Link> : <div key={`${actor}-${index}`} className="flex items-center gap-3 rounded-2xl border border-gray-200 p-3 dark:border-gray-800">{content}</div> })}</div></section>}

        {movie.trailer && <section><p className="text-sm font-bold uppercase tracking-widest text-blue-600">Vidéo</p><h2 className="mt-1 text-3xl font-black">Bande-annonce</h2><div className="mt-6 aspect-video max-w-4xl overflow-hidden rounded-3xl bg-black shadow-xl"><iframe src={movie.trailer} title={`Bande-annonce de ${movie.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full" /></div></section>}

        {!isLocal && (similar.loading || similar.movies.length > 0) && (
          <section>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">À découvrir</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-3xl font-black">Films similaires</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Si vous avez aimé {movie.title}, ces films pourraient aussi vous plaire.</p>
              </div>
              <Link to="/films" className="text-sm font-bold text-blue-600 hover:underline dark:text-blue-400">Découvrir plus de films →</Link>
            </div>

            {similar.loading ? (
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {[1, 2, 3, 4].map(item => (
                  <div key={item} className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                    <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-800" />
                    <div className="space-y-2 p-4">
                      <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                      <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {similar.movies.map(similarMovie => (
                  <MovieCard key={similarMovie.id} movie={similarMovie} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
