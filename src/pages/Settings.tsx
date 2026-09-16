import { ChangeEvent, useMemo } from "react"
import { AccentColor, useApp } from "../context/AppContext"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import type { CinePreferences, ThemeMode } from "../types/Preferences"

const accents: Array<{ value: AccentColor; label: string; swatch: string }> = [
  { value: "blue", label: "Bleu", swatch: "#2563eb" }, { value: "violet", label: "Violet", swatch: "#7c3aed" },
  { value: "red", label: "Rouge cinéma", swatch: "#dc2626" }, { value: "emerald", label: "Émeraude", swatch: "#059669" }, { value: "amber", label: "Or", swatch: "#d97706" },
]
const genres = ["Action", "Aventure", "Animation", "Comédie", "Crime", "Documentaire", "Drame", "Familial", "Fantastique", "Histoire", "Horreur", "Musique", "Mystère", "Romance", "Science-Fiction", "Thriller", "Guerre", "Western"]
const languages = [{ code: "fr", label: "Français" }, { code: "en", label: "Anglais" }, { code: "ja", label: "Japonais" }, { code: "ko", label: "Coréen" }, { code: "es", label: "Espagnol" }, { code: "it", label: "Italien" }]

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-gray-200/80 px-4 py-3 text-left dark:border-white/10"><span className="text-sm font-bold">{label}</span><span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} /></span></button>
}

