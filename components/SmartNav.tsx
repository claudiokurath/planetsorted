import Link from 'next/link'

export function SmartNav() {
  return (
    <header className="border-b border-neutral-800 bg-[#0A0A0A]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-black uppercase tracking-wider text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          Planet Sorted
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/intelligence" className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-[#C0392B] transition-colors">
            Guidebook
          </Link>
          <Link href="/tools" className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-[#C0392B] transition-colors">
            Toolbox
          </Link>
          <Link href="/dashboard" className="rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-[#C0392B] hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  )
}
