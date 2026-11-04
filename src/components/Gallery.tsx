import { useState } from 'react'
import Modal from './Modal'
import s from './Gallery.module.css'

/** Превью + лайтбокс; в лайтбоксе листают стрелками клавиатуры. */
export default function Gallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState<number | null>(null)
  const step = (d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length))
  return (
    <>
      <div className={s.grid}>
        {images.map((src, i) => (
          <button key={src} type="button" className={s.thumb} onClick={() => setIndex(i)} aria-label={`Открыть фото ${i + 1} из ${images.length}: ${name}`}>
            <img src={src.replace('w=1400', 'w=900')} alt={`${name}, фото ${i + 1}`} loading={i ? 'lazy' : 'eager'} />
          </button>
        ))}
      </div>
      <Modal
        open={index !== null}
        title={`${name}: фото ${(index ?? 0) + 1} из ${images.length}`}
        onClose={() => setIndex(null)}
        wide
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
      >
        {index !== null && (
          <div className={s.box}>
            <img src={images[index]} alt={`${name}, фото ${index + 1}`} className={s.big} />
            <div className={s.nav}>
              <button type="button" className="btn btnGhost" onClick={() => step(-1)}>
                ← Назад
              </button>
              <button type="button" className="btn btnGhost" onClick={() => step(1)}>
                Вперёд →
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
