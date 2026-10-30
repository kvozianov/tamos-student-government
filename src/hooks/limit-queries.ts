import type { CollectionBeforeOperationHook, GlobalBeforeOperationHook, PayloadRequest } from 'payload'

/**
 * Ограничение публичных запросов к REST API. Посетитель без входа получает не больше MAX_LIMIT записей
 * за запрос и связи не глубже MAX_DEPTH: иначе ?limit=0&depth=10 выгружает всю коллекцию одним запросом
 * и нагружает базу. Сайт читает данные через Local API (src/lib/data.ts), его запросы не ограничиваются.
 */
export const PUBLIC_QUERY_LIMITS = { maxLimit: 100, maxDepth: 2 } as const

type JoinArgs = Record<string, false | { limit?: number } | undefined>
type QueryArgs = { depth?: number; limit?: number; pagination?: boolean; joins?: JoinArgs | false }

const clampLimit = (value: unknown) => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 && n <= PUBLIC_QUERY_LIMITS.maxLimit ? n : PUBLIC_QUERY_LIMITS.maxLimit
}

/** Подрезает параметры запроса до допустимых. Возвращает тот же объект. */
export function clampQueryArgs<T extends QueryArgs>(args: T): T {
  if (args.limit !== undefined) args.limit = clampLimit(args.limit)
  if (args.pagination === false) args.pagination = true
  if (args.depth !== undefined && !(Number(args.depth) <= PUBLIC_QUERY_LIMITS.maxDepth)) args.depth = PUBLIC_QUERY_LIMITS.maxDepth
  if (args.joins) {
    for (const join of Object.values(args.joins)) {
      if (join && join.limit !== undefined) join.limit = clampLimit(join.limit)
    }
  }
  return args
}

const isAnonymousRest = (req: PayloadRequest) => !req.user && req.payloadAPI === 'REST'

export const limitPublicQueries: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if ((operation === 'read' || operation === 'readDistinct') && isAnonymousRest(req)) clampQueryArgs(args as QueryArgs)
  return args
}

export const limitPublicGlobalQueries: GlobalBeforeOperationHook = ({ args, operation, req }) => {
  if (operation === 'read' && isAnonymousRest(req)) clampQueryArgs(args as QueryArgs)
  return args
}
