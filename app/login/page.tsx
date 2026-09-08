import { redirect } from 'next/navigation'

/**
 * Typed-URL alias for the sign-in surface. The auth experience is one email magic-link page at /signup.
 */
export default function LoginPage() {
  redirect('/signup')
}
