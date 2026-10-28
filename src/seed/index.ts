/**
 * Начальное наполнение базы. Запуск: npm run seed
 *
 * Переносит события и обещания из архива кампании (src/seed/data/campaign-content.js, данные прежнего статического сайта),
 * создаёт учётные записи из .env и демонстрационные материалы. Все примеры отмечены «Демо-материал»,
 * их можно скрыть в настройках сайта и удалить командой npm run demo:clear.
 */
import config from '@payload-config'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { getPayload, type Payload } from 'payload'

import { demoImage } from './images'
import { doc, h, p, ul } from './lexical'

type LegacyUpdate = { date: string; status: string; text: string }
type LegacyPromise = { id: string; title: string; category: string; status: string; source: string; summary: string; updates: LegacyUpdate[] }
type LegacySection = { heading: string; body?: string; list?: string[] }
type LegacyEvent = {
  id: string
  title: string
  date: string
  place: string
  audience: string
  summary: string
  stage: number
  stageNote: string
  registration: { opens: string; closes: string; url: string; note: string } | null
  reference: { author: string; platform: string; title: string; url: string; note: string } | null
  sections: LegacySection[]
  promiseId: string
}

const ROOT = process.cwd()
const TZ_OFFSET = '+05:00' // время в прежнем сайте указывалось по местному времени школы
const SITE_TZ = 'Asia/Almaty'

const PROMISE_STATUS: Record<string, string> = {
  kept: 'done',
  compromise: 'partial',
  broken: 'failed',
  stalled: 'review',
  working: 'in_progress',
  unrated: 'planned',
}

const EVENT_PLAN: Record<string, { status: string; dateConfirmed: boolean; endTime?: string; tentativeLabel?: string }> = {
  'hide-and-seek': { status: 'date_confirmed', dateConfirmed: true, endTime: '17:45' },
  'movie-night': { status: 'approved', dateConfirmed: false },
  'open-mic': { status: 'review', dateConfirmed: false, tentativeLabel: 'Декабрь 2026' },
  'suggestion-box-launch': { status: 'completed', dateConfirmed: true, endTime: '14:00' },
}

const EVENT_UPDATE_STATUS: Record<string, string> = { working: 'preparing', kept: 'completed' }

const local = (date: string, time?: string) => {
  if (date.includes('T')) return new Date(`${date}${TZ_OFFSET}`).toISOString()
  return new Date(`${date}T${time ?? '12:00:00'}${TZ_OFFSET}`).toISOString()
}

function readLegacy() {
  const file = path.join(ROOT, 'src/seed/data/campaign-content.js')
  const sandbox: { window: { CONTENT?: { promises: LegacyPromise[]; events: LegacyEvent[] } } } = { window: {} }
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox)
  if (!sandbox.window.CONTENT) throw new Error('Не удалось прочитать данные прежнего сайта')
  return sandbox.window.CONTENT
}

const stripTags = (s: string) => s.replace(/<[^>]+>/g, '')

async function ensureUser(payload: Payload, email: string | undefined, password: string | undefined, data: Record<string, unknown>) {
  if (!email || !password) return null
  const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0]
  return payload.create({ collection: 'users', data: { email, password, ...data } as never })
}

