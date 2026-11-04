import { Link } from 'react-router-dom'
import { extras, seasonalServices } from '../data/extras'
import { usePageMeta } from '../hooks/usePageMeta'
import { formatMoney } from '../lib/format'
import s from './Services.module.css'

export default function Services() {
  usePageMeta('Услуги', 'Баня, завтраки, сапы и лодки, трансфер от вокзала Браслава: что можно заказать в «Заречье» и сколько это стоит.')
  return (
    <div className="container section">
      <h1>Услуги</h1>
      <p className="muted">Всё, что можно добавить к проживанию. Бронируется вместе с домиком, остальное договариваемся на месте.</p>
      <div className={s.grid}>
        {extras.map((e) => (
          <article key={e.id} className={`card ${s.card}`}>
            <img src={e.image} alt="" loading="lazy" />
            <div className={s.body}>
              <h3>{e.name}</h3>
              <p>{e.description}</p>
              <p className={s.price}>
                {formatMoney(e.price)} <span className="muted">{e.unit}</span>
              </p>
              <p className="muted">Сезон: {e.season}</p>
            </div>
          </article>
        ))}
      </div>
      <h2>Только на месте</h2>
      <ul className={s.list}>
        {seasonalServices.map((x) => (
          <li key={x.name} className="card">
            <strong>{x.name}</strong>
            <span>{x.price}</span>
            <span className="muted">{x.note}</span>
          </li>
        ))}
      </ul>
      <Link to="/booking" className="btn">
        Выбрать даты и забронировать
      </Link>
    </div>
  )
}
