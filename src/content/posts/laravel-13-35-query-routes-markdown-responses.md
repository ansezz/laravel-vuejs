---
id: 10
title: "Laravel 13.35: QUERY routes, Markdown responses and model defaults()"
excerpt: "Laravel 13.35 adds Route::query() for the new HTTP QUERY method, response()->markdown(), Schedule::alwaysOnOneServer(), percentage memory limits for queue workers, array-based fake assertions and an opt-in defaults() method for Eloquent models. Before and after code for each."
date: 2026-10-10T03:28:00Z
snippet: "Route::query('/products/search', ...)"
categories: [laravel]
tags: [laravel, release]
---

Laravel **13.35.0** was tagged on **October 6, 2026**. Most of its 60-plus changes are bug fixes, but six of them are small new features that clean up everyday code:

1. `Route::query()` for the HTTP **QUERY** method
2. `response()->markdown()`
3. `Schedule::alwaysOnOneServer()`
4. `queue:work --memory=60%`
5. **Array** checks in `Queue::assertPushed()` and friends
6. An opt-in **`defaults()`** method on Eloquent models

Here is each one, with before and after code.

> **Update:** `composer update laravel/framework` (13.35.0 or later). None of these features are breaking changes; they are all opt-in.

## 1. QUERY routes

`QUERY` is a new HTTP method from the IETF HTTP working group. Think of it as **a GET with a body**: it is safe and repeatable like GET, but you can send a JSON payload instead of squeezing complex filters into the URL. It is a good fit for search endpoints with many filters.

### Before

You had two bad options: a very long query string, or a POST that is not really a write.

```php
// A POST used for reading, just to get a request body
Route::post('/products/search', SearchProductsController::class);
```

### After

```php
// routes/web.php
use App\Http\Controllers\SearchProductsController;

Route::query('/products/search', SearchProductsController::class);
```

The controller reads the body like any other request:

```php
// app/Http/Controllers/SearchProductsController.php
class SearchProductsController
{
    public function __invoke(SearchProductsRequest $request): JsonResponse
    {
        $products = Product::query()
            ->whereIn('category_id', $request->validated('categories', []))
            ->where('price', '>=', $request->validated('min', 0))
            ->where('price', '<=', $request->validated('max', PHP_INT_MAX))
            ->paginate(20);

        return response()->json($products);
    }
}
```

HTML forms can't send QUERY, but `fetch` can. From a Vue component:

```ts
const response = await fetch('/products/search', {
    method: 'QUERY',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ categories: [3, 7], min: 10, max: 250 }),
})
```

Testing helpers already exist:

```php
it('filters products by category', function () {
    Product::factory()->count(2)->create(['category_id' => 3]);
    Product::factory()->create(['category_id' => 7]);

    $this->queryJson('/products/search', ['categories' => [3]])
        ->assertOk()
        ->assertJsonCount(2, 'data');
});
```

Two things to know:

- On `web` routes, QUERY requests are **CSRF-checked** like POST, because the handler is your code and Laravel can't guarantee it has no side effects. Send the `X-XSRF-TOKEN` header from your front end, or use `api` routes.
- `QUERY` is now part of `Router::$verbs`, so `Route::any()` and `Route::redirect()` match it too.

## 2. Markdown responses

Laravel already had `$request->wantsMarkdown()` (handy for AI agents and tools that ask for `text/markdown`), but no way to answer in Markdown without setting the header yourself.

### Before

```php
return response($post->markdown, 200, ['Content-Type' => 'text/markdown']);
```

### After

```php
// app/Http/Controllers/PostController.php
public function show(Request $request, Post $post): Response|InertiaResponse
{
    if ($request->wantsMarkdown()) {
        return response()->markdown($post->body_markdown);
    }

    return Inertia::render('posts/show', [
        'post' => PostResource::make($post),
    ]);
}
```

Status codes and extra headers work like `response()->make()`. The `Content-Type` is always `text/markdown`, even if you pass another one in `$headers`.

## 3. `Schedule::alwaysOnOneServer()`

When you run the scheduler on several servers or containers, every task runs on every one of them unless you add `->onOneServer()`. Forget it once and your users get the same report email three times.

### Before

```php
// routes/console.php
Schedule::onOneServer()->group(function () {
    Schedule::command('reports:send')->dailyAt('08:00');
    Schedule::command('invoices:remind')->hourly();
    // ...and everyone must remember to add new tasks inside this group
});
```

### After

Turn it on once, in a service provider:

