import { useEffect, useId, useRef, useState } from 'react'
import DatesPicker from '../components/DatesPicker'
import GuestsPicker from '../components/GuestsPicker'
import HouseCard, { type CardStatus } from '../components/HouseCard'
import { amenityLabels, houses } from '../data/houses'
import { useAvailability } from '../hooks/useAvailability'
import { useBooking } from '../hooks/useBooking'
import { usePageMeta } from '../hooks/usePageMeta'
import { isRangeFree } from '../lib/availability'
import { guestsLabel, plural } from '../lib/format'
import { guestsTotal, quote, stayProblem } from '../lib/pricing'
import type { Amenity, Guests } from '../types'
import s from './Houses.module.css'

const FILTERS: Amenity[] = ['sauna', 'fireplace', 'lake', 'pets']

/** Поле «Гости» с выпадающим блоком степперов: закрывается по клику вне, Esc и «Готово», фокус возвращается на кнопку. */
function GuestsField({ guests, onChange }: { guests: Guests; onChange: (g: Guests) => void }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const box = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const close = () => {
    setOpen(false)
    btn.current?.focus()
  }
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      btn.current?.focus()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  const pets = guests.pets ? `, ${guests.pets} ${plural(guests.pets, ['питомец', 'питомца', 'питомцев'])}` : ''
  return (
    <div
      ref={box}
      className={`field ${s.guests}`}
      // Tab за пределы блока тоже закрывает его
      onBlur={(e) => {
        if (e.relatedTarget && !box.current?.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <span id={id}>Гости</span>
      <button ref={btn} type="button" className="fieldBtn" aria-labelledby={`${id} ${id}v`} aria-expanded={open} aria-controls={`${id}p`} onClick={() => setOpen(!open)}>
        <span id={`${id}v`}>
          {guestsLabel(guestsTotal(guests))}
          {pets}
        </span>
        <span aria-hidden="true" className="fieldChevron">
          {open ? '▴' : '▾'}
        </span>
      </button>
      <div id={`${id}p`} className={`card ${s.panel}`} hidden={!open}>
        <GuestsPicker guests={guests} onChange={onChange} />
        <button type="button" className={`btn ${s.done}`} onClick={close}>
          Готово
        </button>
      </div>
    </div>
  )
}

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
        <GuestsField guests={b.guests} onChange={b.setGuests} />
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
