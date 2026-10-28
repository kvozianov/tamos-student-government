import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { safePath } from '@/lib/site'

/**
 * Кнопка «Предпросмотр» в панели ведёт сюда. Если запрос пришёл от вошедшего сотрудника,
 * включается режим черновиков Next.js и открывается страница материала с последней версией.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = safePath(url.searchParams.get('path'))
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) redirect(`/admin/login?redirect=${encodeURIComponent(`/next/preview?path=${path}`)}`)
  ;(await draftMode()).enable()
  redirect(path)
}
