import { useEffect, useRef, type ReactNode } from 'react'
import s from './Modal.module.css'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
  onKeyDown?: (e: React.KeyboardEvent) => void
}

/** Нативный <dialog>: фокус остаётся внутри, Esc закрывает, после закрытия фокус возвращается на кнопку-источник. */
export default function Modal({ open, title, onClose, children, wide, onKeyDown }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`${s.dialog} ${wide ? s.wide : ''}`}
      aria-label={title}
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className={s.inner}>
          <header className={s.head}>
            <h2>{title}</h2>
            <button type="button" className={s.close} onClick={onClose} aria-label="Закрыть">
              ×
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  )
}
