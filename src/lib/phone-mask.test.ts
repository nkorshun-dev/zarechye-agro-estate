import { describe, expect, it } from 'vitest'
import { formatPhone } from './phone-mask'

describe('formatPhone', () => {
  it('принимает номер в любом виде', () => {
    for (const raw of ['291234567', '+375291234567', '375291234567', '80291234567', '+375 29 123-45-67', '+375 (29) 123-45-67'])
      expect(formatPhone(raw)).toBe('+375 (29) 123-45-67')
  })
  it('набранный по символам префикс 375/80 не становится кодом оператора', () => {
    expect(formatPhone('+375 (37')).toBe('+375 (37)') // ещё неясно, промежуточное состояние
    expect(formatPhone('+375 (375')).toBe('+375')
    expect(formatPhone('+375 (80')).toBe('+375')
    expect(formatPhone('+375 (8')).toBe('+375 (8')
    expect(formatPhone('+375 (33) 7')).toBe('+375 (33) 7')
  })
  it('стёртый префикс даёт пустой номер', () => {
    expect(formatPhone('+37')).toBe('+375')
    expect(formatPhone('')).toBe('')
  })
})
