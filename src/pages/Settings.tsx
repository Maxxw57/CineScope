import { useApp } from "../context/AppContext"

export default function Settings() {
  const {
    favorites,
    library,
    removeFavorite,
    removeFromLibrary,
    theme,
    toggleTheme
  } = useApp()

  const clearFavorites = () => {
    favorites.forEach(f => removeFavorite(f.id))
  }

  const clearLibrary = () => {
    library.forEach(l => removeFromLibrary(l.id))
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Paramètres</h1>

      <div className="space-y-6">

        {/* Section Favoris */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-3">Favoris</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-3">
            Nombre de films : {favorites.length}
          </p>
          <button
            onClick={clearFavorites}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-500 text-white"
          >
            Vider les favoris
          </button>
        </div>

        {/* Section Bibliothèque */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-3">Bibliothèque</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-3">
            Nombre de films : {library.length}
          </p>
          <button
            onClick={clearLibrary}
            className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-500 text-white"
          >
            Vider la bibliothèque
          </button>
        </div>

        {/* Section Thème */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-3">Thème</h2>

          <p className="text-gray-600 dark:text-gray-300 mb-3">
            Thème actuel : {theme === "dark" ? "Sombre" : "Clair"}
          </p>

          <button
            onClick={toggleTheme}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 text-white"
          >
            Passer en mode {theme === "dark" ? "clair" : "sombre"}
          </button>
        </div>

      </div>
    </div>
  )
}