import { STANDALONE_ROUTES } from './standaloneRoutes'

const STANDALONE_PATHS = new Set(Object.values(STANDALONE_ROUTES))

export function isStandaloneToolRoute(pathname: string | null): boolean {
  if (!pathname) return false
  const path = pathname.split('?')[0]
  return STANDALONE_PATHS.has(path) || path.startsWith('/embed/')
}
