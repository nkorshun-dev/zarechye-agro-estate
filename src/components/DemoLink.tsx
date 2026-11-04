import type { ReactNode } from 'react'

/** Контакт в демо: выглядит как ссылка, но не звонит и не пишет. */
export default function DemoLink({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="demo-link" aria-label={`${label} (в демо не активно)`} title="Демо-проект: ссылка не активна">
      {children}
    </span>
  )
}
