export const validateName = (v: string): string | null =>
  v.trim().split(/\s+/).filter((w) => w.length >= 2).length >= 2 ? null : 'Укажите фамилию и имя'

export const validatePhone = (v: string): string | null =>
  /^\+375 \((25|29|33|44)\) \d{3}-\d{2}-\d{2}$/.test(v) ? null : 'Номер в формате +375 (29) 123-45-67'

export const validateEmail = (v: string): string | null =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'Проверьте адрес почты'
