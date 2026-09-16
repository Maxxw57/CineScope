import { Link } from "react-router-dom"
import { Series } from "../types/Series"

export default function SeriesCard({ series }: { series: Series }) {
  return <article className="cine-movie-card group">
    <div className="relative aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-800">
      <Link to={`/series/${series.id}`} className="absolute inset-0" aria-label={`Voir ${series.title}`}>
        {series.poster ? <img src={series.poster} alt={`Affiche de ${series.title}`} loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.07]"/> : <div className="grid h-full place-items-center px-4 text-center font-bold text-gray-500">Affiche indisponible</div>}
      </Link>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-80 transition duration-300 group-hover:via-black/35 group-hover:opacity-100"/>
      <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-blue-600/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-xl">Série</span>
      <span className="cine-card-rating absolute right-3 top-3 rounded-full border border-white/15 bg-black/65 px-2.5 py-1 text-xs font-black text-yellow-300 backdrop-blur-xl">★ {series.rating.toFixed(1)}</span>
      <div className="cine-card-content absolute inset-x-0 bottom-0 p-4 text-white">
        <h3 className="cine-card-title line-clamp-2 text-lg font-black leading-tight">{series.title}</h3>
        <p className="cine-card-meta mt-1 text-xs font-semibold text-white/70">{series.year || "—"} · {series.genre}</p>
        <p className="cine-card-synopsis mt-2 line-clamp-2 max-h-0 overflow-hidden text-xs leading-5 text-white/75 opacity-0 transition-all duration-300 group-hover:max-h-12 group-hover:opacity-100">{series.synopsis}</p>
        <div className="cine-card-actions mt-3 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"><Link to={`/series/${series.id}`} className="block rounded-xl bg-blue-600 px-3 py-2 text-center text-xs font-black text-white hover:bg-blue-500">▶ Voir la série</Link></div>
      </div>
    </div>
  </article>
}
