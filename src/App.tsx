import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import NavBar from "./components/NavBar"
import ProtectedRoute from "./components/ProtectedRoute"
import PageLoader from "./components/PageLoader"
import RouteEffects from "./components/RouteEffects"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"

// Les autres pages sont chargées à la demande : la page d'accueil s'affiche plus vite.
const Movies = lazy(() => import("./pages/Movies"))
const MovieDetail = lazy(() => import("./pages/MovieDetail"))
const SeriesPage = lazy(() => import("./pages/Series"))
const SeriesDetail = lazy(() => import("./pages/SeriesDetail"))
const Calendar = lazy(() => import("./pages/Calendar"))
const ActorDetail = lazy(() => import("./pages/ActorDetail"))
const ForYou = lazy(() => import("./pages/ForYou"))
const RandomMovie = lazy(() => import("./pages/RandomMovie"))
const Search = lazy(() => import("./pages/Search"))
const Favorites = lazy(() => import("./pages/Favorites"))
const Library = lazy(() => import("./pages/Library"))
const Profile = lazy(() => import("./pages/Profile"))
const Settings = lazy(() => import("./pages/Settings"))
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))

export default function App() {
  return (
    <div className="cine-app-shell min-h-screen">
      <RouteEffects />
      <NavBar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/films" element={<Movies />} />
          <Route path="/films/:id" element={<MovieDetail />} />
          <Route path="/series" element={<SeriesPage />} />
          <Route path="/series/:id" element={<SeriesDetail />} />
          <Route path="/calendrier" element={<Calendar />} />
          <Route path="/acteurs/:id" element={<ActorDetail />} />
          <Route path="/pour-vous" element={<ProtectedRoute><ForYou /></ProtectedRoute>} />
          <Route path="/film-aleatoire" element={<RandomMovie />} />
          <Route path="/search" element={<Search />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  )
}
