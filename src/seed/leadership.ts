/**
 * Руководство, слоганы и контакты. Запуск: npm run leadership
 * Повторный запуск безопасен: записи обновляются, а не дублируются.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { doc, p } from './lexical'

const payload = await getPayload({ config })

/* Президент */
const pres = await payload.find({ collection: 'members', where: { isPresident: { equals: true } }, limit: 1 })
if (!pres.docs[0]) throw new Error('Не найдена карточка президента')
await payload.update({
  collection: 'members',
  id: pres.docs[0].id,
  data: { name: 'Андрей Подгорный', position: 'Президент TAMOS Education', order: 0, active: true, isDemo: false },
})

/* Вице-президент */
const vpData = {
  name: 'Кирилл Возьянов',
  slug: 'kirill-vozyanov',
  position: 'Вице-президент TAMOS Education',
  isVicePresident: true,
  order: 1,
  active: true,
  isDemo: false,
}
const vpFound = await payload.find({ collection: 'members', where: { slug: { equals: vpData.slug } }, limit: 1 })
const vp = vpFound.docs[0]
  ? await payload.update({ collection: 'members', id: vpFound.docs[0].id, data: vpData })
  : await payload.create({ collection: 'members', data: vpData })

/* Временные карточки команды скрываем: министры будут представлены позже */
const placeholders = await payload.update({
  collection: 'members',
  where: { and: [{ isDemo: { equals: true } }, { active: { equals: true } }] },
  data: { active: false },
})
payload.logger.info(`Скрыто временных карточек: ${placeholders.docs.length}`)

/* Главная: слоган; временный текст обращения убираем, пока нет настоящего */
await payload.updateGlobal({ slug: 'home', data: { heroSlogan: 'MAKE TAMOS GREAT AGAIN', address: null } })

/* Бюро идей */
await payload.updateGlobal({ slug: 'ideas-page', data: { lead: 'Есть идея? Давай реализуем!', ctaTitle: 'Есть идея? Давай реализуем!' } })

/* Контакты в подвале */
await payload.updateGlobal({
  slug: 'settings',
  data: {
    contactEmail: 'tamos.students@gmail.com',
    socials: [
      { platform: 'telegram', url: 'https://t.me/podgornis1' },
      { platform: 'instagram', url: 'https://www.instagram.com/andrew.tamos.president' },
    ],
  },
})

/* Кампания: команда и подзаголовок */
const campaign = await payload.findGlobal({ slug: 'campaign', depth: 0 })
await payload.updateGlobal({
  slug: 'campaign',
  data: {
    lead: 'Архив предвыборной кампании президента Андрея Подгорного: история, программа, события и итоги.',
    team: [pres.docs[0].id, vp.id],
    programIntro: campaign.programIntro ?? doc(p('Программа кампании — это список обещаний.')),
  },
})

payload.logger.info(`Готово: президент «Андрей Подгорный», вице-президент «${vp.name}», контакты и слоганы обновлены.`)
process.exit(0)
