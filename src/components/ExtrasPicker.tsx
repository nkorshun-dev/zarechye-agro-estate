import { useEffect, useState } from 'react'
import { extras, SAUNA_TIMES } from '../data/extras'
import { eachNight } from '../lib/dates'
import { formatDateWeekday, formatMoney } from '../lib/format'
import type { ExtrasSelection } from '../types'
import s from './ExtrasPicker.module.css'

interface Props {
  checkIn: string
  checkOut: string
  value: ExtrasSelection
  onChange: (v: ExtrasSelection) => void
}

const price = (id: string) => extras.find((e) => e.id === id)!
// Месяцы работы (как в описании услуг): сап с мая по сентябрь, лодка с мая по октябрь.
const SEASON = { sup: [5, 9], boat: [5, 10] }

export default function ExtrasPicker({ checkIn, checkOut, value, onChange }: Props) {
  const nights = eachNight(checkIn, checkOut)
  const [date, setDate] = useState(nights[0])
  const [time, setTime] = useState(SAUNA_TIMES[3])
  const set = (patch: Partial<ExtrasSelection>) => onChange({ ...value, ...patch })
  const days = nights.length
  const open = (key: 'sup' | 'boat') => nights.every((n) => Number(n.slice(5, 7)) >= SEASON[key][0] && Number(n.slice(5, 7)) <= SEASON[key][1])
  const closed = { sup: !open('sup'), boat: !open('boat') }
  useEffect(() => {
    if ((closed.sup && value.sup) || (closed.boat && value.boat)) onChange({ ...value, sup: closed.sup ? 0 : value.sup, boat: closed.boat ? 0 : value.boat })
  })
  const num = (key: 'sup' | 'boat' | 'transfer', max: number) => (
    <input
      type="number"
      min={0}
      max={max}
      value={value[key]}
      aria-label="Количество"
      onChange={(e) => set({ [key]: Math.min(max, Math.max(0, Number(e.target.value) || 0)) })}
    />
  )
  const item = (id: keyof ExtrasSelection, control: React.ReactNode) => {
    const e = price(id)
    return (
      <div className={`card ${s.item}`}>
        <div>
          <h3>{e.name}</h3>
          <p className="muted">{e.description}</p>
          <p className={s.price}>
            {formatMoney(e.price)} <span className="muted">{e.unit}</span>
          </p>
        </div>
        <div className={s.control}>{control}</div>
      </div>
    )
  }
  return (
    <div className={s.list}>
      {item(
        'saunaSessions',
        <>
          <div className={s.sauna}>
            <label className="field">
              День
              <select value={date} onChange={(e) => setDate(e.target.value)}>
                {nights.map((n) => (
                  <option key={n} value={n}>
                    {formatDateWeekday(n)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Время
              <select value={time} onChange={(e) => setTime(e.target.value)}>
                {SAUNA_TIMES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="btn btnGhost"
              onClick={() => {
                if (value.saunaSessions.some((x) => x.date === date && x.time === time)) return
                set({ saunaSessions: [...value.saunaSessions, { date, time }] })
              }}
            >
              Добавить сеанс
            </button>
          </div>
          <ul className={s.sessions}>
            {value.saunaSessions.map((x) => (
              <li key={x.date + x.time}>
                {formatDateWeekday(x.date)}, {x.time}–{String(Number(x.time.slice(0, 2)) + 3).padStart(2, '0')}:00
                <button type="button" onClick={() => set({ saunaSessions: value.saunaSessions.filter((y) => y !== x) })} aria-label={`Убрать сеанс ${x.date} ${x.time}`}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </>,
      )}
      {item(
        'breakfast',
        <label className={s.check}>
          <input type="checkbox" checked={value.breakfast} onChange={(e) => set({ breakfast: e.target.checked })} />
          На все {days} дн.
        </label>,
      )}
      {item('sup', closed.sup ? <span className="muted">Не в сезон: {price('sup').season}</span> : <label className={s.num}>Дней: {num('sup', days)}</label>)}
      {item('boat', closed.boat ? <span className="muted">Не в сезон: {price('boat').season}</span> : <label className={s.num}>Дней: {num('boat', days)}</label>)}
      {item('transfer', <label className={s.num}>Поездок: {num('transfer', 2)}</label>)}
      {item(
        'lateCheckout',
        <label className={s.check}>
          <input type="checkbox" checked={value.lateCheckout} onChange={(e) => set({ lateCheckout: e.target.checked })} />
          Нужен
        </label>,
      )}
    </div>
  )
}
