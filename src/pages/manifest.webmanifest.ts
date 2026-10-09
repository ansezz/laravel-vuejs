import { SITE_NAME, SITE_DESCRIPTION } from '../config/site'
export const GET = () => new Response(JSON.stringify({
  name: SITE_NAME, short_name: 'Laravel & Vue', description: SITE_DESCRIPTION, lang: 'en',
  start_url: '/', display: 'standalone', theme_color: '#6936D3', background_color: '#080B13',
  icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }, { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
}), { headers: { 'Content-Type': 'application/manifest+json' } })
