type PaginationOptions = {
  defaultPage?: number
  defaultLimit?: number
  maxLimit?: number
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const normalized = String(value ?? '').trim()
  if (!/^\d+$/.test(normalized)) {
    return fallback
  }

  const parsed = Number.parseInt(normalized, 10)
  return Number.isSafeInteger(parsed) ? parsed : fallback
}

export function resolvePagination(
  page: string | undefined,
  limit: string | undefined,
  options: PaginationOptions = {},
) {
  const defaultPage = options.defaultPage ?? 1
  const defaultLimit = options.defaultLimit ?? 12
  const maxLimit = options.maxLimit ?? 60

  const pageNum = Math.max(1, parsePositiveInteger(page, defaultPage))
  const limitNum = Math.min(maxLimit, Math.max(1, parsePositiveInteger(limit, defaultLimit)))

  return {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum,
  }
}
