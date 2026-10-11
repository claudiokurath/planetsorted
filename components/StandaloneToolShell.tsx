import type { ReactNode } from 'react'
import { BrandLogo } from '@/components/BrandLogo'

interface StandaloneToolShellProps {
  title: string
  category: string
  children: ReactNode
}

export function StandaloneToolShell({ title, category, children }: StandaloneToolShellProps) {
  return (
    <div className="sorted-tool-app">
      <header className="sorted-tool-masthead">
        <a href="/" target="_top" aria-label="SOR7ED home" className="sorted-tool-brand"><BrandLogo className="h-8 w-auto" /></a>
        <div className="sorted-tool-identity"><span>{category} / SOR7ED Lab</span><p>{title}</p></div>
        <a className="sorted-tool-back" href="/tools" target="_top">Toolbox <span aria-hidden="true">↗</span></a>
      </header>
      {children}
    </div>
  )
}
