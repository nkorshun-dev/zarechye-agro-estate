import { guestsTotal } from '../lib/pricing'
import type { Guests, House } from '../types'
import s from './GuestsPicker.module.css'

interface Props {
  guests: Guests
  house?: House
  onChange: (g: Guests) => void
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className={s.row}>
      <span id={`st-${label}`}>{label}</span>
      <div className={s.step} role="group" aria-labelledby={`st-${label}`}>
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Меньше: ${label}`}>
          −
        </button>
        <output aria-live="polite">{value}</output>
        <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Больше: ${label}`}>
          +
        </button>
      </div>
    </div>
  )
}

export default function GuestsPicker({ guests, house, onChange }: Props) {
  const max = house?.maxGuests ?? 12
  const total = guestsTotal(guests)
  const full = total >= max
  const setAge = (i: number, age: number) => onChange({ ...guests, childAges: guests.childAges.map((a, j) => (j === i ? age : a)) })
  return (
    <div className={s.box}>
      <Stepper label="Взрослые" value={guests.adults} min={1} max={full ? guests.adults : max - guests.childAges.length} onChange={(v) => onChange({ ...guests, adults: v })} />
      <Stepper
        label="Дети"
        value={guests.childAges.length}
        min={0}
        max={full ? guests.childAges.length : 10}
        onChange={(v) => onChange({ ...guests, childAges: v > guests.childAges.length ? [...guests.childAges, 7] : guests.childAges.slice(0, v) })}
      />
      {guests.childAges.map((age, i) => (
        <label key={i} className={`field ${s.age}`}>
          Возраст ребёнка {i + 1}
          <select value={age} onChange={(e) => setAge(i, Number(e.target.value))}>
            {Array.from({ length: 18 }, (_, a) => (
              <option key={a} value={a}>
                {a === 0 ? 'до 1 года' : a}
              </option>
            ))}
          </select>
        </label>
      ))}
      <Stepper label="Животные" value={guests.pets} min={0} max={house && !house.pets ? 0 : 2} onChange={(v) => onChange({ ...guests, pets: v })} />
      <p className={`muted ${s.hint}`}>
        {house ? `Всего до ${house.maxGuests} гостей, базовая цена на ${house.baseGuests}. ` : ''}Дети до 5 лет бесплатно.
        {house && !house.pets && ' В этот домик с животными нельзя.'}
      </p>
    </div>
  )
}
