import { useId, useState } from 'react'
import { useAvailability } from '../hooks/useAvailability'
import { formatDate } from '../lib/format'
import DateRangeCalendar from './DateRangeCalendar'
import Modal from './Modal'

interface Props {
  checkIn: string | null
  checkOut: string | null
  onChange: (checkIn: string | null, checkOut: string | null) => void
}

/** Кнопка с датами, по клику — календарь в модалке (для поиска без выбранного домика). */
export default function DatesPicker({ checkIn, checkOut, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const { today } = useAvailability()
  const id = useId()
  return (
    <>
      <div className="field">
        <span id={id}>Даты</span>
        <button type="button" className="fieldBtn" aria-labelledby={`${id} ${id}v`} aria-haspopup="dialog" onClick={() => setOpen(true)}>
          <span id={`${id}v`}>{checkIn && checkOut ? `${formatDate(checkIn)} — ${formatDate(checkOut)}` : 'Выберите даты'}</span>
          <span aria-hidden="true" className="fieldChevron">▾</span>
        </button>
      </div>
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
