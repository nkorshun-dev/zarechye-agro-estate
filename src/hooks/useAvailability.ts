import { useCallback, useMemo } from 'react'
import { busyNights } from '../lib/availability'
import { isISO, todayMinsk } from '../lib/dates'
import type { StoredBooking } from '../types'
import { useLocalStorage } from './useLocalStorage'

export const BOOKINGS_KEY = 'zarechye:bookings'

/** Занятость домиков: сгенерированные брони + брони, сохранённые на этом устройстве. */
export function useAvailability(slug?: string) {
  const [stored, setBookings] = useLocalStorage<StoredBooking[]>(BOOKINGS_KEY, [])
  // Хранилище могли испортить: берём только записи с корректными полями.
  const bookings = useMemo(
    () => (Array.isArray(stored) ? stored.filter((b) => b && typeof b.houseSlug === 'string' && isISO(b.checkIn) && isISO(b.checkOut)) : []),
    [stored],
  )
  const today = useMemo(() => todayMinsk(), [])
  const busyFor = useCallback((s: string) => busyNights(s, today, bookings), [today, bookings])
  const busy = useMemo(() => (slug ? busyFor(slug) : new Set<string>()), [slug, busyFor])
  const addBooking = useCallback((b: StoredBooking) => setBookings((prev) => [...(Array.isArray(prev) ? prev : []), b]), [setBookings])
  return { today, busy, busyFor, bookings, addBooking }
}
