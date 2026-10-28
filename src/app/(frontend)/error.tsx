'use client'

import { useEffect } from 'react'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <section className="container-site flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="label-wide text-navy-700">Временная ошибка</p>
      <h1 className="mt-4 font-serif text-[48px] leading-none md:text-[72px]">Не удалось загрузить страницу</h1>
      <p className="mt-6 max-w-md text-[17px] text-muted">Данные временно недоступны. Попробуйте обновить страницу через минуту.</p>
      <button type="button" onClick={reset} className="label-wide mt-10 bg-navy-900 px-7 py-4 text-white hover:bg-navy-700">
        Попробовать снова
      </button>
    </section>
  )
}
