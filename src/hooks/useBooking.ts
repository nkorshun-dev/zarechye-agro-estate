import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getHouse } from '../data/houses'
import { isISO, todayMinsk } from '../lib/dates'
import type { Guests, House } from '../types'

const int = (v: string | null, min: number, max: number, fallback: number) => {
  const n = Number.parseInt(v ?? '', 10)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}

/**
 * Состояние бронирования живёт в адресной строке: ?h=домик&in=2026-07-10&out=2026-07-13&a=2&c=3,7&p=1.
 * Ссылкой можно поделиться; битые значения молча отбрасываются.
 */
export function useBooking(forcedHouse?: House) {
  const [params, setParams] = useSearchParams()
  const house = forcedHouse ?? getHouse(params.get('h'))
  const inP = params.get('in')
  const outP = params.get('out')
  const checkIn = isISO(inP) && inP >= todayMinsk() ? inP : null // прошедшие даты из ссылки отбрасываем
  const checkOut = checkIn && isISO(outP) && outP > checkIn ? outP : null
  const adults = int(params.get('a'), 1, 12, 2)
  const cParam = params.get('c')
  const pets = int(params.get('p'), 0, 2, 0)

  const guests: Guests = useMemo(
    () => ({
      adults,
      childAges: (cParam ?? '').split(',').filter(Boolean).slice(0, 10).map((x) => int(x, 0, 17, 0)),
      pets,
    }),
    [adults, cParam, pets],
  )

  const update = useCallback(
    (patch: Record<string, string | null>) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [k, v] of Object.entries(patch)) {
            if (v) next.set(k, v)
            else next.delete(k)
          }
          return next
        },
        { replace: true },
      ),
    [setParams],
  )

  return {
    house,
    checkIn,
    checkOut,
    guests,
    setHouse: (slug: string | null) => update({ h: slug }),
    setDates: (inD: string | null, outD: string | null) => update({ in: inD, out: outD }),
    setGuests: (g: Guests) => update({ a: String(g.adults), c: g.childAges.join(',') || null, p: g.pets ? String(g.pets) : null }),
    /** Строка запроса для ссылки на другую страницу с тем же состоянием. */
    query: (slug?: string) => {
      const q = new URLSearchParams(params)
      if (slug) q.set('h', slug)
      else q.delete('h')
      return q.toString() ? `?${q.toString()}` : ''
    },
  }
}
