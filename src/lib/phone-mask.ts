/** Маска белорусского номера: +375 (29) 123-45-67. Принимает ввод и вставку в любом виде (8029…, 375…, 29…). */
export const formatPhone = (input: string): string => {
  let d = input.replace(/\D/g, '')
  if (d.startsWith('80')) d = '375' + d.slice(2)
  else if (!d.startsWith('375')) d = '375' + d
  d = d.slice(3, 12)
  if (d.length === 0) return input.length > 0 ? '+375' : ''
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)]
  let out = `+375 (${parts[0]}`
  if (parts[0].length === 2) out += ')'
  if (parts[1]) out += ` ${parts[1]}`
  if (parts[2]) out += `-${parts[2]}`
  if (parts[3]) out += `-${parts[3]}`
  return out
}
