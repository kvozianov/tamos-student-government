import { NextResponse, type NextRequest } from 'next/server'

const COOKIE = 'tamos_setup'

/**
 * Защита регистрации первого администратора. Payload разрешает создать первого пользователя любому,
 * кто откроет /admin на пустой базе. Если задан ADMIN_SETUP_TOKEN, регистрация работает только
 * по ссылке /admin/create-first-user?setup=<токен>. Когда администратор создан, Payload сам закрывает
 * эту форму, и защита больше ни на что не влияет.
 */
export function proxy(request: NextRequest) {
  const token = process.env.ADMIN_SETUP_TOKEN
  if (!token) return NextResponse.next()

  if (request.nextUrl.searchParams.get('setup') === token) {
    const response = NextResponse.next()
    response.cookies.set(COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 })
    return response
  }
  if (request.cookies.get(COOKIE)?.value === token) return NextResponse.next()

  return new NextResponse('Регистрация первого администратора закрыта. Откройте ссылку с параметром setup из настроек проекта.', {
    status: 403,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}

export const config = {
  matcher: ['/admin/create-first-user', '/api/users/first-register'],
}
