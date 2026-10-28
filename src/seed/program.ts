/**
 * Предвыборная программа (дополненная версия). Запуск: npm run program
 *
 * Создаёт или обновляет обещания программы по адресу страницы, снимает с публикации демо-обещания
 * из первой версии сайта (они остаются черновиками в CMS) и записывает вступление к программе.
 * Скрипт можно запускать повторно: записи не дублируются.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { doc, p } from './lexical'

type Item = { number: number; slug: string; title: string; summary: string; deadline: string; category: string; isNew?: boolean; details?: string[] }

const PROGRAM: Item[] = [
  {
    number: 1,
    slug: 'formirovanie-shkolnogo-soveta',
    title: 'Формирование школьного совета',
    summary: 'Набор руководителей направлений, распределение обязанностей и создание команды волонтёров.',
    deadline: 'Первая неделя после вступления в должность',
    category: 'Школьный совет',
  },
  {
    number: 2,
    slug: 'byuro-idey',
    title: 'Бюро идей',
    summary: 'Платформа, через которую любой ученик сможет предложить проект, получить помощь в разработке и представить его школьной администрации.',
    deadline: 'Запуск во вторую неделю II четверти; сопровождение проектов — в течение учебного года',
    category: 'Инициативы учеников',
    details: [
      'Платформа, через которую любой ученик сможет предложить проект, получить помощь в разработке и представить его школьной администрации. Запуск — во вторую неделю II четверти.',
      'Развитие ученических инициатив: помощь с презентациями, прототипами, поиском ресурсов, спонсоров и реализацией перспективных проектов — в течение учебного года.',
    ],
  },
  {
    number: 3,
    slug: 'pitching-shkolnyh-proektov',
    title: 'Питчинг школьных проектов',
    summary: 'Презентация ученических инициатив, голосование и отбор 2–3 проектов для дальнейшей реализации.',
    deadline: 'Середина II четверти',
    category: 'Инициативы учеников',
  },
  {
    number: 4,
    slug: 'sistema-shkolnyh-klubov',
    title: 'Система школьных клубов',
    summary: 'Возможность создавать клубы по интересам: программирование, дебаты, кино, настольные игры и другие направления.',
    deadline: 'Подготовка с первой недели II четверти, первые встречи — с третьей недели',
    category: 'Клубы',
  },
  {
    number: 5,
    slug: 'yarmarka-shkolnyh-klubov',
    title: 'Ярмарка школьных клубов',
    summary: 'Мероприятие, на котором ученики смогут представить свои клубы и набрать участников.',
    deadline: 'Вторая неделя II четверти',
    category: 'Клубы',
  },
  {
    number: 6,
    slug: 'futbolnyy-turnir-mezhdu-klassami',
    title: 'Футбольный турнир между классами',
    summary: 'Организация первого общешкольного спортивного соревнования.',
    deadline: 'Конец октября 2026 года',
    category: 'Спорт',
  },
  {
    number: 7,
    slug: 'regulyarnye-sportivnye-turniry',
    title: 'Регулярные спортивные турниры',
    summary: 'Соревнования по футболу, баскетболу, волейболу, настольному теннису, шахматам и другим дисциплинам.',
    deadline: 'В течение учебного года',
    category: 'Спорт',
  },
  {
    number: 8,
    slug: 'reyting-klassov',
    title: 'Рейтинг классов',
    summary: 'Система накопления баллов за участие и победы в школьных соревнованиях. Награждение лучших классов по итогам года.',
    deadline: 'Запуск вместе с турнирами; итоги — конец учебного года',
    category: 'Спорт',
  },
  {
    number: 9,
    slug: 'pryatki-exile',
    title: '«Прятки Exile»',
    summary: 'Масштабная игра по мотивам популярного YouTube-формата с участием учеников 10–11 классов.',
    deadline: 'Начало декабря 2026 года',
    category: 'События',
  },
  {
    number: 10,
    slug: 'ezhemesyachnye-shkolnye-kvesty',
    title: 'Ежемесячные школьные квесты',
    summary: 'Поиск подсказок, решение загадок и командные соревнования между классами.',
    deadline: 'Каждый месяц, после согласования календаря',
    category: 'События',
  },
  {
    number: 11,
    slug: 'shkolnyy-minecraft-server',
    title: 'Школьный Minecraft-сервер',
    summary: 'Создание общешкольного игрового пространства с возможностью совместного строительства, проведения соревнований и мероприятий.',
    deadline: 'Дата запуска уточняется',
    category: 'События',
    isNew: true,
  },
  {
    number: 13,
    slug: 'publichnaya-otchetnost-shkolnogo-soveta',
    title: 'Публичная отчётность школьного совета',
    summary: 'Регулярная публикация информации о выполненных обещаниях, текущих проектах, сроках и причинах возможных задержек.',
    deadline: 'Первый отчёт — через месяц после вступления в должность; далее — раз в четверть',
    category: 'Прозрачность',
    isNew: true,
  },
]

const CATEGORY_ORDER = ['Школьный совет', 'Инициативы учеников', 'Клубы', 'Спорт', 'События', 'Прозрачность']

const INTRO = [
  'Ниже представлены все основные обязательства из предвыборной программы с планируемыми сроками реализации.',
  'Добавлены два новых пункта: школьный Minecraft-сервер и публичная отчётность. Сроки остальных инициатив сохранены из первоначальной программы.',
]

const payload = await getPayload({ config })

/* Темы */
const categoryId: Record<string, number> = {}
const existingCats = await payload.find({ collection: 'categories', limit: 200, pagination: false })
for (const c of existingCats.docs) categoryId[c.title] = c.id
for (const [i, title] of CATEGORY_ORDER.entries()) {
  if (categoryId[title]) await payload.update({ collection: 'categories', id: categoryId[title], data: { order: i + 1 } })
  else categoryId[title] = (await payload.create({ collection: 'categories', data: { title, order: i + 1 } })).id
}
for (const c of existingCats.docs) if (!CATEGORY_ORDER.includes(c.title)) await payload.update({ collection: 'categories', id: c.id, data: { order: 50 + (c.order ?? 0) } })

