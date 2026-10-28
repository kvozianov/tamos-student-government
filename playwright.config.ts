import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.PORT ?? 3000)
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

/**
 * Смоук-тесты по живому приложению с базой. Локально переиспользуют запущенный `npm run dev`,
 * в CI поднимают продакшен-сборку (`npm run start`) после миграций и наполнения базы.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, locale: 'ru-RU', timezoneId: 'Asia/Almaty', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /public\.spec\.ts/ },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: process.env.CI ? 'npm run start' : 'npm run dev', url: baseURL, reuseExistingServer: !process.env.CI, timeout: 240_000 },
})
