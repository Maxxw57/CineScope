import { useCallback, useEffect, useState } from "react"

/** Lit une valeur JSON du localStorage ; renvoie `undefined` si absente ou corrompue. */
export function readStored<T>(key: string): T | undefined {
  const raw = localStorage.getItem(key)
  if (raw === null) return undefined
  try {
    return JSON.parse(raw) as T
  } catch {
    localStorage.removeItem(key)
    return undefined
  }
}

type Options<T> = {
  /** Valide/normalise une valeur lue ; renvoyer `undefined` la rejette. */
  revive?: (value: unknown) => T | undefined
  /** Ancienne clé (non rattachée à un compte) à reprendre si `storageKey` est vide. */
  legacyKey?: string
}

/**
 * État synchronisé avec le localStorage.
 *
 * La lecture se fait pendant le rendu (et non dans un effet) : la valeur
 * sauvegardée n'est donc jamais écrasée par l'état initial vide, y compris avec
 * le double montage de React.StrictMode. Quand `storageKey` change (changement
 * de compte), la nouvelle valeur est relue immédiatement ; `null` = pas de
 * persistance (utilisateur déconnecté).
 */
export function useStoredState<T>(storageKey: string | null, fallback: T, options: Options<T> = {}) {
  const read = (key: string | null): T => {
    if (!key) return fallback
    const revive = options.revive ?? ((value: unknown) => value as T)
    const own = readStored<unknown>(key)
    if (own !== undefined) return revive(own) ?? fallback
    if (options.legacyKey) {
      const legacy = readStored<unknown>(options.legacyKey)
      if (legacy !== undefined) return revive(legacy) ?? fallback
    }
    return fallback
  }

  const [state, setState] = useState(() => ({ key: storageKey, value: read(storageKey) }))

  let current = state
  if (state.key !== storageKey) {
    current = { key: storageKey, value: read(storageKey) }
    setState(current)
  }

  useEffect(() => {
    if (!current.key) return
    localStorage.setItem(current.key, JSON.stringify(current.value))
    // Données reprises de l'ancienne clé globale : elles appartiennent désormais à ce compte.
    if (options.legacyKey) localStorage.removeItem(options.legacyKey)
  }, [current, options.legacyKey])

  const setValue = useCallback((update: T | ((previous: T) => T)) => {
    setState(previous => ({
      key: previous.key,
      value: typeof update === "function" ? (update as (previous: T) => T)(previous.value) : update,
    }))
  }, [])

  return [current.value, setValue] as const
}
