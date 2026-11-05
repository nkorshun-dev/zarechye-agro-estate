import { useState, type ChangeEvent, type FormEvent } from 'react'
import { rules } from '../data/estate'
import { formatPhone } from '../lib/phone-mask'
import { validateEmail, validateName, validatePhone } from '../lib/validation'
import Modal from './Modal'
import s from './BookingForm.module.css'

export interface ContactValues {
  name: string
  phone: string
  email: string
  comment: string
}

interface Props {
  submitting: boolean
  onBack: () => void
  onSubmit: (v: ContactValues) => void
}

/** Маска + удаление: Backspace по «)» или «-» стирает цифру, а не возвращает символ. */
const nextPhone = (prev: string, raw: string, caret: number): string => {
  const next = formatPhone(raw)
  // заменили всё поле (вставка, автозаполнение), а не стёрли один символ — цифры не трогаем
  if (raw !== prev.slice(0, caret) + prev.slice(caret + 1)) return next
  const digits = raw.replace(/\D/g, '')
  if (digits.length <= 3) return ''
  return next === prev ? formatPhone(digits.slice(0, -1)) : next
}

export default function BookingForm({ submitting, onBack, onSubmit }: Props) {
  const [v, setV] = useState<ContactValues>({ name: '', phone: '', email: '', comment: '' })
  const [rulesOk, setRulesOk] = useState(false)
  const [dataOk, setDataOk] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [touched, setTouched] = useState(false)

  const errors = {
    name: validateName(v.name),
    phone: validatePhone(v.phone),
    email: validateEmail(v.email),
    consent: rulesOk && dataOk ? null : 'Нужно согласие с правилами и обработкой данных',
  }
  const valid = !Object.values(errors).some(Boolean)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (valid) onSubmit(v)
  }
  // Правка в середине номера: после маски возвращаем курсор к той же цифре, а не в конец.
  const onPhone = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.target
    const digitsBefore = el.value.slice(0, el.selectionStart ?? 0).replace(/\D/g, '').length
    const atEnd = el.selectionStart === el.value.length
    const phone = nextPhone(v.phone, el.value, el.selectionStart ?? el.value.length)
    setV({ ...v, phone })
    if (atEnd) return
    let pos = 0
    for (let n = 0; pos < phone.length && n < digitsBefore; pos++) if (/\d/.test(phone[pos])) n++
    setTimeout(() => el.setSelectionRange(pos, pos), 0)
  }
  const err = (k: 'name' | 'phone' | 'email') => touched && errors[k]

  return (
    <form className={s.form} onSubmit={submit} noValidate>
      <label className="field">
        Фамилия и имя
        <input value={v.name} autoComplete="name" aria-invalid={!!err('name')} onChange={(e) => setV({ ...v, name: e.target.value })} />
        {err('name') && <span className="error" role="alert">{errors.name}</span>}
      </label>
      <label className="field">
        Телефон
        <input
          value={v.phone}
          inputMode="tel"
          autoComplete="tel"
          placeholder="+375 (29) 123-45-67"
          aria-invalid={!!err('phone')}
          onChange={onPhone}
        />
        {err('phone') && <span className="error" role="alert">{errors.phone}</span>}
      </label>
      <label className="field">
        Электронная почта
        <input type="email" value={v.email} autoComplete="email" aria-invalid={!!err('email')} onChange={(e) => setV({ ...v, email: e.target.value })} />
        {err('email') && <span className="error" role="alert">{errors.email}</span>}
      </label>
      <label className="field">
        Пожелания
        <textarea rows={3} value={v.comment} onChange={(e) => setV({ ...v, comment: e.target.value })} placeholder="Например: детская кроватка, топить баню к 18:00" />
      </label>
      <label className={s.check}>
        <input type="checkbox" checked={rulesOk} onChange={(e) => setRulesOk(e.target.checked)} />
        <span>
          Согласен с{' '}
          <button type="button" className={s.link} onClick={() => setShowRules(true)}>
            правилами проживания
          </button>
        </span>
      </label>
      <label className={s.check}>
        <input type="checkbox" checked={dataOk} onChange={(e) => setDataOk(e.target.checked)} />
        <span>Согласен на обработку персональных данных (демо: данные никуда не уходят)</span>
      </label>
      {touched && errors.consent && <span className="error" role="alert">{errors.consent}</span>}
      <div className={s.actions}>
        <button type="button" className="btn btnGhost" onClick={onBack}>
          Назад
        </button>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Отправляем…' : 'Забронировать'}
        </button>
      </div>
      <Modal open={showRules} title="Правила проживания" onClose={() => setShowRules(false)}>
        <ul className={s.rules}>
          {rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <button type="button" className="btn" onClick={() => { setRulesOk(true); setShowRules(false) }}>
          Принимаю
        </button>
      </Modal>
    </form>
  )
}
