import { expect, test } from '@playwright/test'

const email = process.env.E2E_ADMIN_EMAIL
const password = process.env.E2E_ADMIN_PASSWORD

test.describe('admin panel', () => {
  test.skip(!email || !password, 'E2E_ADMIN_EMAIL и E2E_ADMIN_PASSWORD не заданы')

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('#field-email').fill(email!)
    await page.locator('#field-password').fill(password!)
    await page.locator('button[type="submit"]').click()
    await expect(page.getByText('Панель управления сайтом')).toBeVisible()
  })

  test('rejects a wrong password', async ({ browser }) => {
    const page = await browser.newPage()
    await page.goto('/admin/login')
    await page.locator('#field-email').fill(email!)
    await page.locator('#field-password').fill('definitely-wrong-password')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/admin\/login/)
    await page.close()
  })

  test('login page has no password recovery link', async ({ browser }) => {
    const page = await browser.newPage()
    await page.goto('/admin/login')
    await expect(page.locator('#field-email')).toBeVisible()
    await expect(page.getByRole('link', { name: /забыли пароль/i })).toBeHidden()
    await expect(page.getByText('Обратитесь к администратору сайта')).toBeVisible()
    await page.close()
  })

  test('signed-in staff get the access map and account guards work', async ({ page }) => {
    // Запросы из самой страницы: Payload принимает cookie сессии только у запросов с того же сайта.
    const api = (method: string, path: string, data?: object) =>
      page.evaluate(
        async ({ method, path, data }) => {
          const res = await fetch(path, { method, headers: { 'content-type': 'application/json' }, body: data ? JSON.stringify(data) : undefined })
          return { status: res.status, body: await res.text() }
        },
        { method, path, data },
      )

    expect((await api('GET', '/api/access')).status).toBe(200)

    const shortPassword = await api('POST', '/api/users', { email: `short-${Date.now()}@example.com`, password: 'short-pass', name: 'Короткий пароль', role: 'editor' })
    expect(shortPassword.status).toBe(400)
    expect(shortPassword.body).toContain('не короче 12 символов')

    const me = JSON.parse((await api('GET', '/api/users/me')).body).user as { id: number }
    expect((await api('DELETE', `/api/users/${me.id}`)).status).toBe(403)
    expect(JSON.parse((await api('GET', '/api/users/me')).body).user?.id).toBe(me.id)
  })

  test('creates and publishes a news item that appears on the site', async ({ page }) => {
    const title = `Смоук-тест ${Date.now()}`
    await page.goto('/admin/collections/news/create')
    await page.locator('#field-title').fill(title)
    await page.locator('#field-excerpt').fill('Запись создана автоматическим тестом панели управления.')
    await page.locator('#action-save').click()
    await expect(page.getByText(/успешно|опубликован/i).first()).toBeVisible()

    const slug = await page.locator('#field-slug').inputValue()
    expect(slug).toMatch(/^smouk-test-\d+$/)
    await page.goto(`/news/${slug}`)
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
  })

  test('drafts stay hidden from visitors but open in preview', async ({ page, browser }) => {
    const title = `Черновик ${Date.now()}`
    await page.goto('/admin/collections/news/create')
    await page.locator('#field-title').fill(title)
    await page.locator('#field-excerpt').fill('Черновик не должен быть виден посетителям.')
    await page.locator('#action-save-draft').click()
    await expect(page.locator('#field-slug')).not.toHaveValue('')
    const slug = await page.locator('#field-slug').inputValue()

    const visitor = await browser.newPage()
    const res = await visitor.goto(`/news/${slug}`)
    expect(res?.status()).toBe(404)
    await visitor.close()

    await page.goto(`/next/preview?path=/news/${slug}`)
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
    await expect(page.getByText('Предпросмотр', { exact: true })).toBeVisible()
  })
})
