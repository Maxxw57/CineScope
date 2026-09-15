import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useApp } from "../context/AppContext"
import { useRandomMovie, type RandomMode } from "../hooks/useRandomMovie"

const modes: { id: RandomMode; icon: string; title: string; text: string }[] = [
  { id: "surprise", icon: "✨", title: "Surprends-moi", text: "Une découverte sans prise de tête" },
  { id: "tastes", icon: "❤️", title: "Selon mes goûts", text: "Inspiré de ta bibliothèque" },
  { id: "library", icon: "📚", title: "Ma bibliothèque", text: "Choisis parmi tes films enregistrés" },
  { id: "short", icon: "⚡", title: "Film court", text: "100 minutes maximum" },
  { id: "top", icon: "🏆", title: "Très bien noté", text: "Au moins 7,5 / 10 sur TMDB" },
]

function formatDuration(minutes?: number) {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours ? `${hours} h ${rest ? String(rest).padStart(2, "0") : ""}`.trim() : `${rest} min`
}

export default function RandomMovie() {
  const { favorites, library, addFavorite, removeFavorite, addToLibrary, removeFromLibrary } = useApp()
  const { movie, loading, error, draw, preferredGenres, hasLibrary, mode, setMode, filters, setFilters, genres, updateGenre, resetFilters } = useRandomMovie()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [trailerOpen, setTrailerOpen] = useState(false)

  const activeFilters = useMemo(() => {
    const items: string[] = []
    if (filters.genreName) items.push(filters.genreName)
    if (filters.maxDuration) items.push(`≤ ${formatDuration(filters.maxDuration)}`)
    if (filters.minRating) items.push(`★ ${filters.minRating}+`)
    return items
  }, [filters])

  const compatibility = useMemo(() => {
    if (!movie || mode !== "tastes" || preferredGenres.length === 0) return null
    const movieGenres = movie.genres?.length ? movie.genres : movie.genre.split(",").map(g => g.trim())
    const matches = preferredGenres.filter(pref => movieGenres.some(g => g.toLowerCase() === pref.toLowerCase())).length
    // Score transparent : 55 % de base + jusqu'à 40 % selon le recoupement de genres + 5 % si TMDB >= 7.
    return Math.min(99, Math.round(55 + (matches / preferredGenres.length) * 40 + (movie.rating >= 7 ? 5 : 0)))
  }, [movie, mode, preferredGenres])

  const isFavorite = movie ? favorites.some(item => item.id === movie.id) : false
  const isInLibrary = movie ? library.some(item => item.id === movie.id) : false
  const duration = formatDuration(movie?.duration)

  const handleDraw = async () => {
    setTrailerOpen(false)
    await draw()
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-blue-400/20 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-7 text-white shadow-2xl sm:p-10">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-300">Que regarder ce soir ?</p>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">🎲 Film aléatoire</h1>
          <p className="mt-4 max-w-2xl text-base font-medium text-slate-300">Choisis ton humeur, affine si tu veux, et laisse CineScope trouver le film.</p>
          {preferredGenres.length > 0 && <div className="mt-5 flex flex-wrap items-center gap-2"><span className="text-sm font-bold text-slate-400">Tes goûts :</span>{preferredGenres.map(g => <span key={g} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-bold backdrop-blur">{g}</span>)}</div>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-black">1. Choisis un mode</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {modes.map(item => <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl ${mode === item.id ? "border-blue-400 bg-gradient-to-br from-blue-600/15 to-violet-600/10 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10" : "border-gray-200 bg-white hover:border-blue-400/60 dark:border-gray-800 dark:bg-gray-900"}`}><span className={`block text-3xl transition duration-300 group-hover:scale-110 ${mode === item.id ? "scale-110" : ""}`}>{item.icon}</span><span className="mt-3 block font-black">{item.title}</span><span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">{item.text}</span>{mode === item.id && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,.9)]" />}</button>)}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-black">2. Affine le tirage <span className="text-sm font-medium text-gray-400">(optionnel)</span></h2><div className="mt-2 flex flex-wrap gap-2">{activeFilters.length ? activeFilters.map(item => <span key={item} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{item}</span>) : <span className="text-sm text-gray-500">Aucun filtre actif</span>}</div></div>
          <div className="flex gap-3"><button type="button" onClick={resetFilters} className="text-sm font-bold text-gray-500 hover:text-blue-600">Réinitialiser</button><button type="button" onClick={() => setFiltersOpen(v => !v)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-black transition hover:border-blue-400 dark:border-gray-700">🎛️ {filtersOpen ? "Masquer" : "Filtres avancés"}</button></div>
        </div>
        {filtersOpen && <div className="mt-5 grid gap-4 border-t border-gray-200 pt-5 md:grid-cols-3 dark:border-gray-800">
          <label className="text-sm font-bold">Genre<select value={filters.genreId ?? ""} onChange={e => updateGenre(e.target.value ? Number(e.target.value) : undefined)} className="mt-2 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 dark:border-gray-700"><option value="">Tous les genres</option>{genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
          <label className="text-sm font-bold">Durée maximum<select value={filters.maxDuration ?? ""} onChange={e => setFilters(f => ({ ...f, maxDuration: e.target.value ? Number(e.target.value) : undefined }))} className="mt-2 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 dark:border-gray-700"><option value="">Peu importe</option><option value="90">1 h 30</option><option value="105">1 h 45</option><option value="120">2 h</option><option value="150">2 h 30</option></select></label>
          <label className="text-sm font-bold">Note TMDB minimum<select value={filters.minRating ?? ""} onChange={e => setFilters(f => ({ ...f, minRating: e.target.value ? Number(e.target.value) : undefined }))} className="mt-2 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 dark:border-gray-700"><option value="">Peu importe</option><option value="6">6 / 10</option><option value="7">7 / 10</option><option value="7.5">7,5 / 10</option><option value="8">8 / 10</option></select></label>
        </div>}
      </section>

      <div className="my-8 text-center"><button type="button" onClick={handleDraw} disabled={loading} className={`rounded-2xl bg-blue-600 px-9 py-4 text-lg font-black text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:opacity-70 ${loading ? "animate-pulse" : ""}`}>{loading ? "🎲 Mélange en cours..." : "🎲 Trouve mon film"}</button></div>

      {error && !loading && mode === "library" && !hasLibrary && <section className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900 dark:bg-amber-950/30"><div className="text-4xl">📚</div><h2 className="mt-3 text-xl font-black">Ta bibliothèque est vide</h2><p className="mt-2 text-gray-600 dark:text-gray-300">Ajoute quelques films à ta bibliothèque avant d’utiliser le mode « Ma bibliothèque ».</p><Link to="/films" className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-500">Découvrir des films</Link></section>}

      {error && !loading && !(mode === "library" && !hasLibrary) && <section className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30"><h2 className="text-xl font-black">Aucun résultat pour ce tirage</h2><p className="mt-2 text-gray-600 dark:text-gray-300">{error}</p><button type="button" onClick={resetFilters} className="mt-4 font-bold text-blue-600 hover:underline dark:text-blue-400">Retirer les filtres</button></section>}

      {!loading && !error && movie && <section key={`${mode}-${movie.id}`} className="animate-[fadeIn_.45s_ease-out] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-2xl">
        <div className="relative isolate overflow-hidden">
          {(movie.backdrop || movie.poster) && <img src={movie.backdrop || movie.poster} alt="" className="absolute inset-0 -z-20 h-full w-full scale-105 object-cover opacity-35 blur-[2px]" />}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/65" />
          <div className="grid gap-7 p-6 md:grid-cols-[260px_1fr] md:p-8 lg:gap-10 lg:p-10">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">{movie.poster ? <img src={movie.poster} alt={`Affiche de ${movie.title}`} className="aspect-[2/3] h-full w-full object-cover" /> : <div className="grid aspect-[2/3] place-items-center text-slate-400">Affiche indisponible</div>}</div>
            <div className="flex min-w-0 flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-300"><span>{mode === "library" ? "Depuis ta bibliothèque" : mode === "tastes" ? "Selon tes goûts" : "La sélection CineScope"}</span>{compatibility !== null && <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-300">{compatibility}% compatible</span>}</div>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl lg:text-5xl">{movie.title}</h2>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-slate-300"><span>{movie.year || "Année inconnue"}</span>{duration && <span>{duration}</span>}<span className="rounded-full bg-yellow-400/10 px-3 py-1 text-yellow-300">★ {movie.rating}/10</span>{movie.voteCount ? <span>{movie.voteCount.toLocaleString("fr-FR")} votes</span> : null}</div>
              <div className="mt-4 flex flex-wrap gap-2">{(movie.genres?.length ? movie.genres : movie.genre.split(",")).slice(0, 5).map(g => <span key={g} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur">{g.trim()}</span>)}</div>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{movie.synopsis}</p>
              {mode === "tastes" && preferredGenres.length > 0 && <div className="mt-5 rounded-2xl border border-pink-400/15 bg-pink-400/5 p-4"><p className="text-sm font-black text-pink-200">❤️ Pourquoi ce film ?</p><p className="mt-1 text-sm text-slate-300">Parce que ta bibliothèque montre un intérêt pour <strong className="text-white">{preferredGenres.join(" · ")}</strong>.</p></div>}
              <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => isFavorite ? removeFavorite(movie.id) : addFavorite(movie)} className={`rounded-xl px-4 py-3 text-sm font-black transition ${isFavorite ? "bg-pink-500/20 text-pink-200 ring-1 ring-pink-400/30" : "bg-white/10 hover:bg-white/15"}`}>{isFavorite ? "♥ Favori" : "♡ Favori"}</button><button type="button" onClick={() => isInLibrary ? removeFromLibrary(movie.id) : addToLibrary(movie)} className={`rounded-xl px-4 py-3 text-sm font-black transition ${isInLibrary ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30" : "bg-white/10 hover:bg-white/15"}`}>{isInLibrary ? "✓ Ma liste" : "+ Ma liste"}</button>{movie.trailer && <button type="button" onClick={() => setTrailerOpen(true)} className="rounded-xl bg-white/10 px-4 py-3 text-sm font-black transition hover:bg-white/15">▶ Bande-annonce</button>}</div>
              <div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={handleDraw} className="rounded-xl bg-blue-600 px-6 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-500">🎲 Un autre film</button><Link to={`/films/${movie.id}`} className="rounded-xl border border-white/20 px-6 py-3 text-center font-black transition hover:bg-white/10">Voir la fiche →</Link></div>
            </div>
          </div>
        </div>
      </section>}

      {trailerOpen && movie?.trailer && <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setTrailerOpen(false)}><div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between p-4"><div><p className="text-xs font-black uppercase tracking-widest text-blue-400">Bande-annonce</p><h3 className="font-black text-white">{movie.title}</h3></div><button type="button" onClick={() => setTrailerOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20" aria-label="Fermer">×</button></div><div className="aspect-video bg-black"><iframe src={movie.trailer} title={`Bande-annonce de ${movie.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full" /></div></div></div>}
    </main>
  )
}
