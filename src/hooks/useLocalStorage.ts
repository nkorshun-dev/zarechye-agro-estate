import { useCallback, useState } from 'react'

/** Состояние в localStorage; если хранилище недоступно (приватный режим), работает как обычный useState. */
export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {
          /* хранилище недоступно — остаёмся в памяти */
        }
        return next
      })
    },
    [key],
  )
  return [value, set]
}
