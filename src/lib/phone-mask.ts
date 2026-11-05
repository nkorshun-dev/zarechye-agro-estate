/** Маска белорусского номера: +375 (29) 123-45-67. Принимает ввод и вставку в любом виде (8029…, 375…, 29…). */
export const formatPhone = (input: string): string => {
  // «+375» маски (или его стёртая часть) — не номер; затем снимаем набранный пользователем 375/80:
  // кодов оператора на 37 и 80 нет, поэтому «+375 (375…» и «+375 (80…» — это префикс, а не номер.
  const d = input.replace(/^\s*\+(375|37|3)?/, '').replace(/\D/g, '').replace(/^375/, '').replace(/^80/, '').slice(0, 9)
  if (d.length === 0) return input.length > 0 ? '+375' : ''
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)]
  let out = `+375 (${parts[0]}`
  if (parts[0].length === 2) out += ')'
  if (parts[1]) out += ` ${parts[1]}`
  if (parts[2]) out += `-${parts[2]}`
  if (parts[3]) out += `-${parts[3]}`
  return out
}
