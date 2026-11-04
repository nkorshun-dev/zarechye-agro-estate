import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFound() {
  usePageMeta('Страница не найдена')
  return (
    <div className="container section" style={{ textAlign: 'center', minHeight: '50dvh' }}>
      <h1>404</h1>
      <p>Такой страницы у нас нет, но есть домики у озера.</p>
      <Link to="/houses" className="btn">
        Посмотреть домики
      </Link>
    </div>
  )
}
