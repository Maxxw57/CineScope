import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <p className="text-6xl">🍿</p>
      <p className="mt-5 text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Erreur 404</p>
      <h1 className="mt-2 text-4xl font-black">Cette séance n’existe pas</h1>
      <p className="mt-3 text-gray-500">La page demandée est introuvable.</p>
      <Link to="/" className="mt-7 inline-block rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500">Retour à l’accueil</Link>
    </main>
  )
}
