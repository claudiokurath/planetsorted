/**
 * Sanitises the `next` redirect target used by the magic-link auth flow.
 *
 * Without this, `?next=https://evil.example` sends a freshly signed-in member
 * straight to someone else's site — a convincing phishing hop, because the
 * redirect happens immediately after a genuine SOR7ED login.
 *
 * Only same-site absolute paths are allowed through. Anything else falls back
 * to the dashboard.
 *
 * Rejected: protocol-relative ("//evil.example"), absolute URLs
 * ("https://evil.example"), backslash variants that some browsers normalise to
 * "//" ("/\evil.example"), and any value that does not start with "/".
 */
export const DEFAULT_NEXT = '/dashboard'

export function safeNext(next: string | null | undefined): string {
  if (!next) return DEFAULT_NEXT

  // Must be a rooted path. Rules out "https://…", "evil.example" and "mailto:…".
  if (!next.startsWith('/')) return DEFAULT_NEXT

  // Rules out "//evil.example" and "/\evil.example", both of which browsers
  // treat as protocol-relative URLs pointing off-site.
  if (next.startsWith('//') || next.startsWith('/\\')) return DEFAULT_NEXT

  return next
}
