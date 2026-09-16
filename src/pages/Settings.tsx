import { AccentColor, useApp } from "../context/AppContext"

const accents: Array<{ value: AccentColor; label: string; description: string; swatch: string }> = [
  { value: "blue", label: "Bleu CineScope", description: "Le style original", swatch: "#2563eb" },
  { value: "violet", label: "Violet", description: "Plus créatif et nocturne", swatch: "#7c3aed" },
  { value: "red", label: "Rouge cinéma", description: "Ambiance salle obscure", swatch: "#dc2626" },
  { value: "emerald", label: "Émeraude", description: "Sobre et moderne", swatch: "#059669" },
  { value: "amber", label: "Or", description: "Chaleureux et premium", swatch: "#d97706" },
]

export default function Settings() {
  const { favorites, library, removeFavorite, removeFromLibrary, theme, toggleTheme, accentColor, setAccentColor } = useApp()

  const clearFavorites = () => favorites.forEach(f => removeFavorite(f.id))
  const clearLibrary = () => library.forEach(l => removeFromLibrary(l.id))

  return (
    <main className="page-enter mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <div className="mb-8">
        <p className="cine-eyebrow">Personnalisation</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Paramètres</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Adapte l’apparence de CineScope sans changer son identité.</p>
      </div>

      <div className="space-y-6">
        <section className="cine-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><h2 className="text-xl font-black">Apparence</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Mode actuel : {theme === "dark" ? "Sombre" : "Clair"}</p></div>
            <button onClick={toggleTheme} className="cine-button-primary">{theme === "dark" ? "☀ Passer en clair" : "☾ Passer en sombre"}</button>
          </div>
        </section>

        <section className="cine-panel">
          <div className="mb-5"><h2 className="text-xl font-black">Couleur CineScope</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">La couleur choisie s’applique aux boutons, liens actifs, accents et effets lumineux.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {accents.map(accent => {
              const active = accentColor === accent.value
              return <button key={accent.value} type="button" onClick={() => setAccentColor(accent.value)} className={`group rounded-2xl border p-4 text-left transition hover:-translate-y-1 ${active ? "cine-accent-choice-active bg-gray-50 shadow-lg dark:bg-white/[.06]" : "border-gray-200 bg-white/50 hover:border-gray-300 dark:border-white/10 dark:bg-white/[.025]"}`}>
                <span className="mb-4 block h-10 w-10 rounded-xl shadow-lg ring-4 ring-white/10" style={{ backgroundColor: accent.swatch }} />
                <span className="block text-sm font-black">{accent.label}</span><span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">{accent.description}</span>
                {active && <span className="cine-accent-text mt-3 block text-xs font-black">✓ Actif</span>}
              </button>
            })}
          </div>
          <div className="cine-accent-preview mt-6 overflow-hidden rounded-2xl border p-5">
            <p className="text-xs font-black uppercase tracking-[.2em] opacity-70">Aperçu</p>
            <div className="mt-3 flex flex-wrap items-center gap-3"><button className="cine-button-primary">Bouton principal</button><span className="cine-accent-chip rounded-full px-3 py-1.5 text-sm font-bold">Accent CineScope</span><span className="cine-accent-text font-black">Lien actif →</span></div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="cine-panel"><h2 className="text-xl font-black">Favoris</h2><p className="mt-2 text-gray-500 dark:text-gray-400">{favorites.length} film{favorites.length > 1 ? "s" : ""}</p><button onClick={clearFavorites} disabled={!favorites.length} className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 font-bold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40">Vider les favoris</button></section>
          <section className="cine-panel"><h2 className="text-xl font-black">Bibliothèque</h2><p className="mt-2 text-gray-500 dark:text-gray-400">{library.length} film{library.length > 1 ? "s" : ""}</p><button onClick={clearLibrary} disabled={!library.length} className="mt-5 rounded-xl bg-amber-600 px-4 py-2.5 font-bold text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40">Vider la bibliothèque</button></section>
        </div>
      </div>
    </main>
  )
}
