export function isStandaloneToolRoute(pathname: string | null): boolean {
  return !!pathname && pathname.startsWith('/tools/') && pathname !== '/tools'
}
