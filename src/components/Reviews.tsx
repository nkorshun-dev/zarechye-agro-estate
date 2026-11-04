import { reviews } from '../data/reviews'
import { formatDateFull } from '../lib/format'
import s from './Reviews.module.css'

export default function Reviews() {
  return (
    <div className={s.grid}>
      {reviews.map((r) => (
        <article key={r.id} className={`card ${s.card}`}>
          <div className={s.top}>
            <strong>{r.author}</strong>
            <span role="img" aria-label={`Оценка ${r.rating} из 5`} className={s.stars}>
              {'★'.repeat(r.rating)}
              {'☆'.repeat(5 - r.rating)}
            </span>
          </div>
          <p className="muted">
            {r.occasion} · {formatDateFull(r.date)}
          </p>
          <p>{r.text}</p>
          {r.reply && (
            <p className={s.reply}>
              <strong>Ответ хозяев:</strong> {r.reply}
            </p>
          )}
        </article>
      ))}
    </div>
  )
}
