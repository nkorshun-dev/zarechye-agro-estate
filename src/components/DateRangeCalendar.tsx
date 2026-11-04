import { useEffect, useRef, useState } from 'react'
import { selectDay, type Selection } from '../lib/availability'
import { addDays, addMonths, daysInMonth, startOfMonth, weekday } from '../lib/dates'
import { formatDateWeekday, formatMonth, formatMoney } from '../lib/format'
import { nightType } from '../lib/pricing'
import s from './DateRangeCalendar.module.css'

interface Props {
  today: string
  busy: Set<string>
  checkIn: string | null
  checkOut: string | null
  onChange: (sel: Selection) => void
  /** Цена ночи для подписи в ячейке и aria-label; без неё цены не показываются. */
  priceFor?: (iso: string) => number
  months?: number
}

const WEEK = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

export default function DateRangeCalendar({ today, busy, checkIn, checkOut, onChange, priceFor, months = 2 }: Props) {
  const [view, setView] = useState(startOfMonth(checkIn ?? today))
  const [focus, setFocus] = useState(checkIn ?? today)
  const [hint, setHint] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const needFocus = useRef(false)

  useEffect(() => {
    if (!needFocus.current) return
    needFocus.current = false
    root.current?.querySelector<HTMLButtonElement>(`[data-d="${focus}"]`)?.focus()
  })

  const lastMonth = addMonths(startOfMonth(today), 4) // последний месяц, для которого сгенерирована занятость (5 месяцев с начала текущего)
  const moveFocus = (d: string) => {
    if (d < today || d >= addMonths(lastMonth, 1)) return
    setFocus(d)
    if (d < view) setView(startOfMonth(d))
    else if (d >= addMonths(view, months)) setView(addMonths(startOfMonth(d), -(months - 1)))
    needFocus.current = true
  }
  const shiftView = (n: number) => {
    const next = addMonths(view, n)
    if (next < startOfMonth(today) || addMonths(next, months - 1) > lastMonth) return
    setView(next)
  }

  const click = (d: string) => {
    setFocus(d)
    const r = selectDay({ checkIn, checkOut }, d, today, busy)
    setHint(r.hint)
    if (r.selection.checkIn !== checkIn || r.selection.checkOut !== checkOut) onChange(r.selection)
  }

  const onKey = (e: React.KeyboardEvent) => {
    const moves: Record<string, string> = {
      ArrowLeft: addDays(focus, -1),
      ArrowRight: addDays(focus, 1),
      ArrowUp: addDays(focus, -7),
      ArrowDown: addDays(focus, 7),
      PageUp: addMonths(focus, -1),
      PageDown: addMonths(focus, 1),
      Home: addDays(focus, -((weekday(focus) + 6) % 7)),
      End: addDays(focus, 6 - ((weekday(focus) + 6) % 7)),
    }
    if (moves[e.key]) {
      e.preventDefault()
      moveFocus(moves[e.key])
    }
  }

  const label = (d: string): string => {
    const state = d < today ? 'дата прошла' : busy.has(d) ? 'ночь занята' : d === checkIn ? 'заезд' : d === checkOut ? 'выезд' : 'свободно'
    const type = nightType(d)
    const kind = type === 'newyear' ? ', новогодняя ночь' : type === 'holiday' ? ', праздничный день' : ''
    const price = priceFor && d >= today && !busy.has(d) ? `, ${formatMoney(priceFor(d))} за ночь` : ''
    return `${formatDateWeekday(d)}: ${state}${kind}${price}`
  }

  const baseHint = !checkIn ? 'Выберите дату заезда.' : !checkOut ? 'Теперь выберите дату выезда.' : ''

  return (
    <div ref={root} className={s.wrap}>
      <div className={s.nav}>
        <button type="button" onClick={() => shiftView(-1)} disabled={view <= startOfMonth(today)} aria-label="Предыдущий месяц">
          ←
        </button>
        <button type="button" onClick={() => shiftView(1)} disabled={addMonths(view, months) > lastMonth} aria-label="Следующий месяц">
          →
        </button>
      </div>
      <div className={s.months} onKeyDown={onKey}>
        {Array.from({ length: months }, (_, m) => {
          const first = addMonths(view, m)
          const count = daysInMonth(first)
          const offset = (weekday(first) + 6) % 7
          return (
            <section key={first} aria-label={formatMonth(first)} className={s.month}>
              <h3 className={s.title}>{formatMonth(first)}</h3>
              <div className={s.grid}>
                {WEEK.map((w) => (
                  <span key={w} className={s.dow} aria-hidden="true">
                    {w}
                  </span>
                ))}
                {Array.from({ length: offset }, (_, i) => (
                  <span key={`e${i}`} />
                ))}
                {Array.from({ length: count }, (_, i) => {
                  const d = addDays(first, i)
                  const isPast = d < today
                  const isBusy = !isPast && busy.has(d)
                  const inRange = checkIn && checkOut && d > checkIn && d < checkOut
                  const type = nightType(d)
                  const cls = [
                    s.day,
                    isPast && s.past,
                    isBusy && s.busy,
                    (d === checkIn || d === checkOut) && s.edge,
                    inRange && s.range,
                    !isPast && !isBusy && (type === 'holiday' || type === 'newyear') && s.holiday,
                  ]
                    .filter(Boolean)
                    .join(' ')
                  return (
                    <button
                      key={d}
                      type="button"
                      data-d={d}
                      className={cls}
                      tabIndex={d === focus ? 0 : -1}
                      aria-label={label(d)}
                      aria-pressed={d === checkIn || d === checkOut || !!inRange}
                      aria-disabled={isPast || isBusy}
                      onClick={() => click(d)}
                    >
                      <span>{Number(d.slice(8))}</span>
                      {priceFor && !isPast && !isBusy && <small>{priceFor(d)}</small>}
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
      <p className={s.hint} role="status" aria-live="polite">
        {hint || baseHint}
      </p>
      <ul className={s.legend} aria-label="Обозначения">
        <li><i className={s.swFree} /> свободно</li>
        <li><i className={s.swBusy} /> занято</li>
        <li><i className={s.swSel} /> выбрано</li>
        <li><i className={s.swHol} /> праздник</li>
      </ul>
    </div>
  )
}
