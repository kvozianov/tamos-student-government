import { ArrowLink } from '@/components/site/ArrowLink'
import { Seal } from '@/components/site/Seal'

export default function NotFound() {
  return (
    <section className="container-site flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <Seal size={72} className="mb-8 text-navy-700/30" />
      <p className="label-wide text-navy-700">Ошибка 404</p>
      <h1 className="mt-4 font-serif text-[52px] leading-none md:text-[80px]">Страница не найдена</h1>
      <p className="mt-6 max-w-md text-[17px] text-muted">Возможно, материал перенесли или сняли с публикации. Попробуйте поиск или вернитесь на главную.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-10">
        <ArrowLink href="/">На главную</ArrowLink>
        <ArrowLink href="/search">Поиск по сайту</ArrowLink>
      </div>
    </section>
  )
}
