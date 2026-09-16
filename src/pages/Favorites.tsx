import { useMemo, useState } from "react"
import MovieCard from "../components/MovieCard"
import { useApp } from "../context/AppContext"

type SortOption = "rating" | "year" | "title"

export default function Favorites() {
  const { favorites } = useApp()
  const [query, setQuery] = useState("")
  const [genre, setGenre] = useState("all")
  const [sortBy, setSortBy] = useState<SortOption>("rating")

  const genres = useMemo(
    () =>
      Array.from(
        new Set(
          favorites
            .flatMap(movie => movie.genres?.length ? movie.genres : [movie.genre])
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, "fr")),
    [favorites]
  )

  const filteredFavorites = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr")

    return favorites
      .filter(movie => {
        const movieGenres = movie.genres?.length ? movie.genres : [movie.genre]
        const matchesSearch =
          normalizedQuery.length === 0 ||
          movie.title.toLocaleLowerCase("fr").includes(normalizedQuery)
        const matchesGenre = genre === "all" || movieGenres.includes(genre)
        return matchesSearch && matchesGenre
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title, "fr")
        if (sortBy === "year") return b.year - a.year
        return b.rating - a.rating
      })
  }, [favorites, genre, query, sortBy])

  const averageRating = useMemo(() => {
    if (favorites.length === 0) return 0
    return favorites.reduce((sum, movie) => sum + movie.rating, 0) / favorites.length
  }, [favorites])

  const resetFilters = () => {
    setQuery("")
    setGenre("all")
    setSortBy("rating")
  }

  const hasFilters = query.trim() !== "" || genre !== "all" || sortBy !== "rating"

  return (
    <main className="page-enter mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="cine-premium-header mb-8 p-7 sm:p-10">
        <div className="relative z-10 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-pink-100">
            Ma collection
          </p>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">Mes favoris</h1>
          <p className="mt-3 max-w-2xl text-pink-50/90">
            Retrouve les films que tu aimes, recherche-les et organise ta sélection en quelques secondes.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-16 text-[220px] font-black leading-none text-white/10">
          ♥
        </div>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Films favoris</p>
          <p className="mt-1 text-3xl font-black">{favorites.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Genres représentés</p>
          <p className="mt-1 text-3xl font-black">{genres.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Note TMDB moyenne</p>
          <p className="mt-1 text-3xl font-black">
            {favorites.length > 0 ? averageRating.toFixed(1) : "—"}
            {favorites.length > 0 && <span className="text-base text-yellow-500"> ★</span>}
          </p>
        </div>
      </section>

      {favorites.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900/50">
          <div className="text-5xl">♡</div>
          <h2 className="mt-4 text-2xl font-black">Aucun favori pour le moment</h2>
          <p className="mx-auto mt-2 max-w-lg text-gray-500 dark:text-gray-400">
            Ajoute des films à tes favoris depuis le catalogue ou une fiche film. Ils apparaîtront automatiquement ici.
          </p>
        </section>
      ) : (
        <>
          <section className="mb-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_220px_220px_auto] md:items-end">
              <label className="text-sm font-bold">
                Rechercher
                <div className="relative mt-2">
                  <input
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Rechercher un film..."
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-gray-700 dark:bg-gray-950"
                  />
                </div>
              </label>

              <label className="text-sm font-bold">
                Genre
                <select
                  value={genre}
                  onChange={event => setGenre(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-gray-700 dark:bg-gray-950"
                >
                  <option value="all">Tous les genres</option>
                  {genres.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-bold">
                Trier par
                <select
                  value={sortBy}
                  onChange={event => setSortBy(event.target.value as SortOption)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-gray-700 dark:bg-gray-950"
                >
                  <option value="rating">Mieux notés</option>
                  <option value="year">Plus récents</option>
                  <option value="title">Titre A → Z</option>
                </select>
              </label>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-bold transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </section>

          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {filteredFavorites.length} film{filteredFavorites.length > 1 ? "s" : ""} affiché{filteredFavorites.length > 1 ? "s" : ""}
            </p>
          </div>

          {filteredFavorites.length === 0 ? (
            <section className="rounded-2xl border border-gray-200 p-10 text-center dark:border-gray-800">
              <h2 className="text-xl font-black">Aucun favori ne correspond à ta recherche.</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 font-bold text-pink-600 hover:underline dark:text-pink-400"
              >
                Réinitialiser les filtres
              </button>
            </section>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {filteredFavorites.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
