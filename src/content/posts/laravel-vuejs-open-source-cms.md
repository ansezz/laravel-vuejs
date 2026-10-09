---
id: 5
title: "Laravel & VueJs: an open source community blog, rebuilt"
excerpt: "Laravel & VueJs started as an open source CMS built with Laravel, Nova, GraphQL and Nuxt. Here is what it was, what it is now, and how you can help shape it."
date: 2020-02-20T19:31:34Z
updated: 2026-10-10T00:00:00Z
snippet: "git clone ansezz/laravel-vuejs"
featured: true
categories: [laravel, vuejs]
tags: [laravel, vuejs, open-source, astro]
---

Laravel & VueJs began as a side project with a simple idea: one place where developers who love **Laravel** on the back end and **Vue** on the front end can learn from each other. The code has always been open source, and the community around it has grown to thousands of developers.

This post explains where the project came from, how it is built today, and how you can take part.

## Where it started

The first version was a full-stack CMS, and a showcase of what the two frameworks could do together:

| Layer | Technology |
| --- | --- |
| Back end | Laravel, with Laravel Nova as the admin panel |
| API | GraphQL through Lighthouse |
| Search | Laravel Scout + Algolia |
| Auth | Passport and Socialite |
| Front end | Nuxt 2 (Vue 2), Apollo, Bootstrap |

It worked well, but running a PHP server, a database, a Node SSR server and a GraphQL API for what is mostly a reading experience was a lot of moving parts.

## What it is now

In 2026 the site moved to **laravel-vuejs.space** and was rebuilt as a static site:

- **Astro** renders every page to plain HTML at build time.
- Posts are **Markdown files** in the repository, so writing a post is a pull request.
- The site is served from **Cloudflare's edge**, with almost no JavaScript.
- Code samples are highlighted at build time, in light and dark themes.

The original Laravel + Nuxt code is still in the repository's Git history ([browse it at commit `0b000da`](https://github.com/ansezz/laravel-vuejs/tree/0b000da), the last version before the Astro migration), if you want to study a complete Laravel + GraphQL + Nuxt application.

## Writing a post

Every article lives in `src/content/posts`. A post is a Markdown file with a small front matter block:

```md
---
id: 6
title: "Typed props in Vue 3.5 with defineProps"
excerpt: "A short, practical guide to typing component props."
date: 2026-10-12T09:00:00Z
categories: [vuejs]
tags: [vuejs, typescript]
---

Your article, in Markdown. Code blocks are highlighted automatically.
```

Open a pull request with your file, and we will review it with you.

## Contributors

- [Anass Ez-zouaine](https://github.com/ansezz)
- [Othmane Gourirran](https://github.com/OthmanDev)
- [Omar Bourhaouta](https://github.com/bourhaouta)

## Contributing

Bug reports, ideas and pull requests are welcome on [GitHub](https://github.com/ansezz/laravel-vuejs). The project is open source under the [MIT license](https://opensource.org/licenses/MIT).
