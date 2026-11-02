import { Suspense } from 'react'
import { SignupForm } from './SignupForm'

export const metadata = {
  title: 'Sign in — Planet Sorted',
  description: 'Get a magic sign-in link. No password needed.',
  robots: { index: false, follow: false },
}

export default function SignupPage() {
  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-black flex flex-col items-center justify-center p-6">
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </main>
  )
}
