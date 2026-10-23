/** Affiché pendant le chargement d'une page (découpage du code avec React.lazy). */
export default function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600/20 border-t-blue-600" aria-hidden="true" />
      <span className="sr-only">Chargement de la page…</span>
    </div>
  )
}
