import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useApp } from "../context/AppContext"
import { useToast } from "../context/ToastContext"

type ProfileForm = {
  firstName: string
  lastName: string
  username: string
  email: string
  bio: string
}

type ProfileErrors = Partial<Record<keyof ProfileForm, string>>

type ProfileMedia = {
  avatar: string
  banner: string
}

const compressImage = (file: File, maxWidth: number, maxHeight: number, quality = 0.82) =>
  new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Le fichier sélectionné n’est pas une image."))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Impossible de lire cette image."))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error("Impossible de charger cette image."))
      image.onload = () => {
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1)
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext("2d")
        if (!context) {
          reject(new Error("Impossible de traiter cette image."))
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", quality))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Profile() {
  const { user } = useAuth()
  const { favorites, library, ratings, history, clearHistory } = useApp()
  const { showToast } = useToast()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [media, setMedia] = useState<ProfileMedia>({ avatar: "", banner: "" })

  const watchedCount = library.filter(movie => movie.status === "watched").length
  const watchingCount = library.filter(movie => movie.status === "watching").length
  const watchlistCount = library.filter(movie => movie.status === "watchlist").length
  const ratingValues = Object.values(ratings)
  const averageRating = ratingValues.length
    ? (ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length).toFixed(1)
    : "—"

  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    username: user?.username ?? "",
    email: user?.email ?? "",
    bio: "",
  })
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [isEditing, setIsEditing] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) return

    const savedProfile = localStorage.getItem("profile")
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile) as Partial<ProfileForm>
        setForm({
          firstName: parsed.firstName ?? "",
          lastName: parsed.lastName ?? "",
          username: parsed.username ?? user.username,
          email: parsed.email ?? user.email,
          bio: parsed.bio ?? "",
        })
        setIsEditing(false)
        return
      } catch {
        localStorage.removeItem("profile")
      }
    }

    setForm(current => ({ ...current, username: user.username, email: user.email }))
    setIsEditing(true)
  }, [user])

  useEffect(() => {
    if (!user) return
    const storageKey = `profile-media:${user.email}`
    try {
      const savedMedia = localStorage.getItem(storageKey)
      if (savedMedia) {
        const parsed = JSON.parse(savedMedia) as Partial<ProfileMedia>
        setMedia({ avatar: parsed.avatar ?? "", banner: parsed.banner ?? "" })
      } else {
        setMedia({ avatar: "", banner: "" })
      }
    } catch {
      localStorage.removeItem(storageKey)
      setMedia({ avatar: "", banner: "" })
    }
  }, [user])

  if (!user) {
    return <p className="p-6 text-gray-900 dark:text-white">Tu dois te connecter.</p>
  }

  const initials = `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase() || "CS"
  const totalLibrary = library.length
  const watchedProgress = totalLibrary ? Math.round((watchedCount / totalLibrary) * 100) : 0

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm(current => ({ ...current, [field]: value }))
    setSuccess(false)
    setErrors(current => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const validate = () => {
    const nextErrors: ProfileErrors = {}
    if (!form.firstName.trim()) nextErrors.firstName = "Le prénom est obligatoire."
    if (!form.lastName.trim()) nextErrors.lastName = "Le nom est obligatoire."
    if (!form.username.trim()) nextErrors.username = "Le pseudonyme est obligatoire."
    if (!form.email.trim()) nextErrors.email = "L'adresse e-mail est obligatoire."
    else if (!emailRegex.test(form.email.trim())) nextErrors.email = "Veuillez saisir une adresse e-mail valide."
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccess(false)
    if (!validate()) return

    const profileToSave: ProfileForm = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      bio: form.bio.trim(),
    }

    localStorage.setItem("profile", JSON.stringify(profileToSave))
    setForm(profileToSave)
    setSuccess(true)
    setIsEditing(false)
    showToast("Profil enregistré avec succès.")
  }

  const handleEdit = () => {
    setErrors({})
    setSuccess(false)
    setIsEditing(true)
  }

  const saveMedia = (nextMedia: ProfileMedia) => {
    if (!user) return false
    try {
      localStorage.setItem(`profile-media:${user.email}`, JSON.stringify(nextMedia))
      setMedia(nextMedia)
      return true
    } catch {
      showToast("Image trop volumineuse pour le stockage local.", "error")
      return false
    }
  }

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      const avatar = await compressImage(file, 500, 500, 0.84)
      if (saveMedia({ ...media, avatar })) showToast("Photo de profil mise à jour.")
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Impossible de modifier la photo.", "error")
    }
  }

  const handleBannerChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      const banner = await compressImage(file, 1600, 600, 0.8)
      if (saveMedia({ ...media, banner })) showToast("Bannière mise à jour.")
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Impossible de modifier la bannière.", "error")
    }
  }

  const removeAvatar = () => {
    if (saveMedia({ ...media, avatar: "" })) showToast("Photo de profil supprimée.")
  }

  const removeBanner = () => {
    if (saveMedia({ ...media, banner: "" })) showToast("Bannière réinitialisée.")
  }

  const inputClassName =
    "mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white"

  if (isEditing) {
    return (
      <main className="page-enter mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Compte CineScope</p>
          <h1 className="mt-2 text-4xl font-black text-gray-900 dark:text-white sm:text-5xl">Modifier mon profil</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">Personnalisez les informations visibles sur votre espace CineScope.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/40 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
          <div className="h-28 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600" />
          <div className="p-6 sm:p-8">
            <div className="-mt-20 mb-8 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gray-950 shadow-lg dark:border-gray-900">
              {media.avatar ? <img src={media.avatar} alt="Photo de profil" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white">{initials}</div>}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="font-bold text-gray-900 dark:text-white">Prénom</label>
                <input id="firstName" value={form.firstName} onChange={e => updateField("firstName", e.target.value)} placeholder="Votre prénom" className={inputClassName} />
                {errors.firstName && <p className="mt-2 text-sm font-semibold text-red-600">{errors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="font-bold text-gray-900 dark:text-white">Nom</label>
                <input id="lastName" value={form.lastName} onChange={e => updateField("lastName", e.target.value)} placeholder="Votre nom" className={inputClassName} />
                {errors.lastName && <p className="mt-2 text-sm font-semibold text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="username" className="font-bold text-gray-900 dark:text-white">Pseudonyme</label>
                <input id="username" value={form.username} onChange={e => updateField("username", e.target.value)} placeholder="Votre pseudonyme" className={inputClassName} />
                {errors.username && <p className="mt-2 text-sm font-semibold text-red-600">{errors.username}</p>}
              </div>
              <div>
                <label htmlFor="email" className="font-bold text-gray-900 dark:text-white">Adresse e-mail</label>
                <input id="email" type="email" value={form.email} onChange={e => updateField("email", e.target.value)} placeholder="votre@email.com" className={inputClassName} />
                {errors.email && <p className="mt-2 text-sm font-semibold text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="bio" className="font-bold text-gray-900 dark:text-white">Biographie</label>
              <textarea id="bio" rows={5} value={form.bio} onChange={e => updateField("bio", e.target.value)} placeholder="Parlez-nous un peu de vous..." className={`${inputClassName} resize-y`} />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="submit" className="rounded-2xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500">Enregistrer mon profil</button>
              <button type="button" onClick={() => setIsEditing(false)} className="rounded-2xl border border-gray-300 px-6 py-3.5 font-bold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">Annuler</button>
            </div>
          </div>
        </form>
      </main>
    )
  }

  return (
    <main className="page-enter mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-2xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
        <div className="relative h-44 overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 sm:h-56">
          {media.banner && <img src={media.banner} alt="Bannière du profil" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-black/15" />
          {!media.banner && <>
            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-blue-300/20 blur-3xl" />
          </>}
          <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white backdrop-blur-sm">CineScope Member</div>
          <div className="absolute right-5 top-5 flex gap-2">
            <button type="button" onClick={() => bannerInputRef.current?.click()} className="rounded-xl border border-white/25 bg-black/35 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:bg-black/55">📷 Modifier la bannière</button>
            {media.banner && <button type="button" onClick={removeBanner} className="rounded-xl border border-white/25 bg-black/35 px-3 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:bg-black/55" aria-label="Réinitialiser la bannière">×</button>}
          </div>
          <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
        </div>

        <div className="relative px-6 pb-8 sm:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="group relative -mt-14 h-28 w-28 shrink-0 overflow-hidden rounded-full border-[6px] border-white bg-gray-950 shadow-xl dark:border-gray-900 sm:-mt-16 sm:h-32 sm:w-32">
                {media.avatar ? <img src={media.avatar} alt="Photo de profil" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-4xl font-black text-white">{initials}</div>}
                <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-black text-transparent transition group-hover:bg-black/55 group-hover:text-white" aria-label="Modifier la photo de profil">📷 Modifier</button>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <div className="sm:pb-2">
                <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl">{form.firstName} {form.lastName}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-bold text-blue-600 dark:text-blue-400">@{form.username}</span>
                  <span className="hidden text-gray-300 sm:inline dark:text-gray-700">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Membre CineScope</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {media.avatar && <button type="button" onClick={removeAvatar} className="rounded-2xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Supprimer la photo</button>}
              <button type="button" onClick={handleEdit} className="rounded-2xl bg-gray-950 px-5 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200">Modifier mon profil</button>
            </div>
          </div>

          {success && <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 font-semibold text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">Profil enregistré avec succès.</div>}

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["♥", favorites.length, "Favoris"],
              ["★", ratingValues.length, "Films notés"],
              ["✓", watchedCount, "Films vus"],
              ["★", averageRating, "Note moyenne"],
            ].map(([icon, value, label]) => (
              <div key={String(label)} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950/60">
                <div className="flex items-center justify-between">
                  <span className="text-lg text-blue-600 dark:text-blue-400">{icon}</span>
                  <span className="text-2xl font-black text-gray-950 dark:text-white">{value}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.8fr]">
        <div className="space-y-6">
          {favorites.length > 0 && <section className="cine-panel">
            <p className="cine-eyebrow">Sélection personnelle</p><h2 className="mt-1 text-2xl font-black">Mes films favoris</h2>
            <div className="mt-6 flex gap-4 overflow-x-auto pb-3">{[...favorites].sort((a,b) => b.rating-a.rating).slice(0,5).map((movie,index) => <Link key={movie.id} to={`/films/${movie.id}`} className="group relative w-32 shrink-0"><div className="aspect-[2/3] overflow-hidden rounded-2xl bg-gray-200 shadow-lg dark:bg-gray-800">{movie.poster && <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/>}</div><span className="absolute -left-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-xs font-black text-white shadow-lg">#{index+1}</span><p className="mt-2 truncate text-sm font-black">{movie.title}</p></Link>)}</div>
          </section>}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Votre activité</p>
                <h2 className="mt-1 text-2xl font-black text-gray-950 dark:text-white">Récemment consultés</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Les dernières fiches de films que vous avez ouvertes.</p>
              </div>
              {history.length > 0 && (
                <button type="button" onClick={clearHistory} className="shrink-0 rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold text-gray-600 transition hover:border-red-300 hover:text-red-600 dark:border-gray-700 dark:text-gray-300">Effacer</button>
              )}
            </div>

            {history.length ? (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {history.slice(0, 4).map(entry => (
                  <Link key={`${entry.source}:${entry.movie.id}`} to={`/films/${entry.movie.id}${entry.source === "local" ? "?source=local" : ""}`} className="group">
                    <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-gray-100 shadow-sm dark:bg-gray-800">
                      {entry.movie.poster ? <img src={entry.movie.poster} alt={`Affiche de ${entry.movie.title}`} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center p-4 text-center text-sm font-bold text-gray-400">Affiche indisponible</div>}
                    </div>
                    <p className="mt-2 truncate font-bold text-gray-900 dark:text-white">{entry.movie.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{entry.movie.year || "—"} · ★ {entry.movie.rating}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                <p className="font-bold text-gray-900 dark:text-white">Aucun film consulté pour le moment.</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ouvrez une fiche film et elle apparaîtra automatiquement ici.</p>
                <Link to="/films" className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-500">Explorer le catalogue</Link>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">À propos</p>
            <h2 className="mt-1 text-2xl font-black text-gray-950 dark:text-white">Qui suis-je ?</h2>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-600 dark:text-gray-300">{form.bio || "Aucune biographie renseignée. Modifiez votre profil pour vous présenter à la communauté CineScope."}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-gray-100 px-4 py-2 font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">✉ {form.email}</span>
              <span className="rounded-full bg-blue-50 px-4 py-2 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">🎬 {totalLibrary} film{totalLibrary > 1 ? "s" : ""} en bibliothèque</span>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Progression</p>
            <h2 className="mt-1 text-xl font-black text-gray-950 dark:text-white">Ma bibliothèque</h2>
            <div className="mt-6 flex items-end justify-between">
              <div><span className="text-4xl font-black text-gray-950 dark:text-white">{watchedProgress}%</span><p className="mt-1 text-sm text-gray-500">de la bibliothèque vue</p></div>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">{watchedCount}/{totalLibrary || 0}</span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500 transition-all" style={{ width: `${watchedProgress}%` }} /></div>
            <div className="mt-6 space-y-4">
              {[["À regarder", watchlistCount], ["En cours", watchingCount], ["Vus", watchedCount]].map(([label, value]) => (
                <div key={String(label)} className="flex items-center justify-between"><span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{label}</span><span className="rounded-lg bg-gray-100 px-2.5 py-1 text-sm font-black text-gray-900 dark:bg-gray-800 dark:text-white">{value}</span></div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 p-6 text-white shadow-xl shadow-blue-900/15">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">CineScope</p>
            <h2 className="mt-2 text-2xl font-black">Votre cinéma, votre collection.</h2>
            <p className="mt-3 text-sm leading-6 text-blue-100">Continuez à découvrir, noter et classer les films qui vous marquent.</p>
            <Link to="/films" className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-black text-blue-700 transition hover:bg-blue-50">Explorer le catalogue</Link>
          </section>
        </aside>
      </div>
    </main>
  )
}
