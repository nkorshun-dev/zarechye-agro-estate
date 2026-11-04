import { formatDate, formatMoney, nightsLabel } from '../lib/format'
import { quote } from '../lib/pricing'
import type { ExtrasSelection, Guests, House, NightType } from '../types'
import { LONG_STAY, PREPAYMENT_SHARE } from '../data/pricing'
import { guestsLabel } from '../lib/format'
import s from './PriceBreakdown.module.css'

const labels: Record<NightType, string> = { weekday: 'Будни', weekend: 'Выходные (пт–сб)', holiday: 'Праздничные ночи', newyear: 'Новогодние ночи' }

interface Props {
  house: House
  checkIn: string | null
  checkOut: string | null
  guests: Guests
  extras?: ExtrasSelection
  problem?: string | null
}

export default function PriceBreakdown({ house, checkIn, checkOut, guests, extras, problem }: Props) {
  if (!checkIn || !checkOut) {
    return (
      <div className={`card ${s.box}`}>
        <h3>{house.name}</h3>
        <p className="muted">Выберите даты заезда и выезда, и мы посчитаем стоимость.</p>
      </div>
    )
  }
  const q = quote(house, checkIn, checkOut, guests, extras)
  return (
    <div className={`card ${s.box}`} aria-live="polite">
      <h3>{house.name}</h3>
      <p className="muted">
        {formatDate(checkIn)} — {formatDate(checkOut)}, {nightsLabel(q.nights.length)}
      </p>
      {problem && <p className="error">{problem}</p>}
      <ul className={s.list}>
        {q.groups.map((g) => (
          <li key={g.type}>
            <details>
              <summary>
                <span>
                  {labels[g.type]}: {nightsLabel(g.count)}
                </span>
                <span>{formatMoney(g.sum)}</span>
              </summary>
              <ul className={s.nights}>
                {q.nights.filter((n) => n.type === g.type).map((n) => (
                  <li key={n.date}>
                    <span>{formatDate(n.date)}</span>
                    <span>{formatMoney(n.price)}</span>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
        {q.guestSurcharge > 0 && (
          <li className={s.line}>
            <span>
              Доплата: {guestsLabel(q.payingGuestsOver)} сверх {house.baseGuests}
            </span>
            <span>{formatMoney(q.guestSurcharge)}</span>
          </li>
        )}
        {q.extrasLines.map((l) => (
          <li key={l.label} className={s.line}>
            <span>{l.label}</span>
            <span>{formatMoney(l.sum)}</span>
          </li>
        ))}
        {q.discount > 0 && (
          <li className={`${s.line} ${s.discount}`}>
            <span>Скидка {LONG_STAY.discount * 100}% за {LONG_STAY.nights}+ ночей</span>
            <span>−{formatMoney(q.discount)}</span>
          </li>
        )}
      </ul>
      <p className={s.total}>
        <span>Итого</span>
        <strong>{formatMoney(q.total)}</strong>
      </p>
      <p className="muted">Предоплата {PREPAYMENT_SHARE * 100}%: {formatMoney(q.prepayment)}</p>
    </div>
  )
}
