import DemoLink from '../components/DemoLink'
import Map from '../components/Map'
import { estate, route } from '../data/estate'
import { usePageMeta } from '../hooks/usePageMeta'
import s from './Contacts.module.css'

export default function Contacts() {
  usePageMeta('Контакты и как добраться', 'Адрес, телефон, карта и маршрут из Минска до агроусадьбы «Заречье»: на машине около 3,5 часа.')
  return (
    <div className="container section">
      <h1>Контакты и как добраться</h1>
      <div className={s.top}>
        <div className="card" style={{ padding: 24 }}>
          <p>{estate.address}</p>
          <p className="muted">Координаты: {estate.coords.lat}, {estate.coords.lon}</p>
          <p>
            Телефон и Viber: <DemoLink label={`Телефон ${estate.phone}`}>{estate.phone}</DemoLink>
          </p>
          <p>
            Telegram: <DemoLink label={`Telegram @${estate.telegram}`}>@{estate.telegram}</DemoLink>
          </p>
          <p>
            Почта: <DemoLink label={`Почта ${estate.email}`}>{estate.email}</DemoLink>
          </p>
          <p className="muted">Отвечаем с 9:00 до 21:00. Хозяева: {estate.owners}.</p>
        </div>
        <Map />
      </div>
      <div className={s.cols}>
        <section>
          <h2>Из Минска на машине</h2>
          <ul>{route.car.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>
        <section>
          <h2>На автобусе или поезде</h2>
          <ul>{route.public.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>
        <section>
          <h2>Что взять с собой</h2>
          <ul>{route.bring.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>
      </div>
    </div>
  )
}
