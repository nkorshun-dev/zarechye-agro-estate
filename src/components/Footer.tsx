import { Link } from 'react-router-dom'
import { estate } from '../data/estate'
import DemoLink from './DemoLink'
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
            <DemoLink label={`Телефон ${estate.phone}`}>{estate.phone}</DemoLink>
          </p>
          <p>
            <DemoLink label={`Почта ${estate.email}`}>{estate.email}</DemoLink>
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
