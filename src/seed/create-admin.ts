/**
 * Создаёт или обновляет администратора из переменных окружения. Запуск: npm run create-admin
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... [ADMIN_NAME=...] npm run create-admin
 *
 * Пароль в базе не хранится: Payload сохраняет только соль и хеш PBKDF2. Повторный запуск
 * с тем же адресом меняет пароль, поэтому скрипт годится и для восстановления доступа.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { passwordProblem } from '@/lib/password'

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME?.trim() || 'Администратор'

if (!email || !password) {
  console.error('Задайте ADMIN_EMAIL и ADMIN_PASSWORD')
  process.exit(1)
}
const problem = passwordProblem(password)
if (problem) {
  console.error(problem)
  process.exit(1)
}

const payload = await getPayload({ config })
const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, overrideAccess: true })

if (existing.docs[0]) {
  await payload.update({
    collection: 'users',
    id: existing.docs[0].id,
    overrideAccess: true,
    data: { password, role: 'admin', loginAttempts: 0, lockUntil: null },
  })
  payload.logger.info(`Администратор ${email}: пароль обновлён`)
} else {
  await payload.create({ collection: 'users', overrideAccess: true, data: { email, password, name, role: 'admin', sections: [] } })
  payload.logger.info(`Администратор ${email} создан`)
}
process.exit(0)
