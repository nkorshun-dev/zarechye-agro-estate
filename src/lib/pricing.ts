import {
  EXTRA_GUEST_FEE,
  FIXED_HOLIDAYS,
  FREE_CHILD_UNDER,
  HOLIDAY_MARKUP,
  LONG_STAY,
  MIN_NIGHTS,
  MIN_NIGHTS_REASON,
  NEW_YEAR,
  PREPAYMENT_SHARE,
  SEASONS,
} from '../data/pricing'
import { extras as extrasData } from '../data/extras'
import type { ExtrasSelection, Guests, House, NightPrice, NightType, Quote } from '../types'
import { addDays, eachNight, diffDays, monthDay, monthOf, toISO, weekday } from './dates'

export const emptyExtras: ExtrasSelection = { saunaSessions: [], breakfast: false, sup: 0, boat: 0, transfer: 0, lateCheckout: false }
export const emptyGuests = (adults = 2): Guests => ({ adults, childAges: [], pets: 0 })

/** Православная Пасха (григорианская дата) по алгоритму Мееуса, верно для 1900–2099. */
export const orthodoxEaster = (year: number): string => {
  const a = year % 4
  const b = year % 7
  const c = year % 19
  const d = (19 * c + 15) % 30
  const e = (2 * a + 4 * b - d + 34) % 7
  const month = Math.floor((d + e + 114) / 31)
  const day = ((d + e + 114) % 31) + 1
  const julian = toISO(new Date(Date.UTC(year, month - 1, day)))
  return addDays(julian, 13)
}
export const radunitsa = (year: number): string => addDays(orthodoxEaster(year), 9)

export const isNewYear = (date: string): boolean => {
  const md = monthDay(date)
  return md >= NEW_YEAR.from || md <= NEW_YEAR.to
}
export const isHoliday = (date: string): boolean =>
  FIXED_HOLIDAYS.includes(monthDay(date)) || date === radunitsa(Number(date.slice(0, 4)))
export const isHighSeason = (date: string): boolean => SEASONS.high.months.includes(monthOf(date))
export const seasonCoefficient = (date: string): number => {
  const m = monthOf(date)
  if (SEASONS.high.months.includes(m)) return SEASONS.high.coefficient
  if (SEASONS.low.months.includes(m)) return SEASONS.low.coefficient
  return SEASONS.regular.coefficient
}

/** Тип ночи (ночь, которая начинается в этот день). Приоритет: Новый год → праздник → выходные → будни. */
export const nightType = (date: string): NightType => {
  if (isNewYear(date)) return 'newyear'
  if (isHoliday(date)) return 'holiday'
  const wd = weekday(date)
  return wd === 5 || wd === 6 ? 'weekend' : 'weekday'
}

export const nightPrice = (house: House, date: string): NightPrice => {
  const type = nightType(date)
  if (type === 'newyear') return { date, type, price: house.priceNewYear }
  const base = type === 'weekday' ? house.priceWeekday : type === 'weekend' ? house.priceWeekend : house.priceWeekend * HOLIDAY_MARKUP
  return { date, type, price: Math.round(base * seasonCoefficient(date)) }
}

const minNightsForNight = (date: string): number => {
  const type = nightType(date)
  if (type === 'newyear') return MIN_NIGHTS.newYear
  if (isHighSeason(date)) return MIN_NIGHTS.highSeason
  if (type === 'holiday') return MIN_NIGHTS.holiday
  return type === 'weekend' ? MIN_NIGHTS.weekend : 1
}

/** Минимум ночей для диапазона = самое строгое правило среди его ночей. */
export const minNightsFor = (checkIn: string, checkOut: string): { required: number; reason: string } => {
  const required = Math.max(1, ...eachNight(checkIn, checkOut).map(minNightsForNight))
  return { required, reason: MIN_NIGHTS_REASON[required] ?? '' }
}

export const guestsTotal = (g: Guests): number => g.adults + g.childAges.length
const payingGuests = (g: Guests): number => g.adults + g.childAges.filter((a) => a >= FREE_CHILD_UNDER).length

/** Текст проблемы со стоимостью/параметрами или null, если всё в порядке. */
export const stayProblem = (house: House, checkIn: string, checkOut: string, g: Guests): string | null => {
  const nights = diffDays(checkIn, checkOut)
  if (nights < 1) return 'Выезд должен быть позже заезда.'
  const { required, reason } = minNightsFor(checkIn, checkOut)
  if (nights < required) return reason
  if (guestsTotal(g) > house.maxGuests) return `В этом домике максимум ${house.maxGuests} гостей.`
  if (g.pets > 0 && !house.pets) return 'В этот домик нельзя с питомцами.'
  return null
}

export const extrasLines = (nights: number, g: Guests, sel: ExtrasSelection): { label: string; sum: number }[] => {
  const price = (id: string) => extrasData.find((e) => e.id === id)?.price ?? 0
  const lines = [
    { label: `Баня, сеансов: ${sel.saunaSessions.length}`, sum: sel.saunaSessions.length * price('saunaSessions') },
    { label: `Завтраки, ${guestsTotal(g)} чел. × ${nights} дн.`, sum: sel.breakfast ? guestsTotal(g) * nights * price('breakfast') : 0 },
    { label: `Сап, дней: ${sel.sup}`, sum: sel.sup * price('sup') },
    { label: `Лодка, дней: ${sel.boat}`, sum: sel.boat * price('boat') },
    { label: `Трансфер, поездок: ${sel.transfer}`, sum: sel.transfer * price('transfer') },
    { label: 'Поздний выезд до 18:00', sum: sel.lateCheckout ? price('lateCheckout') : 0 },
  ]
  return lines.filter((l) => l.sum > 0)
}

export const quote = (house: House, checkIn: string, checkOut: string, g: Guests, sel: ExtrasSelection = emptyExtras): Quote => {
  const nights = eachNight(checkIn, checkOut).map((d) => nightPrice(house, d))
  const nightsTotal = nights.reduce((s, n) => s + n.price, 0)
  const groups = (['weekday', 'weekend', 'holiday', 'newyear'] as const)
    .map((type) => {
      const list = nights.filter((n) => n.type === type)
      return { type, count: list.length, sum: list.reduce((s, n) => s + n.price, 0) }
    })
    .filter((x) => x.count > 0)
  const payingGuestsOver = Math.max(0, payingGuests(g) - house.baseGuests)
  const guestSurcharge = payingGuestsOver * EXTRA_GUEST_FEE * nights.length
  const lines = extrasLines(nights.length, g, sel)
  const extrasTotal = lines.reduce((s, l) => s + l.sum, 0)
  const discount = nights.length >= LONG_STAY.nights ? Math.round((nightsTotal + guestSurcharge) * LONG_STAY.discount) : 0
  const total = nightsTotal + guestSurcharge + extrasTotal - discount
  return { nights, groups, nightsTotal, payingGuestsOver, guestSurcharge, extrasLines: lines, extrasTotal, discount, total, prepayment: Math.round(total * PREPAYMENT_SHARE) }
}

