// Даты хранятся строками «ГГГГ-ММ-ДД» (календарный день, без времени).
// Арифметика идёт через UTC, поэтому переходы на летнее время и пояс браузера ничего не сдвигают.
// «Сегодня» берётся по Europe/Minsk, а не по часам устройства гостя.
const DAY = 86_400_000
const TZ = 'Europe/Minsk'

export const parseISO = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
export const toISO = (d: Date): string => d.toISOString().slice(0, 10)
export const isISO = (s: unknown): s is string =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && toISO(parseISO(s)) === s

export const addDays = (s: string, n: number): string => toISO(new Date(parseISO(s).getTime() + n * DAY))
/** Число ночей от заезда до выезда: выезд-день не считается. */
export const diffDays = (a: string, b: string): number => Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / DAY)
/** 0 = воскресенье … 6 = суббота */
export const weekday = (s: string): number => parseISO(s).getUTCDay()
export const monthOf = (s: string): number => Number(s.slice(5, 7))
export const monthDay = (s: string): string => s.slice(5)

export const todayMinsk = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)

export const startOfMonth = (s: string): string => `${s.slice(0, 7)}-01`
export const addMonths = (s: string, n: number): string => {
  const d = parseISO(startOfMonth(s))
  d.setUTCMonth(d.getUTCMonth() + n)
  return toISO(d)
}
export const daysInMonth = (s: string): number => diffDays(startOfMonth(s), addMonths(s, 1))

/** Список ночей: [заезд, выезд). */
export const eachNight = (checkIn: string, checkOut: string): string[] => {
  const n = diffDays(checkIn, checkOut)
  return Array.from({ length: Math.max(0, n) }, (_, i) => addDays(checkIn, i))
}
