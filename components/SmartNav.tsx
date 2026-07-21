export function SmartNav() {
  return (
    <header className="border-b border-gray-200 px-6 py-4">
      <nav className="mx-auto flex max-w-5xl items-center justify-between">
        <a href="/" className="text-base font-semibold text-gray-900 hover:text-gray-700 transition-colors">
          Planet Sorted
        </a>
        {/* Auth-aware nav items will be added here once auth is wired up */}
      </nav>
    </header>
  )
}
