---
id: 9
title: "Inertia 3.9: pause polling in background tabs and detect back-button visits"
seoTitle: "Inertia 3.9: background-tab polling and back-button visits"
excerpt: "Inertia 3.9 adds a background option for usePoll, a type field on the navigate event so you can refresh stale pages after the back button, and 3.9.1 ships two security hardening fixes. Here is what changed, with Vue 3 examples."
date: 2026-10-10T03:25:00Z
snippet: "usePoll(5000, {}, { background: 'pause' })"
categories: [vuejs, laravel]
tags: [inertia, vuejs, release]
---

Inertia **3.9.0** came out on **October 9, 2026**, followed a few hours later by **3.9.1**. It is a small release, but two of its additions remove code that many Vue apps write by hand:

- A **`background` option for polling**, so a dashboard can stop hitting your server while the tab is hidden.
- A **`type` field on the `navigate` event**, so you can tell a back/forward button visit apart from a normal one and refresh stale data.

3.9.1 then adds two security hardening fixes that you get just by updating. Let's go through them with Vue 3 examples.

> **Applies to:** `@inertiajs/vue3` 3.9.1 (also React and Svelte). No changes are needed on the Laravel side; `inertiajs/inertia-laravel` 3.5 works as is.

## Update

```bash
npm install @inertiajs/vue3@^3.9.1
```

That's all. Nothing in 3.9 is a breaking change.

## 1. Pause polling in background tabs

Polling is the simplest way to keep a page fresh: an order status, a queue monitor, a list of notifications. Until now, Inertia had two modes when the user switched to another tab:

- **Default:** keep polling, but only every 10th interval.
- **`keepAlive: true`:** keep polling at the full speed.

There was no way to stop completely. A dashboard that polls every 5 seconds still sent a request every 50 seconds from every forgotten tab, all day long.

### Before (3.8)

To stop polling in hidden tabs, you had to wire it up yourself:

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { usePoll } from '@inertiajs/vue3'

const { start, stop } = usePoll(5000, { only: ['orders'] }, { autoStart: false })

const sync = () => (document.hidden ? stop() : start())

onMounted(() => {
    sync()
    document.addEventListener('visibilitychange', sync)
})

onUnmounted(() => document.removeEventListener('visibilitychange', sync))
</script>
```

### After (3.9)

```vue
<script setup lang="ts">
import { usePoll } from '@inertiajs/vue3'

usePoll(5000, { only: ['orders'] }, { background: 'pause' })
</script>
```

It is also smarter than the hand-written version. When the tab becomes visible again, Inertia sends a request **right away only if one was due** while the tab was hidden. Otherwise it waits for the rest of the current interval. So a user who flicks between tabs does not trigger a request on every switch.

The option has three values:

| `background` | What happens in a hidden tab |
|---|---|
| `'throttle'` (default) | Polls every 10th interval, same as before |
| `'pause'` | Stops polling, resumes when the tab is visible |
| `'continue'` | Keeps polling at the full interval |

`keepAlive: true` still works, but it is now **deprecated** in favor of `background: 'continue'`. If you use it, this is a one-line change:

```diff
- usePoll(2000, {}, { keepAlive: true })
+ usePoll(2000, {}, { background: 'continue' })
```

The same option works with `router.poll()` outside components:

```ts
import { router } from '@inertiajs/vue3'

const { stop } = router.poll(10_000, { only: ['stats'] }, { background: 'pause' })
```

On the Laravel side, pair polling with a partial reload so each request only computes the prop you need:

```php
// app/Http/Controllers/OrderController.php
public function index(Request $request): Response
{
    return Inertia::render('orders/index', [
        'filters' => $request->only('status'),
        'orders' => fn () => OrderResource::collection(
            $request->user()->orders()->latest()->limit(20)->get()
        ),
    ]);
}
```

Because `orders` is a closure, a poll with `only: ['orders']` skips everything else.

**Which one should you pick?** Use `'pause'` for anything the user only cares about while looking at it: dashboards, lists, admin screens. Keep `'continue'` for things that must keep running in the background, such as keeping a session alive or tracking a long job that should notify the user when it ends.

Inertia 3.9 also fixes a related bug: a poll created while the tab was **already hidden** used to run at full speed until the next visibility change. Now it respects the hidden state from the start.

## 2. Know how the user arrived: `navigate` event `type`

When the user presses the back button, Inertia restores the page from browser history. That is fast, but the props are the ones the page had **when the user left it**. An inbox that showed 3 unread messages ten minutes ago still shows 3, even if there are now 12.

Before 3.9, there was no public way to tell a history restore apart from a normal visit. Now the `navigate` event has a `type`:

| `type` | When |
|---|---|
| `'initial'` | First page load, including a browser reload |
| `'visit'` | A normal Inertia visit (link click, `router.visit`, form submit) |
| `'history'` | The page was restored with the back or forward button |

### Refresh stale data after the back button

Register the listener once, for example in `resources/js/app.ts`:

```ts
import { router } from '@inertiajs/vue3'

