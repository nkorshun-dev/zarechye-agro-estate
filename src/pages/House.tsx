import { Link, useNavigate, useParams } from 'react-router-dom'
import DateRangeCalendar from '../components/DateRangeCalendar'
import Gallery from '../components/Gallery'
import GuestsPicker from '../components/GuestsPicker'
import PriceBreakdown from '../components/PriceBreakdown'
import { estate } from '../data/estate'
import { amenityIcons, amenityLabels, getHouse } from '../data/houses'
import { useAvailability } from '../hooks/useAvailability'
import { useBooking } from '../hooks/useBooking'
import { usePageMeta } from '../hooks/usePageMeta'
import { isRangeFree } from '../lib/availability'
import { formatMoney, plural } from '../lib/format'
import { nightPrice, quote, stayProblem } from '../lib/pricing'
import NotFound from './NotFound'
import s from './House.module.css'

export default function House() {
  const { slug } = useParams()
  const house = getHouse(slug)
  usePageMeta(house?.name ?? 'Домик не найден', house?.description)
  const b = useBooking(house)
  const { today, busy } = useAvailability(house?.slug)
  const nav = useNavigate()
  if (!house) return <NotFound />

  const ready = !!(b.checkIn && b.checkOut)
  const free = ready && isRangeFree(busy, b.checkIn!, b.checkOut!)
  const problem = ready ? (!free ? 'На эти даты домик занят.' : stayProblem(house, b.checkIn!, b.checkOut!, b.guests)) : null
  const total = ready && !problem ? quote(house, b.checkIn!, b.checkOut!, b.guests).total : null
  const go = () => nav(`/booking${b.query(house.slug)}`)

  return (
    <div className="container section">
      <p>
        <Link to={`/houses${b.query()}`} className={s.back}>← Все домики</Link>
      </p>
      <h1>{house.name}</h1>
      <p className="muted">{house.tagline}</p>
      <Gallery images={house.images} name={house.name} />

      <div className={s.layout}>
        <div>
          <section>
            <p className={s.desc}>{house.description}</p>
            <ul className={s.facts}>
              <li><strong>{house.baseGuests}</strong> гостей в цене, максимум <strong>{house.maxGuests}</strong></li>
              <li><strong>{house.bedrooms}</strong> {plural(house.bedrooms, ['спальня', 'спальни', 'спален'])}</li>
              <li><strong>{house.area} м²</strong></li>
              <li>{house.pets ? 'Можно с питомцами' : 'Без питомцев'}</li>
            </ul>
          </section>
          <section>
            <h2>Удобства</h2>
            <ul className={s.amen}>
              {house.amenities.map((a) => (
                <li key={a}>
                  <span aria-hidden="true">{amenityIcons[a]}</span> {amenityLabels[a]}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Правила</h2>
            <ul className={s.rules}>
              <li>Заезд с {estate.checkIn}, выезд до {estate.checkOut}</li>
              <li>Тишина после 23:00</li>
              <li>Животные: {house.pets ? 'да, до двух' : 'нет'}</li>
              <li>Курение только на террасе</li>
            </ul>
          </section>
          <section>
            <h2>Календарь и цены</h2>
            <p className="muted">Цена за ночь указана в каждом дне. Выберите заезд и выезд.</p>
            <DateRangeCalendar
              today={today}
              busy={busy}
              checkIn={b.checkIn}
              checkOut={b.checkOut}
              onChange={(sel) => b.setDates(sel.checkIn, sel.checkOut)}
              priceFor={(d) => nightPrice(house, d).price}
            />
          </section>
        </div>

        <aside className={s.panel} aria-label="Бронирование">
          <div className={`card ${s.panelBox}`}>
            <h2>Бронирование</h2>
            <GuestsPicker guests={b.guests} house={house} onChange={b.setGuests} />
          </div>
          <PriceBreakdown house={house} checkIn={b.checkIn} checkOut={b.checkOut} guests={b.guests} problem={problem} />
          <button type="button" className="btn" disabled={!ready || !!problem} onClick={go}>
            Забронировать
          </button>
        </aside>
      </div>

      <div className={s.bar}>
        <div>
          <strong>{total !== null ? formatMoney(total) : `от ${formatMoney(house.priceWeekday)}`}</strong>
          <span className="muted">{total !== null ? ' за всё' : ' / ночь'}</span>
        </div>
        <button type="button" className="btn" disabled={!ready || !!problem} onClick={go}>
          Забронировать
        </button>
      </div>
    </div>
  )
}
