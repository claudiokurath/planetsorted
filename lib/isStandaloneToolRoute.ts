import { STANDALONE_ROUTES } from './standaloneRoutes'

const STANDALONE_PATHS = new Set(Object.values(STANDALONE_ROUTES))

export function isStandaloneToolRoute(pathname: string | null): boolean {
  if (!pathname) return false
  return STANDALONE_PATHS.has(pathname.split('?')[0])
}
