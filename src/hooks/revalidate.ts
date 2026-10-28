import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Сброс кэша публичных страниц после правок в CMS (подробно — в README, раздел «Кэш»).
 *
 * Сбрасываем весь сайт, а не отдельные адреса: шапка каждой страницы показывает последнюю новость
 * и ближайшее событие, подвал — настройки, а обещания и события перекрёстно связаны. Правки редкие,
 * поэтому проще и надёжнее пометить устаревшими все страницы: следующий посетитель каждой из них
 * получит свежую версию сразу, а не через 60 секунд.
 *
 * Вне Next.js (npm run seed, demo:clear, signature, payload migrate) кэша нет и revalidatePath
 * бросает ошибку — её пропускаем. Страницы обновятся сами по истечении revalidate.
 */
export function revalidateSite() {
  try {
    revalidatePath('/', 'layout')
  } catch (error) {
    if (process.env.NEXT_RUNTIME) console.error('Не удалось сбросить кэш сайта', error)
  }
}

const afterChange: CollectionAfterChangeHook = ({ doc }) => {
  revalidateSite()
  return doc
}

const afterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateSite()
  return doc
}

const afterGlobalChange: GlobalAfterChangeHook = ({ doc }) => {
  revalidateSite()
  return doc
}

/** Хуки для коллекций, данные которых показываются на сайте. */
export const revalidateCollection = { afterChange: [afterChange], afterDelete: [afterDelete] }

/** Хуки для глобалов (настройки, главная, страницы). */
export const revalidateGlobal = { afterChange: [afterGlobalChange] }
