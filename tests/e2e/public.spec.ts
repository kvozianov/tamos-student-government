import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/** Серьёзные и критичные нарушения доступности (WCAG 2.1 A/AA) на странице. */
async function a11yViolations(page: Page) {
  // Без анимаций: иначе axe ловит заголовки посреди появления и считает их бледными.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  return violations.filter((v) => v.impact === 'critical' || v.impact === 'serious').map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

test('home page shows news, events and the team', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/TAMOS/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Новости', level: 2 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Ближайшие события', level: 2 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Команда', level: 2 })).toBeVisible()
  expect(await a11yViolations(page)).toEqual([])
})

test('news list filters by tab and opens an article', async ({ page }) => {
  await page.goto('/news')
  await expect(page.getByRole('heading', { name: 'Новости', level: 1 })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Рубрики' })).toBeVisible()
  const first = page.locator('main a[href^="/news/"]').first()
  const href = await first.getAttribute('href')
  await page.goto(href!)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Навигационная цепочка' })).toBeVisible()
  expect(await a11yViolations(page)).toEqual([])
})

test('events page switches between list and calendar', async ({ page }) => {
  await page.goto('/events')
  await page.getByRole('tab', { name: 'Календарь' }).click()
  await expect(page).toHaveURL(/#calendar$/)
  await expect(page.getByRole('table')).toBeVisible()
  await page.getByRole('button', { name: 'Следующий месяц' }).click()
  await page.getByRole('tab', { name: 'Список' }).click()
  await expect(page.getByRole('table')).toBeHidden()
})

for (const path of ['/programme', '/team', '/contact']) {
  test(`${path} renders without serious accessibility issues`, async ({ page }) => {
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await a11yViolations(page)).toEqual([])
  })
}

test('old section addresses redirect to the new ones', async ({ page }) => {
  await page.goto('/promises')
  await expect(page).toHaveURL(/\/programme$/)
  await page.goto('/administration')
  await expect(page).toHaveURL(/\/team$/)
})

/** Отдельный адрес отправителя для каждого прогона: форма ограничивает число сообщений с одного IP. */
const testClientIp = () => `198.51.100.${Math.floor(Math.random() * 250) + 1}, 10.0.0.${Math.floor(Math.random() * 250) + 1}`

async function fillContactForm(page: Page, subject = 'Проверка формы') {
  await page.getByLabel('Имя').fill('Смоук Тест')
  await page.getByLabel('Почта для ответа').fill('smoke@example.com')
  await page.getByLabel('Тема').fill(subject)
  await page.getByLabel('Сообщение').fill('Автоматическая проверка формы обращения.')
  await page.waitForTimeout(3100) // защита от ботов принимает форму не раньше чем через 3 секунды
  await page.getByRole('button', { name: 'Отправить' }).click()
}

test('contact form validates and sends a message', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': testClientIp() })
  await page.goto('/contact')
  await page.getByRole('button', { name: 'Отправить' }).click()
  await expect(page.getByText('Укажите имя')).toBeVisible()

  await fillContactForm(page)
  await expect(page.getByText('Сообщение отправлено')).toBeVisible()
})

test('contact form refuses the fourth message in a row from one address', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'достаточно одного прогона: сообщения учитываются в общем лимите формы')
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': testClientIp() })
  for (let i = 1; i <= 3; i++) {
    await page.goto('/contact')
    await fillContactForm(page, `Проверка лимита ${i}`)
    await expect(page.getByText('Сообщение отправлено')).toBeVisible()
  }
  await page.goto('/contact')
  await fillContactForm(page, 'Проверка лимита 4')
  await expect(page.locator('#form-error')).toContainText('несколько сообщений подряд')
  await expect(page.getByLabel('Тема')).toHaveValue('Проверка лимита 4')
})

test('API hides password recovery, the schema map and caps list size for visitors', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'проверка API не зависит от устройства')
  expect((await request.post('/api/users/forgot-password', { data: { email: 'nobody@example.com' } })).status()).toBe(404)
  expect((await request.post('/api/users/reset-password', { data: { token: 'x', password: 'long-enough-password' } })).status()).toBe(404)
  expect((await request.post('/api/users/Forgot-Password', { data: { email: 'nobody@example.com' } })).status()).toBe(403)
  expect((await request.get('/api/access')).status()).toBe(404)
  expect((await request.get('/api/access', { headers: { cookie: 'payload-token=forged' } })).status()).toBe(404)

  const news = await request.get('/api/news?limit=0&depth=10')
  expect(news.status()).toBe(200)
  expect((await news.json()).limit).toBe(100)
})
