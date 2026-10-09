import { SITE_URL } from "./site.js"
export const GOOGLE_ANALYTICS = process.env.GOOGLE_ANALYTICS
export const DEFAULT_LANG = process.env.DEFAULT_LANG
export const main_menu = [
    {
        name: 'Home',
        url: '/',
    },
    {
        name: 'Laravel',
        url: '/category/laravel',
    },
    {
        name: 'VueJs',
        url: '/category/vuejs',
    },
    {
        name: 'Jobs',
        url: '/category/jobs',
    },
    {
        name: 'eBooks',
        url: '/category/ebooks',
    }
]

export const second_menu = [
    {
        name: 'Home',
        url: '/',
    },
    {
        name: 'DMCA Policy',
        url: '/page/dmca-policy',
    },
    {
        name: 'Privacy Policy',
        url: '/page/privacy-policy',
    },
    {
        name: 'Terms and Conditions',
        url: '/page/terms-and-conditions',
    },
    {
        name: 'Contact us',
        url: '/page/contact-us',
    },
    {
        name: 'About us',
        url: '/page/about-us',
    },
    {
        name: 'Hire us',
        url: '/page/hire-us',
    },
    {
      name: 'Laravel Best',
      url: 'https://Laravel.Best',
      external: true
    }
]

export const social_media = [
    {
        title: "GitHub",
        href: "https://github.com/ansezz/laravel-vuejs",
        class: "github"
    },
    {
        title: "Facebook",
        href: "https://www.facebook.com/LaravelVueJs",
        class: "facebook"
    },
    {
        title: "Twitter",
        href: "https://twitter.com/LaravelVueJs",
        class: "twitter"
    },
    {
        title: "Pinterest",
        href: "https://www.pinterest.com/laravelvuejs/",
        class: "pinterest"
    },
    {
        title: "Flickr",
        href: "https://www.flickr.com/photos/laravelvuejs/",
        class: "flickr"
    },
    {
        title: "Reddit",
        href: "https://www.reddit.com/user/laravelvuejs",
        class: "reddit"
    },
    {
        title: "Tumblr",
        href: "https://laravelvuejs.tumblr.com",
        class: "tumblr"
    },
    {
        title: "Instagram",
        href: "https://www.instagram.com/laravelvuejs/",
        class: "instagram"
    },
    {
        title: "Telegram",
        href: "http://t.me/LaravelVueJs",
        class: "paper-plane"
    },
    {
        title: "Rss",
        href: SITE_URL + "/feed.xml",
        class: "rss"
    }
]
