import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import s from './Header.module.css'

const links = [
  { to: '/', label: 'Главная', end: true },
  { to: '/houses', label: 'Домики' },
  { to: '/services', label: 'Услуги' },
  { to: '/contacts', label: 'Контакты' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className={s.header}>
      <div className={`container ${s.bar}`}>
        <Link to="/" className={s.logo} onClick={() => setOpen(false)}>
          Заречье
        </Link>
        <button type="button" className={s.burger} aria-expanded={open} aria-controls="nav" onClick={() => setOpen(!open)}>
          {open ? 'Закрыть' : 'Меню'}
        </button>
        <nav id="nav" className={`${s.nav} ${open ? s.open : ''}`} aria-label="Основная навигация">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? s.active : '')} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/booking" className="btn" onClick={() => setOpen(false)}>
            Забронировать
          </Link>
        </nav>
      </div>
    </header>
  )
}