async function main() {
  const payload = await getPayload({ config })
  const already = await payload.count({ collection: 'promises' })
  if (already.totalDocs > 0) {
    payload.logger.info('В базе уже есть обещания: начальное наполнение пропущено, существующие данные не тронуты.')
    process.exit(0)
  }

  const legacy = readLegacy()
  const pub = { _status: 'published' as const }

  await ensureUser(payload, process.env.SEED_ADMIN_EMAIL, process.env.SEED_ADMIN_PASSWORD, { name: 'Администратор сайта', role: 'admin' })
  await ensureUser(payload, process.env.SEED_EDITOR_EMAIL, process.env.SEED_EDITOR_PASSWORD, {
    name: 'Редактор пресс-службы',
    role: 'editor',
    sections: ['news', 'events', 'albums'],
  })

  /* Темы обещаний */
  const categoryIds: Record<string, number> = {}
  const categoryOrder = ['События', 'Голос учеников', 'Пространство', 'Еда', 'Учёба', 'Спорт']
  for (const [i, title] of categoryOrder.entries()) {
    const c = await payload.create({ collection: 'categories', data: { title, order: i + 1 } })
    categoryIds[title] = c.id
  }

  /* Обещания из прежнего сайта */
  const promiseIds: Record<string, number> = {}
  for (const [i, lp] of legacy.promises.entries()) {
    if (!categoryIds[lp.category]) {
      const c = await payload.create({ collection: 'categories', data: { title: lp.category, order: 50 } })
      categoryIds[lp.category] = c.id
    }
    const created = await payload.create({
      collection: 'promises',
      draft: false,
      data: {
        ...pub,
        title: lp.title,
        slug: lp.id,
        summary: lp.summary,
        category: categoryIds[lp.category],
        status: PROMISE_STATUS[lp.status] ?? 'planned',
        source: lp.source,
        order: (i + 1) * 10,
        isDemo: true,
        updates: lp.updates.map((u) => ({ date: local(u.date), status: PROMISE_STATUS[u.status] ?? undefined, text: u.text })) as never,
        details: doc(p(lp.summary), p('Это демонстрационное обещание из первой версии сайта. Замените текст фактическим ходом реализации.')),
      } as never,
    })
    promiseIds[lp.id] = created.id
  }

  /* Состав администрации: президент и временные карточки команды */
  const president = await payload.create({
    collection: 'members',
    data: {
      name: 'Андрей',
      slug: 'andrey',
      position: 'Президент TAMOS',
      isPresident: true,
      shortBio: 'Официальная биография будет опубликована после согласования. Сейчас здесь временный текст.',
      bio: doc(p('Биография, опыт и приоритеты президента будут добавлены в этот раздел. Текст редактируется в панели управления: Администрация → Андрей.')),
      order: 0,
      active: true,
      isDemo: false,
      signatureSvg: fs.existsSync(path.join(ROOT, 'src/seed/signature.svg')) ? fs.readFileSync(path.join(ROOT, 'src/seed/signature.svg'), 'utf8') : undefined,
    },
  })
  const team: number[] = []
  for (let i = 1; i <= 4; i++) {
    const m = await payload.create({
      collection: 'members',
      data: {
        name: 'Участник команды',
        slug: `uchastnik-komandy-${i}`,
        position: 'Должность уточняется',
        area: 'Направление будет указано',
        shortBio: 'Временная карточка. Замените её данными участника команды в разделе «Администрация».',
        order: i * 10,
        active: true,
        isDemo: true,
      },
    })
    team.push(m.id)
  }

  /* События из прежнего сайта */
  const eventIds: Record<string, number> = {}
  for (const le of legacy.events) {
    const plan = EVENT_PLAN[le.id] ?? { status: 'idea', dateConfirmed: false }
    const howSection = le.sections.find((s) => s.list)
    const program = (howSection?.list ?? []).map((item) => {
      const clean = stripTags(item)
      const m = clean.match(/^([\d:–-]+)\s+—\s+(.*)$/)
      return m ? { time: m[1], title: m[2] } : { title: clean }
    })
    const descNodes = le.sections.filter((s) => s.body).flatMap((s) => [h(s.heading), p(s.body!)])
    const startsAt = local(le.date)
    const endsAt = plan.endTime ? local(le.date.split('T')[0], `${plan.endTime}:00`) : undefined
    const relatedPromise = legacy.promises.find((lp) => lp.id === le.promiseId)
    const created = await payload.create({
      collection: 'events',
      draft: false,
      data: {
        ...pub,
        title: le.title,
        slug: le.id,
        summary: le.summary,
        place: le.place,
        audience: le.audience,
        status: plan.status,
        dateConfirmed: plan.dateConfirmed,
        startsAt,
        startsAt_tz: SITE_TZ,
        endsAt,
        endsAt_tz: endsAt ? SITE_TZ : undefined,
        tentativeLabel: plan.tentativeLabel,
        description: descNodes.length ? doc(...descNodes) : undefined,
        program: program as never,
        organizers: le.id === 'open-mic' || le.id === 'hide-and-seek' ? [president.id] : [],
        registration: le.registration
          ? { opensAt: local(le.registration.opens), closesAt: local(le.registration.closes, '23:00:00'), url: le.registration.url || undefined, note: le.registration.note }
          : undefined,
        reference: le.reference
          ? { author: le.reference.author, platform: le.reference.platform, title: le.reference.title, url: le.reference.url, note: le.reference.note }
          : undefined,
        updates: [
          ...(relatedPromise?.updates ?? []).map((u) => ({ date: local(u.date), status: EVENT_UPDATE_STATUS[u.status] ?? 'preparing', text: u.text })),
          ...(le.stageNote && !relatedPromise?.updates.length ? [{ date: local('2026-10-12'), status: plan.status, text: le.stageNote }] : []),
        ] as never,
        relatedPromises: [promiseIds[le.promiseId], le.id !== 'suggestion-box-launch' ? promiseIds['monthly-events'] : undefined].filter(Boolean) as number[],
        isDemo: true,
      } as never,
    })
    eventIds[le.id] = created.id
  }

  /* Демо-фото для альбома */
  const albumMedia: number[] = []
  const captions = ['Ящик у гардероба', 'Первые предложения', 'Онлайн-форма', 'Разбор предложений', 'Команда администрации', 'Итоги первой недели']
  for (let i = 0; i < 6; i++) {
    const data = await demoImage(i, 'Запуск ящика предложений')
    const m = await payload.create({
      collection: 'media',
      data: { alt: `Демонстрационная иллюстрация: ${captions[i].toLowerCase()}`, caption: captions[i], isDemo: true },
      file: { data, mimetype: 'image/jpeg', name: `demo-suggestion-box-${i + 1}.jpg`, size: data.length },
    })
    albumMedia.push(m.id)
  }
  await payload.create({
    collection: 'albums',
    draft: false,
    data: {
      ...pub,
      title: 'Запуск ящика предложений',
      slug: 'zapusk-yaschika-predlozheniy',
      date: local('2026-09-30'),
      event: eventIds['suggestion-box-launch'],
      description: 'Демонстрационный альбом: так будут выглядеть фото с мероприятий. Замените иллюстрации настоящими фотографиями.',
      items: albumMedia.map((id, i) => ({ kind: 'media', media: id, caption: captions[i] })) as never,
      isDemo: true,
    } as never,
  })

  /* Новости (демо, по мотивам событий и обещаний прежнего сайта) */
  const news = [
    {
      title: 'Запущен публичный трекер обещаний администрации',
      slug: 'zapuschen-trekker-obeschaniy',
      category: 'project',
      date: '2026-10-12T10:00:00',
      excerpt: 'Все пункты программы получили статусы. Каждое изменение теперь записывается с датой и объяснением.',
      body: [
        'Администрация открыла публичный трекер обещаний. В нём собраны все пункты программы, у каждого есть статус и история изменений.',
        'Статусы меняются только по фактам. Если что-то не получилось, в истории обещания появляется объяснение.',
      ],
      featured: true,
      promises: ['weekly-report'],
      events: [] as string[],
    },
    {
      title: 'Прятки по всему зданию пройдут 24 октября',
      slug: 'pryatki-24-oktyabrya',
      category: 'initiative',
      date: '2026-10-09T15:00:00',
      excerpt: 'Дата согласована с администрацией школы. Регистрация открыта до 22 октября, мест — 60.',
      body: ['Первое большое событие кампании пройдёт в главном корпусе на четырёх этажах.', 'Правила и список закрытых зон переданы на подпись администрации школы.'],
      featured: false,
      promises: ['hide-and-seek', 'monthly-events'],
      events: ['hide-and-seek'],
    },
    {
      title: 'Ящик предложений: первые итоги',
      slug: 'yaschik-predlozheniy-pervye-itogi',
      category: 'results',
      date: '2026-09-30T13:00:00',
      excerpt: 'За первые две недели пришло 23 предложения. По шести уже есть ответ.',
      body: ['Физический ящик стоит у гардероба, онлайн-форма открыта круглосуточно.', 'Предложения разбираем каждую пятницу и публикуем ответы раз в две недели.'],
      featured: false,
      promises: ['suggestion-box'],
      events: ['suggestion-box-launch'],
    },
    {
      title: 'Заявление о музыке на переменах',
      slug: 'zayavlenie-o-muzyke-na-peremenah',
      category: 'statement',
      date: '2026-10-08T17:00:00',
      excerpt: 'После тестовой недели администрация школы отказала окончательно. Ищем другой формат.',
      body: ['Мы признаём, что обещание не выполнено. Статус в трекере изменён на «Не реализовано».', 'Следующее предложение — колонка в столовой во время обеда.'],
      featured: false,
      promises: ['music-breaks'],
      events: [],
    },
    {
      title: 'День без формы — раз в четверть',
      slug: 'den-bez-formy-raz-v-chetvert',
      category: 'news',
      date: '2026-10-02T12:00:00',
      excerpt: 'Администрация школы согласилась на компромисс: первый день без формы пройдёт 30 октября.',
      body: ['Мы просили один день в месяц, договорились на один день в четверть.', 'Если первый раз пройдёт спокойно, вернёмся к обсуждению.'],
      featured: false,
      promises: ['no-uniform-day'],
      events: [],
    },
  ]
  for (const n of news) {
    await payload.create({
      collection: 'news',
      draft: false,
      data: {
        ...pub,
        title: n.title,
        slug: n.slug,
        category: n.category,
        publishedAt: local(n.date),
        excerpt: n.excerpt,
        content: doc(...n.body.map((t) => p(t)), p('Это демонстрационная публикация. Замените её настоящей новостью пресс-службы.')),
        featured: n.featured,
        relatedPromises: n.promises.map((id) => promiseIds[id]).filter(Boolean),
        relatedEvents: n.events.map((id) => eventIds[id]).filter(Boolean),
        isDemo: true,
      } as never,
    })
  }

  /* Бюро идей (демо) */
  const ideaBox = await payload.create({
    collection: 'ideas',
    draft: false,
    data: {
      ...pub,
      title: 'Анонимный ящик предложений',
      slug: 'anonimnyy-yaschik-predlozheniy',
      summary: 'Способ сказать администрации, что не так, не называя себя: ящик у гардероба и онлайн-форма.',
      author: 'Автор будет указан',
      submittedAt: local('2026-09-05'),
      status: 'implemented',
      result: 'Ящик и онлайн-форма работают с 30 сентября. За две недели — 23 предложения.',
      content: doc(p('Демонстрационный кейс: так выглядит страница проекта, который прошёл весь путь Бюро идей.')),
      gallery: albumMedia.slice(0, 3),
      relatedPromises: [promiseIds['suggestion-box']],
      relatedEvents: [eventIds['suggestion-box-launch']],
      isDemo: true,
    } as never,
  })
  await payload.create({
    collection: 'ideas',
    draft: false,
    data: {
      ...pub,
      title: 'Зона отдыха на третьем этаже',
      slug: 'zona-otdyha-na-tretem-etazhe',
      summary: 'Пуфы, столик и тихое место в холле третьего этажа, чтобы было где сидеть на переменах.',
      author: 'Автор будет указан',
      submittedAt: local('2026-09-15'),
      status: 'approval',
      result: 'Смета готова. Ждём решения администрации школы по бюджету и правилам пожарной безопасности.',
      content: doc(p('Демонстрационный кейс на этапе согласования.')),
      relatedPromises: [promiseIds['lounge']],
      isDemo: true,
    } as never,
  })

  /* Отчётность (демо) */
  await payload.create({
    collection: 'reports',
    draft: false,
    data: {
      ...pub,
      title: 'Отчёт о работе за сентябрь — октябрь 2026',
      slug: 'otchet-sentyabr-oktyabr-2026',
      type: 'activity',
      publishedAt: local('2026-10-15'),
      periodStart: local('2026-09-01'),
      periodEnd: local('2026-10-15'),
      summary: 'Что сделано за первые полтора месяца: запущены ящик предложений и стенд кружков, согласованы прятки по всему зданию, одно обещание не выполнено.',
      keyFacts: [
        { value: String(legacy.promises.length), label: 'обещаний в программе' },
        { value: String(legacy.promises.filter((lp) => lp.status === 'kept').length), label: 'выполнено полностью' },
        { value: '23', label: 'предложения пришло в ящик за две недели' },
      ] as never,
      content: doc(
        h('Выполнено'),
        ul(['Запущен анонимный ящик предложений', 'Повешен стенд с расписанием кружков', 'Запущен публичный трекер обещаний']),
        h('В работе'),
        ul(['Прятки по всему зданию — дата утверждена', 'Второй вариант обеда — опрос проведён', 'Открытый микрофон с директором — согласован на декабрь']),
        h('Не получилось'),
        p('Музыка на переменах: администрация школы отказала после тестовой недели.'),
        p('Это демонстрационный отчёт. Замените его настоящим отчётом о работе.'),
      ),
      relatedPromises: ['suggestion-box', 'clubs-board', 'weekly-report', 'music-breaks'].map((id) => promiseIds[id]).filter(Boolean),
      relatedEvents: [eventIds['suggestion-box-launch'], eventIds['hide-and-seek']],
      relatedIdeas: [ideaBox.id],
      isDemo: true,
    } as never,
  })
  await payload.create({
    collection: 'reports',
    draft: false,
    data: {
      ...pub,
      title: 'Прятки по всему зданию: решение о проведении',
      slug: 'pryatki-reshenie-o-provedenii',
      type: 'approved',
      publishedAt: local('2026-10-09'),
      periodLabel: 'Октябрь 2026',
      summary: 'Администрация школы одобрила проведение пряток 24 октября в главном корпусе. Утверждены зоны, время и число участников.',
      content: doc(p('Демонстрационная запись об утверждённой инициативе. Сюда прикрепляются подписанные документы.')),
      relatedEvents: [eventIds['hide-and-seek']],
      relatedPromises: [promiseIds['hide-and-seek']],
      isDemo: true,
    } as never,
  })

  /* Страницы */
  await payload.updateGlobal({
    slug: 'settings',
    data: {
      siteName: 'Президентская администрация TAMOS',
      shortName: 'TAMOS',
      descriptor: 'Президентская администрация',
      description: 'Официальный портал президентской администрации TAMOS: новости, события, обещания, Бюро идей и отчётность.',
      ideasFormUrl: '',
      ideasFormNote: 'Форма откроется в новой вкладке.',
      showDemo: true,
    },
  })
  await payload.updateGlobal({
    slug: 'home',
    data: {
      heroEyebrow: 'Президентская администрация TAMOS',
      heroSlogan: 'Открытая работа, понятные решения и отчёт по каждому обещанию.',
      heroCta: 'О президенте и администрации',
      addressTitle: 'Обращение президента',
      address: doc(
        p('Здесь будет опубликовано обращение президента к ученикам TAMOS. Это временный текст: замените его в панели управления, раздел «Главная страница», вкладка «Обращение».'),
        p('Обращение показывается на главной странице сразу после первого экрана и подписывается именем и должностью президента.'),
      ),
    },
  })
  await payload.updateGlobal({
    slug: 'ideas-page',
    data: {
      lead: 'Бюро идей помогает превратить идею ученика в проект школы: от первой мысли до запуска.',
      about: doc(
        p('Бюро идей — направление администрации, которое рассматривает, сопровождает и развивает инициативы учеников.'),
        p('Автор предлагает собственный проект. Команда Бюро помогает проработать концепцию, оценить реализуемость, подготовить материалы и организовать рассмотрение.'),
      ),
      principles: [
        { title: 'Предложить может каждый', text: 'Идею можно подать одному или командой. Опыт и готовый план не нужны.' },
        { title: 'Помогаем довести до проекта', text: 'Вместе с автором превращаем идею в понятную концепцию с ресурсами и сроками.' },
        { title: 'Честно оцениваем реализуемость', text: 'Если идею нельзя реализовать сейчас, объясняем почему и что можно изменить.' },
        { title: 'Открытый путь', text: 'Каждый проект, прошедший Бюро, публикуется в каталоге вместе с результатом.' },
      ],
      steps: [
        { title: 'Подача идеи', text: 'Автор заполняет короткую форму: что предлагает и зачем это школе.' },
        { title: 'Первичное рассмотрение', text: 'Команда Бюро изучает идею и связывается с автором.' },
        { title: 'Доработка концепции', text: 'Вместе уточняем цель, ресурсы, сроки и риски.' },
        { title: 'Согласование', text: 'Проект представляется администрации школы и получает решение.' },
        { title: 'Реализация', text: 'Запускаем проект и публикуем результат в каталоге кейсов.' },
      ],
      ctaTitle: 'Есть идея для школы?',
      ctaText: 'Опишите её в нескольких предложениях. Команда Бюро идей свяжется с вами и поможет с дальнейшими шагами.',
    },
  })
  await payload.updateGlobal({
    slug: 'campaign',
    data: {
      title: 'Кампания',
      lead: 'Архив предвыборной кампании президента Андрея: история, программа, события и итоги.',
      isDemo: true,
      story: doc(
        p('История кампании будет добавлена: как появилась команда, с чего началась кампания и какие события стали главными.'),
        p('Раздел работает как архив. Тексты, фотографии и хроника редактируются в панели управления, раздел «Кампания».'),
      ),
      goals: [
        { title: 'Публичная отчётность', text: 'Каждое обещание программы получает статус и историю изменений на сайте администрации.' },
        { title: 'Одно большое событие в месяц', text: 'Регулярные события для всей школы, от пряток по зданию до киноночи.' },
        { title: 'Голос учеников', text: 'Анонимный ящик предложений и открытый микрофон с директором.' },
      ],
      programIntro: doc(p('Программа кампании — это список обещаний. Их выполнение отслеживается в разделе «Обещания».')),
      timeline: [{ date: local('2026-10-12'), title: 'Запущен публичный трекер обещаний', text: 'Первая версия сайта с отсчётом до ближайшего события и статусами обещаний.' }],
      team: [president.id, ...team],
      results: doc(p('Итоги кампании будут опубликованы после подведения результатов.')),
    } as never,
  })

  payload.logger.info('Готово: база заполнена. Демо-материалы отмечены и могут быть скрыты в настройках сайта.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
