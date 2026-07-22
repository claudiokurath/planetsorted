import Link from 'next/link'

export function SmartNav() {
  return (
    <header className="border-b border-[#E8E0D5]" style={{ backgroundColor: '#FAF7F2' }}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-black uppercase tracking-wider text-[#1A1A1A]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          Planet Sorted
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/intelligence" className="text-xs font-bold uppercase tracking-widest text-[#444] hover:text-[#C0392B] transition-colors">
            Guidebook
          </Link>
          <Link href="/tools" className="text-xs font-bold uppercase tracking-widest text-[#444] hover:text-[#C0392B] transition-colors">
            Toolbox
          </Link>
          <Link href="/dashboard" className="rounded-full bg-[#1A1A1A] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C0392B] transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  )
}
