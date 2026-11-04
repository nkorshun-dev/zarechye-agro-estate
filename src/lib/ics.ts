import { estate } from '../data/estate'
import type { House, StoredBooking } from '../types'

const ymd = (iso: string) => iso.replaceAll('-', '')

/** Событие на весь день: DTEND в формате DATE не включается, то есть это дата выезда. */
export const buildICS = (b: StoredBooking, house: House): string =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zarechye//Demo//RU',
    'BEGIN:VEVENT',
    `UID:${b.id}@zarechye.demo`,
    `DTSTAMP:${b.createdAt.replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${ymd(b.checkIn)}`,
    `DTEND;VALUE=DATE:${ymd(b.checkOut)}`,
    `SUMMARY:Заречье: ${house.name}`,
    `LOCATION:${estate.address}`,
    `DESCRIPTION:Бронь ${b.id}. Заезд с ${estate.checkIn}\\, выезд до ${estate.checkOut}. Тел. ${estate.phone}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

export const downloadICS = (b: StoredBooking, house: House): void => {
  const url = URL.createObjectURL(new Blob([buildICS(b, house)], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `zarechye-${b.id}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
