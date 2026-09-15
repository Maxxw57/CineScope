export type MovieCastMember = {
  id: number
  name: string
  character?: string
  profile: string
}

export type Movie = {
  id: number
  title: string
  year: number
  rating: number
  duration?: number
  genre: string
  genres?: string[]
  poster: string
  synopsis: string

  // Casting simple
  cast?: string[]

  // Casting détaillé TMDB pour les pages acteurs
  castDetails?: MovieCastMember[]

  trailer?: string
  voteCount?: number
  originalLanguage?: string
  productionCountries?: string[]
}