router.on('navigate', (event) => {
    if (event.detail.type === 'history') {
        router.reload({ only: ['messages'] })
    }
})
```

If only some pages need fresh data, check the component name so other pages are not reloaded for nothing:

```ts
const refreshOnBack: Record<string, string[]> = {
    'inbox/index': ['messages', 'unreadCount'],
    'orders/index': ['orders'],
}

router.on('navigate', ({ detail }) => {
    const only = refreshOnBack[detail.page.component]

    if (detail.type === 'history' && only) {
        router.reload({ only })
    }
})
```

The reload is a partial reload, so the user sees the restored page instantly and the fresh data arrives a moment later.

### Track real page views

The same field helps with analytics. You probably don't want to count a back-button restore the same way as a new page view:

```ts
router.on('navigate', ({ detail }) => {
    analytics.track('page_view', {
        url: detail.page.url,
        restored: detail.type === 'history',
    })
})
```

One detail from the pull request: if the user goes back from a **non-Inertia** page (an external site, a file download page) and the browser restores your app, the type is also `'history'`, because the props come from the saved history state in that case too.

## 3. Security hardening in 3.9.1

Two fixes, both automatic once you update:

- **The XSRF token stays on your own origin.** Inertia's built-in HTTP client sent the `X-XSRF-TOKEN` header on every request, including requests to other domains, for example a presigned S3 upload URL used with `useHttp`. Now the header is only added for same-origin URLs. If you really need it for another origin, add it yourself in an `http.onRequest` handler.
- **History encryption uses a fresh IV for every entry.** If you use `Inertia::encryptHistory()`, entries used to share one AES-GCM IV per tab. Each entry now gets its own random IV. Entries saved by older versions can't be decrypted anymore, so Inertia simply fetches those pages from the server again. Users won't notice anything.

If your app sends requests to other domains with `useHttp`, this is the main reason to update today.

## Other fixes worth knowing

- **`useRemember`** no longer restores state from an earlier page on a brand-new visit to the same component.
- **`<InfiniteScroll>`** ignores responses that arrive after the component is gone, and no longer errors when unmounted right after its items change.
- **Clearing history** (`router.clearHistory()`) now also flushes the prefetch cache, so no prefetched page with old data survives a logout.
- `history.replaceState` **quota errors** (very large pages) are handled instead of crashing the visit.
- The Vite plugin keeps **source maps** for your entry file.

## Upgrade notes

- No breaking changes. Update to **3.9.1**, not 3.9.0, to get the security fixes.
- Search for `keepAlive` in `resources/js` and switch to `background: 'continue'` to avoid the deprecation.
- Consider `background: 'pause'` on every `usePoll` that only matters while the page is visible. It is a free reduction in server load.
- On Inertia 2? Version **2.3.29** was released the same day with the history encryption IV fix and the prefetch cache flush.

## Sources

- [Inertia v3.9.0 release notes](https://github.com/inertiajs/inertia/releases/tag/v3.9.0)
- [Inertia v3.9.1 release notes](https://github.com/inertiajs/inertia/releases/tag/v3.9.1)
- [PR #3292: `background` option for polling](https://github.com/inertiajs/inertia/pull/3292)
- [PR #3291: `type` on the `navigate` event](https://github.com/inertiajs/inertia/pull/3291)
- [PR #3313: XSRF header only for same-origin URLs](https://github.com/inertiajs/inertia/pull/3313)
- [PR #3315: unique IV per encrypted history entry](https://github.com/inertiajs/inertia/pull/3315)
- [Inertia docs: polling](https://inertiajs.com/docs/v3/data-props/polling)

Questions about this release? Ask in our [Facebook group](https://www.facebook.com/groups/LaravelVueJs) or on [Telegram](https://t.me/LaravelVueJs).
