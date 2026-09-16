export type SeriesCastMember = {
  id: number
  name: string
  character?: string
  profile: string
}

export type SeriesSeason = {
  id: number
  seasonNumber: number
  name: string
  episodeCount: number
  airDate?: string
  poster: string
  overview?: string
}

export type SeriesEpisode = {
  id: number
  episodeNumber: number
  name: string
  overview: string
  airDate?: string
  rating: number
  runtime?: number
  still: string
}

export type Series = {
  id: number
  title: string
  year: number
  rating: number
  voteCount?: number
  genre: string
  genres?: string[]
  poster: string
  backdrop?: string
  synopsis: string
  originalLanguage?: string
  productionCountries?: string[]
  status?: string
  seasonsCount?: number
  episodesCount?: number
  seasons?: SeriesSeason[]
  cast?: string[]
  castDetails?: SeriesCastMember[]
  trailer?: string
}
