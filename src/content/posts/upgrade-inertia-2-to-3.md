---
id: 7
title: "Upgrade a Laravel 13 + Vue app from Inertia 2 to Inertia 3: the practical checklist"
seoTitle: "Upgrade Inertia 2 to 3 in Laravel 13 + Vue: the checklist"
excerpt: "Inertia 2 stopped getting bug fixes on September 26, 2026. Here is the step-by-step upgrade we tested on a real Laravel 13 + Vue app: dependencies, the new Vite plugin, renamed APIs, Axios, SSR and a final audit."
date: 2026-10-13T07:00:00Z
snippet: "npm i @inertiajs/vue3@^3"
categories: [laravel, vuejs]
tags: [inertia, laravel, vuejs, upgrade]
---

Inertia 3 came out on **March 26, 2026**, and it is what the official Laravel Vue starter kit uses today. Since **September 26, 2026**, Inertia 2 no longer gets bug fixes. It still gets security fixes until **March 26, 2027** (see the [support policy](https://inertiajs.com/docs/v3/getting-started)). So if your app still runs on 2.x, now is a good time to upgrade, while it is a planned job and not an emergency.

The good news: for a typical Laravel + Vue app, the upgrade is small. We tested every step below on the Laravel 13 Vue starter kit as it was just before the Inertia 3 release. After the dependency bump alone, the app built, logged in, saved forms, and all **40 feature tests passed**. The rest of the checklist is about removing old code and using what v3 adds.

> **Tested with:** Laravel 13.35, `inertiajs/inertia-laravel` 3.5, `@inertiajs/vue3` and `@inertiajs/vite` 3.9, Vue 3.5, Vite 8, PHP 8.4. Inertia 3 itself needs **PHP 8.2+ and Laravel 11+**.

## The checklist at a glance

1. Upgrade the PHP and npm packages, republish the config
2. Audit your code for removed and renamed APIs
3. Check what you imported through Axios, `qs` or `lodash-es`
4. Rename the `inertia` head attribute (or switch to the new Blade components)
5. Adopt the `@inertiajs/vite` plugin and slim down `app.ts`
6. Simplify SSR
7. Run your tests, then a browser smoke test

## 1. Upgrade the packages

```bash
composer require inertiajs/inertia-laravel:^3.0 -W
npm install @inertiajs/vue3@^3.0 @inertiajs/vite@^3.0
```

`@inertiajs/vite` is optional, but you want it (step 5). Next, republish the config file, because v3 changed its structure. Then clear compiled views, because the output of the `@inertia` directive changed:

```bash
php artisan vendor:publish --provider="Inertia\ServiceProvider" --force
php artisan view:clear
```

`--force` overwrites `config/inertia.php`, so commit first and re-apply your changes afterwards. The main change: page settings now live under a `pages` key, and the `testing` section is shorter.

```php
// config/inertia.php (v3)
'pages' => [
    'ensure_pages_exist' => false,
    'paths' => [resource_path('js/pages')],
    'extensions' => ['js', 'jsx', 'svelte', 'ts', 'tsx', 'vue'],
],

'testing' => [
    'ensure_pages_exist' => true,
],
```

Check `paths`. The starter kits use lowercase `js/pages`, and older apps often use `js/Pages`.

## 2. Audit removed and renamed APIs

Run this from your project root to find everything that needs a change:

```bash
grep -rnE "router\.cancel\(|router\.on\('(invalid|exception)'|inertia:(invalid|exception)|hideProgress|revealProgress|future:|Inertia::lazy|LazyProp|require\(['\"]@inertiajs" resources/js app routes
```

Here is what each match means, from the [official upgrade guide](https://inertiajs.com/docs/v3/getting-started/upgrade-guide):

| Inertia 2 | Inertia 3 |
|---|---|
| `router.on('invalid', …)` | `router.on('httpException', …)` |
| `router.on('exception', …)` | `router.on('networkError', …)` |
| `router.cancel()` (sync visits only) | `router.cancelAll()` (sync, async and prefetch) |
| `hideProgress()`, `revealProgress()` | `progress.hide()`, `progress.reveal()` |
| `defaults: { future: { … } }` | delete it: all four options are now always on |
| `Inertia::lazy()` / `LazyProp` | `Inertia::optional()` |
| `require('@inertiajs/…')` | `import`: the packages are ESM only |

Two notes:

- To keep the old behavior of `router.cancel()`, call `router.cancelAll({ async: false, prefetch: false })`.
- The new per-visit callbacks let you handle errors without leaving the page. Return `false` from `onHttpException` and Inertia will not show its error page:

```ts
router.post('/invoices', data, {
    onHttpException: (response) => {
        toast.error(`Server error (${response.status}). Please try again.`)
        return false
    },
    onNetworkError: () => toast.error('You seem to be offline.'),
})
```

TypeScript helps here too: `router.cancel` no longer exists in the v3 types, so `vue-tsc --noEmit` points to every place you still call it.

One quiet behavior change: `useForm` now keeps `processing` set to `true` until `onFinish`, not just until the response arrives. If you use `form.processing` to disable a submit button, the button now stays disabled a little longer, which is usually what you want.

## 3. Axios, `qs` and `lodash-es`

Inertia 3 no longer ships Axios. It uses a small built-in XHR client. For most apps nothing changes: Laravel's CSRF protection keeps working, because the client reads the `XSRF-TOKEN` cookie and sends it in the `X-XSRF-TOKEN` header (we checked this with POST requests in our test app).

You do need to act in three cases:

- **You import `axios`, `qs` or `lodash-es` in your own code** but never installed them yourself. They used to come in with Inertia, and now they don't. Install them directly: `npm install axios` (or `qs`, or `lodash-es`).
- **You use Axios interceptors** to add headers or log errors. Move them to Inertia's built-in interceptors, which apply to the router, `useForm`, `<Form>` and `useHttp`:

```ts
import { http } from '@inertiajs/vue3'

http.onRequest((config) => {
    config.headers['X-Tenant'] = currentTenant()
    return config
})

http.onError((error) => reportToSentry(error))
```

- **You really need Axios** (a shared, customised instance, for example). Pass it through the adapter:

```ts
import axios from 'axios'
import { axiosAdapter } from '@inertiajs/core'

createInertiaApp({
    http: axiosAdapter(axios.create({ timeout: 10_000 })),
})
```

The packages now target **ES2022**. If you must support very old browsers, add `@vitejs/plugin-legacy`.

## 4. The `<head>` attribute

v3 renamed the `inertia` attribute on head elements to `data-inertia`. In your root Blade view, `<title inertia>` becomes `<title data-inertia>`. In our test, Inertia still replaced the old title on the client. With SSR you can end up with duplicate tags, though, so rename it anyway.

Even better, use the new Blade components. The slot of `<x-inertia::head>` is only rendered when SSR is off, which finally fixes duplicate `<title>` tags:

```blade
{{-- resources/views/app.blade.php --}}
<head>
    @vite(['resources/css/app.css', 'resources/js/app.ts', "resources/js/pages/{$page['component']}.vue"])
    <x-inertia::head>
        <title>{{ config('app.name', 'Laravel') }}</title>
    </x-inertia::head>
</head>
<body class="font-sans antialiased">
    <x-inertia::app />
</body>
```

The `@inertia` and `@inertiaHead` directives still work if you would rather not touch this file.

## 5. Adopt the Vite plugin

This is where your code gets shorter. Add the plugin to `vite.config.ts`, and remove the `ssr` entry from the Laravel plugin if you had one:

```ts
// vite.config.ts
import inertia from '@inertiajs/vite'
import laravel from 'laravel-vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.ts'],
            refresh: true,
        }),
        inertia(),
        vue(),
    ],
})
```

The plugin resolves pages from `./pages` or `./Pages` and mounts the app for you, so the `resolve` and `setup` callbacks can go:

```diff
 import { createInertiaApp } from '@inertiajs/vue3'
-import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
-import type { DefineComponent } from 'vue'
-import { createApp, h } from 'vue'
 import '../css/app.css'

 createInertiaApp({
     title: (title) => (title ? `${title} - ${appName}` : appName),
-    resolve: (name) =>
-        resolvePageComponent(`./pages/${name}.vue`, import.meta.glob<DefineComponent>('./pages/**/*.vue')),
-    setup({ el, App, props, plugin }) {
-        createApp({ render: () => h(App, props) }).use(plugin).mount(el)
-    },
     progress: { color: '#4B5563' },
 })
```

Do you register Vue plugins such as i18n or Pinia? Move them into `withApp`:

```ts
createInertiaApp({
    withApp(app) {
        app.use(i18n).use(pinia)
    },
})
```

Your old `resolve` and `setup` still work in v3. In our test, the app ran fine before we touched `app.ts`, so you can do this step later. The Laravel team made exactly this change in the starter kit ([commit 290aba0](https://github.com/laravel/vue-starter-kit/commit/290aba0dc11900cc1ac8a433229583b644699b48)).

**Optional: default layouts.** The starter kit also moved page layouts out of each page and into one place, with the new `layout` option:

```ts
createInertiaApp({
    layout: (name) => (name.startsWith('auth/') ? AuthLayout : AppLayout),
})
```

A page can then pass props to its layout with `defineOptions({ layout: { breadcrumbs: [...] } })`. That is optional, so do it page by page.

## 6. Simplify SSR

With the Vite plugin, **SSR runs in `npm run dev`**. There is no separate SSR build and no `inertia:start-ssr` while you develop. The plugin also reuses `app.ts` for the server bundle, so you can usually delete `resources/js/ssr.ts`:

```bash
git rm resources/js/ssr.ts
```

In production nothing new is needed: build both bundles, then start the SSR server (Node.js 22 or newer):

```bash
npm run build:ssr   # vite build && vite build --ssr
php artisan inertia:start-ssr
```

We checked this in our test app. After deleting `ssr.ts`, `vite build --ssr` still produced `bootstrap/ssr/app.js`. The SSR server rendered the login page with exactly one `<title>`.

v3 can also turn SSR off for specific routes, via middleware or the facade. That is useful for pages that only make sense in the browser.

## 7. Test it

```bash
php artisan test
npx vue-tsc --noEmit
npm run build
```

Then click through the paths that matter most: log in, submit a form with a validation error, upload a file, and open a page that uses deferred or partial reloads. If you have a global error handler, trigger a 500 to make sure your `httpException` listener runs.

## What you get for your trouble

Upgrading is more than staying supported. v3 adds features that remove real code from Vue apps:

- **`useHttp`**: `useForm`-style state (`processing`, `errors`, progress) for plain JSON requests that don't change the page.
- **Optimistic updates** with automatic rollback, for the router, `useForm`, `<Form>` and `useHttp`.
- **Instant visits**, **layout props** and much better SSR error messages.

On Thursday we will build two of those: an optimistic like button and a live search with `useHttp`. [Follow the series](/posts) so you don't miss it.

## Sources

- [Inertia v3 upgrade guide](https://inertiajs.com/docs/v3/getting-started/upgrade-guide)
- [Inertia support policy](https://inertiajs.com/docs/v3/getting-started)
- [Client-side setup and HTTP client](https://inertiajs.com/docs/v3/installation/client-side-setup)
- [Server-side rendering](https://inertiajs.com/docs/v3/advanced/server-side-rendering)
- [Laravel Vue starter kit: the Inertia 3 upgrade commit](https://github.com/laravel/vue-starter-kit/commit/290aba0dc11900cc1ac8a433229583b644699b48)
- [Inertia releases on GitHub](https://github.com/inertiajs/inertia/releases)

Stuck on a step? Ask in our [Facebook group](https://www.facebook.com/groups/LaravelVueJs) or on [Telegram](https://t.me/LaravelVueJs), where we also share a short digest of new posts every Sunday.
