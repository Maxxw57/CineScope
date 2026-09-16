import { ReactNode, useEffect } from "react"

type Props = { open: boolean; title: string; onClose: () => void; children: ReactNode }

export default function CineModal({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = previous }
  }, [open, onClose])

  if (!open) return null
  return <div className="cine-modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-label={title} className="cine-modal" onMouseDown={e => e.stopPropagation()}>
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-black text-white">{title}</h2>
        <button type="button" onClick={onClose} className="cine-icon-button" aria-label="Fermer">✕</button>
      </div>
      {children}
    </section>
  </div>
}
