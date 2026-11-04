import { useEffect } from 'react'

const DEFAULT_TITLE = 'Агроусадьба «Заречье» — домики у озера Дривяты'
const DEFAULT_DESC = 'Агроусадьба «Заречье» в Браславском районе: четыре дома у озера Дривяты, баня на дровах, лодки и сапы. Выберите даты и сразу увидите цену.'

const setMeta = (selector: string, content: string) => document.querySelector(selector)?.setAttribute('content', content)

/** Заголовок вкладки, description и Open Graph меняются по странице. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const t = title ? `${title} — Заречье` : DEFAULT_TITLE
    const d = description || DEFAULT_DESC
    document.title = t
    setMeta('meta[name="description"]', d)
    setMeta('meta[property="og:title"]', t)
    setMeta('meta[property="og:description"]', d)
  }, [title, description])
}
