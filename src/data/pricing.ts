// Все цены и правила расчёта живут здесь — меняйте числа, логика в lib/pricing.ts подхватит.
export const CURRENCY = 'BYN'

export const SEASONS = {
  high: { months: [6, 7, 8], coefficient: 1.3, label: 'высокий сезон' },
  low: { months: [11, 3], coefficient: 0.85, label: 'низкий сезон' },
  regular: { coefficient: 1.0, label: 'межсезонье' },
}

// Новогодние ночи (месяц-день): цена фиксированная, у каждого домика своя (priceNewYear).
export const NEW_YEAR = { from: '12-30', to: '01-06' }

// Праздничные даты Беларуси; Радуница считается в lib/pricing.ts (дата переходящая).
export const FIXED_HOLIDAYS = ['01-01', '01-02', '01-07', '03-08', '05-01', '05-09', '07-03', '11-07', '12-25']

export const HOLIDAY_MARKUP = 1.2 // наценка к цене выходной ночи
export const EXTRA_GUEST_FEE = 35 // BYN за гостя сверх базовой вместимости за ночь
export const FREE_CHILD_UNDER = 5 // дети младше этого возраста — бесплатно
export const LONG_STAY = { nights: 7, discount: 0.1 }
export const PREPAYMENT_SHARE = 0.3

export const MIN_NIGHTS = { weekend: 2, holiday: 2, highSeason: 3, newYear: 3 }

export const MIN_NIGHTS_REASON: Record<number, string> = {
  3: 'На новогодние праздники и в высокий сезон (июнь–август) минимум 3 ночи.',
  2: 'В выходные (пт–сб) и праздничные дни минимум 2 ночи.',
}
