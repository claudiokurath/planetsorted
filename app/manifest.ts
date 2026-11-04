import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'PLANET SOR7ED',
    short_name: 'SOR7ED',
    description: 'Practical tools and guidebooks. One clear next step.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    lang: 'en-GB',
    icons: [
      { src: '/app-icons/sor7ed-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/app-icons/sor7ed-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/app-icons/sor7ed-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Brain type', url: '/brain-type' },
      { name: 'Toolbox', url: '/tools' },
      { name: 'Guidebooks', url: '/guidebooks' },
    ],
  }
}
