import { Movie } from "../types/Movie"
import { Actor } from "../types/Actor"

const API_URL = "https://api.themoviedb.org/3"
const IMAGE_URL = "https://image.tmdb.org/t/p/w500"
const token = import.meta.env.VITE_TMDB_TOKEN as string | undefined

export type MoviePage = {
  movies: Movie[]
  page: number
  totalPages: number
  totalResults: number
}

export type TmdbGenre = { id: number; name: string }
type TmdbMovie = {
  id: number
  title: string
  release_date?: string
  vote_average?: number
  vote_count?: number
  genre_ids?: number[]
  genres?: TmdbGenre[]
  poster_path?: string | null
  overview?: string
  runtime?: number
  original_language?: string
  production_countries?: { name: string }[]
  credits?: { cast?: { id: number; name: string; character?: string; profile_path?: string | null }[] }
  videos?: { results?: { key: string; site: string; type: string }[] }
}

type TmdbPage = {
  results: TmdbMovie[]
  page: number
  total_pages: number
  total_results: number
}

function headers(): HeadersInit {
  if (!token) throw new Error("VITE_TMDB_TOKEN n'est pas configuré dans le fichier .env")
  return { Authorization: `Bearer ${token}`, accept: "application/json" }
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: headers() })
  if (!response.ok) throw new Error(`Erreur TMDB (${response.status})`)
  return response.json() as Promise<T>
}

let genreCache: Map<number, string> | null = null

async function getGenreMap() {
  if (genreCache) return genreCache
  const data = await request<{ genres: TmdbGenre[] }>("/genre/movie/list?language=fr-FR")
  genreCache = new Map(data.genres.map(genre => [genre.id, genre.name]))
  return genreCache
}

function posterUrl(path?: string | null) {
  return path ? `${IMAGE_URL}${path}` : ""
}

function mapMovie(movie: TmdbMovie, genreMap?: Map<number, string>): Movie {
  const genreNames = movie.genres?.map(g => g.name) ?? movie.genre_ids?.map(id => genreMap?.get(id)).filter((g): g is string => Boolean(g)) ?? []
  const trailer = movie.videos?.results?.find(video => video.site === "YouTube" && video.type === "Trailer")

  return {
    id: movie.id,
    title: movie.title,
    year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : 0,
    rating: Number((movie.vote_average ?? 0).toFixed(1)),
    voteCount: movie.vote_count ?? 0,
    duration: movie.runtime,
    genre: genreNames.join(", ") || "Genre inconnu",
    genres: genreNames,
    poster: posterUrl(movie.poster_path),
    synopsis: movie.overview || "Aucune description disponible.",
    cast: movie.credits?.cast?.slice(0, 8).map(actor => actor.name) ?? [],
    castDetails: movie.credits?.cast?.slice(0, 8).map(actor => ({ id: actor.id, name: actor.name, character: actor.character, profile: posterUrl(actor.profile_path) })) ?? [],
    trailer: trailer ? `https://www.youtube.com/embed/${trailer.key}` : undefined,
    originalLanguage: movie.original_language,
    productionCountries: movie.production_countries?.map(country => country.name) ?? [],
  }
}


export async function getMovieGenres(): Promise<TmdbGenre[]> {
  const data = await request<{ genres: TmdbGenre[] }>("/genre/movie/list?language=fr-FR")
  return data.genres
}

export type DiscoverMovieFilters = {
  genreId?: number
  year?: number
  minRating?: number
  sortBy?: "popularity.desc" | "vote_average.desc" | "primary_release_date.desc" | "title.asc"
}

export async function discoverMovies(filters: DiscoverMovieFilters = {}, page = 1): Promise<MoviePage> {
  const params = new URLSearchParams({
    language: "fr-FR",
    include_adult: "false",
    include_video: "false",
    page: String(page),
    sort_by: filters.sortBy ?? "popularity.desc",
  })

  if (filters.genreId) params.set("with_genres", String(filters.genreId))
  if (filters.year) params.set("primary_release_year", String(filters.year))
  if (filters.minRating) {
    params.set("vote_average.gte", String(filters.minRating))
    params.set("vote_count.gte", "50")
  }

  const [data, genres] = await Promise.all([
    request<TmdbPage>(`/discover/movie?${params.toString()}`),
    getGenreMap(),
  ])

  return {
    movies: data.results.map(movie => mapMovie(movie, genres)),
    page: data.page,
    totalPages: Math.min(data.total_pages, 500),
    totalResults: data.total_results,
  }
}

