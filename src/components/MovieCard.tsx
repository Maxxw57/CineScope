import { Link } from "react-router-dom"
import { useApp } from "../context/AppContext"
import { Movie } from "../types/Movie"

export default function MovieCard({ movie, localSource = false }: { movie: Movie; localSource?: boolean }) {
  const { favorites, library, addFavorite, removeFavorite, addToLibrary, removeFromLibrary } = useApp()
  const isFavorite = favorites.some(item => item.id === movie.id)
  const isInLibrary = library.some(item => item.id === movie.id)
  const detailUrl = localSource ? `/films/${movie.id}?source=local` : `/films/${movie.id}`
  const synopsis = movie.synopsis && movie.synopsis !== "Aucune description disponible." ? movie.synopsis : "Découvrez ce film sur CineScope."

  return <article className="cine-movie-card group">
    <div className="relative aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-800">
      <Link to={detailUrl} className="absolute inset-0" aria-label={`Voir ${movie.title}`}>
        {movie.poster ? <img src={movie.poster} alt={`Affiche du film ${movie.title}`} loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.07]" /> : <div className="grid h-full place-items-center px-4 text-center font-bold text-gray-500">Affiche indisponible</div>}
      </Link>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-80 transition duration-300 group-hover:via-black/35 group-hover:opacity-100" />
      <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/65 px-2.5 py-1 text-xs font-black text-yellow-300 backdrop-blur-xl">★ {movie.rating.toFixed?.(1) ?? movie.rating}</span>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <h3 className="line-clamp-2 text-lg font-black leading-tight drop-shadow">{movie.title}</h3>
        <p className="mt-1 text-xs font-semibold text-white/70">{movie.year || "—"} · {movie.genre || "Genre inconnu"}</p>
        <p className="mt-2 line-clamp-2 max-h-0 overflow-hidden text-xs leading-5 text-white/75 opacity-0 transition-all duration-300 group-hover:max-h-12 group-hover:opacity-100">{synopsis}</p>
        <div className="mt-3 grid translate-y-3 grid-cols-[1fr_auto_auto] gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Link to={detailUrl} className="rounded-xl bg-blue-600 px-3 py-2 text-center text-xs font-black text-white hover:bg-blue-500">▶ Voir</Link>
          <button type="button" onClick={() => isFavorite ? removeFavorite(movie.id) : addFavorite(movie)} className={`cine-card-action ${isFavorite ? "text-pink-300" : ""}`} aria-label="Favori">{isFavorite ? "♥" : "♡"}</button>
          <button type="button" onClick={() => isInLibrary ? removeFromLibrary(movie.id) : addToLibrary(movie)} className={`cine-card-action ${isInLibrary ? "text-emerald-300" : ""}`} aria-label="Bibliothèque">{isInLibrary ? "✓" : "+"}</button>
        </div>
      </div>
    </div>
  </article>
}
