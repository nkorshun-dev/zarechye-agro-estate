import { describe, expect, it } from 'vitest'
import { houses } from '../data/houses'
import { emptyExtras } from './pricing'
import { minNightsFor, nightType, orthodoxEaster, quote, radunitsa, stayProblem } from './pricing'
import { diffDays, todayMinsk } from './dates'
import { busyNights, generateBookings, selectDay } from './availability'
import { formatPhone } from './phone-mask'

const [sosnovy, rybatsky, banny] = houses
const guests = (adults: number, childAges: number[] = [], pets = 0) => ({ adults, childAges, pets })

describe('календарные правила', () => {
  it('Пасха и Радуница', () => {
    expect(orthodoxEaster(2026)).toBe('2026-04-12')
    expect(radunitsa(2026)).toBe('2026-04-21')
    expect(radunitsa(2027)).toBe('2027-05-11')
  })
  it('типы ночей', () => {
    expect(nightType('2026-11-09')).toBe('weekday') // пн
    expect(nightType('2026-07-10')).toBe('weekend') // пт
    expect(nightType('2026-11-07')).toBe('holiday') // 7 ноября (суббота)
    expect(nightType('2026-12-31')).toBe('newyear')
    expect(nightType('2027-01-07')).toBe('holiday')
    expect(nightType('2027-01-08')).toBe('weekend') // пт после праздников
  })
  it('ночи считаются от заезда до выезда', () => {
    expect(diffDays('2026-03-28', '2026-03-30')).toBe(2) // через смену времени
    expect(todayMinsk(new Date('2026-06-30T22:30:00Z'))).toBe('2026-07-01') // в Минске уже 1 июля
  })
})

describe('цена: сверка с ручным расчётом', () => {
  it('будни низкого сезона: пн–чт, ноябрь, Сосновый, 2 гостя', () => {
    // 142 × 0.85 = 120.7 → 121 за ночь; 3 ночи = 363; предоплата 30% = 108.9 → 109
    const q = quote(sosnovy, '2026-11-09', '2026-11-12', guests(2))
    expect(q.nights.map((n) => n.price)).toEqual([121, 121, 121])
    expect(q.total).toBe(363)
    expect(q.prepayment).toBe(109)
  })
  it('выходные летом: пт–пн, июль, Рыбацкий, 4 гостя', () => {
    // пт, сб: 276 × 1.3 = 358.8 → 359; вс: 214 × 1.3 = 278.2 → 278; итого 996
    const q = quote(rybatsky, '2026-07-10', '2026-07-13', guests(4))
    expect(q.nights.map((n) => n.price)).toEqual([359, 359, 278])
    expect(q.total).toBe(996)
    expect(stayProblem(rybatsky, '2026-07-10', '2026-07-13', guests(4))).toBeNull()
  })
  it('Новый год: 4 ночи, Банный дом, 8 гостей', () => {
    // 4 × 640 = 2560; сверх базовых 6 — двое × 35 × 4 = 280; итого 2840
    const q = quote(banny, '2026-12-30', '2027-01-03', guests(8))
    expect(q.nightsTotal).toBe(2560)
    expect(q.guestSurcharge).toBe(280)
    expect(q.total).toBe(2840)
  })
  it('праздник: 7 ноября = цена выходного × 1.2 × 0.85', () => {
    // 142 → Сосновый: 188 × 1.2 = 225.6; × 0.85 = 191.76 → 192
    expect(quote(sosnovy, '2026-11-07', '2026-11-08', guests(2)).total).toBe(192)
  })
  it('скидка 10% за 7+ ночей и дети до 5 лет бесплатно', () => {
    // 7 будних/выходных ночей мая-ноября: пн 2026-11-16 → 2026-11-23: пн–чт 4×121 + пт, сб 2×(188×.85=159.8→160) + вс 121
    const q = quote(sosnovy, '2026-11-16', '2026-11-23', guests(2, [3]))
    expect(q.nightsTotal).toBe(5 * 121 + 2 * 160)
    expect(q.payingGuestsOver).toBe(0) // ребёнок 3 года не считается
    expect(q.discount).toBe(Math.round(q.nightsTotal * 0.1))
    expect(quote(sosnovy, '2026-11-16', '2026-11-18', guests(2, [6])).payingGuestsOver).toBe(1)
  })
  it('2 ночи в будни ноября: 2 × 121 = 242', () => {
    expect(quote(sosnovy, '2026-11-10', '2026-11-12', guests(2)).total).toBe(242)
  })
  it('пт–вс в июле, 6 гостей в доме на 4: 996 + 2×35×3 = 1206', () => {
    expect(quote(rybatsky, '2026-07-10', '2026-07-13', guests(6)).total).toBe(1206)
  })
  it('4 ночи с 30 декабря: 4 × 260 = 1040', () => {
    expect(quote(sosnovy, '2026-12-30', '2027-01-03', guests(2)).total).toBe(1040)
  })
  it('8 ночей в июне: 6×185 + 2×244 = 1598, скидка 160, итого 1438', () => {
    const q = quote(sosnovy, '2026-06-01', '2026-06-09', guests(2))
    expect([q.nightsTotal, q.discount, q.total]).toEqual([1598, 160, 1438])
  })
  it('доп. услуги', () => {
    const q = quote(sosnovy, '2026-11-09', '2026-11-12', guests(2), {
      ...emptyExtras, saunaSessions: [{ date: '2026-11-10', time: '19:00' }], breakfast: true, lateCheckout: true,
    })
    // баня 85 + завтраки 2×3×17=102 + поздний выезд 40
    expect(q.extrasTotal).toBe(227)
    expect(q.total).toBe(363 + 227)
  })
})

