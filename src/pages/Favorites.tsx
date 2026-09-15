import { useApp } from "../context/AppContext"
import MovieCard from "../components/MovieCard"

export default function Favorites() {
  const { favorites } = useApp()

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Favoris</h1>

      {favorites.length === 0 && <p>Aucun favori pour le moment.</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {favorites.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}