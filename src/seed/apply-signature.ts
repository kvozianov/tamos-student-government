/**
 * Записывает подпись из src/seed/signature.svg в карточку президента.
 * Обычно запускается через npm run signature (сначала трассировка скана, потом запись).
 */
import config from '@payload-config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'

async function main() {
  const svg = fs.readFileSync(path.join(process.cwd(), 'src/seed/signature.svg'), 'utf8')
  const payload = await getPayload({ config })
  const res = await payload.find({ collection: 'members', where: { isPresident: { equals: true } }, limit: 1 })
  const president = res.docs[0]
  if (!president) {
    payload.logger.warn('Президент не найден: отметьте «Это президент» у нужной карточки в разделе «Администрация».')
    process.exit(1)
  }
  await payload.update({ collection: 'members', id: president.id, data: { signatureSvg: svg } })
  payload.logger.info(`Подпись записана в карточку «${president.name}».`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
