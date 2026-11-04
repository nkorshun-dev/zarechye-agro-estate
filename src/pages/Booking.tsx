import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BookingForm, { type ContactValues } from '../components/BookingForm'
import DateRangeCalendar from '../components/DateRangeCalendar'
import GuestsPicker from '../components/GuestsPicker'
import ExtrasPicker from '../components/ExtrasPicker'
import PriceBreakdown from '../components/PriceBreakdown'
import { estate, route } from '../data/estate'
import { houses } from '../data/houses'
import { useAvailability } from '../hooks/useAvailability'
import { useBooking } from '../hooks/useBooking'
import { usePageMeta } from '../hooks/usePageMeta'
import { useToast } from '../hooks/useToast'
import { isRangeFree } from '../lib/availability'
import { diffDays } from '../lib/dates'
import { formatDateFull, formatMoney, guestsLabel, nightsLabel } from '../lib/format'
import { downloadICS } from '../lib/ics'
import { emptyExtras, guestsTotal, nightPrice, quote, stayProblem } from '../lib/pricing'
import type { ExtrasSelection, StoredBooking } from '../types'
import s from './Booking.module.css'

const STEPS = ['Даты и гости', 'Услуги', 'Контакты']

export default function Booking() {
  usePageMeta('Бронирование', 'Выберите домик, даты и услуги, и сразу увидите итоговую цену. Демо: бронь сохраняется только в вашем браузере.')
  const b = useBooking()
  const { today, busy, addBooking } = useAvailability(b.house?.slug)
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [extras, setExtras] = useState<ExtrasSelection>(emptyExtras)
  const [submitting, setSubmitting] = useState(false)
  const sent = useRef(false) // защита от двойной отправки в тот же такт
  const [done, setDone] = useState<StoredBooking | null>(null)

  const { house, checkIn, checkOut, guests } = b
  const ready = !!(house && checkIn && checkOut)
  const problem = ready ? (!isRangeFree(busy, checkIn, checkOut) ? 'На эти даты домик уже занят.' : stayProblem(house, checkIn, checkOut, guests)) : null
  const canNext = ready && !problem

  const again = () => {
    setDone(null)
    setStep(0)
    setExtras(emptyExtras)
    b.setDates(null, null)
  }

  if (done) return <Success booking={done} onAgain={again} />

  const submit = (c: ContactValues) => {
    if (!house || !checkIn || !checkOut || sent.current) return
    sent.current = true
    setSubmitting(true)
    window.setTimeout(() => {
      const q = quote(house, checkIn, checkOut, guests, extras)
      const booking: StoredBooking = {
        id: `ZR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        houseSlug: house.slug,
        checkIn,
        checkOut,
        guests,
        total: q.total,
        prepayment: q.prepayment,
        name: c.name,
        phone: c.phone,
        createdAt: new Date().toISOString(),
      }
      addBooking(booking)
      sent.current = false
      setSubmitting(false)
      setDone(booking)
      toast('Бронь оформлена (демо)')
      window.scrollTo(0, 0)
    }, 1000)
  }

  return (
    <div className="container section">
      <h1>Бронирование</h1>
      <ol className={s.steps} aria-label="Шаги">
        {STEPS.map((t, i) => (
          <li key={t} aria-current={i === step ? 'step' : undefined} className={i === step ? s.cur : i < step ? s.past : ''}>
            {i + 1}. {t}
          </li>
        ))}
      </ol>

      <div className={s.layout}>
        <div>
          {step === 0 && (
            <>
              <h2>Домик</h2>
              <div className={s.houses} role="radiogroup" aria-label="Домик">
                {houses.map((h) => (
                  <label key={h.slug} className={`card ${s.house} ${house?.slug === h.slug ? s.sel : ''}`}>
                    <input type="radio" name="house" checked={house?.slug === h.slug} onChange={() => b.setHouse(h.slug)} />
                    <strong>{h.name}</strong>
                    <span className="muted">
                      до {h.maxGuests} гостей, от {formatMoney(h.priceWeekday)}
                    </span>
                  </label>
                ))}
              </div>
              {house ? (
                <>
                  <h2>Даты</h2>
                  <DateRangeCalendar
                    today={today}
                    busy={busy}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onChange={(sel) => b.setDates(sel.checkIn, sel.checkOut)}
                    priceFor={(d) => nightPrice(house, d).price}
                  />
                  <h2>Гости</h2>
                  <GuestsPicker guests={guests} house={house} onChange={b.setGuests} />
                  {problem && <p className="error">{problem}</p>}
                </>
              ) : (
                <p className="muted">Сначала выберите домик.</p>
              )}
              <div className={s.actions}>
                <span />
                <button type="button" className="btn" disabled={!canNext} onClick={() => setStep(1)}>
                  Далее: услуги
                </button>
              </div>
            </>
          )}

          {step === 1 && ready && (
            <>
              <h2>Дополнительные услуги</h2>
              <ExtrasPicker checkIn={checkIn} checkOut={checkOut} value={extras} onChange={setExtras} />
              <div className={s.actions}>
                <button type="button" className="btn btnGhost" onClick={() => setStep(0)}>
                  Назад
                </button>
                <button type="button" className="btn" onClick={() => setStep(2)}>
                  Далее: контакты
                </button>
              </div>
            </>
          )}

          {step === 2 && ready && (
            <>
              <h2>Контакты</h2>
              <BookingForm submitting={submitting} onBack={() => setStep(1)} onSubmit={submit} />
              <p className={`muted ${s.demo}`}>Демо-режим: бронирование не отправляется.</p>
            </>
          )}
        </div>

        <aside className={s.side}>
          {house && <PriceBreakdown house={house} checkIn={checkIn} checkOut={checkOut} guests={guests} extras={extras} problem={problem} />}
        </aside>
      </div>
    </div>
  )
}

function Success({ booking, onAgain }: { booking: StoredBooking; onAgain: () => void }) {
  const house = houses.find((h) => h.slug === booking.houseSlug)!
  const nights = diffDays(booking.checkIn, booking.checkOut)
  return (
    <div className="container section">
      <div className={`card ${s.success}`}>
        <h1>Бронь принята</h1>
        <p>
          Номер брони: <strong>{booking.id}</strong>
        </p>
        <ul className={s.summary}>
          <li>Домик: {house.name}</li>
          <li>
            {formatDateFull(booking.checkIn)} — {formatDateFull(booking.checkOut)}, {nightsLabel(nights)}
          </li>
          <li>{guestsLabel(guestsTotal(booking.guests))}</li>
          <li>Итого: {formatMoney(booking.total)}, предоплата {formatMoney(booking.prepayment)}</li>
          <li>Заезд с {estate.checkIn}, выезд до {estate.checkOut}</li>
        </ul>
        <div className={s.cols}>
          <div>
            <h2>Что взять с собой</h2>
            <ul>{route.bring.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
          <div>
            <h2>Как добраться</h2>
            <p>{route.car[1]}</p>
            <p>
              <Link to="/contacts">Маршрут и карта</Link>
            </p>
          </div>
        </div>
        <button type="button" className="btn" onClick={() => downloadICS(booking, house)}>
          Добавить в календарь (.ics)
        </button>{' '}
        <button type="button" className="btn btnGhost" onClick={onAgain}>
          Забронировать ещё
        </button>
        <p className={`muted ${s.demo}`}>Демо-режим: бронирование не отправляется. Даты заблокированы только в вашем браузере.</p>
      </div>
    </div>
  )
}
