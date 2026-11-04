import { estate } from '../data/estate'
import s from './Map.module.css'

export default function Map() {
  const { lat, lon } = estate.coords
  const d = 0.04
  const bbox = `${lon - d},${lat - d / 2},${lon + d},${lat + d / 2}`
  return (
    <iframe
      className={s.map}
      title="Карта OpenStreetMap: расположение усадьбы «Заречье»"
      loading="lazy"
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
    />
  )
}
