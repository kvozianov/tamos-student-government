const UNSAFE = /[<>&\u2028\u2029]/g

/**
 * JSON-LD для <script type="application/ld+json">. Заголовки и описания приходят из CMS, поэтому
 * экранируем символы, которыми можно закрыть тег script (</script>) или сломать разбор: <, >, &, U+2028, U+2029.
 */
export const jsonLdHtml = (data: unknown) =>
  JSON.stringify(data).replace(UNSAFE, (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`)
