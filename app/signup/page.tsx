import Image from 'next/image'
import { Suspense } from 'react'
import { SignupForm } from './SignupForm'

export const metadata = {
  title: 'Sign in — Planet Sorted',
  description: 'Get a magic sign-in link. No password needed.',
}

export default function SignupPage() {
  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-black flex flex-col items-center justify-center p-6">
      <Image
        src="/images/tangle-white.png"
        alt=""
        aria-hidden
        width={1024}
        height={1024}
        className="pointer-events-none absolute -right-24 -top-16 z-[-1] w-72 select-none opacity-[0.07] sm:w-96"
      />
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </main>
  )
}
