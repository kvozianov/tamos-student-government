/**
 * Состав команды для демо: президент, вице-президент и четыре министерства с временными карточками.
 * Запуск: npm run team. Повторный запуск безопасен: записи обновляются по адресу (slug).
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const leaders = [
  { slug: 'andrey', data: { area: 'Общее руководство администрацией, представительство перед дирекцией школы' } },
  {
    slug: 'kirill-vozyanov',
    data: {
      area: 'Техническая часть: сайт, цифровые сервисы, отчётность',
      shortBio: 'Вице-президент студенческого самоуправления TAMOS. Отвечает за техническую часть работы администрации и публичный трекер программы.',
    },
  },
]

const ministries = [
  { slug: 'uchastnik-komandy-1', position: 'Министр мероприятий', area: 'Школьные события, праздники и внеклассные форматы' },
  { slug: 'uchastnik-komandy-2', position: 'Министр коммуникаций', area: 'Соцсети, новости и обратная связь с учениками' },
  { slug: 'uchastnik-komandy-3', position: 'Министр образования', area: 'Олимпиады, клубы и учебные инициативы' },
  { slug: 'uchastnik-komandy-4', position: 'Министр спорта', area: 'Турниры, спортивные секции и здоровье' },
]

for (const { slug, data } of leaders) {
  const found = await payload.find({ collection: 'members', where: { slug: { equals: slug } }, limit: 1 })
  if (found.docs[0]) await payload.update({ collection: 'members', id: found.docs[0].id, data })
}

for (const [i, m] of ministries.entries()) {
  const data = {
    name: 'Кандидатура уточняется',
    position: m.position,
    area: m.area,
    shortBio: 'Министр будет назначен президентом. Карточка временная и заменится настоящими данными.',
    order: 10 * (i + 1),
    active: true,
    isDemo: true,
  }
  const found = await payload.find({ collection: 'members', where: { slug: { equals: m.slug } }, limit: 1 })
  if (found.docs[0]) await payload.update({ collection: 'members', id: found.docs[0].id, data })
  else await payload.create({ collection: 'members', data: { ...data, slug: m.slug } })
}

payload.logger.info('Команда обновлена: президент, вице-президент и четыре министерства')
process.exit(0)
