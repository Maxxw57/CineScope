import { Route, Routes } from "react-router-dom"
import NavBar from "./components/NavBar"
import ProtectedRoute from "./components/ProtectedRoute"
import Favorites from "./pages/Favorites"
import Home from "./pages/Home"
import Library from "./pages/Library"
import Login from "./pages/Login"
import MovieDetail from "./pages/MovieDetail"
import Movies from "./pages/Movies"
import NotFound from "./pages/NotFound"
import Profile from "./pages/Profile"
import Register from "./pages/Register"
import Settings from "./pages/Settings"
import Search from "./pages/Search"
import ActorDetail from "./pages/ActorDetail"
import ForYou from "./pages/ForYou"
import RandomMovie from "./pages/RandomMovie"
import SeriesPage from "./pages/Series"
import SeriesDetail from "./pages/SeriesDetail"
import Calendar from "./pages/Calendar"

export default function App() {
  return (
    <div className="cine-app-shell min-h-screen">
      <NavBar />
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
    </div>
  )
}