```php
// app/Providers/AppServiceProvider.php
use Illuminate\Support\Facades\Schedule;

public function boot(): void
{
    Schedule::alwaysOnOneServer();
}
```

Now every scheduled task behaves as if it had `->onOneServer()`, and `routes/console.php` goes back to a plain list. Like `onOneServer()`, it needs a shared cache store (Redis, Memcached, database or DynamoDB). Closures without a name are skipped, so give them one:

```php
Schedule::call(fn () => Cache::forget('stats'))->name('clear-stats')->hourly();
```

## 4. Memory limit as a percentage for queue workers

`--memory` tells a worker to restart after it uses a given amount of memory. It was always a number of megabytes, so it had to be updated every time you resized your containers.

### Before

```bash
# memory_limit is 1G in this container; remember to change 768 when it changes
php artisan queue:work --memory=768
```

### After

```bash
php artisan queue:work --memory=75%
```

The percentage is taken from PHP's `memory_limit`, so the same command works on a small and a large container. Laravel Cloud managed queues don't take custom worker options, so this is for workers you run yourself.

## 5. Array checks in fake assertions

Checking that a job was pushed with the right data used to need a closure for every assertion.

### Before

```php
Queue::assertPushed(ProcessPodcast::class, function (ProcessPodcast $job) use ($podcast, $user) {
    return $job->podcast->is($podcast)
        && $job->user->is($user)
        && $job->status === 'pending';
});
```

### After

```php
Queue::assertPushed(ProcessPodcast::class, [
    'podcast' => $podcast,
    'user' => $user,
    'status' => 'pending',
]);
```

Models are compared with `is()`, so it checks the record, not the object instance. It works with `Queue`, `Bus`, `Event` and `Notification` fakes, so this is valid too:

```php
Event::assertDispatched(OrderShipped::class, ['order' => $order]);
```

Closures still work when you need more complex logic.

## 6. `defaults()` on Eloquent models

Eloquent's `$attributes` property sets default values, but it can only hold constants. You couldn't use an enum's value or a config setting without overriding the constructor.

### Before

```php
class Post extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->attributes['status'] = PostStatus::Draft->value;
        $this->attributes['locale'] = config('app.locale');

        parent::__construct($attributes);
    }
}
```

### After

```php
use Illuminate\Database\Eloquent\Concerns\HasDefaultAttributes;

class Post extends Model
{
    use HasDefaultAttributes;

    protected function defaults(): array
    {
        return [
            'status' => PostStatus::Draft->value,
            'locale' => config('app.locale'),
            'views' => 0,
        ];
    }
}
```

```php
$post = new Post(['title' => 'Hello']);

$post->status; // 'draft'
$post->locale; // 'en'
$post->isDirty('status'); // false
```

Values you pass to the constructor or `create()` win over the defaults. The method is only called on models that use the `HasDefaultAttributes` trait, so existing models are not affected.

## Notable fixes

A few bug fixes in this release that may affect real apps:

- `chunkById()` and `lazyById()` no longer loop forever on models with a cast primary key.
- `cursorPaginate()` keeps union, select and join bindings.
- `incrementOrCreate()` on relations now sets the foreign key and keeps extra attributes.
- `withCasts()` on a cloned query no longer changes the casts of the original query.
- Several reference cycles (in `PendingRequest::throw()` and Mailable callbacks) are fixed, which helps long-running workers and Octane.
- `schedule:list` shows the right times around daylight saving changes.

## Sources

- [Laravel v13.35.0 release notes](https://github.com/laravel/framework/releases/tag/v13.35.0)
- [PR #61797: QUERY route method](https://github.com/laravel/framework/pull/61797)
- [PR #61800: `response()->markdown()`](https://github.com/laravel/framework/pull/61800)
- [PR #61789: `Schedule::alwaysOnOneServer()`](https://github.com/laravel/framework/pull/61789)
- [PR #61753: percentage `--memory` for `queue:work`](https://github.com/laravel/framework/pull/61753)
- [PR #61770: array properties in fake assertions](https://github.com/laravel/framework/pull/61770)
- [PR #61813: opt-in `defaults()` trait](https://github.com/laravel/framework/pull/61813)
- [PR #61799: `lazy_root_creation` for local disks](https://github.com/laravel/framework/pull/61799)

Bonus from the same release: local disks accept `'lazy_root_creation' => true` in `config/filesystems.php`, so the root folder is only created when the first file is written.

Questions about this release? Ask in our [Facebook group](https://www.facebook.com/groups/LaravelVueJs) or on [Telegram](https://t.me/LaravelVueJs).
