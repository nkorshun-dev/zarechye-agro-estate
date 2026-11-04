import { useCallback, useState, type ReactNode } from 'react'
import { ToastContext } from '../hooks/useToast'
import s from './Toast.module.css'

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const show = useCallback((m: string) => {
    setMessage(m)
    window.setTimeout(() => setMessage((cur) => (cur === m ? '' : cur)), 4000)
  }, [])
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={s.region} role="status" aria-live="polite">
        {message && <div className={s.toast}>{message}</div>}
      </div>
    </ToastContext.Provider>
  )
}
