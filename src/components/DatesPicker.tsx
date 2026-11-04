import { useState } from 'react'
import { useAvailability } from '../hooks/useAvailability'
import { formatDate } from '../lib/format'
import DateRangeCalendar from './DateRangeCalendar'
import Modal from './Modal'
import s from './DatesPicker.module.css'

interface Props {
  checkIn: string | null
  checkOut: string | null
  onChange: (checkIn: string | null, checkOut: string | null) => void
}

/** Кнопка с датами, по клику — календарь в модалке (для поиска без выбранного домика). */
export default function DatesPicker({ checkIn, checkOut, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const { today } = useAvailability()
  return (
    <>
      <button type="button" className={s.btn} onClick={() => setOpen(true)}>
        <span className={s.cap}>Даты</span>
        {checkIn && checkOut ? `${formatDate(checkIn)} — ${formatDate(checkOut)}` : 'Выберите даты'}
      </button>
      <Modal open={open} title="Даты поездки" onClose={() => setOpen(false)} wide>
        <DateRangeCalendar
          today={today}
          busy={new Set()}
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={(sel) => {
            onChange(sel.checkIn, sel.checkOut)
            if (sel.checkOut) setOpen(false)
          }}
        />
      </Modal>
    </>
  )
}