describe('минимальные ночи и ограничения', () => {
  it('будни: 1, выходные: 2, лето: 3, Новый год: 3', () => {
    expect(minNightsFor('2026-11-09', '2026-11-10').required).toBe(1)
    expect(minNightsFor('2026-11-13', '2026-11-14').required).toBe(2)
    expect(minNightsFor('2026-07-06', '2026-07-07').required).toBe(3)
    expect(minNightsFor('2026-12-30', '2026-12-31').required).toBe(3)
    expect(stayProblem(sosnovy, '2026-12-30', '2027-01-01', guests(2))).toMatch(/3 ночи/)
  })
  it('гости и животные', () => {
    expect(stayProblem(sosnovy, '2026-11-09', '2026-11-10', guests(4))).toMatch(/максимум 3/)
    expect(stayProblem(sosnovy, '2026-11-09', '2026-11-10', guests(2, [], 1))).toMatch(/питомц/)
  })
})

describe('занятость', () => {
  const today = '2026-11-03'
  it('генерация стабильна и покрывает 4 месяца', () => {
    const a = generateBookings('sosnovy', today)
    expect(a).toEqual(generateBookings('sosnovy', today))
    expect(diffDays(today, a[a.length - 1].to)).toBeGreaterThan(120)
  })
  it('клик через занятый день делает новый заезд', () => {
    const busy = new Set(['2026-11-12'])
    let r = selectDay({ checkIn: null, checkOut: null }, '2026-11-10', today, busy)
    expect(r.selection.checkIn).toBe('2026-11-10')
    expect(selectDay(r.selection, '2026-11-12', today, busy).selection).toEqual({ checkIn: '2026-11-10', checkOut: '2026-11-12' }) // выезд утром занятой ночи можно
    r = selectDay(r.selection, '2026-11-14', today, busy)
    expect(r.selection).toEqual({ checkIn: '2026-11-14', checkOut: null })
    expect(r.hint).toMatch(/занятая ночь.*выезд не выставлен/)
    expect(selectDay(r.selection, '2026-11-16', today, busy).selection).toEqual({ checkIn: '2026-11-14', checkOut: '2026-11-16' })
  })
  it('занятый день через занятые ночи: заезд остаётся', () => {
    const busy = new Set(['2026-11-12', '2026-11-13'])
    const r = selectDay({ checkIn: '2026-11-10', checkOut: null }, '2026-11-13', today, busy)
    expect(r.selection).toEqual({ checkIn: '2026-11-10', checkOut: null })
    expect(r.hint).toMatch(/не позже 12/)
  })
  it('занятый день не становится заездом', () => {
    const busy = new Set(['2026-11-12'])
    expect(selectDay({ checkIn: null, checkOut: null }, '2026-11-12', today, busy).selection.checkIn).toBeNull()
    const full = { checkIn: '2026-11-04', checkOut: '2026-11-06' }
    expect(selectDay(full, '2026-11-12', today, busy).selection).toEqual(full)
  })
  it('клик раньше заезда — новый заезд', () => {
    const r = selectDay({ checkIn: '2026-11-10', checkOut: null }, '2026-11-05', today, new Set())
    expect(r.selection).toEqual({ checkIn: '2026-11-05', checkOut: null })
    expect(r.hint).toMatch(/раньше заезда/)
  })
  it('клик по заезду сбрасывает даты', () => {
    const empty = { checkIn: null, checkOut: null }
    expect(selectDay({ checkIn: '2026-11-10', checkOut: null }, '2026-11-10', today, new Set()).selection).toEqual(empty)
    expect(selectDay({ checkIn: '2026-11-10', checkOut: '2026-11-12' }, '2026-11-10', today, new Set()).selection).toEqual(empty)
  })
  it('при выбранном диапазоне клик — новый заезд, прошедшая дата — без изменений', () => {
    const full = { checkIn: '2026-11-10', checkOut: '2026-11-12' }
    expect(selectDay(full, '2026-11-20', today, new Set()).selection).toEqual({ checkIn: '2026-11-20', checkOut: null })
    expect(selectDay(full, '2026-11-01', today, new Set()).selection).toEqual(full)
  })
  it('мин. ночи дают подсказку', () => {
    const r = selectDay({ checkIn: '2026-11-13', checkOut: null }, '2026-11-14', today, new Set())
    expect(r.selection.checkOut).toBeNull()
    expect(r.hint).toMatch(/минимум 2 ночи/)
  })
  it('бронь пользователя блокирует ночи', () => {
    const mine = [{ houseSlug: 'sosnovy', checkIn: '2026-11-20', checkOut: '2026-11-22' }] as never
    const busy = busyNights('sosnovy', today, mine)
    expect(busy.has('2026-11-20') && busy.has('2026-11-21')).toBe(true)
  })
})

describe('маска телефона', () => {
  it('форматирует разные виды ввода', () => {
    expect(formatPhone('291234567')).toBe('+375 (29) 123-45-67')
    expect(formatPhone('80291234567')).toBe('+375 (29) 123-45-67')
    expect(formatPhone('+375 29 1')).toBe('+375 (29) 1')
  })
})
