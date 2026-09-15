import { Link } from "react-router-dom"
import MovieCard from "../components/MovieCard"
import { useRandomMovie, type RandomMode } from "../hooks/useRandomMovie"

const modes: { id: RandomMode; icon: string; title: string; text: string }[] = [
  { id: "surprise", icon: "✨", title: "Surprends-moi", text: "Une découverte sans prise de tête" },
  { id: "tastes", icon: "❤️", title: "Selon mes goûts", text: "Inspiré de ta bibliothèque" },
  { id: "library", icon: "📚", title: "Ma bibliothèque", text: "Choisis parmi tes films enregistrés" },
  { id: "short", icon: "⚡", title: "Film court", text: "100 minutes maximum" },
  { id: "top", icon: "🏆", title: "Très bien noté", text: "Au moins 7,5 / 10 sur TMDB" },
]

export default function RandomMovie() {
  const { movie, loading, error, draw, preferredGenres, hasLibrary, mode, setMode, filters, setFilters, genres, updateGenre, resetFilters } = useRandomMovie()

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-blue-700 to-cyan-600 p-7 text-white shadow-xl sm:p-10">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-white/75">Que regarder ce soir ?</p>
        <h1 className="mt-2 text-4xl font-black sm:text-5xl">🎲 Film aléatoire V2</h1>
        <p className="mt-4 max-w-2xl text-base font-medium text-white/85">Choisis ton humeur, ajoute quelques critères et laisse CineScope décider à ta place.</p>
        {preferredGenres.length > 0 && <div className="mt-5 flex flex-wrap gap-2"><span className="text-sm font-bold text-white/70">Tes goûts :</span>{preferredGenres.map(g => <span key={g} className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold">{g}</span>)}</div>}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-black">1. Choisis un mode</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {modes.map(item => <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`rounded-2xl border p-4 text-left transition ${mode === item.id ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 dark:bg-blue-950/30" : "border-gray-200 bg-white hover:border-blue-300 dark:border-gray-800 dark:bg-gray-900"}`}><span className="text-2xl">{item.icon}</span><span className="mt-2 block font-black">{item.title}</span><span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{item.text}</span></button>)}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">2. Affine le tirage <span className="text-sm font-medium text-gray-400">(optionnel)</span></h2><p className="mt-1 text-sm text-gray-500">Les filtres se combinent avec le mode choisi.</p></div><button type="button" onClick={resetFilters} className="text-sm font-bold text-blue-600 hover:underline dark:text-blue-400">Réinitialiser</button></div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="text-sm font-bold">Genre<select value={filters.genreId ?? ""} onChange={e => updateGenre(e.target.value ? Number(e.target.value) : undefined)} className="mt-2 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 dark:border-gray-700"><option value="">Tous les genres</option>{genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
          <label className="text-sm font-bold">Durée maximum<select value={filters.maxDuration ?? ""} onChange={e => setFilters(f => ({ ...f, maxDuration: e.target.value ? Number(e.target.value) : undefined }))} className="mt-2 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 dark:border-gray-700"><option value="">Peu importe</option><option value="90">1 h 30</option><option value="105">1 h 45</option><option value="120">2 h</option><option value="150">2 h 30</option></select></label>
          <label className="text-sm font-bold">Note TMDB minimum<select value={filters.minRating ?? ""} onChange={e => setFilters(f => ({ ...f, minRating: e.target.value ? Number(e.target.value) : undefined }))} className="mt-2 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 dark:border-gray-700"><option value="">Peu importe</option><option value="6">6 / 10</option><option value="7">7 / 10</option><option value="7.5">7,5 / 10</option><option value="8">8 / 10</option></select></label>
        </div>
      </section>

      <div className="my-8 text-center"><button type="button" onClick={draw} disabled={loading} className="rounded-2xl bg-blue-600 px-8 py-4 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:opacity-60">{loading ? "🎲 Tirage en cours..." : "🎲 Trouve mon film"}</button></div>

      {error && !loading && mode === "library" && !hasLibrary && <section className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900 dark:bg-amber-950/30"><div className="text-4xl">📚</div><h2 className="mt-3 text-xl font-black">Ta bibliothèque est vide</h2><p className="mt-2 text-gray-600 dark:text-gray-300">Ajoute quelques films à ta bibliothèque avant d’utiliser le mode « Ma bibliothèque ».</p><Link to="/films" className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-500">Découvrir des films</Link></section>}

      {error && !loading && !(mode === "library" && !hasLibrary) && <section className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30"><h2 className="text-xl font-black">Aucun résultat pour ce tirage</h2><p className="mt-2 text-gray-600 dark:text-gray-300">{error}</p><button type="button" onClick={resetFilters} className="mt-4 font-bold text-blue-600 hover:underline dark:text-blue-400">Retirer les filtres</button></section>}

      {!loading && !error && movie && <section className="mx-auto max-w-sm"><div className="mb-5 text-center"><p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{mode === "library" ? "Depuis ta bibliothèque" : mode === "tastes" && preferredGenres.length > 0 ? `Recommandé selon tes goûts : ${preferredGenres.join(" · ")}` : "La sélection CineScope"}</p><h2 className="mt-1 text-2xl font-black">Et si tu regardais celui-ci ?</h2></div><MovieCard movie={movie} /><div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" onClick={draw} className="rounded-xl bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-500">🎲 Un autre film</button><Link to={`/films/${movie.id}`} className="rounded-xl border border-gray-300 px-5 py-3 text-center font-black hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">Voir la fiche</Link></div></section>}
    </main>
  )
}
