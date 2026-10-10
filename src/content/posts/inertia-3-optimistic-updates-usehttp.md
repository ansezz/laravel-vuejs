---
id: 8
title: "Optimistic updates and useHttp in Inertia 3 with Vue: a like button and a live search"
seoTitle: "Inertia 3 optimistic updates and useHttp with Vue"
excerpt: "Build two everyday features with Inertia 3's new tools: a like button that updates instantly and rolls back on failure, and a debounced live search with useHttp. Laravel 13 back end, typed Vue 3 front end, tests included."
date: 2026-10-15T07:00:00Z
snippet: "router.optimistic(...)"
categories: [vuejs, laravel]
tags: [inertia, vuejs, laravel]
---

Users notice waiting. A like button that takes 300 ms to react feels broken, even when nothing is wrong. Until now, Laravel + Vue apps had two ways out: manage local state by hand, or bring in a separate data library. **Inertia 3** adds two built-in tools for this:

- **Optimistic updates**: change the UI right away, send the request, and roll back automatically if it fails.
- **`useHttp`**: the familiar `useForm` state (`processing`, `errors`, progress) for plain JSON requests that should not trigger a page visit.

In this post we build both into one page: a **like button** and a **live search**. Every snippet comes from a working Laravel 13 app that we tested in the browser, with a slow server and with a failing one.

> **Tested with:** Laravel 13.35, `inertiajs/inertia-laravel` 3.5, `@inertiajs/vue3` 3.9, Vue 3.5, TypeScript, Pest 4. Still on Inertia 2? Start with our [upgrade checklist](/upgrade-inertia-2-to-3).

## The back end

Posts can be liked by users, so we need a pivot table:

```php
// database/migrations/xxxx_create_post_likes_table.php
Schema::create('post_likes', function (Blueprint $table) {
    $table->foreignId('post_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->timestamps();
    $table->primary(['post_id', 'user_id']);
});
```

```php
// app/Models/Post.php
public function likes(): BelongsToMany
{
    return $this->belongsToMany(User::class, 'post_likes')->withTimestamps();
}
```

The index page sends each post with its like count and whether the current user liked it:

```php
// app/Http/Controllers/PostController.php
public function index(Request $request): Response
{
    return Inertia::render('posts/Index', [
        'posts' => Post::query()
            ->withCount('likes')
            ->withExists(['likes as liked' => fn ($q) => $q->whereKey($request->user()->id)])
            ->latest()
            ->limit(20)
            ->get(['id', 'title', 'excerpt']),
    ]);
}
```

Liking is an ordinary Inertia endpoint: change the data, then `back()`. Inertia follows the redirect and sends fresh props.

```php
// app/Http/Controllers/PostLikeController.php
public function store(Request $request, Post $post): RedirectResponse
{
    $post->likes()->syncWithoutDetaching([$request->user()->id]);

    return back();
}

public function destroy(Request $request, Post $post): RedirectResponse
{
    $post->likes()->detach($request->user()->id);

    return back();
}
```

Search is a JSON endpoint. It is not a page, so it returns `response()->json()`:

```php
// app/Http/Controllers/PostSearchController.php
public function __invoke(Request $request): JsonResponse
{
    $validated = $request->validate([
        'q' => ['required', 'string', 'min:2', 'max:100'],
    ]);

    return response()->json(
        Post::query()
            ->where('title', 'like', '%'.$validated['q'].'%')
            ->orderBy('title')
            ->limit(8)
            ->get(['id', 'title'])
    );
}
```

```php
// routes/web.php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('posts', [PostController::class, 'index'])->name('posts.index');
    Route::get('posts/search', PostSearchController::class)->name('posts.search');
    Route::post('posts/{post}/like', [PostLikeController::class, 'store'])->name('posts.like');
    Route::delete('posts/{post}/like', [PostLikeController::class, 'destroy'])->name('posts.unlike');
});
```

All routes live in `web.php`, so they share the session. Inertia's HTTP client sends the `XSRF-TOKEN` cookie as a header, which means CSRF protection works for `useHttp` POSTs with no extra setup.

## Part 1: an optimistic like button

Put a shared type for the page props in its own file:

```ts
// resources/js/types/post.ts
export interface Post {
    id: number
    title: string
    excerpt: string
    likes_count: number
    liked: boolean
}
```

Now the button. `router.optimistic()` takes the current page props and returns the props that should change. Inertia applies them **before** sending the request:

