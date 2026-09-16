import { ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"

type Props = { open: boolean; title: string; onClose: () => void; children: ReactNode }

export default function CineModal({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKey)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="cine-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="cine-modal max-h-[calc(100vh-2rem)] overflow-y-auto"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-slate-950/95 px-5 py-4 backdrop-blur-xl">
          <h2 className="text-lg font-black text-white">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="cine-icon-button"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {children}
      </section>
    </div>,
    document.body
  )
}
