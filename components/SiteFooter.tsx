export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
      <nav className="flex justify-center gap-6">
        <a href="/privacy" className="hover:text-gray-800 transition-colors">Privacy</a>
        <a href="/terms" className="hover:text-gray-800 transition-colors">Terms</a>
        <a href="/cookies" className="hover:text-gray-800 transition-colors">Cookies</a>
      </nav>
      <p className="mt-3 text-xs text-gray-400">
        © {new Date().getFullYear()} Planet Sorted. Planet Sorted Limited, trading as Planet Sorted.
      </p>
    </footer>
  )
}
