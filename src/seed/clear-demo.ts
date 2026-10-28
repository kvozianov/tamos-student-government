/**
 * Удаляет все записи с отметкой «Демо-материал». Запуск: npm run demo:clear -- --yes
 * Без флага --yes только показывает, что будет удалено.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const COLLECTIONS = ['news', 'events', 'promises', 'ideas', 'reports', 'albums', 'members', 'media', 'documents'] as const

async function main() {
  const payload = await getPayload({ config })
  const confirmed = process.argv.includes('--yes')
  for (const collection of COLLECTIONS) {
    const { totalDocs } = await payload.count({ collection, where: { isDemo: { equals: true } } })
    if (!totalDocs) continue
    if (!confirmed) {
      payload.logger.info(`${collection}: будет удалено ${totalDocs}`)
      continue
    }
    await payload.delete({ collection, where: { isDemo: { equals: true } } })
    payload.logger.info(`${collection}: удалено ${totalDocs}`)
  }
  if (!confirmed) payload.logger.info('Ничего не удалено. Чтобы удалить демо-материалы, запустите: npm run demo:clear -- --yes')
  else await payload.updateGlobal({ slug: 'campaign', data: { isDemo: false } })
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
