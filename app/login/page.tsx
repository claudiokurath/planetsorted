import { redirect } from 'next/navigation'

/**
 * Typed-URL alias for the sign-in surface. The auth experience is one
 * dual-mode page at /signup; /login always lands returning members in
 * the returning-member tab.
 */
export default function LoginPage() {
  redirect('/signup?mode=returning')
}
