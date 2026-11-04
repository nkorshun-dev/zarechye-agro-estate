import { useState } from 'react'
import DatesPicker from '../components/DatesPicker'
import GuestsPicker from '../components/GuestsPicker'
import HouseCard, { type CardStatus } from '../components/HouseCard'
import { amenityLabels, houses } from '../data/houses'
import { useAvailability } from '../hooks/useAvailability'
import { useBooking } from '../hooks/useBooking'
import { usePageMeta } from '../hooks/usePageMeta'
import { isRangeFree } from '../lib/availability'
import { guestsTotal, quote, stayProblem } from '../lib/pricing'
import type { Amenity } from '../types'
import s from './Houses.module.css'

const FILTERS: Amenity[] = ['sauna', 'fireplace', 'lake', 'pets']

export default function Houses() {
  usePageMeta('Домики', 'Четыре дома в агроусадьбе «Заречье»: от уютного «Соснового» для двоих до «Большого дома» на 12 гостей.')
  const b = useBooking()
  const { busyFor } = useAvailability()
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const total = guestsTotal(b.guests)
  const hasDates = !!(b.checkIn && b.checkOut)

  const list = houses.filter((h) => h.maxGuests >= total && amenities.every((a) => h.amenities.includes(a)) && (b.guests.pets === 0 || h.pets))

  const statusOf = (slug: string): CardStatus | undefined => {
    const house = houses.find((h) => h.slug === slug)!
    if (!b.checkIn || !b.checkOut) return undefined
    if (!isRangeFree(busyFor(slug), b.checkIn, b.checkOut)) return { available: false, note: 'На эти даты занят' }
    const problem = stayProblem(house, b.checkIn, b.checkOut, b.guests)
    if (problem) return { available: false, note: problem }
    const q = quote(house, b.checkIn, b.checkOut, b.guests)
    return { available: true, total: q.total, nights: q.nights.length }
  }

  return (
    <div className="container section">
      <h1>Домики</h1>
      <div className={`card ${s.filters}`}>
        <DatesPicker checkIn={b.checkIn} checkOut={b.checkOut} onChange={b.setDates} />
        <details className={s.guests}>
          <summary>
            Гости: {total}
            {b.guests.pets ? `, животных: ${b.guests.pets}` : ''}
          </summary>
          <GuestsPicker guests={b.guests} onChange={b.setGuests} />
        </details>
        <fieldset className={s.amen}>
          <legend>Удобства</legend>
          {FILTERS.map((a) => (
            <label key={a}>
              <input type="checkbox" checked={amenities.includes(a)} onChange={(e) => setAmenities(e.target.checked ? [...amenities, a] : amenities.filter((x) => x !== a))} />
              {amenityLabels[a]}
            </label>
          ))}
        </fieldset>
      </div>
      {hasDates && <p className="muted">Показываем доступность и итоговую цену на выбранные даты.</p>}
      {list.length === 0 ? (
        <p>Под такие условия домиков нет. Попробуйте убрать часть фильтров.</p>
      ) : (
        <div className={s.grid}>
          {list.map((h) => (
            <HouseCard key={h.slug} house={h} query={b.query()} status={statusOf(h.slug)} />
          ))}
        </div>
      )}
    </div>
  )
}
