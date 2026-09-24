import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import CineModal from "../components/CineModal"
import { useApp } from "../context/AppContext"
import {
  CalendarEpisode,
  CalendarMovieRelease,
  CalendarSeriesRelease,
  getCalendarMovieReleases,
  getCalendarSeriesReleases,
  getMovieDetails,
  getNextSeriesEpisode,
} from "../services/tmdb"

type CalendarEntry =
  | { type: "movie"; date: string; movie: CalendarMovieRelease }
  | { type: "series"; date: string; series: CalendarSeriesRelease }
  | { type: "episode"; date: string; episode: CalendarEpisode }

type Filter = "all" | "movies" | "series" | "followed"
type ViewMode = "month" | "list"

function readFollowedSeries(): number[] {
  try {
    const value = JSON.parse(localStorage.getItem("followedSeries") ?? "[]")
    return Array.isArray(value) ? value.filter(id => typeof id === "number") : []
  } catch { return [] }
}

function isoDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function prettyDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`))
}

function entryKey(entry: CalendarEntry) {
  if (entry.type === "movie") return `movie-${entry.movie.id}-${entry.date}`
  if (entry.type === "series") return `series-${entry.series.id}-${entry.date}`
  return `episode-${entry.episode.seriesId}-${entry.episode.seasonNumber}-${entry.episode.episodeNumber}`
}

function entryTitle(entry: CalendarEntry) {
  if (entry.type === "movie") return entry.movie.title
  if (entry.type === "series") return entry.series.title
  return entry.episode.seriesTitle
}

function entryPoster(entry: CalendarEntry) {
  if (entry.type === "movie") return entry.movie.poster
  if (entry.type === "series") return entry.series.poster
  return entry.episode.seriesPoster
}

export default function Calendar() {
  const { addFavorite, addToLibrary, isFavorite, library } = useApp()
  const [movies, setMovies] = useState<CalendarMovieRelease[]>([])
  const [series, setSeries] = useState<CalendarSeriesRelease[]>([])
  const [episodes, setEpisodes] = useState<CalendarEpisode[]>([])
  const [followedIds, setFollowedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [view, setView] = useState<ViewMode>("month")
  const [filter, setFilter] = useState<Filter>("all")
  const [selected, setSelected] = useState<CalendarEntry | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true); setError(false)
      try {
        const followed = readFollowedSeries()
        setFollowedIds(followed)
        const [movieReleases, seriesReleases, episodeResults] = await Promise.all([
          getCalendarMovieReleases(120),
          getCalendarSeriesReleases(120),
          Promise.all(followed.map(id => getNextSeriesEpisode(id).catch(() => null))),
        ])
        if (!cancelled) {
          setMovies(movieReleases)
          setSeries(seriesReleases)
          setEpisodes(episodeResults.filter((episode): episode is CalendarEpisode => episode !== null))
        }
      } catch { if (!cancelled) setError(true) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const entries = useMemo<CalendarEntry[]>(() => [
    ...movies.map(movie => ({ type: "movie" as const, date: movie.date, movie })),
    ...series.map(item => ({ type: "series" as const, date: item.date, series: item })),
    ...episodes.map(episode => ({ type: "episode" as const, date: episode.date, episode })),
  ].sort((a, b) => a.date.localeCompare(b.date)), [movies, series, episodes])

  const filteredEntries = useMemo(() => entries.filter(entry => {
    if (filter === "movies") return entry.type === "movie"
    if (filter === "series") return entry.type === "series" || entry.type === "episode"
    if (filter === "followed") return entry.type === "episode"
    return true
  }), [entries, filter])

  const grouped = useMemo(() => {
    const groups = new Map<string, CalendarEntry[]>()
    filteredEntries.forEach(entry => groups.set(entry.date, [...(groups.get(entry.date) ?? []), entry]))
    return [...groups.entries()]
  }, [filteredEntries])

  const monthCells = useMemo(() => {
    const year = month.getFullYear(), monthIndex = month.getMonth()
    const first = new Date(year, monthIndex, 1)
    const days = new Date(year, monthIndex + 1, 0).getDate()
    const leading = (first.getDay() + 6) % 7
    const cells: Array<Date | null> = Array.from({ length: leading }, () => null)
    for (let day = 1; day <= days; day++) cells.push(new Date(year, monthIndex, day))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [month])

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>()
    filteredEntries.forEach(entry => map.set(entry.date, [...(map.get(entry.date) ?? []), entry]))
    return map
  }, [filteredEntries])

  const toggleFollow = async (seriesId: number) => {
    const current = readFollowedSeries()
    const following = current.includes(seriesId)
    const next = following ? current.filter(id => id !== seriesId) : [...current, seriesId]
    localStorage.setItem("followedSeries", JSON.stringify(next))
    setFollowedIds(next)
    if (following) setEpisodes(currentEpisodes => currentEpisodes.filter(ep => ep.seriesId !== seriesId))
    else {
      const episode = await getNextSeriesEpisode(seriesId).catch(() => null)
      if (episode) setEpisodes(currentEpisodes => [...currentEpisodes.filter(ep => ep.seriesId !== seriesId), episode])
    }
  }

  const addMovieFavorite = async (id: number) => {
    setActionLoading(true)
    try { addFavorite(await getMovieDetails(id)) } finally { setActionLoading(false) }
  }
  const addMovieLibrary = async (id: number) => {
    setActionLoading(true)
    try { addToLibrary(await getMovieDetails(id)) } finally { setActionLoading(false) }
  }

  const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(month)
  const today = isoDate(new Date())
  const selectedSeriesId = selected?.type === "series" ? selected.series.id : selected?.type === "episode" ? selected.episode.seriesId : null
  const selectedMovieId = selected?.type === "movie" ? selected.movie.id : null

  return <main className="page-enter mx-auto max-w-7xl px-4 py-12 sm:px-6">
    <section className="mb-8">
      <p className="cine-eyebrow">Agenda CineScope</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
        <div><h1 className="text-4xl font-black sm:text-5xl">Calendrier cinéma & séries</h1><p className="mt-4 max-w-3xl text-gray-500 dark:text-gray-400">Sorties cinéma, nouvelles séries et prochains épisodes de vos séries suivies.</p></div>
        <div className="flex rounded-2xl border border-gray-200 bg-white/70 p-1 dark:border-white/10 dark:bg-white/5">
          <button onClick={() => setView("month")} className={view === "month" ? "cine-button-primary" : "cine-button-secondary"}>▦ Calendrier</button>
          <button onClick={() => setView("list")} className={view === "list" ? "cine-button-primary" : "cine-button-secondary"}>☰ Liste</button>
        </div>
      </div>
    </section>

    <section className="mb-7 grid gap-4 md:grid-cols-3">
      <div className="cine-glass-card"><p className="cine-eyebrow">Cinéma</p><p className="mt-2 text-3xl font-black">{movies.length}</p><p className="mt-1 text-sm text-gray-500">sorties à venir</p></div>
      <div className="cine-glass-card"><p className="cine-eyebrow">Nouvelles séries</p><p className="mt-2 text-3xl font-black">{series.length}</p><p className="mt-1 text-sm text-gray-500">premières diffusions</p></div>
      <div className="cine-glass-card"><p className="cine-eyebrow">Séries suivies</p><p className="mt-2 text-3xl font-black">{episodes.length}</p><p className="mt-1 text-sm text-gray-500">prochains épisodes annoncés</p></div>
    </section>

    <section className="cine-panel mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        {([['all','Tout'],['movies','🎬 Films'],['series','📺 Séries'],['followed','♥ Mes séries']] as [Filter,string][]).map(([value,label]) => <button key={value} onClick={() => setFilter(value)} className={filter === value ? "cine-button-primary" : "cine-button-secondary"}>{label}</button>)}
      </div>
      {view === "month" && <div className="flex items-center gap-2"><button className="cine-button-secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1))}>←</button><button className="cine-button-secondary" onClick={() => { const d=new Date(); setMonth(new Date(d.getFullYear(),d.getMonth(),1)) }}>Aujourd'hui</button><button className="cine-button-secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1))}>→</button></div>}
    </section>

    {loading && <div className="cine-panel text-center font-bold">Chargement du calendrier...</div>}
    {error && <div className="cine-panel text-center"><p className="text-xl font-black">Impossible de charger le calendrier.</p><p className="mt-2 text-gray-500">Vérifiez votre connexion et la configuration TMDB.</p></div>}

    {!loading && !error && view === "month" && <section className="cine-panel overflow-x-auto">
      <h2 className="mb-6 text-center text-2xl font-black capitalize">{monthLabel}</h2>
      <div className="min-w-[900px]">
        <div className="grid grid-cols-7 gap-2">{["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(day => <div key={day} className="px-2 py-2 text-center text-xs font-black uppercase tracking-wider text-gray-500">{day}</div>)}</div>
        <div className="grid grid-cols-7 gap-2">{monthCells.map((date,index) => {
          if (!date) return <div key={`empty-${index}`} className="min-h-36 rounded-2xl border border-transparent"/>
          const key = isoDate(date), dayEntries = entriesByDate.get(key) ?? [], isToday = key === today
          return <div key={key} className={`min-h-36 rounded-2xl border p-2 ${isToday ? "border-blue-500/60 bg-blue-500/5" : "border-gray-200 bg-white/40 dark:border-white/10 dark:bg-white/[0.03]"}`}>
            <div className={`mb-2 grid h-7 w-7 place-items-center rounded-full text-xs font-black ${isToday ? "bg-blue-600 text-white" : ""}`}>{date.getDate()}</div>
            <div className="space-y-1.5">{dayEntries.slice(0,3).map(entry => <button key={entryKey(entry)} onClick={() => setSelected(entry)} className={`block w-full truncate rounded-lg px-2 py-1.5 text-left text-[11px] font-black ${entry.type === "movie" ? "bg-blue-600/10 text-blue-600 dark:text-blue-300" : entry.type === "series" ? "bg-fuchsia-600/10 text-fuchsia-600 dark:text-fuchsia-300" : "bg-violet-600/10 text-violet-600 dark:text-violet-300"}`}>{entry.type === "movie" ? "🎬 " : entry.type === "series" ? "📺 " : "♥ "}{entryTitle(entry)}</button>)}{dayEntries.length > 3 && <p className="px-2 text-[10px] font-bold text-gray-500">+ {dayEntries.length-3} autre{dayEntries.length-3>1?'s':''}</p>}</div>
          </div>
        })}</div>
      </div>
    </section>}

    {!loading && !error && view === "list" && <div className="space-y-8">
      {grouped.length === 0 && <div className="cine-panel text-center font-bold">Aucun événement pour ce filtre.</div>}
      {grouped.map(([date, dayEntries]) => <section key={date}><div className="mb-4 flex items-center gap-4"><h2 className="text-xl font-black capitalize">{prettyDate(date)}</h2><div className="h-px flex-1 bg-gray-200 dark:bg-white/10"/></div><div className="grid gap-4 md:grid-cols-2">{dayEntries.map(entry => <button key={entryKey(entry)} onClick={() => setSelected(entry)} className="cine-glass-card flex gap-4 text-left transition hover:-translate-y-1">{entryPoster(entry) ? <img src={entryPoster(entry)} alt="" className="h-28 w-20 rounded-xl object-cover"/> : <div className="h-28 w-20 rounded-xl bg-gray-200 dark:bg-gray-800"/>}<div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${entry.type === "movie" ? "bg-blue-600/10 text-blue-600 dark:text-blue-400" : entry.type === "series" ? "bg-fuchsia-600/10 text-fuchsia-600 dark:text-fuchsia-400" : "bg-violet-600/10 text-violet-600 dark:text-violet-400"}`}>{entry.type === "movie" ? "Sortie cinéma" : entry.type === "series" ? "Nouvelle série" : "Nouvel épisode · série suivie"}</span><h3 className="mt-3 text-lg font-black">{entryTitle(entry)}</h3>{entry.type === "episode" && <p className="mt-1 text-sm font-bold">S{String(entry.episode.seasonNumber).padStart(2,"0")} E{String(entry.episode.episodeNumber).padStart(2,"0")} · {entry.episode.episodeName}</p>}{entry.type !== "episode" && (entry.type === "movie" ? entry.movie.rating : entry.series.rating) > 0 && <p className="mt-2 text-sm font-bold text-yellow-500">★ {entry.type === "movie" ? entry.movie.rating : entry.series.rating}/10</p>}</div></button>)}</div></section>)}
    </div>}

    <CineModal open={selected !== null} onClose={() => setSelected(null)} title={selected ? entryTitle(selected) : "Événement"}>
      {selected && <div className="p-6 text-white"><div className="flex gap-5">{entryPoster(selected) && <img src={entryPoster(selected)} alt="" className="h-48 w-32 rounded-2xl object-cover"/>}<div><p className="text-xs font-black uppercase tracking-wider text-blue-300">{selected.type === "movie" ? "Sortie cinéma" : selected.type === "series" ? "Nouvelle série" : "Prochain épisode"}</p><p className="mt-2 text-lg font-black capitalize">{prettyDate(selected.date)}</p>{selected.type === "episode" && <p className="mt-3 text-sm text-white/70">Saison {selected.episode.seasonNumber} · Épisode {selected.episode.episodeNumber}<br/><strong className="text-white">{selected.episode.episodeName}</strong></p>}{selected.type !== "episode" && <p className="mt-3 font-bold text-yellow-300">★ {selected.type === "movie" ? selected.movie.rating : selected.series.rating}/10</p>}</div></div>
        <div className="mt-6 flex flex-wrap gap-3">
          {selected.type === "movie" && <><Link to={`/films/${selected.movie.id}`} className="cine-button-primary">Voir le film →</Link><button disabled={actionLoading || (selectedMovieId !== null && isFavorite(selectedMovieId))} onClick={() => addMovieFavorite(selected.movie.id)} className="cine-button-secondary">{isFavorite(selected.movie.id) ? "✓ Favori" : "♡ Favoris"}</button><button disabled={actionLoading || library.some(item => item.id === selected.movie.id)} onClick={() => addMovieLibrary(selected.movie.id)} className="cine-button-secondary">{library.some(item => item.id === selected.movie.id) ? "✓ Bibliothèque" : "+ Bibliothèque"}</button></>}
          {selected.type !== "movie" && selectedSeriesId !== null && <><Link to={`/series/${selectedSeriesId}`} className="cine-button-primary">Voir la série →</Link><button onClick={() => toggleFollow(selectedSeriesId)} className="cine-button-secondary">{followedIds.includes(selectedSeriesId) ? "✓ Série suivie" : "+ Suivre la série"}</button></>}
        </div>
      </div>}
    </CineModal>
  </main>
}
