import { Suspense } from 'react'
import { SignupForm } from './SignupForm'

export const metadata = {
  title: 'Sign in — Planet Sorted',
  description: 'Get a magic sign-in link. No password needed.',
}

export default function SignupPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-black flex items-center justify-center px-4 py-12">
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </main>
  )
}
