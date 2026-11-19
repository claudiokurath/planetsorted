import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Your protocol — SOR7ED', robots: { index: false, follow: false } }
export default async function ProtocolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) notFound()
  // Opening an older card does not stage or send another WhatsApp message.
  redirect(`https://www.sor7ed.com/resource?context=article&slug=${encodeURIComponent(slug)}`)
}