export async function getPersonalizedRecommendations(
  preferredGenres: string[],
  excludedIds: number[] = [],
  page = 1
): Promise<MoviePage> {
  const genres = await getMovieGenres()
  const normalized = preferredGenres.map(name => name.trim().toLowerCase())
  const genreIds = genres
    .filter(genre => normalized.includes(genre.name.toLowerCase()))
    .map(genre => genre.id)
    .slice(0, 4)

  const params = new URLSearchParams({
    language: "fr-FR",
    include_adult: "false",
    include_video: "false",
    page: String(page),
    sort_by: "popularity.desc",
    "vote_count.gte": "100",
    "vote_average.gte": "6",
  })

  // Le séparateur | signifie « l'un de ces genres » dans TMDB.
  if (genreIds.length > 0) {
    params.set("with_genres", genreIds.join("|"))
  }

  const [data, genreMap] = await Promise.all([
    request<TmdbPage>(`/discover/movie?${params.toString()}`),
    getGenreMap(),
  ])

  const excluded = new Set(excludedIds)
  const movies = data.results
    .map(movie => mapMovie(movie, genreMap))
    .filter(movie => !excluded.has(movie.id))
    .sort((a, b) => {
      const aMatches = a.genres?.filter(genre => normalized.includes(genre.toLowerCase())).length ?? 0
      const bMatches = b.genres?.filter(genre => normalized.includes(genre.toLowerCase())).length ?? 0
      return bMatches - aMatches || b.rating - a.rating
    })

  return {
    movies,
    page: data.page,
    totalPages: Math.min(data.total_pages, 500),
    totalResults: data.total_results,
  }
}

export async function getRandomMovie(
  preferredGenres: string[] = [],
  excludedIds: number[] = []
): Promise<Movie | null> {
  const genres = await getMovieGenres()
  const normalized = preferredGenres.map(name => name.trim().toLowerCase())
  const genreIds = genres
    .filter(genre => normalized.includes(genre.name.toLowerCase()))
    .map(genre => genre.id)
    .slice(0, 4)

  // On change de page à chaque tirage pour renouveler réellement les propositions.
  const randomPage = Math.floor(Math.random() * 25) + 1
  const params = new URLSearchParams({
    language: "fr-FR",
    include_adult: "false",
    include_video: "false",
    page: String(randomPage),
    sort_by: "popularity.desc",
    "vote_count.gte": "100",
    "vote_average.gte": "6",
  })

  if (genreIds.length > 0) {
    params.set("with_genres", genreIds.join("|"))
  }

  const [data, genreMap] = await Promise.all([
    request<TmdbPage>(`/discover/movie?${params.toString()}`),
    getGenreMap(),
  ])

  const excluded = new Set(excludedIds)
  const candidates = data.results
    .map(movie => mapMovie(movie, genreMap))
    .filter(movie => !excluded.has(movie.id) && Boolean(movie.poster))

  if (candidates.length === 0) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export async function getPopularMovies(page = 1): Promise<MoviePage> {
  const [data, genres] = await Promise.all([
    request<TmdbPage>(`/movie/popular?language=fr-FR&page=${page}`),
    getGenreMap(),
  ])

  return {
    movies: data.results.map(movie => mapMovie(movie, genres)),
    page: data.page,
    totalPages: Math.min(data.total_pages, 500),
    totalResults: data.total_results,
  }
}

async function getMovieList(path: string, page = 1): Promise<MoviePage> {
  const separator = path.includes("?") ? "&" : "?"
  const [data, genres] = await Promise.all([
    request<TmdbPage>(`${path}${separator}language=fr-FR&page=${page}`),
    getGenreMap(),
  ])

  return {
    movies: data.results.map(movie => mapMovie(movie, genres)),
    page: data.page,
    totalPages: Math.min(data.total_pages, 500),
    totalResults: data.total_results,
  }
}

export function getTopRatedMovies(page = 1): Promise<MoviePage> {
  return getMovieList("/movie/top_rated", page)
}

export function getUpcomingMovies(page = 1): Promise<MoviePage> {
  return getMovieList("/movie/upcoming", page)
}

export async function searchMovies(query: string, page = 1): Promise<MoviePage> {
  const [data, genres] = await Promise.all([
    request<TmdbPage>(`/search/movie?language=fr-FR&include_adult=false&query=${encodeURIComponent(query)}&page=${page}`),
    getGenreMap(),
  ])

  return {
    movies: data.results.map(movie => mapMovie(movie, genres)),
    page: data.page,
    totalPages: Math.min(data.total_pages, 500),
    totalResults: data.total_results,
  }
}

export async function getMovieDetails(id: number): Promise<Movie> {
  const movie = await request<TmdbMovie>(`/movie/${id}?language=fr-FR&append_to_response=credits,videos`)
  return mapMovie(movie)
}

export async function getSimilarMovies(id: number, page = 1): Promise<MoviePage> {
  return getMovieList(`/movie/${id}/similar`, page)
}


type TmdbPerson = {
  id: number
  name: string
  biography?: string
  birthday?: string | null
  deathday?: string | null
  place_of_birth?: string | null
  profile_path?: string | null
  known_for_department?: string
  movie_credits?: { cast?: TmdbMovie[] }
}

export async function getActorDetails(id: number): Promise<Actor> {
  const [person, genres] = await Promise.all([
    request<TmdbPerson>(`/person/${id}?language=fr-FR&append_to_response=movie_credits`),
    getGenreMap(),
  ])

  const movies = (person.movie_credits?.cast ?? [])
    .filter(movie => Boolean(movie.title))
    .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0))
    .slice(0, 12)
    .map(movie => mapMovie(movie, genres))

  return {
    id: person.id,
    name: person.name,
    biography: person.biography || "Aucune biographie disponible en français.",
    birthday: person.birthday ?? undefined,
    deathday: person.deathday ?? undefined,
    placeOfBirth: person.place_of_birth ?? undefined,
    profile: posterUrl(person.profile_path),
    knownForDepartment: person.known_for_department,
    movies,
  }
}
