import { Link } from 'react-router-dom'
import { estate } from '../data/estate'
import s from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={`container ${s.grid}`}>
        <div>
          <p className={s.brand}>Заречье</p>
          <p>{estate.address}</p>
        </div>
        <div>
          <p>
            <a href={`tel:${estate.phoneRaw}`}>{estate.phone}</a>
          </p>
          <p>
            <a href={`mailto:${estate.email}`}>{estate.email}</a>
          </p>
        </div>
        <nav aria-label="Разделы в подвале" className={s.links}>
          <Link to="/houses">Домики</Link>
          <Link to="/services">Услуги</Link>
          <Link to="/contacts">Как добраться</Link>
          <Link to="/booking">Бронирование</Link>
        </nav>
      </div>
      <p className={`container ${s.demo}`}>Демо-проект для портфолио. Бизнес вымышленный.</p>
    </footer>
  )
}
