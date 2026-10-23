import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/** Titre de l'onglet pour chaque page (les pages de détail peuvent le préciser ensuite). */
const TITLES: [RegExp, string][] = [
  [/^\/$/, "Accueil"],
  [/^\/films\/[^/]+$/, "Film"],
  [/^\/films$/, "Films"],
  [/^\/series\/[^/]+$/, "Série"],
  [/^\/series$/, "Séries"],
  [/^\/calendrier$/, "Calendrier des sorties"],
  [/^\/acteurs\/[^/]+$/, "Acteur"],
  [/^\/pour-vous$/, "Pour vous"],
  [/^\/film-aleatoire$/, "Film aléatoire"],
  [/^\/search$/, "Recherche"],
  [/^\/favorites$/, "Favoris"],
  [/^\/library$/, "Ma bibliothèque"],
  [/^\/profile$/, "Mon profil"],
  [/^\/settings$/, "Paramètres"],
  [/^\/login$/, "Connexion"],
  [/^\/register$/, "Créer un compte"],
]

/** Remonte en haut de page et met à jour le titre à chaque changement de page. */
export default function RouteEffects() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
    const match = TITLES.find(([pattern]) => pattern.test(pathname))
    document.title = match ? `${match[1]} · CineScope` : "Page introuvable · CineScope"
  }, [pathname])

  return null
}
