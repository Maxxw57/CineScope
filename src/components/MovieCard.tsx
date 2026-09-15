import { Link } from "react-router-dom"
import { useApp } from "../context/AppContext"
import { Movie } from "../types/Movie"

export default function MovieCard({ movie, localSource = false }: { movie: Movie; localSource?: boolean }) {
  const { favorites, library, addFavorite, removeFavorite, addToLibrary, removeFromLibrary } = useApp()
  const isFavorite = favorites.some(item => item.id === movie.id)
  const isInLibrary = library.some(item => item.id === movie.id)
  const detailUrl = localSource ? `/films/${movie.id}?source=local` : `/films/${movie.id}`

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Link to={detailUrl} aria-label={`Voir ${movie.title}`}>
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={`Affiche du film ${movie.title}`}
              loading="lazy"
              className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid aspect-[2/3] w-full place-items-center bg-gray-200 px-4 text-center font-semibold text-gray-500 dark:bg-gray-800">
              Affiche indisponible
            </div>
          )}
        </Link>
        <span className="absolute right-2 top-2 rounded-full bg-black/75 px-2.5 py-1 text-xs font-bold text-yellow-300 backdrop-blur">★ {movie.rating}</span>
      </div>

      <div className="p-4">
        <Link to={detailUrl} className="block">
          <h3 className="truncate text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400">{movie.title}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{movie.year} · {movie.genre}</p>
        </Link>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => isFavorite ? removeFavorite(movie.id) : addFavorite(movie)}
            className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${isFavorite ? "bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-950 dark:text-pink-300" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"}`}
            aria-pressed={isFavorite}
          >
            {isFavorite ? "♥ Favori" : "♡ Favori"}
          </button>
          <button
            type="button"
            onClick={() => isInLibrary ? removeFromLibrary(movie.id) : addToLibrary(movie)}
            className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${isInLibrary ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"}`}
            aria-pressed={isInLibrary}
          >
            {isInLibrary ? "✓ Ma liste" : "+ Ma liste"}
          </button>
        </div>
      </div>
    </article>
  )
}
