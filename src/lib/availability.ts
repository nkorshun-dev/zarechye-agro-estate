import type { StoredBooking } from '../types'
import { addDays, addMonths, diffDays, eachNight, startOfMonth } from './dates'
import { formatDate } from './format'
import { minNightsFor } from './pricing'

export interface Range {
  from: string // заезд
  to: string // выезд (ночь выезда уже свободна)
}

const hash = (s: string): number => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}
const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** «Чужие» брони: детерминированы от домика и месяца, перезагрузка их не меняет. Окно — 5 месяцев с начала текущего. */
export const generateBookings = (slug: string, today: string): Range[] => {
  const start = startOfMonth(today)
  const end = addMonths(start, 5)
  const rnd = mulberry32(hash(`${slug}|${start}`))
  const out: Range[] = []
  let cursor = addDays(start, Math.floor(rnd() * 3))
  while (diffDays(cursor, end) > 0) {
    cursor = addDays(cursor, 2 + Math.floor(rnd() * 6))
    const to = addDays(cursor, 2 + Math.floor(rnd() * 4))
    out.push({ from: cursor, to })
    cursor = to
  }
  return out
}

/** Занятые ночи домика: сгенерированные брони + брони пользователя из localStorage. */
export const busyNights = (slug: string, today: string, mine: StoredBooking[]): Set<string> => {
  const set = new Set<string>()
  const ranges: Range[] = [
    ...generateBookings(slug, today),
    ...mine.filter((b) => b.houseSlug === slug).map((b) => ({ from: b.checkIn, to: b.checkOut })),
  ]
  for (const r of ranges) for (const n of eachNight(r.from, r.to)) set.add(n)
  return set
}

export const isRangeFree = (busy: Set<string>, checkIn: string, checkOut: string): boolean =>
  eachNight(checkIn, checkOut).every((n) => !busy.has(n))

export interface Selection {
  checkIn: string | null
  checkOut: string | null
}

/**
 * Реакция на клик по дню: новый выбор + подсказка. Чистая функция — одна на все календари.
 * Первый клик — заезд; клик позже заезда через свободные ночи — выезд;
 * клик раньше заезда или через занятую ночь — новый заезд; клик по заезду — сброс.
 */
export const selectDay = (sel: Selection, day: string, today: string, busy: Set<string>): { selection: Selection; hint: string } => {
  if (day < today) return { selection: sel, hint: 'Эта дата уже прошла.' }
  const { checkIn, checkOut } = sel
  if (day === checkIn) return { selection: { checkIn: null, checkOut: null }, hint: 'Даты сброшены. Выберите дату заезда.' }
  const startNew = (why = ''): { selection: Selection; hint: string } =>
    busy.has(day)
      ? { selection: sel, hint: `Ночь на ${formatDate(day)} занята. Выберите свободную дату заезда.` }
      : { selection: { checkIn: day, checkOut: null }, hint: `${why}Теперь выберите дату выезда.` }

  if (!checkIn || checkOut) return startNew()
  if (day < checkIn) return startNew(`${formatDate(day)} раньше заезда, поэтому это новая дата заезда. `)

  const firstBusy = eachNight(checkIn, day).find((n) => busy.has(n))
  if (firstBusy) {
    // по занятому дню заехать нельзя — оставляем заезд и подсказываем крайний выезд
    if (busy.has(day)) return { selection: sel, hint: `Между этими датами есть занятая ночь (${formatDate(firstBusy)}). Выезд возможен не позже ${formatDate(firstBusy)}.` }
    return startNew(`Между датами есть занятая ночь (${formatDate(firstBusy)}), поэтому выезд не выставлен: ${formatDate(day)} — новая дата заезда. `)
  }
  const { required, reason } = minNightsFor(checkIn, day)
  if (diffDays(checkIn, day) < required) return { selection: sel, hint: `${reason} Выберите выезд не раньше ${formatDate(addDays(checkIn, required))}.` }
  return { selection: { checkIn, checkOut: day }, hint: '' }
}
