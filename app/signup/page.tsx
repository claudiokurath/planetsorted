import { Suspense } from 'react'
import { SignupForm } from './SignupForm'

export const metadata = {
  title: 'Sign in — Planet SOR7ED',
  description: 'Get a magic sign-in link. No password needed.',
}

export default function SignupPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-black flex flex-col items-center justify-center p-6">
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </main>
  )
}
