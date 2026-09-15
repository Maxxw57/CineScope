import { Link, useParams } from "react-router-dom"
import MovieCard from "../components/MovieCard"
import { useTmdbActor } from "../hooks/useTmdbActor"

function formatDate(value?: string) {
  if (!value) return "Inconnue"
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`))
}

export default function ActorDetail() {
  const { id } = useParams()
  const actorId = id ? Number(id) : null
  const { actor, loading, error, retry } = useTmdbActor(actorId)

  if (loading) return <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><div className="grid animate-pulse gap-8 md:grid-cols-[280px_1fr]"><div className="aspect-[2/3] rounded-3xl bg-gray-200 dark:bg-gray-800"/><div className="space-y-5 py-5"><div className="h-12 w-2/3 rounded bg-gray-200 dark:bg-gray-800"/><div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-gray-800"/><div className="h-40 rounded bg-gray-200 dark:bg-gray-800"/></div></div></main>

  if (!actor || error) return <main className="mx-auto max-w-4xl px-4 py-20 text-center"><p className="text-5xl">🎭</p><h1 className="mt-4 text-3xl font-black">Impossible de charger cet acteur.</h1><p className="mt-2 text-gray-500">La fiche demandée est indisponible pour le moment.</p><div className="mt-6 flex justify-center gap-3"><button onClick={retry} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Réessayer</button><Link to="/films" className="rounded-xl border border-gray-300 px-5 py-3 font-bold dark:border-gray-700">Voir les films</Link></div></main>

  return <main className="pb-16">
    <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50 via-white to-white dark:border-gray-800 dark:from-blue-950/30 dark:via-gray-950 dark:to-gray-950">
      <div className="mx-auto max-w-6xl px-4 pt-7 sm:px-6"><Link to="/films" className="text-sm font-bold text-gray-500 hover:text-blue-600">← Retour aux films</Link></div>
      <div className="mx-auto grid max-w-6xl gap-9 px-4 py-10 sm:px-6 md:grid-cols-[280px_1fr] md:py-14">
        {actor.profile ? <img src={actor.profile} alt={`Portrait de ${actor.name}`} className="aspect-[2/3] w-full max-w-[280px] rounded-3xl object-cover shadow-2xl"/> : <div className="grid aspect-[2/3] max-w-[280px] place-items-center rounded-3xl bg-gray-200 text-6xl dark:bg-gray-800">👤</div>}
        <div className="self-center"><p className="text-sm font-black uppercase tracking-[.2em] text-blue-600 dark:text-blue-400">{actor.knownForDepartment || "Cinéma"}</p><h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">{actor.name}</h1><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/70"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Naissance</p><p className="mt-1 font-bold">{formatDate(actor.birthday)}</p></div><div className="rounded-2xl border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/70"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Lieu de naissance</p><p className="mt-1 font-bold">{actor.placeOfBirth || "Inconnu"}</p></div></div>{actor.deathday && <p className="mt-3 text-sm text-gray-500">Décès : {formatDate(actor.deathday)}</p>}</div>
      </div>
    </section>
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6">
      <section><p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">À propos</p><h2 className="mt-1 text-3xl font-black">Biographie</h2><p className="mt-5 max-w-4xl whitespace-pre-line text-base leading-8 text-gray-600 dark:text-gray-300">{actor.biography}</p></section>
      {actor.movies.length > 0 && <section><p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Filmographie</p><h2 className="mt-1 text-3xl font-black">Films connus</h2><p className="mt-2 text-gray-500 dark:text-gray-400">Découvrez les films les plus populaires avec {actor.name}.</p><div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">{actor.movies.map(movie => <MovieCard key={movie.id} movie={movie}/>)}</div></section>}
    </div>
  </main>
}
