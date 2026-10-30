import { NextResponse, type NextRequest } from 'next/server'

const SETUP_COOKIE = 'tamos_setup'
/** Cookie сессии панели управления (Payload: `${cookiePrefix}-token`, префикс по умолчанию). */
const AUTH_COOKIE = 'payload-token'

const plain = (status: number, message: string) =>
  new NextResponse(message, { status, headers: { 'content-type': 'text/plain; charset=utf-8' } })

/**
 * Восстановление пароля отключено. У сайта нет почтового сервиса, поэтому Payload не отправляет письмо,
 * а печатает ссылку для сброса в логи сервера. Новый пароль выдаёт администратор (npm run create-admin
 * или правка пользователя в панели). Payload сопоставляет адреса API без учёта регистра, поэтому
 * сами операции дополнительно запрещены хуком коллекции Users (src/collections/Users.ts).
 */
const PASSWORD_RESET_PATHS = ['/api/users/forgot-password', '/api/users/reset-password', '/admin/forgot', '/admin/reset']

const normalize = (pathname: string) => pathname.toLowerCase().replace(/\/+$/, '') || '/'

const isPasswordReset = (path: string) => PASSWORD_RESET_PATHS.some((p) => path === p || path.startsWith(`${p}/`))

/** Есть ли у запроса признак входа в панель: cookie сессии или заголовок Authorization. Проверяет токен сам Payload. */
const hasCredentials = (request: NextRequest) => Boolean(request.cookies.get(AUTH_COOKIE)?.value || request.headers.get('authorization'))

export function proxy(request: NextRequest) {
  const path = normalize(request.nextUrl.pathname)

  if (isPasswordReset(path)) return plain(404, 'Восстановление пароля отключено. Новый пароль выдаёт администратор сайта.')

  // /api/access перечисляет все коллекции и поля схемы. Панели он нужен только после входа. Без признаков входа
  // отвечаем сразу; поддельный cookie дойдёт до Payload, и там эндпоинт проверит сессию (src/payload.config.ts).
  if (path === '/api/access') return hasCredentials(request) ? NextResponse.next() : plain(404, 'Not Found')

  if (path === '/admin/create-first-user' || path === '/api/users/first-register') return guardFirstUser(request)

  return NextResponse.next()
}

/**
 * Защита регистрации первого администратора. Payload разрешает создать первого пользователя любому,
 * кто откроет /admin на пустой базе. Если задан ADMIN_SETUP_TOKEN, регистрация работает только
 * по ссылке /admin/create-first-user?setup=<токен>. Когда администратор создан, Payload сам закрывает
 * эту форму, и защита больше ни на что не влияет.
 */
function guardFirstUser(request: NextRequest) {
  const token = process.env.ADMIN_SETUP_TOKEN
  if (!token) return NextResponse.next()

  if (request.nextUrl.searchParams.get('setup') === token) {
    const response = NextResponse.next()
    response.cookies.set(SETUP_COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 })
    return response
  }
  if (request.cookies.get(SETUP_COOKIE)?.value === token) return NextResponse.next()

  return plain(403, 'Регистрация первого администратора закрыта. Откройте ссылку с параметром setup из настроек проекта.')
}

export const config = {
  matcher: [
    '/admin/create-first-user',
    '/api/users/first-register',
    '/api/access',
    '/api/users/forgot-password',
    '/api/users/reset-password',
    '/admin/forgot/:path*',
    '/admin/reset/:path*',
  ],
}
