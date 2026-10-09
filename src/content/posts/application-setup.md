---
id: 2
title: "Set up a Laravel 13 + Vue 3 app in ten minutes"
excerpt: "Create a project with the official Vue starter kit, then add your first model, controller and typed Vue page with Inertia. Every command you need, start to finish."
date: 2019-05-18T02:35:03Z
updated: 2026-10-10T00:00:00Z
snippet: "laravel new blog"
featured: true
categories: [laravel, vuejs]
tags: [laravel, vuejs, inertia, setup]
---

This guide takes you from an empty folder to a Laravel 13 app with a Vue 3 page showing data from your database. You need PHP 8.3+, Composer and Node.js (see [what you need](/requirements)).

## 1. Install the Laravel installer

```bash
composer global require laravel/installer
```

Make sure Composer's global `bin` directory is on your `PATH`, so the `laravel` command is available.

## 2. Create the project

```bash
laravel new blog
```

The installer asks a few questions. Pick:

- **Starter kit:** Vue
- **Authentication:** Laravel's built-in authentication
- **Testing framework:** Pest

It then installs Composer and npm dependencies, creates a SQLite database and runs the first migrations.

## 3. Start the dev servers

```bash
cd blog
composer run dev
```

This one command starts the PHP server, the queue worker, the log viewer and Vite with hot reload. Open `http://localhost:8000` and you will see the welcome page, with working **Log in** and **Register** links.

## 4. Add a model

Create a `Post` model with a migration, a factory and a seeder:

```bash
php artisan make:model Post -mfs
```

Describe the table in the new migration:

```php
// database/migrations/xxxx_xx_xx_create_posts_table.php
public function up(): void
{
    Schema::create('posts', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->string('slug')->unique();
        $table->text('excerpt');
        $table->timestamp('published_at')->nullable();
        $table->timestamps();
    });
}
```

Let the model be filled in bulk, and give the factory some fake data:

```php
// app/Models/Post.php
class Post extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'slug', 'excerpt', 'published_at'];

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }
}
```

```php
// database/factories/PostFactory.php
public function definition(): array
{
    $title = fake()->sentence();

    return [
        'title' => $title,
        'slug' => str($title)->slug(),
        'excerpt' => fake()->paragraph(),
        'published_at' => now(),
    ];
}
```

```php
// database/seeders/PostSeeder.php
public function run(): void
{
    Post::factory()->count(12)->create();
}
```

Run the migration and seed the table:

```bash
php artisan migrate
php artisan db:seed --class=PostSeeder
```

## 5. Add a route and a controller

```bash
php artisan make:controller PostController
```

```php
// app/Http/Controllers/PostController.php
use App\Models\Post;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('posts/Index', [
            'posts' => Post::query()
                ->latest('published_at')
                ->get(['id', 'title', 'slug', 'excerpt', 'published_at']),
        ]);
    }
}
```

```php
// routes/web.php
use App\Http\Controllers\PostController;

Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
```

## 6. Write the Vue page

Inertia passes the controller's data to the page as props. With `<script setup>` and TypeScript, they are fully typed:

```vue
<!-- resources/js/pages/posts/Index.vue -->
<script setup lang="ts">
import { Head } from '@inertiajs/vue3'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  published_at: string
}

defineProps<{ posts: Post[] }>()
</script>

<template>
  <Head title="Posts" />

  <main class="mx-auto max-w-3xl space-y-6 p-8">
    <h1 class="text-3xl font-semibold">Posts</h1>

    <article v-for="post in posts" :key="post.id" class="rounded-xl border p-6">
      <h2 class="text-xl font-medium">{{ post.title }}</h2>
      <p class="mt-2 text-muted-foreground">{{ post.excerpt }}</p>
    </article>
  </main>
</template>
```

Visit `http://localhost:8000/posts`. Vite reloads the page as you edit, and Laravel serves the data. There is no separate API to build.

## 7. Test it

```php
// tests/Feature/PostsTest.php
use App\Models\Post;

it('lists posts', function () {
    Post::factory()->create(['title' => 'Hello Laravel 13']);

    $this->get('/posts')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('posts/Index')
            ->has('posts', 1)
        );
});
```

```bash
php artisan test
```

## Where to go next

- Add a `show` page for a single post, with route model binding on `slug`.
- Use [Inertia forms](https://inertiajs.com/forms) (`useForm`) to create and edit posts.
- Run `npm run build` for production, and `npm run build:ssr` if you want Inertia server-side rendering.

> Looking for the original Laravel 5 + Nuxt 2 setup of this site? It is in the repository's Git history, from before the Astro migration.
