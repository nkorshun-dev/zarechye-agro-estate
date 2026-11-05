import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DatesPicker from '../components/DatesPicker'
import Faq from '../components/Faq'
import HouseCard from '../components/HouseCard'
import Map from '../components/Map'
import Reviews from '../components/Reviews'
import { estate, route } from '../data/estate'
import { houses } from '../data/houses'
import { usePageMeta } from '../hooks/usePageMeta'
import s from './Home.module.css'

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`

const facts = [
  ['12 км', 'до Браслава'],
  ['50 м', 'до озера Дривяты'],
  ['4 домика', 'на 4 га'],
  ['с 2017', 'года принимаем гостей'],
]

const activities = [
  ['Баня на дровах', 'Парная с вениками и чан с травяным чаем. Топим к вашему времени.', '1540555700478-4be289fbecef'],
  ['Рыбалка', 'Щука, окунь, плотва. Лодка, удочки и советы Сергея, где клюёт.', '1470770841072-f978cf4d019e'],
  ['Лодки и сапы', 'Выходите на озеро утром, пока вода как зеркало.', '1501785888041-af3ef285b470'],
  ['Велосипеды', 'Маршрут вдоль озёр, 15 км по лесным дорогам.', '1441974231531-c6227db76b6e'],
  ['Браславские озёра', 'Экскурсия на машине: смотровые, старые хутора, чай у воды.', '1506905925346-21bda4d32df4'],
  ['Зимой: снегоходы', 'С января по март. С инструктором, в тёплых комбинезонах.', '1510798831971-661eb04b3739'],
]

export default function Home() {
  usePageMeta('', 'Агроусадьба «Заречье» в Браславском районе: четыре дома у озера Дривяты, баня, лодки и сапы. Выберите даты и сразу увидите цену.')
  const nav = useNavigate()
  const [dates, setDates] = useState<[string | null, string | null]>([null, null])
  const [adults, setAdults] = useState(2)
  const heroEl = useRef<HTMLElement>(null)

  // hero-картинка лежит в index.html (#hero-stage), чтобы LCP не ждал JS: здесь только показываем её и подгоняем под секцию
  useLayoutEffect(() => {
    const stage = document.getElementById('hero-stage')
    const hero = heroEl.current
    if (!stage || !hero) return
    stage.hidden = false
    const fit = () => {
      stage.style.top = hero.offsetTop + 'px'
      stage.style.height = hero.offsetHeight + 'px'
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(hero)
    return () => {
      ro.disconnect()
      stage.hidden = true
    }
  }, [])

  const search = () => {
    const q = new URLSearchParams({ a: String(adults) })
    if (dates[0] && dates[1]) {
      q.set('in', dates[0])
      q.set('out', dates[1])
    }
    nav(`/houses?${q}`)
  }

  return (
    <>
      <section ref={heroEl} className={s.hero}>
        <div className={`container ${s.heroInner}`}>
          <h1>Тишина, баня и озеро в пятидесяти метрах</h1>
          <p className={s.lead}>Четыре дома на четырёх гектарах в Браславском районе. Выберите даты, и сразу увидите свободные домики и итоговую цену.</p>
          <form
            className={`card ${s.search}`}
            onSubmit={(e) => {
              e.preventDefault()
              search()
            }}
          >
            <DatesPicker checkIn={dates[0]} checkOut={dates[1]} onChange={(a, b) => setDates([a, b])} />
            <label className={`field ${s.guests}`}>
              Гостей
              <select value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1}>{i + 1}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn">
              Найти домик
            </button>
          </form>
        </div>
      </section>

      <section className="section container">
        <div className={s.about}>
          <div>
            <h2>О месте</h2>
            <p>Мы с Сергеем купили этот хутор в 2016-м: покосившийся дом, заросший берег и вид на Дривяты, от которого не хотелось уходить. Год чинили крышу, ещё год строили баню, и в 2017-м приняли первых гостей.</p>
            <p>Сейчас здесь четыре дома, каждый со своим характером. Мы по-прежнему сами топим бани, пекли сырники и знаем, где в этом году клюёт щука. Приезжайте отдохнуть так, как отдыхали мы сами, когда только нашли это место.</p>
            <p className="muted">Анна и Сергей</p>
          </div>
          <ul className={s.facts}>
            {facts.map(([n, t]) => (
              <li key={n} className="card">
                <strong>{n}</strong>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section container">
        <h2>Домики</h2>
        <div className={s.cards}>
          {houses.map((h) => (
            <HouseCard key={h.slug} house={h} query="" />
          ))}
        </div>
      </section>

      <section className={`section ${s.dark}`}>
        <div className="container">
          <h2>Чем заняться</h2>
          <div className={s.activities}>
            {activities.map(([t, d, id]) => (
              <article key={t} className={s.act}>
                <img draggable="false" src={img(id)} alt="" loading="lazy" />
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </article>
            ))}
          </div>
          <Link to="/services" className="btn">
            Все услуги и цены
          </Link>
        </div>
      </section>

      <section className="section container">
        <div className={s.kitchen}>
          <img draggable="false" src={img('1542718610-a1d656d1884c')} alt="Дом на закате" loading="lazy" />
          <div>
            <h2>Кухня</h2>
            <p>Завтрак приносим в домик к девяти: сырники, яичница с деревенскими яйцами, каша, блины с вареньем. 17 BYN с человека.</p>
            <p>Вечером можно заказать ужин: драники, жаркое в горшочках или уху из утреннего улова. Просим заказывать за сутки, чтобы Анна успела закупить продукты.</p>
          </div>
        </div>
      </section>

      <section className="section container">
        <h2>Отзывы гостей</h2>
        <Reviews />
      </section>

      <section className="section container">
        <h2>Частые вопросы</h2>
        <Faq />
      </section>

      <section className="section container">
        <h2>Как добраться</h2>
        <div className={s.route}>
          <div>
            <p>
              <strong>{estate.address}</strong>
            </p>
            <p>От Минска около 3,5 часа на машине. От Браслава 12 км, можем встретить на вокзале.</p>
            <p>{route.car[0]}</p>
            <Link to="/contacts" className="btn btnGhost">
              Маршрут подробно
            </Link>
          </div>
          <Map />
        </div>
      </section>

      <section className={s.cta}>
        <div className="container">
          <h2>Выберите даты, пока свободно</h2>
          <p>Утренний туман над озером никуда не денется, а вот выходные разбирают быстро.</p>
          <Link to="/booking" className="btn">
            Забронировать
          </Link>
        </div>
      </section>
    </>
  )
}
