import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  maxWidth?: 'max-w-md' | 'max-w-4xl' | 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl'
  className?: string
}

export function PageShell({ children, maxWidth = 'max-w-6xl', className = '' }: PageShellProps) {
  return (
    <main className={`min-h-[calc(100vh-80px)] bg-black text-white ${className}`}>
      <div className={`mx-auto ${maxWidth} px-4 py-12 sm:px-6 lg:px-8`}>
        {children}
      </div>
    </main>
  )
}
