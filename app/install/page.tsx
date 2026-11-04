import Link from 'next/link'
import { AppInstall } from '@/components/AppInstall'
import { publicPageMetadata } from '@/lib/seo'

export const metadata = publicPageMetadata({ title: 'SOR7ED on your phone', path: '/install', description: 'Add SOR7ED to your iPhone or Android home screen for quick access to tools and guidebooks.' })

export default function InstallPage() {
  return <section className="mx-auto max-w-3xl px-6 py-16 text-center text-white">
    <p className="text-sm uppercase tracking-widest text-[#FFD400]">SOR7ED on your phone</p>
    <h1 className="mt-5 font-bebas text-5xl sm:text-6xl">One tap. One clear next step.</h1>
    <p className="mt-6 leading-7 text-neutral-300">Keep the tools and guidebooks on your home screen, with your SOR7ED scribble icon. Free to add. No app-store download needed.</p>
    <AppInstall />
    <p className="mt-10 border-t border-white/20 pt-6 text-sm leading-6 text-neutral-400">This is the live website in a home-screen app. You need an internet connection. WhatsApp opens separately. Sign in inside this version if needed; a sign-in link opened in another browser may only sign in that browser.</p>
    <Link className="mt-8 inline-flex min-h-12 items-center text-[#FFD400] underline underline-offset-4" href="/brain-type">Find your starting point →</Link>
  </section>
}
