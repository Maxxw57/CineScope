import { useEffect, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import CineModal from "../components/CineModal"
import MovieCard from "../components/MovieCard"
import { useApp } from "../context/AppContext"
import { useTmdbMovie } from "../hooks/useTmdbMovie"
import { useTmdbSimilarMovies } from "../hooks/useTmdbSimilarMovies"

function formatDuration(minutes?: number) {
  if (!minutes) return null

  const h = Math.floor(minutes / 60)
  const m = minutes % 60

  return h
    ? `${h} h ${m.toString().padStart(2, "0")}`
    : `${m} min`
}

export default function MovieDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [trailerOpen, setTrailerOpen] = useState(false)

  // Note sélectionnée avant enregistrement.
  // null = aucune étoile sélectionnée.
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const {
    movies,
    favorites,
    library,
    addFavorite,
    removeFavorite,
    addToLibrary,
    removeFromLibrary,
    isLoggedIn,
    rateMovie,
    removeRating,
    getMovieRating,
    recordMovieView,
    preferences,
  } = useApp()

  const movieId = id ? Number(id) : null
  const isLocal = searchParams.get("source") === "local"

  const localMovie =
    isLocal && movieId !== null
      ? movies.find(item => item.id === movieId) ?? null
      : null

  const tmdb = useTmdbMovie(movieId, !isLocal)
  const similar = useTmdbSimilarMovies(movieId, !isLocal)

  const movie = isLocal ? localMovie : tmdb.movie

  const loading = isLocal
    ? movies.length === 0
    : tmdb.loading

  const error = isLocal
    ? !loading && !localMovie
      ? "not-found"
      : null
    : tmdb.error

  useEffect(() => {
    if (movie && !loading && !error) {
      recordMovieView(
        movie,
        isLocal ? "local" : "tmdb"
      )
    }
  }, [
    movie,
    loading,
    error,
    isLocal,
    recordMovieView,
  ])

  if (loading) {
    return (
      <main className="page-enter mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid animate-pulse gap-8 md:grid-cols-[280px_1fr]">
          <div className="aspect-[2/3] rounded-[2rem] bg-gray-200 dark:bg-gray-800" />

          <div className="space-y-5 py-8">
            <div className="h-12 w-3/4 rounded-xl bg-gray-200 dark:bg-gray-800" />
            <div className="h-6 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </main>
    )
  }

  if (!movie || error) {
    return (
      <main className="page-enter mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-5xl">🎞️</p>

        <h1 className="mt-4 text-3xl font-black">
          {error === "not-found"
            ? "Film introuvable"
            : "Impossible de charger ce film."}
        </h1>

        <div className="mt-6 flex justify-center gap-3">
          {error === "network" && (
            <button
              onClick={tmdb.retry}
              className="cine-button-primary"
            >
              Réessayer
            </button>
          )}

          <Link
            to="/films"
            className="cine-button-secondary"
          >
            Retour aux films
          </Link>
        </div>
      </main>
    )
  }

  const isFavorite = favorites.some(
    item => item.id === movie.id
  )

  const isInLibrary = library.some(
    item => item.id === movie.id
  )

  const duration = formatDuration(movie.duration)

  const openTrailer = () => {
    if (!movie.trailer) return

    if (
      preferences.playback.trailerTarget === "youtube"
    ) {
      const external = movie.trailer
        .replace(
          "youtube.com/embed/",
          "youtube.com/watch?v="
        )
        .split("?")[0]

      window.open(
        external,
        "_blank",
        "noopener,noreferrer"
      )
    } else {
      setTrailerOpen(true)
    }
  }

  const trailerSrc = movie.trailer
    ? `${movie.trailer}${
        movie.trailer.includes("?") ? "&" : "?"
      }enablejsapi=1&autoplay=${
        preferences.playback.autoplayTrailers
          ? 1
          : 0
      }`
    : ""

  const setTrailerVolume = (
    event: React.SyntheticEvent<HTMLIFrameElement>
  ) =>
    event.currentTarget.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: "setVolume",
        args: [
          preferences.playback.volume,
        ],
      }),
      "*"
    )

  const genres = movie.genres?.length
    ? movie.genres
    : movie.genre
        .split(",")
        .map(g => g.trim())
        .filter(Boolean)

  const ratingKey = `${
    isLocal ? "local" : "tmdb"
  }:${movie.id}`

  const personalRating =
    getMovieRating(ratingKey)

  // Si une nouvelle note est sélectionnée,
  // on l'affiche. Sinon on affiche la note enregistrée.
  const displayedRating =
    selectedRating ?? personalRating ?? 0

  const saveRating = () => {
    if (!isLoggedIn) return

    // Aucune étoile sélectionnée = 0/5
    rateMovie(
      ratingKey,
      selectedRating ?? 0
    )

    setSelectedRating(null)
  }

  const deleteRating = () => {
    removeRating(ratingKey)
    setSelectedRating(null)
  }

  return (
    <main className="page-enter pb-16">
      <section className="relative isolate min-h-[620px] overflow-hidden border-b border-white/10 bg-slate-950 text-white">
        {movie.backdrop && (
          <img
            src={movie.backdrop}
            alt=""
            className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
          />
        )}

        {!movie.backdrop && movie.poster && (
          <img
            src={movie.poster}
            alt=""
            className="absolute inset-0 -z-30 h-full w-full scale-125 object-cover blur-xl"
          />
        )}

        <div className="absolute inset-0 -z-20 bg-black/45" />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/20" />

        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

        <div className="mx-auto max-w-7xl px-4 pt-7 sm:px-6">
          <Link
            to="/films"
            className="inline-flex rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm font-bold text-white/80 backdrop-blur-xl hover:text-white"
          >
            ← Retour aux films
          </Link>
        </div>

        <div className="mx-auto grid max-w-7xl items-end gap-10 px-4 pb-12 pt-12 sm:px-6 md:grid-cols-[300px_1fr] md:pb-16 md:pt-20">
          <div className="md:translate-y-10">
            {movie.poster ? (
              <img
                src={movie.poster}
                alt={`Affiche de ${movie.title}`}
                className="mx-auto aspect-[2/3] w-full max-w-[300px] rounded-[2rem] object-cover shadow-2xl ring-1 ring-white/15 md:mx-0"
              />
            ) : (
              <div className="grid aspect-[2/3] max-w-[300px] place-items-center rounded-[2rem] bg-white/10">
                Affiche indisponible
              </div>
            )}
          </div>

          <div className="pb-2">
            <div className="flex flex-wrap gap-2">
              {genres.map(g => (
                <span
                  key={g}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur-xl"
                >
                  {g}
                </span>
              ))}
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              {movie.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-white/75">
              <span>
                {movie.year ||
                  "Date inconnue"}
              </span>

              {duration && (
                <>
                  <span>•</span>
                  <span>{duration}</span>
                </>
              )}

              <span>•</span>

              <span className="rounded-lg bg-yellow-400/15 px-2.5 py-1 text-yellow-300">
                ★ {movie.rating}/10
              </span>

              {movie.voteCount !==
                undefined && (
                <span className="font-medium text-white/50">
                  {movie.voteCount.toLocaleString(
                    "fr-FR"
                  )}{" "}
                  votes
                </span>
              )}
            </div>

            <p className="mt-6 max-w-3xl text-base leading-8 text-white/75 sm:text-lg">
              {movie.synopsis}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  isFavorite
                    ? removeFavorite(movie.id)
                    : addFavorite(movie)
                }
                className={
                  isFavorite
                    ? "cine-hero-button bg-pink-500/20 text-pink-200 ring-pink-300/20"
                    : "cine-hero-button bg-blue-600 text-white ring-blue-400/20"
                }
              >
                {isFavorite
                  ? "♥ Dans les favoris"
                  : "♡ Favori"}
              </button>

              <button
                onClick={() =>
                  isInLibrary
                    ? removeFromLibrary(
                        movie.id
                      )
                    : addToLibrary(movie)
                }
                className="cine-hero-button bg-white/10 text-white ring-white/15"
              >
                {isInLibrary
                  ? "✓ Dans ma bibliothèque"
                  : "+ Ma bibliothèque"}
              </button>

              {movie.trailer && (
                <button
                  onClick={openTrailer}
                  className="cine-hero-button bg-white text-slate-950 ring-white/30"
                >
                  ▶ Bande-annonce
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-14 sm:px-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="cine-glass-card">
            <p className="cine-eyebrow">
              Langue originale
            </p>

            <p className="mt-2 text-xl font-black">
              {movie.originalLanguage?.toUpperCase() ||
                "Inconnue"}
            </p>
          </div>

          <div className="cine-glass-card md:col-span-2">
            <p className="cine-eyebrow">
              Pays de production
            </p>

            <p className="mt-2 text-xl font-black">
              {movie.productionCountries?.join(
                ", "
              ) || "Inconnu"}
            </p>
          </div>
        </section>

        {/* NOTE PERSONNELLE */}
        <section className="cine-panel">
          <p className="cine-eyebrow">
            Votre avis
          </p>

          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black">
                Ma note
              </h2>

              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {!isLoggedIn
                  ? "Connectez-vous pour attribuer une note personnelle."
                  : personalRating !== null
                    ? `Vous avez noté ce film ${personalRating}/5.`
                    : "Sélectionnez une étoile ou enregistrez directement pour attribuer 0/5."}
              </p>

              <div className="mt-4 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(
                  star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setSelectedRating(
                          star
                        )
                      }
                      disabled={
                        !isLoggedIn
                      }
                      aria-label={`Noter ${star} sur 5`}
                      className={`text-4xl transition hover:scale-110 disabled:opacity-40 ${
                        star <=
                        displayedRating
                          ? "text-yellow-400"
                          : "text-gray-300 dark:text-gray-700"
                      }`}
                    >
                      ★
                    </button>
                  )
                )}
              </div>

              {isLoggedIn && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={saveRating}
                    className="cine-button-primary"
                  >
                    Enregistrer ma note
                  </button>
                </div>
              )}
            </div>

            {personalRating !== null && (
              <button
                type="button"
                onClick={deleteRating}
                className="cine-button-secondary"
              >
                Supprimer ma note
              </button>
            )}
          </div>
        </section>

        {movie.cast &&
          movie.cast.length > 0 && (
            <section>
              <p className="cine-eyebrow">
                Distribution
              </p>

              <h2 className="mt-1 text-3xl font-black">
                Casting principal
              </h2>

              <div className="cine-horizontal-scroll mt-6">
                {movie.cast.map(
                  (actor, index) => {
                    const d =
                      movie.castDetails?.[
                        index
                      ]

                    const card = (
                      <div className="w-36 shrink-0 text-center">
                        <div className="mx-auto h-36 w-28 overflow-hidden rounded-2xl bg-gray-200 shadow-lg dark:bg-gray-800">
                          {d?.profile ? (
                            <img
                              src={
                                d.profile
                              }
                              alt={actor}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-3xl">
                              👤
                            </div>
                          )}
                        </div>

                        <p className="mt-3 truncate text-sm font-black">
                          {actor}
                        </p>

                        {d?.character && (
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {
                              d.character
                            }
                          </p>
                        )}
                      </div>
                    )

                    return d ? (
                      <Link
                        key={d.id}
                        to={`/acteurs/${d.id}`}
                        className="transition hover:-translate-y-1"
                      >
                        {card}
                      </Link>
                    ) : (
                      <div
                        key={`${actor}-${index}`}
                      >
                        {card}
                      </div>
                    )
                  }
                )}
              </div>
            </section>
          )}

        {!isLocal &&
          (similar.loading ||
            similar.movies.length >
              0) && (
            <section className="rounded-[2rem] bg-gray-100/70 p-6 dark:bg-white/[.035] sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="cine-eyebrow">
                    À découvrir
                  </p>

                  <h2 className="mt-1 text-3xl font-black">
                    Films similaires
                  </h2>
                </div>

                <Link
                  to="/films"
                  className="text-sm font-black text-blue-600 dark:text-blue-400"
                >
                  Voir plus →
                </Link>
              </div>

              {similar.loading ? (
                <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[1, 2, 3, 4].map(
                    i => (
                      <div
                        key={i}
                        className="aspect-[2/3] animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="cine-movie-grid mt-7 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                  {similar.movies.map(
                    m => (
                      <MovieCard
                        key={m.id}
                        movie={m}
                      />
                    )
                  )}
                </div>
              )}
            </section>
          )}
      </div>

      <CineModal
        open={trailerOpen}
        onClose={() =>
          setTrailerOpen(false)
        }
        title={`Bande-annonce — ${movie.title}`}
      >
        <div className="aspect-video bg-black">
          {movie.trailer && (
            <iframe
              src={trailerSrc}
              onLoad={setTrailerVolume}
              title={`Bande-annonce de ${movie.title}`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          )}
        </div>
      </CineModal>
    </main>
  )
}