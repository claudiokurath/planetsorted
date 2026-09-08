/**
 * The standalone tools are public now — this is kept only so the tool pages
 * that call it don't need editing. It never redirects.
 */
export async function verifyStandaloneAccess(
  _slug: string,
  _searchParams?: { access_token?: string } | Promise<{ access_token?: string }>
): Promise<true> {
  return true
}
