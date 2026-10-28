'use client'

import { usePathname } from 'next/navigation'

/** Полоса режима предпросмотра: видна только сотруднику, который открыл черновик из панели. */
export function PreviewBar() {
  const pathname = usePathname()
  return (
    <div role="status" className="sticky top-0 z-[60] bg-brand-red text-white">
      <p className="container-site flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2 text-[14px]">
        <span>
          <span className="label-wide-sm mr-3">Предпросмотр</span>
          Показана последняя версия, включая неопубликованные черновики. Её видите только вы.
        </span>
        <a href={`/next/exit-preview?path=${encodeURIComponent(pathname)}`} className="label-wide-sm underline underline-offset-4">
          Выйти
        </a>
      </p>
    </div>
  )
}
