import { Movie } from "./Movie"

export type Actor = {
  id: number
  name: string
  biography: string
  birthday?: string
  deathday?: string
  placeOfBirth?: string
  profile: string
  knownForDepartment?: string
  movies: Movie[]
}
