import type { LibraryStatus } from "../context/AppContext"

export type ThemeMode = "light" | "dark" | "system"
export type MotionLevel = "subtle" | "normal" | "cinematic"
export type CardDensity = "comfortable" | "compact"
export type DurationPreference = "any" | "short" | "medium" | "long"
export type TrailerTarget = "modal" | "youtube"
export type LibraryView = "grid" | "list"
export type LibrarySort = "recent" | "title" | "rating" | "year"

export type CinePreferences = {
  themeMode: ThemeMode
  animations: boolean
  motionLevel: MotionLevel
  cardDensity: CardDensity
  favoriteGenres: string[]
  avoidedGenres: string[]
  minimumTmdbRating: number
  durationPreference: DurationPreference
  languages: string[]
  randomDefaultMode: "surprise" | "tastes" | "library" | "short" | "top"
  randomMinRating: number
  randomMaxDuration?: number
  randomExcludeWatched: boolean
  recommendations: {
    useLibrary: boolean
    useFavorites: boolean
    useRatings: boolean
    useHistory: boolean
    hideWatched: boolean
  }
  notifications: {
    enabled: boolean
    success: boolean
    info: boolean
    error: boolean
    duration: number
  }
  playback: {
    autoplayTrailers: boolean
    volume: number
    trailerTarget: TrailerTarget
  }
  library: {
    defaultStatus: LibraryStatus
    defaultView: LibraryView
    defaultSort: LibrarySort
  }
}

export const defaultPreferences: CinePreferences = {
  themeMode: "system",
  animations: true,
  motionLevel: "normal",
  cardDensity: "comfortable",
  favoriteGenres: [],
  avoidedGenres: [],
  minimumTmdbRating: 6,
  durationPreference: "any",
  languages: ["fr", "en"],
  randomDefaultMode: "tastes",
  randomMinRating: 7,
  randomMaxDuration: 120,
  randomExcludeWatched: true,
  recommendations: { useLibrary: true, useFavorites: true, useRatings: true, useHistory: true, hideWatched: true },
  notifications: { enabled: true, success: true, info: true, error: true, duration: 3000 },
  playback: { autoplayTrailers: false, volume: 80, trailerTarget: "modal" },
  library: { defaultStatus: "watchlist", defaultView: "grid", defaultSort: "recent" },
}
