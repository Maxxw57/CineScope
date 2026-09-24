import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarEpisode, CalendarMovieRelease, getCalendarMovieReleases, getNextSeriesEpisode } from "../services/tmdb"

type CalendarEntry =
  | { type: "movie"; date: string; movie: CalendarMovieRelease }
  | { type: "episode"; date: string; episode: CalendarEpisode }

function readFollowedSeries(): number[] {
  try {
    const value = JSON.parse(localStorage.getItem("followedSeries") ?? "[]")
    return Array.isArray(value) ? value.filter(id => typeof id === "number") : []
  } catch {
    return []
  }
}

function prettyDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`))
}

export default function Calendar() {
  const [movies, setMovies] = useState<CalendarMovieRelease[]>([])
  const [episodes, setEpisodes] = useState<CalendarEpisode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(false)
      try {
        const followed = readFollowedSeries()
        const [movieReleases, episodeResults] = await Promise.all([
          getCalendarMovieReleases(120),
          Promise.all(followed.map(id => getNextSeriesEpisode(id).catch(() => null))),
        ])
        if (!cancelled) {
          setMovies(movieReleases)
          setEpisodes(episodeResults.filter((episode): episode is CalendarEpisode => episode !== null))
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const entries = useMemo<CalendarEntry[]>(() => [
    ...movies.map(movie => ({ type: "movie" as const, date: movie.date, movie })),
    ...episodes.map(episode => ({ type: "episode" as const, date: episode.date, episode })),
  ].sort((a, b) => a.date.localeCompare(b.date)), [movies, episodes])

  const grouped = useMemo(() => {
    const groups = new Map<string, CalendarEntry[]>()
    entries.forEach(entry => groups.set(entry.date, [...(groups.get(entry.date) ?? []), entry]))
    return [...groups.entries()]
  }, [entries])

  return <main className="page-enter mx-auto max-w-7xl px-4 py-12 sm:px-6">
    <section className="mb-10">
      <p className="cine-eyebrow">Agenda CineScope</p>
      <h1 className="mt-2 text-4xl font-black sm:text-5xl">Calendrier cinéma & séries</h1>
      <p className="mt-4 max-w-3xl text-gray-500 dark:text-gray-400">Les prochaines sorties cinéma en France et le prochain épisode annoncé des séries que vous suivez.</p>
    </section>

    <section className="mb-10 grid gap-4 md:grid-cols-2">
      <div className="cine-glass-card"><p className="cine-eyebrow">Cinéma</p><p className="mt-2 text-3xl font-black">{movies.length}</p><p className="mt-1 text-sm text-gray-500">sorties à venir sur les 120 prochains jours</p></div>
      <div className="cine-glass-card"><p className="cine-eyebrow">Séries suivies</p><p className="mt-2 text-3xl font-black">{episodes.length}</p><p className="mt-1 text-sm text-gray-500">prochains épisodes actuellement annoncés</p></div>
    </section>

    {loading && <div className="cine-panel text-center font-bold">Chargement du calendrier...</div>}
    {error && <div className="cine-panel text-center"><p className="text-xl font-black">Impossible de charger le calendrier.</p><p className="mt-2 text-gray-500">Vérifiez votre connexion et la configuration TMDB.</p></div>}

    {!loading && !error && episodes.length === 0 && <div className="cine-panel mb-8"><p className="font-black">Aucun prochain épisode affiché.</p><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sur la fiche d'une série, utilisez « Suivre la série » pour l'ajouter au calendrier. Si TMDB n'a pas encore annoncé son prochain épisode, elle n'apparaîtra pas ici.</p><Link to="/series" className="cine-button-secondary mt-4 inline-flex">Découvrir les séries →</Link></div>}

    {!loading && !error && <div className="space-y-8">
      {grouped.map(([date, dayEntries]) => <section key={date}>
        <div className="mb-4 flex items-center gap-4"><h2 className="text-xl font-black capitalize">{prettyDate(date)}</h2><div className="h-px flex-1 bg-gray-200 dark:bg-white/10"/></div>
        <div className="grid gap-4 md:grid-cols-2">
          {dayEntries.map(entry => entry.type === "movie" ? <Link key={`movie-${entry.movie.id}`} to={`/films/${entry.movie.id}`} className="cine-glass-card flex gap-4 transition hover:-translate-y-1">
            {entry.movie.poster ? <img src={entry.movie.poster} alt="" className="h-28 w-20 rounded-xl object-cover"/> : <div className="h-28 w-20 rounded-xl bg-gray-200 dark:bg-gray-800"/>}
            <div><span className="rounded-full bg-blue-600/10 px-2.5 py-1 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">Sortie cinéma</span><h3 className="mt-3 text-lg font-black">{entry.movie.title}</h3>{entry.movie.rating > 0 && <p className="mt-2 text-sm font-bold text-yellow-500">★ {entry.movie.rating}/10</p>}</div>
          </Link> : <Link key={`episode-${entry.episode.seriesId}`} to={`/series/${entry.episode.seriesId}`} className="cine-glass-card flex gap-4 transition hover:-translate-y-1">
            {entry.episode.seriesPoster ? <img src={entry.episode.seriesPoster} alt="" className="h-28 w-20 rounded-xl object-cover"/> : <div className="h-28 w-20 rounded-xl bg-gray-200 dark:bg-gray-800"/>}
            <div><span className="rounded-full bg-violet-600/10 px-2.5 py-1 text-[10px] font-black uppercase text-violet-600 dark:text-violet-400">Nouvel épisode</span><h3 className="mt-3 text-lg font-black">{entry.episode.seriesTitle}</h3><p className="mt-1 text-sm font-bold">S{String(entry.episode.seasonNumber).padStart(2, "0")} E{String(entry.episode.episodeNumber).padStart(2, "0")} · {entry.episode.episodeName}</p></div>
          </Link>)}
        </div>
      </section>)}
    </div>}
  </main>
}
