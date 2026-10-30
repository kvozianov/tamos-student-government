/** Требования к паролю сотрудников. Проверяются хуком коллекции Users и скриптом create-admin. */
export const MIN_PASSWORD_LENGTH = 12

/** Текст ошибки или null, если пароль подходит. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов`
  return null
}