```vue
<!-- resources/js/components/posts/LikeButton.vue -->
<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import type { Post } from '@/types/post'

const props = defineProps<{ post: Post }>()

function toggleLike() {
    const liked = props.post.liked

    router
        .optimistic<{ posts: Post[] }>((pageProps) => ({
            posts: pageProps.posts.map((p) =>
                p.id === props.post.id
                    ? { ...p, liked: !liked, likes_count: p.likes_count + (liked ? -1 : 1) }
                    : p,
            ),
        }))
        [liked ? 'delete' : 'post'](`/posts/${props.post.id}/like`, {
            preserveScroll: true,
            only: ['posts'],
        })
}
</script>

<template>
    <button type="button" :aria-pressed="post.liked" @click="toggleLike">
        <span aria-hidden="true">{{ post.liked ? '♥' : '♡' }}</span>
        {{ post.likes_count }}
        <span class="sr-only">{{ post.liked ? 'Unlike' : 'Like' }}</span>
    </button>
</template>
```

What happens on a click, according to the [optimistic updates docs](https://inertiajs.com/docs/v3/the-basics/optimistic-updates), and what we saw in the browser:

1. Inertia compares the returned props with the current ones and keeps a snapshot of the keys that changed (here only `posts`).
2. It merges the new value, and Vue re-renders straight away. With the server slowed down on purpose, the heart filled and the count went from 0 to 1 while the request was still pending.
3. On success, the server's props replace the optimistic ones. `only: ['posts']` keeps that response small.
4. On failure, Inertia restores the snapshot. When we made the endpoint return a 500, the heart went back to its previous state. A 422 rolls back too, and the validation errors are kept.

A few rules make this reliable:

- **Return only what changes.** The return value is merged shallowly, so return the whole `posts` array, not one post inside it.
- **Do not mutate `pageProps`.** Build new objects (`{ ...p }`) as above.
- **Let the server have the last word.** The optimistic value is a guess. The real count, including likes from other users, arrives with the response.
- **Fast double clicks are handled.** Inertia tracks which props each optimistic update touched, and it does not let a response overwrite a prop until the last update that changed it has finished.

To keep the user on the page when the request fails, handle the error yourself. Inertia rolls back first, then you show a message:

```ts
router.optimistic(/* … */).post(url, {
    preserveScroll: true,
    onHttpException: () => {
        toast.error('Could not save your like. Please try again.')
        return false // stay on the page, no error screen
    },
})
```

The same `optimistic()` method also works on `useForm`, and the `<Form>` component has an `:optimistic` prop. Use those for things like adding a todo to a list before the server confirms it.

## Part 2: a live search with `useHttp`

Search results should not be page props. You don't want a history entry or a full props round trip on every keystroke. That is the job of `useHttp`: it makes a plain HTTP request and gives you `useForm`-style state.

```vue
<!-- resources/js/components/posts/PostSearch.vue -->
<script setup lang="ts">
import { useHttp } from '@inertiajs/vue3'
import { ref } from 'vue'

interface Result {
    id: number
    title: string
}

const search = useHttp<{ q: string }, Result[]>({ q: '' })
const results = ref<Result[]>([])
let timer: ReturnType<typeof setTimeout> | undefined

function onInput() {
    clearTimeout(timer)
    search.cancel() // drop the request for the previous keystroke

    if (search.q.trim().length < 2) {
        results.value = []
        return
    }

    timer = setTimeout(async () => {
        try {
            results.value = (await search.get('/posts/search')) ?? []
        } catch {
            // Cancelled by a newer keystroke, or a network/server error:
            // keep the previous results on screen.
        }
    }, 250)
}
</script>

<template>
    <label for="post-search" class="sr-only">Search posts</label>
    <input id="post-search" v-model="search.q" type="search" placeholder="Search posts…" @input="onInput" />

    <p v-if="search.errors.q">{{ search.errors.q }}</p>
    <p v-if="search.processing">Searching…</p>
    <ul v-else-if="results.length">
        <li v-for="r in results" :key="r.id">{{ r.title }}</li>
    </ul>
</template>
```

Things worth knowing, from the [HTTP requests docs](https://inertiajs.com/docs/v3/the-basics/http-requests) and from reading the source:

- **The data is the form.** `useHttp({ q: '' })` makes `search.q` reactive, so `v-model` works directly. For a `GET`, the data goes into the query string, so the request becomes `/posts/search?q=et`.
- **The generics type both sides.** `useHttp<{ q: string }, Result[]>` types the form data and the resolved response.
- **The promise rejects on errors.** HTTP errors (except 422), network errors and cancellations reject the promise, so wrap `await` in `try`/`catch`, or use callbacks. A **422 does not reject**. It resolves with `undefined` and fills `search.errors`, which is why the template can show `search.errors.q` straight from Laravel's validator.
- **Starting a new request does not cancel the old one.** Call `search.cancel()` yourself, as above, or an old slow response can arrive after a newer one.
- **Need more callbacks?** `onSuccess(data, response)`, `onHttpException`, `onNetworkError`, `onCancel` and `onFinish` are all available, and each instance tracks its own `processing` state.

In our browser test, typing "et" fired one request (the debounce absorbed the first keystroke) and showed 8 results.

## Bonus: optimistic updates on a JSON endpoint

`useHttp` has `optimistic()` too. It works on the hook's own data instead of page props, which fits widgets that talk to a JSON API:

```php
// PostLikeController@toggle, route: POST posts/{post}/like/toggle
public function toggle(Request $request, Post $post): JsonResponse
{
    $post->likes()->toggle([$request->user()->id]);

    return response()->json([
        'liked' => $post->likes()->whereKey($request->user()->id)->exists(),
        'likes_count' => $post->likes()->count(),
    ]);
}
```

```vue
<script setup lang="ts">
import { useHttp } from '@inertiajs/vue3'
import type { Post } from '@/types/post'

type LikeState = { liked: boolean; likes_count: number }

const props = defineProps<{ post: Post }>()
const like = useHttp<LikeState, LikeState>({
    liked: props.post.liked,
    likes_count: props.post.likes_count,
})

async function toggle() {
    try {
        const server = await like
            .optimistic((data) => ({
                liked: !data.liked,
                likes_count: data.likes_count + (data.liked ? -1 : 1),
            }))
            .post(`/posts/${props.post.id}/like/toggle`)

        Object.assign(like, server) // trust the server's numbers
    } catch {
        // already rolled back for us
    }
}
</script>

<template>
    <button type="button" :aria-pressed="like.liked" @click="toggle">
        <span aria-hidden="true">{{ like.liked ? '♥' : '♡' }}</span> {{ like.likes_count }}
    </button>
</template>
```

We tested this one with the same slow and failing server. It updated instantly, confirmed with `{"liked":true,"likes_count":1}`, and rolled back cleanly on a 500.

**Which one should you use?** If the change is part of the page (a list, a counter that other components read from props), use `router.optimistic()`, so the page props stay the single source of truth. If the widget owns its data and talks to a JSON endpoint, use `useHttp().optimistic()`.

## Test the server side

The optimistic part runs in the browser, but the endpoints still need tests. Here are three Pest tests that pass against the code above:

```php
// tests/Feature/PostLikesTest.php
use App\Models\Post;
use App\Models\User;

it('likes and unlikes a post', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();

    $this->actingAs($user)->from('/posts')
        ->post("/posts/{$post->id}/like")
        ->assertRedirect('/posts');

    $this->actingAs($user)->get('/posts')
        ->assertInertia(fn ($page) => $page
            ->component('posts/Index')
            ->where('posts.0.liked', true)
            ->where('posts.0.likes_count', 1)
        );

    $this->actingAs($user)->delete("/posts/{$post->id}/like");

    expect($post->likes()->count())->toBe(0);
});

it('searches posts by title as JSON', function () {
    Post::factory()->create(['title' => 'Optimistic updates in Inertia 3']);
    Post::factory()->create(['title' => 'Queues in Laravel']);

    $this->actingAs(User::factory()->create())
        ->getJson('/posts/search?q=inertia')
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonPath('0.title', 'Optimistic updates in Inertia 3');
});

it('validates the search term', function () {
    $this->actingAs(User::factory()->create())
        ->getJson('/posts/search?q=a')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('q');
});
```

For the browser side, a Playwright or Pest browser test with a delayed route (`page.route()` plus a short wait) is the easiest way to see the optimistic state and the rollback, which is how we checked the examples in this post.

## Recap

- `router.optimistic(fn).post(…)` updates page props right away and rolls back on any failure, including 422s and interrupted visits.
- `useHttp` gives JSON requests the same comfort as `useForm`: reactive data, `processing`, Laravel validation errors and typed responses.
- Remember three things: return partial props, call `cancel()` before a new search request, and catch the rejected promise.

## Sources

- [Inertia v3: Optimistic updates](https://inertiajs.com/docs/v3/the-basics/optimistic-updates)
- [Inertia v3: HTTP requests (`useHttp`)](https://inertiajs.com/docs/v3/the-basics/http-requests)
- [Inertia v3: TypeScript (HTTP helper generics)](https://inertiajs.com/docs/v3/advanced/typescript)
- [Inertia v3: CSRF protection](https://inertiajs.com/docs/v3/security/csrf-protection)
- [Inertia v3 upgrade guide: what's new](https://inertiajs.com/docs/v3/getting-started/upgrade-guide)

Built something with these? Share it in the [Laravel & VueJs Facebook group](https://www.facebook.com/groups/LaravelVueJs), and join us on [Telegram](https://t.me/LaravelVueJs) for the Sunday digest.
