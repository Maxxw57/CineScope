import { Component, ErrorInfo, ReactNode } from "react"

type Props = { children: ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erreur React interceptée par ErrorBoundary :", error, info)
  }

  private retry = () => {
    window.location.reload()
  }

  private goHome = () => {
    window.location.assign("/")
  }

  render() {
    if (this.state.hasError) {
      const isDark = localStorage.getItem("theme") === "dark"

      return (
        <main
          className={`flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 ${
            isDark ? "bg-gray-950 text-white" : "bg-gray-100 text-gray-900"
          }`}
        >
          <section
            className={`w-full max-w-2xl rounded-3xl border p-8 text-center shadow-2xl sm:p-12 ${
              isDark
                ? "border-gray-800 bg-gray-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
                isDark ? "bg-red-950/40" : "bg-red-50"
              }`}
            >
              🎬
            </div>

            <p
              className={`mt-6 text-sm font-black uppercase tracking-[0.25em] ${
                isDark ? "text-red-400" : "text-red-600"
              }`}
            >
              Erreur CineScope
            </p>

            <h1
              className={`mt-3 text-3xl font-black sm:text-4xl ${
                isDark ? "text-white" : "text-gray-950"
              }`}
            >
              Oups, une erreur est survenue
            </h1>

            <p
              className={`mx-auto mt-4 max-w-lg ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              CineScope a rencontré un problème inattendu. Vous pouvez réessayer
              ou revenir à l’accueil.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={this.retry}
                className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-500"
              >
                Réessayer
              </button>

              <button
                type="button"
                onClick={this.goHome}
                className={`rounded-xl border px-6 py-3 font-bold transition ${
                  isDark
                    ? "border-gray-700 text-white hover:bg-gray-800"
                    : "border-gray-300 text-gray-800 hover:bg-gray-100"
                }`}
              >
                Retour à l’accueil
              </button>
            </div>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
