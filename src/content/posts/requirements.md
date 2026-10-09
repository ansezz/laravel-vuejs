---
id: 3
title: "What you need to build with Laravel 13 and Vue 3 in 2026"
excerpt: "PHP versions, extensions, Node.js, databases and the packages worth knowing: a practical checklist for a modern Laravel + Vue stack, and how it compares with the stack this site started on."
date: 2019-05-18T02:48:53Z
updated: 2026-10-10T00:00:00Z
snippet: "php -v  # 8.3+"
featured: true
categories: [laravel]
tags: [laravel, php, vuejs, tooling]
---

This blog was first built on Laravel 5, Nova, GraphQL, Nuxt 2 and Apollo. A lot has changed since then. Here is a checklist for starting a Laravel + Vue project today.

> Versions move fast. Check the official [Laravel release notes](https://laravel.com/docs/releases) and the [Vue releases](https://github.com/vuejs/core/releases) before you start.

## The server side

**Laravel 13** was released on March 17, 2026. It needs **PHP 8.3 to 8.5**. Laravel 12 (PHP 8.2 to 8.5) still gets security fixes until February 2027, but new projects should start on 13.

Your PHP install needs these extensions. Most PHP distributions ship them by default:

- Ctype, cURL, DOM, Fileinfo, Filter, Hash
- Mbstring, OpenSSL, PCRE, PDO, Session
- Tokenizer, XML

You also need:

- **Composer 2**, the PHP package manager
- **A database.** New Laravel apps use **SQLite** out of the box, which is perfect for getting started. MySQL, MariaDB, PostgreSQL and SQL Server are all supported for production.

The quickest ways to get everything installed:

- **macOS and Windows:** [Laravel Herd](https://herd.laravel.com) installs PHP, Composer and the Laravel installer in one go.
- **Linux, macOS or Windows:** [php.new](https://php.new) gives you a one-line installer.
- **Docker:** [Laravel Sail](https://laravel.com/docs/sail) if you prefer containers.

Check what you have:

```bash
php -v          # PHP 8.3 or newer
composer -V     # Composer 2.x
php -m          # lists the loaded extensions
```

## The front-end side

- **Node.js**, a current LTS release (22 or 24), with npm, pnpm or Bun
- **Vue 3.5**, the current stable line. Vue 3.6, with the opt-in *Vapor mode* that skips the virtual DOM, is in release candidate as of October 2026.
- **Vite**, which Laravel uses to build front-end assets

```bash
node -v   # v22 or newer
npm -v
```

## Then and now

Here is the stack this blog started with, next to what we would pick for a new project today:

| Job | Then (2019) | Now (2026) |
| --- | --- | --- |
| Framework | Laravel 5.8 | Laravel 13 |
| Admin panel | Nova | Nova 5 or Filament |
| API | GraphQL with Lighthouse | Inertia 2 for app pages; JSON:API resources or Lighthouse for public APIs |
| Front end | Nuxt 2, Vue 2, Options API | Vue 3.5 with `<script setup>` and TypeScript, via Inertia or Nuxt 4 |
| State | Vuex | Pinia, or Inertia page props |
| Styling | Bootstrap 3, Stylus | Tailwind CSS 4 |
| Auth | Passport, Socialite | Starter kit auth or WorkOS AuthKit; Sanctum for SPA and mobile tokens; Socialite for OAuth |
| Search | Scout + Algolia | Scout (Algolia, Meilisearch or Typesense), or vector search with pgvector |
| Debugging | Telescope | Telescope, Pail, and Pulse or Nightwatch in production |
| Testing | PHPUnit | Pest, plus Vitest for components |

## A good default

If you are not sure where to start, use the official **Laravel + Vue starter kit**. You get Laravel 13, Inertia 2, Vue 3 with TypeScript, Tailwind and shadcn-vue, plus login, registration and email verification already wired up. Our [setup guide](/application-setup) walks you through it.