export default function Settings() {
  const { user } = useAuth()
  const { favorites, library, ratings, history, clearFavorites, clearLibrary, clearRatings, clearHistory, accentColor, setAccentColor, preferences, updatePreferences, resetPreferences } = useApp()
  const { showToast } = useToast()
  const patch = (value: Partial<CinePreferences>) => updatePreferences(value)
  const patchNested = <K extends "recommendations" | "notifications" | "playback" | "library">(key: K, value: Partial<CinePreferences[K]>) => patch({ [key]: { ...preferences[key], ...value } } as Partial<CinePreferences>)

  const stats = useMemo(() => ({ favorites: favorites.length, library: library.length, ratings: Object.keys(ratings).length, history: history.length }), [favorites, library, ratings, history])
  const toggleGenre = (key: "favoriteGenres" | "avoidedGenres", genre: string) => {
    const current = preferences[key]
    const next = current.includes(genre) ? current.filter(item => item !== genre) : [...current, genre]
    const opposite = key === "favoriteGenres" ? "avoidedGenres" : "favoriteGenres"
    patch({ [key]: next, [opposite]: preferences[opposite].filter(item => item !== genre) })
  }
  const toggleLanguage = (code: string) => patch({ languages: preferences.languages.includes(code) ? preferences.languages.filter(item => item !== code) : [...preferences.languages, code] })

  const exportData = () => {
    const data: Record<string, unknown> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || key === "account" || key === "user") continue
      if (["favorites", "library", "profile", "theme", "accentColor", "cinePreferences", "recommendations:ignored"].includes(key) || key.startsWith("ratings:") || key.startsWith("history:") || key.startsWith("profile-media:")) {
        const value = localStorage.getItem(key)
        try { data[key] = value ? JSON.parse(value) : null } catch { data[key] = value }
      }
    }
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `cinescope-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url)
    showToast("Sauvegarde CineScope exportée.")
  }

  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as { data?: Record<string, unknown> }
      if (!parsed.data || typeof parsed.data !== "object") throw new Error()
      Object.entries(parsed.data).forEach(([key, value]) => localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value)))
      showToast("Sauvegarde importée. CineScope va être rechargé.")
      window.setTimeout(() => window.location.reload(), 700)
    } catch { showToast("Ce fichier de sauvegarde est invalide.", "error") }
  }

  const destructive = (message: string, action: () => void) => { if (window.confirm(message)) action() }
  const resetRecommendations = () => { localStorage.removeItem("recommendations:ignored"); showToast("Recommandations réinitialisées.", "info") }

  return <main className="cine-settings-page page-enter mx-auto max-w-6xl px-5 py-10 sm:px-8">
    <div className="mb-8"><p className="cine-eyebrow">Centre de contrôle</p><h1 className="mt-2 text-4xl font-black tracking-tight">Paramètres</h1><p className="mt-2 text-gray-500 dark:text-gray-400">Personnalisez CineScope, ses recommandations et vos données.</p></div>
    <div className="space-y-6">
      <section className="cine-panel cine-appearance-panel"><h2 className="text-xl font-black">🎨 Apparence</h2><div className="mt-5 grid gap-5 lg:grid-cols-2">
        <label className="text-sm font-bold">Thème<select value={preferences.themeMode} onChange={e => patch({ themeMode: e.target.value as ThemeMode })} className="cine-settings-input"><option value="system">Système</option><option value="dark">Sombre</option><option value="light">Clair</option></select></label>
        <label className="text-sm font-bold">Intensité des effets<select value={preferences.motionLevel} onChange={e => patch({ motionLevel: e.target.value as CinePreferences["motionLevel"] })} className="cine-settings-input"><option value="subtle">Discret — sobre et léger</option><option value="normal">Normal — équilibré et premium</option><option value="cinematic">Cinématique — profond et immersif</option></select><span className="mt-2 block text-xs font-medium text-gray-500 dark:text-gray-400">Modifie la couleur du fond, les halos, ombres, profondeur, flou et intensité des interactions.</span></label>
        <Toggle checked={preferences.animations} onChange={animations => patch({ animations })} label="Animations" />
        <Toggle checked={preferences.cardDensity === "compact"} onChange={compact => patch({ cardDensity: compact ? "compact" : "comfortable" })} label="Cartes compactes" />
      </div><div className="mt-6"><p className="mb-3 text-sm font-bold">Couleur CineScope</p><div className="flex flex-wrap gap-3">{accents.map(a => <button key={a.value} onClick={() => setAccentColor(a.value)} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-black ${accentColor === a.value ? "cine-accent-choice-active" : "border-gray-200 dark:border-white/10"}`}><span className="h-5 w-5 rounded-full" style={{ backgroundColor: a.swatch }} />{a.label}{accentColor === a.value && " ✓"}</button>)}</div></div>
      </section>

      <section className="cine-panel"><h2 className="text-xl font-black">🎬 Préférences cinéma</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ces choix influencent Pour vous et Film aléatoire.</p>
        <div className="mt-5"><p className="text-sm font-black">Genres favoris</p><div className="mt-2 flex flex-wrap gap-2">{genres.map(g => <button key={g} onClick={() => toggleGenre("favoriteGenres", g)} className={`cine-pref-chip ${preferences.favoriteGenres.includes(g) ? "cine-pref-chip-active" : ""}`}>{g}</button>)}</div></div>
        <div className="mt-5"><p className="text-sm font-black">Genres à éviter</p><div className="mt-2 flex flex-wrap gap-2">{genres.map(g => <button key={g} onClick={() => toggleGenre("avoidedGenres", g)} className={`cine-pref-chip ${preferences.avoidedGenres.includes(g) ? "border-red-500 bg-red-500/10 text-red-600" : ""}`}>{g}</button>)}</div></div>
        <div className="mt-5 grid gap-4 md:grid-cols-3"><label className="text-sm font-bold">Note TMDB minimum<select value={preferences.minimumTmdbRating} onChange={e => patch({ minimumTmdbRating: Number(e.target.value) })} className="cine-settings-input">{[0,5,6,6.5,7,7.5,8].map(v => <option key={v} value={v}>{v === 0 ? "Aucune" : `${v}/10`}</option>)}</select></label><label className="text-sm font-bold">Durée idéale<select value={preferences.durationPreference} onChange={e => patch({ durationPreference: e.target.value as CinePreferences["durationPreference"] })} className="cine-settings-input"><option value="any">Peu importe</option><option value="short">Moins de 90 min</option><option value="medium">90–120 min</option><option value="long">2 h et plus</option></select></label><div><p className="text-sm font-bold">Langues</p><div className="mt-2 flex flex-wrap gap-2">{languages.map(l => <button key={l.code} onClick={() => toggleLanguage(l.code)} className={`cine-pref-chip ${preferences.languages.includes(l.code) ? "cine-pref-chip-active" : ""}`}>{l.label}</button>)}</div></div></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="cine-panel"><h2 className="text-xl font-black">🎲 Film aléatoire</h2><div className="mt-5 space-y-4"><label className="text-sm font-bold">Mode par défaut<select value={preferences.randomDefaultMode} onChange={e => patch({ randomDefaultMode: e.target.value as CinePreferences["randomDefaultMode"] })} className="cine-settings-input"><option value="surprise">Surprends-moi</option><option value="tastes">Selon mes goûts</option><option value="library">Ma bibliothèque</option><option value="short">Film court</option><option value="top">Très bien noté</option></select></label><div className="grid grid-cols-2 gap-3"><label className="text-sm font-bold">Note min.<input type="number" min="0" max="10" step="0.5" value={preferences.randomMinRating} onChange={e => patch({ randomMinRating: Number(e.target.value) })} className="cine-settings-input" /></label><label className="text-sm font-bold">Durée max.<select value={preferences.randomMaxDuration ?? ""} onChange={e => patch({ randomMaxDuration: e.target.value ? Number(e.target.value) : undefined })} className="cine-settings-input"><option value="">Aucune</option><option value="90">90 min</option><option value="120">2 h</option><option value="150">2 h 30</option></select></label></div><Toggle checked={preferences.randomExcludeWatched} onChange={randomExcludeWatched => patch({ randomExcludeWatched })} label="Exclure les films déjà vus" /></div></section>
        <section className="cine-panel"><h2 className="text-xl font-black">🎯 Recommandations</h2><div className="mt-5 space-y-3"><Toggle checked={preferences.recommendations.useLibrary} onChange={v => patchNested("recommendations", { useLibrary: v })} label="Utiliser ma bibliothèque" /><Toggle checked={preferences.recommendations.useFavorites} onChange={v => patchNested("recommendations", { useFavorites: v })} label="Utiliser mes favoris" /><Toggle checked={preferences.recommendations.useRatings} onChange={v => patchNested("recommendations", { useRatings: v })} label="Utiliser mes notes" /><Toggle checked={preferences.recommendations.useHistory} onChange={v => patchNested("recommendations", { useHistory: v })} label="Utiliser mon historique" /><Toggle checked={preferences.recommendations.hideWatched} onChange={v => patchNested("recommendations", { hideWatched: v })} label="Masquer les films déjà vus" /></div></section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="cine-panel"><h2 className="text-xl font-black">🔔 Notifications</h2><div className="mt-5 space-y-3"><Toggle checked={preferences.notifications.enabled} onChange={v => patchNested("notifications", { enabled: v })} label="Activer les toasts" /><Toggle checked={preferences.notifications.success} onChange={v => patchNested("notifications", { success: v })} label="Succès" /><Toggle checked={preferences.notifications.info} onChange={v => patchNested("notifications", { info: v })} label="Informations" /><Toggle checked={preferences.notifications.error} onChange={v => patchNested("notifications", { error: v })} label="Erreurs" /><label className="text-sm font-bold">Durée<select value={preferences.notifications.duration} onChange={e => patchNested("notifications", { duration: Number(e.target.value) })} className="cine-settings-input"><option value="2000">2 secondes</option><option value="3000">3 secondes</option><option value="5000">5 secondes</option><option value="8000">8 secondes</option></select></label></div></section>
        <section className="cine-panel"><h2 className="text-xl font-black">▶️ Lecture</h2><div className="mt-5 space-y-4"><Toggle checked={preferences.playback.autoplayTrailers} onChange={v => patchNested("playback", { autoplayTrailers: v })} label="Lecture automatique" /><label className="text-sm font-bold">Volume par défaut : {preferences.playback.volume}%<input type="range" min="0" max="100" value={preferences.playback.volume} onChange={e => patchNested("playback", { volume: Number(e.target.value) })} className="mt-3 w-full" /></label><label className="text-sm font-bold">Ouverture<select value={preferences.playback.trailerTarget} onChange={e => patchNested("playback", { trailerTarget: e.target.value as CinePreferences["playback"]["trailerTarget"] })} className="cine-settings-input"><option value="modal">Popup CineScope</option><option value="youtube">YouTube</option></select></label></div></section>
        <section className="cine-panel"><h2 className="text-xl font-black">📚 Bibliothèque</h2><div className="mt-5 space-y-4"><label className="text-sm font-bold">Statut par défaut<select value={preferences.library.defaultStatus} onChange={e => patchNested("library", { defaultStatus: e.target.value as CinePreferences["library"]["defaultStatus"] })} className="cine-settings-input"><option value="watchlist">À regarder</option><option value="watching">En cours</option><option value="watched">Vu</option></select></label><label className="text-sm font-bold">Vue par défaut<select value={preferences.library.defaultView} onChange={e => patchNested("library", { defaultView: e.target.value as CinePreferences["library"]["defaultView"] })} className="cine-settings-input"><option value="grid">Grille</option><option value="list">Liste</option></select></label><label className="text-sm font-bold">Tri par défaut<select value={preferences.library.defaultSort} onChange={e => patchNested("library", { defaultSort: e.target.value as CinePreferences["library"]["defaultSort"] })} className="cine-settings-input"><option value="recent">Ajout récent</option><option value="title">Titre A-Z</option><option value="rating">Note TMDB</option><option value="year">Plus récent</option></select></label></div></section>
      </div>

      <section className="cine-panel"><h2 className="text-xl font-black">🔒 Compte & données</h2><div className="mt-4 rounded-2xl bg-gray-50 p-4 dark:bg-white/[.04]"><p className="font-black">{user?.username ?? "Compte CineScope"}</p><p className="text-sm text-gray-500">{user?.email ?? "Non connecté"}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-gray-500"><span>{stats.favorites} favoris</span><span>•</span><span>{stats.library} bibliothèque</span><span>•</span><span>{stats.ratings} notes</span><span>•</span><span>{stats.history} consultations</span></div></div><div className="mt-5 flex flex-wrap gap-3"><button onClick={() => destructive("Effacer tout l’historique ?", clearHistory)} className="cine-button-secondary">Vider l’historique</button><button onClick={resetRecommendations} className="cine-button-secondary">Réinitialiser les recommandations</button><button onClick={() => destructive("Supprimer toutes vos notes ?", clearRatings)} className="cine-button-secondary">Supprimer les notes</button><button onClick={() => destructive("Vider tous vos favoris ?", clearFavorites)} className="cine-button-secondary">Vider les favoris</button><button onClick={() => destructive("Vider toute votre bibliothèque ?", clearLibrary)} className="cine-button-secondary">Vider la bibliothèque</button><button onClick={() => destructive("Réinitialiser toutes les préférences CineScope ?", resetPreferences)} className="rounded-xl bg-red-600 px-5 py-3 font-black text-white hover:bg-red-500">Réinitialiser les préférences</button></div></section>

      <section className="cine-panel"><h2 className="text-xl font-black">💾 Sauvegarde</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Exportez vos données CineScope sans inclure votre mot de passe ni votre session.</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={exportData} className="cine-button-primary">↓ Exporter mes données</button><label className="cine-button-secondary cursor-pointer">↑ Importer une sauvegarde<input type="file" accept="application/json,.json" onChange={importData} className="hidden" /></label></div></section>

      <section className="cine-panel"><h2 className="text-xl font-black">ℹ️ À propos</h2><div className="mt-4 grid gap-4 sm:grid-cols-3"><div className="cine-glass-card"><p className="text-xs font-black uppercase tracking-wider text-gray-400">Application</p><p className="mt-1 font-black">CineScope</p></div><div className="cine-glass-card"><p className="text-xs font-black uppercase tracking-wider text-gray-400">Version</p><p className="mt-1 font-black">2.5</p></div><div className="cine-glass-card"><p className="text-xs font-black uppercase tracking-wider text-gray-400">Données cinéma</p><p className="mt-1 font-black">TMDB</p></div></div><p className="mt-4 text-xs text-gray-500">Ce produit utilise l’API TMDB mais n’est ni approuvé ni certifié par TMDB.</p></section>
    </div>
  </main>
}
