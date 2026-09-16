import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import CineModal from "../components/CineModal"
import SeriesCard from "../components/SeriesCard"
import { getSeasonEpisodes, getSeriesDetails, getSimilarSeries } from "../services/tmdb"
import { Series, SeriesEpisode } from "../types/Series"

export default function SeriesDetail() {
  const { id } = useParams(); const seriesId = Number(id)
  const [series, setSeries] = useState<Series | null>(null); const [similar, setSimilar] = useState<Series[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false)
  const [season, setSeason] = useState<number | null>(null); const [episodes, setEpisodes] = useState<SeriesEpisode[]>([]); const [episodesLoading, setEpisodesLoading] = useState(false); const [trailerOpen, setTrailerOpen] = useState(false)

  useEffect(() => { let cancelled = false; setLoading(true); Promise.all([getSeriesDetails(seriesId), getSimilarSeries(seriesId)]).then(([detail, rec]) => { if (!cancelled) { setSeries(detail); setSimilar(rec.series.slice(0, 4)) } }).catch(() => !cancelled && setError(true)).finally(() => !cancelled && setLoading(false)); return () => { cancelled = true } }, [seriesId])
  const openSeason = async (n: number) => { setSeason(n); setEpisodesLoading(true); try { setEpisodes(await getSeasonEpisodes(seriesId, n)) } finally { setEpisodesLoading(false) } }

  if (loading) return <main className="mx-auto max-w-7xl px-4 py-20 text-center font-bold">Chargement de la série...</main>
  if (error || !series) return <main className="mx-auto max-w-4xl px-4 py-20 text-center"><h1 className="text-3xl font-black">Série introuvable</h1><Link to="/series" className="cine-button-secondary mt-6 inline-flex">Retour aux séries</Link></main>

  return <main className="page-enter pb-16">
    <section className="relative isolate min-h-[600px] overflow-hidden border-b border-white/10 bg-slate-950 text-white">
      {series.backdrop && <img src={series.backdrop} alt="" className="absolute inset-0 -z-30 h-full w-full object-cover"/>}<div className="absolute inset-0 -z-20 bg-black/45"/><div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/20"/>
      <div className="mx-auto max-w-7xl px-4 pt-7 sm:px-6"><Link to="/series" className="inline-flex rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm font-bold">← Retour aux séries</Link></div>
      <div className="mx-auto grid max-w-7xl items-end gap-10 px-4 pb-14 pt-12 sm:px-6 md:grid-cols-[300px_1fr] md:pt-20">
        {series.poster ? <img src={series.poster} alt={`Affiche de ${series.title}`} className="mx-auto aspect-[2/3] w-full max-w-[300px] rounded-[2rem] object-cover shadow-2xl ring-1 ring-white/15"/> : <div/>}
        <div><div className="flex flex-wrap gap-2">{series.genres?.map(g => <span key={g} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold">{g}</span>)}</div><h1 className="mt-5 text-4xl font-black sm:text-6xl">{series.title}</h1><div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-white/75"><span>{series.year || "—"}</span><span>•</span><span className="text-yellow-300">★ {series.rating}/10</span>{series.seasonsCount !== undefined && <><span>•</span><span>{series.seasonsCount} saison{series.seasonsCount > 1 ? "s" : ""}</span></>}{series.episodesCount !== undefined && <><span>•</span><span>{series.episodesCount} épisodes</span></>}</div><p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">{series.synopsis}</p>{series.trailer && <button onClick={() => setTrailerOpen(true)} className="cine-hero-button mt-7 bg-white text-slate-950 ring-white/30">▶ Bande-annonce</button>}</div>
      </div>
    </section>
    <div className="mx-auto max-w-7xl space-y-14 px-4 py-14 sm:px-6">
      <section className="grid gap-4 md:grid-cols-3"><div className="cine-glass-card"><p className="cine-eyebrow">Statut</p><p className="mt-2 text-xl font-black">{series.status || "Inconnu"}</p></div><div className="cine-glass-card"><p className="cine-eyebrow">Langue originale</p><p className="mt-2 text-xl font-black">{series.originalLanguage?.toUpperCase() || "—"}</p></div><div className="cine-glass-card"><p className="cine-eyebrow">Production</p><p className="mt-2 text-xl font-black">{series.productionCountries?.join(", ") || "—"}</p></div></section>
      {series.castDetails && series.castDetails.length > 0 && <section><p className="cine-eyebrow">Distribution</p><h2 className="mt-1 text-3xl font-black">Casting principal</h2><div className="cine-horizontal-scroll mt-6">{series.castDetails.map(a => <Link key={a.id} to={`/acteurs/${a.id}`} className="w-36 shrink-0 text-center"><div className="mx-auto h-36 w-28 overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800">{a.profile ? <img src={a.profile} alt={a.name} className="h-full w-full object-cover"/> : <div className="grid h-full place-items-center text-3xl">👤</div>}</div><p className="mt-3 truncate text-sm font-black">{a.name}</p><p className="truncate text-xs text-gray-500">{a.character}</p></Link>)}</div></section>}
      {series.seasons && series.seasons.length > 0 && <section><p className="cine-eyebrow">Épisodes</p><h2 className="mt-1 text-3xl font-black">Saisons</h2><div className="mt-6 flex flex-wrap gap-2">{series.seasons.map(s => <button key={s.id} onClick={() => openSeason(s.seasonNumber)} className={season === s.seasonNumber ? "cine-button-primary" : "cine-button-secondary"}>Saison {s.seasonNumber} · {s.episodeCount} ép.</button>)}</div>{episodesLoading && <p className="mt-8 font-bold">Chargement des épisodes...</p>}{!episodesLoading && season !== null && <div className="mt-8 grid gap-4 md:grid-cols-2">{episodes.map(e => <article key={e.id} className="cine-glass-card flex gap-4">{e.still && <img src={e.still} alt="" className="h-28 w-44 rounded-xl object-cover"/>}<div><p className="text-xs font-black uppercase text-blue-500">Épisode {e.episodeNumber}</p><h3 className="mt-1 text-lg font-black">{e.name}</h3><p className="mt-2 line-clamp-2 text-sm text-gray-500">{e.overview}</p><p className="mt-2 text-xs font-bold text-gray-500">{e.airDate || "Date inconnue"} · ★ {e.rating}/10{e.runtime ? ` · ${e.runtime} min` : ""}</p></div></article>)}</div>}</section>}
      {similar.length > 0 && <section><p className="cine-eyebrow">À découvrir</p><h2 className="mt-1 text-3xl font-black">Séries similaires</h2><div className="cine-movie-grid mt-7 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">{similar.map(s => <SeriesCard key={s.id} series={s}/>)}</div></section>}
    </div>
    <CineModal open={trailerOpen} onClose={() => setTrailerOpen(false)} title={`Bande-annonce — ${series.title}`}><div className="aspect-video bg-black">{series.trailer && <iframe src={`${series.trailer}?autoplay=1`} title={`Bande-annonce de ${series.title}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full"/>}</div></CineModal>
  </main>
}
