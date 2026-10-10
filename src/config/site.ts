// Site-wide settings: one place for the domain, contact address and social channels.
export const SITE_URL = 'https://laravel-vuejs.space'
export const SITE_NAME = 'Laravel & VueJs'
export const SITE_DOMAIN = 'laravel-vuejs.space'
export const SITE_DESCRIPTION =
  'Tutorials, guides and a friendly community for developers building with Laravel and Vue.'
export const CONTACT_EMAIL = 'contact@laravel-vuejs.space'
export const GITHUB_URL = 'https://github.com/ansezz/laravel-vuejs'
export const TWITTER_HANDLE = '@LaravelVueJs'
export const DISQUS_SHORTNAME = 'laravel-vuejs-com' // Disqus forum id (not a URL)

// Brand palette (from the original design's variables.styl and logo)
export const BRAND = { mint: '#63F9E6', purple: '#6936D3', slate: '#384457', mist: '#EBEEF2' }

export const SOCIALS = [
  { id: 'facebook', name: 'Facebook', handle: 'LaravelVueJs', url: 'https://www.facebook.com/LaravelVueJs' },
  { id: 'x', name: 'X', handle: '@LaravelVueJs', url: 'https://x.com/LaravelVueJs' },
  { id: 'linkedin', name: 'LinkedIn', handle: 'laravel-vuejs', url: 'https://www.linkedin.com/company/laravel-vuejs' },
  { id: 'instagram', name: 'Instagram', handle: '@laravelvuejs', url: 'https://www.instagram.com/laravelvuejs' },
  { id: 'telegram', name: 'Telegram', handle: 'LaravelVueJs', url: 'https://t.me/LaravelVueJs' },
  { id: 'pinterest', name: 'Pinterest', handle: 'laravelvuejs', url: 'https://www.pinterest.com/laravelvuejs' },
  { id: 'github', name: 'GitHub', handle: 'ansezz/laravel-vuejs', url: GITHUB_URL },
] as const

export const GROUPS = [
  { name: 'Laravel & VueJs', description: 'Questions, discussions and show-and-tell.', url: 'https://www.facebook.com/groups/LaravelVueJs/' },
  { name: 'Freelance & Remote Jobs', description: 'Post and find Laravel and Vue gigs, for free.', url: 'https://www.facebook.com/groups/Laravel.Vuejs.Jobs' },
] as const

export const NAV = [
  { label: 'Articles', href: '/posts' },
  { label: 'Laravel', href: '/category/laravel' },
  { label: 'Vue', href: '/category/vuejs' },
  { label: 'Jobs', href: '/jobs/job-archive' },
  { label: 'Community', href: '/page/about-us' },
] as const

export const FOOTER = [
  { title: 'Learn', links: [
    { label: 'All articles', href: '/posts' }, { label: 'Laravel', href: '/category/laravel' },
    { label: 'Vue', href: '/category/vuejs' }, { label: 'Learning paths', href: '/page/courses' },
    { label: 'Search', href: '/search' } ] },
  { title: 'Community', links: [
    { label: 'About us', href: '/page/about-us' }, { label: 'Jobs', href: '/jobs/job-archive' },
    { label: 'Newsletter', href: '/page/newsletter' }, { label: 'Open source', href: '/page/products' },
    { label: 'FAQ', href: '/page/faq' } ] },
  { title: 'Work with us', links: [
    { label: 'Hire us', href: '/page/hire-us' }, { label: 'Advertise', href: '/page/hire-us#advertise' },
    { label: 'Contact', href: '/page/contact-us' }, { label: 'Write for us', href: '/who-we-are#write-for-the-blog' } ] },
  { title: 'Legal', links: [
    { label: 'Privacy policy', href: '/page/privacy-policy' }, { label: 'Terms', href: '/page/terms-and-conditions' },
    { label: 'DMCA policy', href: '/page/dmca-policy' }, { label: 'Accessibility', href: '/page/accessibility' }, { label: 'RSS feed', href: '/feed.xml' } ] },
] as const

// Default author for posts. Keep to facts we can back up (no invented credentials).
export const AUTHOR = {
  name: 'Anass Ez-zouaine', slug: 'anass-ez-zouaine', url: '/author/anass-ez-zouaine',
  role: 'Founder and maintainer of Laravel & VueJs',
  sameAs: ['https://github.com/ansezz'],
} as const

// Search-engine verification. Paste the token (only the content="..." value) and redeploy.
// Google Search Console: Settings > Ownership verification > HTML tag. Bing Webmaster Tools: Add site > HTML Meta Tag.
// Leave empty to skip the tag (DNS verification through Cloudflare works too).
export const GOOGLE_SITE_VERIFICATION = ''
export const BING_SITE_VERIFICATION = ''

// IndexNow (Bing, Yandex, Seznam, Naver...): this key is public by design and is served at /<key>.txt.
export const INDEXNOW_KEY = '6e60e68e8d8b23b36f7e72a51241af0e'

// AI and search crawlers that robots.txt explicitly welcomes.
export const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'CCBot', 'Amazonbot', 'meta-externalagent',
  'DuckAssistBot', 'MistralAI-User', 'cohere-ai', 'YouBot'] as const
