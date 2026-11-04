import { Link } from 'react-router-dom'
import { amenityIcons, amenityLabels } from '../data/houses'
import { formatMoney, plural } from '../lib/format'
import type { House } from '../types'
import s from './HouseCard.module.css'

export interface CardStatus {
  available: boolean
  note?: string // почему недоступно
  total?: number
  nights?: number
}

interface Props {
  house: House
  query: string
  status?: CardStatus
}

export default function HouseCard({ house, query, status }: Props) {
  const unavailable = status && !status.available
  return (
    <article className={`card ${s.card} ${unavailable ? s.dim : ''}`}>
      <Link to={`/houses/${house.slug}${query}`} className={s.photo} tabIndex={-1} aria-hidden="true">
        <img src={house.images[0].replace('w=1400', 'w=800')} alt="" loading="lazy" />
      </Link>
      <div className={s.body}>
        <h3>
          <Link to={`/houses/${house.slug}${query}`}>{house.name}</Link>
        </h3>
        <p className="muted">{house.tagline}</p>
        <p className={s.meta}>
          до {house.maxGuests} гостей · {house.bedrooms} {plural(house.bedrooms, ['спальня', 'спальни', 'спален'])} · {house.area} м²
        </p>
        <ul className={s.tags}>
          {house.amenities.filter((a) => ['sauna', 'fireplace', 'lake', 'pets'].includes(a)).map((a) => (
            <li key={a}>
              <span aria-hidden="true">{amenityIcons[a]}</span> {amenityLabels[a]}
            </li>
          ))}
        </ul>
        <div className={s.price}>
          {status?.available && status.total !== undefined ? (
            <p>
              <strong>{formatMoney(status.total)}</strong> <span className="muted">за {status.nights} н.</span>
            </p>
          ) : unavailable ? (
            <p className={s.note}>{status?.note}</p>
          ) : (
            <p>
              от <strong>{formatMoney(house.priceWeekday)}</strong> <span className="muted">/ночь</span>
            </p>
          )}
          <Link to={`/houses/${house.slug}${query}`} className="btn btnGhost">
            Подробнее
          </Link>
        </div>
      </div>
    </article>
  )
}
