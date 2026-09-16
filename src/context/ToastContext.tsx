import { createContext, useCallback, useContext, useRef, useState } from "react"

type ToastType = "success" | "info" | "error"

type Toast = {
  id: number
  message: string
  type: ToastType
}

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const removeToast = useCallback((id: number) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    try {
      const raw = localStorage.getItem("cinePreferences")
      const prefs = raw ? JSON.parse(raw)?.notifications : null
      if (prefs?.enabled === false || prefs?.[type] === false) return
      const id = ++nextId.current
      setToasts(current => [...current, { id, message, type }])
      const duration = Math.min(10000, Math.max(1000, Number(prefs?.duration) || 3000))
      window.setTimeout(() => removeToast(id), duration)
    } catch {
      const id = ++nextId.current
      setToasts(current => [...current, { id, message, type }])
      window.setTimeout(() => removeToast(id), 3000)
    }
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map(toast => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl dark:bg-gray-900 ${
              toast.type === "error"
                ? "border-red-200 dark:border-red-900"
                : toast.type === "info"
                  ? "border-blue-200 dark:border-blue-900"
                  : "border-emerald-200 dark:border-emerald-900"
            }`}
          >
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-black text-white ${
              toast.type === "error" ? "bg-red-600" : toast.type === "info" ? "bg-blue-600" : "bg-emerald-600"
            }`}>
              {toast.type === "error" ? "!" : toast.type === "info" ? "i" : "✓"}
            </span>
            <p className="flex-1 pt-0.5 text-sm font-bold text-gray-800 dark:text-gray-100">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-xl leading-none text-gray-400 transition hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Fermer la notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast doit être utilisé dans ToastProvider")
  return context
}
