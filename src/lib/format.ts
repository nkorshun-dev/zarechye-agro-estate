import { CURRENCY } from '../data/pricing'
import { parseISO } from './dates'

export const formatMoney = (n: number): string => `${new Intl.NumberFormat('ru-RU').format(n)} ${CURRENCY}`

const dateFmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('ru-RU', { timeZone: 'UTC', ...opts })
const short = dateFmt({ day: 'numeric', month: 'long' })
const withWeekday = dateFmt({ weekday: 'short', day: 'numeric', month: 'long' })
const full = dateFmt({ day: 'numeric', month: 'long', year: 'numeric' })
const monthTitle = dateFmt({ month: 'long', year: 'numeric' })

export const formatDate = (iso: string): string => short.format(parseISO(iso))
export const formatDateWeekday = (iso: string): string => withWeekday.format(parseISO(iso))
export const formatDateFull = (iso: string): string => full.format(parseISO(iso))
export const formatMonth = (iso: string): string => monthTitle.format(parseISO(iso))

export const plural = (n: number, forms: [string, string, string]): string => {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return forms[0]
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1]
  return forms[2]
}
export const nightsLabel = (n: number): string => `${n} ${plural(n, ['ночь', 'ночи', 'ночей'])}`
export const guestsLabel = (n: number): string => `${n} ${plural(n, ['гость', 'гостя', 'гостей'])}`