/* Обещания программы */
const ids: number[] = []
for (const item of PROGRAM) {
  const data = {
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    category: categoryId[item.category],
    source: `Предвыборная программа, пункт ${item.number}`,
    number: item.number,
    deadline: item.deadline,
    isNew: Boolean(item.isNew),
    order: item.number * 10,
    isDemo: false,
    details: doc(...(item.details ?? [item.summary]).map((t) => p(t)), p(`Планируемые сроки: ${item.deadline.charAt(0).toLowerCase()}${item.deadline.slice(1)}.`)),
    _status: 'published' as const,
  }
  const found = await payload.find({ collection: 'promises', where: { slug: { equals: item.slug } }, limit: 1, draft: true })
  if (found.docs[0]) {
    await payload.update({ collection: 'promises', id: found.docs[0].id, data: data as never })
    ids.push(found.docs[0].id)
  } else {
    const created = await payload.create({ collection: 'promises', draft: false, data: { ...data, status: 'planned' } as never })
    ids.push(created.id)
  }
}
payload.logger.info(`Обещания программы: ${ids.length}`)

/* Демо-обещания первой версии сайта снимаем с публикации: в CMS они остаются черновиками */
const demo = await payload.find({ collection: 'promises', where: { and: [{ isDemo: { equals: true } }, { _status: { equals: 'published' } }] }, limit: 200, pagination: false })
for (const d of demo.docs) await payload.update({ collection: 'promises', id: d.id, data: { _status: 'draft' } as never })
payload.logger.info(`Демо-обещания сняты с публикации: ${demo.docs.length}`)

/* Демо-событие с прятками приводим в соответствие с программой: начало декабря, 10–11 классы, дата уточняется */
const hide = await payload.find({ collection: 'events', where: { slug: { equals: 'hide-and-seek' } }, limit: 1 })
if (hide.docs[0]) {
  await payload.update({
    collection: 'events',
    id: hide.docs[0].id,
    data: {
      title: 'Прятки Exile',
      summary: 'Масштабная игра по мотивам популярного YouTube-формата с участием учеников 10–11 классов.',
      audience: '10–11 классы',
      status: 'idea',
      dateConfirmed: false,
      startsAt: new Date('2026-12-01T16:00:00+05:00').toISOString(),
      endsAt: null,
      tentativeLabel: 'Начало декабря 2026',
      registration: { opensAt: null, closesAt: null, url: null, note: null },
      updates: [{ date: new Date('2026-10-18T12:00:00+05:00').toISOString(), status: 'idea', text: 'Событие внесено в предвыборную программу: начало декабря 2026 года, для учеников 10–11 классов. Дата уточняется.' }],
      relatedPromises: [ids[PROGRAM.findIndex((i) => i.slug === 'pryatki-exile')]],
    } as never,
  })
  payload.logger.info('Событие «Прятки Exile» обновлено по программе')
}

/* Вступление к программе в разделе «Кампания» */
await payload.updateGlobal({ slug: 'campaign', data: { programIntro: doc(...INTRO.map((t) => p(t))), programPromises: ids } as never })
payload.logger.info('Вступление к программе записано')
process.exit(0)
