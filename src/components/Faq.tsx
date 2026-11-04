import { faq } from '../data/faq'
import s from './Faq.module.css'

export default function Faq() {
  return (
    <div className={s.list}>
      {faq.map((item) => (
        <details key={item.q} className={s.item}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  )
}
