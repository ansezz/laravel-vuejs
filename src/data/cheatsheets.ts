// Cheat sheets: one source for the /cheatsheets/<slug> pages and the branded PDFs (scripts/cheatsheets-pdf.mjs).
// Every API here was checked against the official docs on the "checked" date (laravel.com/framework/docs/13.x,
// inertiajs.com/docs/v3, vuejs.org). Keep snippets short: they must fit two A4 pages.

export type CheatItem = { title: string; lang: 'php' | 'vue' | 'ts' | 'js' | 'bash'; code: string; note?: string }
export type CheatSection = { title: string; items: CheatItem[] }
export type CheatSheet = {
  slug: string
  title: string
  short: string
  version: string
  description: string
  lead: string
  checked: string
  published: string // first published (git history); datePublished in the JSON-LD
  sources: { label: string; url: string }[]
  sections: CheatSection[]
}

const eloquent: CheatSheet = {
  slug: 'eloquent',
  title: 'Eloquent cheat sheet for Laravel 13',
  short: 'Eloquent',
  version: 'Laravel 13',
  description: 'Laravel 13 Eloquent on one page: queries, relationships, eager loading, scopes, casts, mass assignment, chunking, lazy collections and N+1 fixes.',
  lead: 'Queries, relationships, eager loading, scopes, casts, mass assignment, chunking and the N+1 fixes, in the Laravel 13 syntax (model attributes like #[Fillable] and #[Scope]).',
  checked: '2026-10-15',
  published: '2026-10-15',
  sources: [
    { label: 'Eloquent: Getting Started', url: 'https://laravel.com/framework/docs/13.x/eloquent' },
    { label: 'Eloquent: Relationships', url: 'https://laravel.com/framework/docs/13.x/eloquent-relationships' },
    { label: 'Eloquent: Mutators & Casting', url: 'https://laravel.com/framework/docs/13.x/eloquent-mutators' },
  ],
  sections: [
    {
      title: 'Model setup',
      items: [
        { title: 'Attributes instead of properties', lang: 'php', code: `use Illuminate\\Database\\Eloquent\\Attributes\\{Fillable, Hidden, Table};

#[Table('flights', key: 'flight_id')]
#[Fillable(['name', 'destination'])]
#[Hidden(['secret'])]
class Flight extends Model
{
    use HasFactory, SoftDeletes;
}` },
        { title: 'Strict mode in AppServiceProvider::boot()', lang: 'php', code: `Model::preventLazyLoading(! $this->app->isProduction());
Model::preventSilentlyDiscardingAttributes($this->app->isLocal());
Model::shouldBeStrict(! $this->app->isProduction()); // all of the above + missing attributes` },
      ],
    },
    {
      title: 'Queries',
      items: [
        { title: 'Retrieve', lang: 'php', code: `Flight::find(1);              Flight::findOrFail(1);
Flight::where('active', 1)->orderBy('name')->limit(10)->get();
Flight::firstWhere('number', 'FR 900');
Flight::where('legs', '>', 3)->firstOr(fn () => null);
Flight::where('active', 1)->count();  // sum, max, avg...
Flight::whereIn('id', $ids)->pluck('name', 'id');
Flight::latest()->paginate(15);       // simplePaginate, cursorPaginate` },
        { title: 'Create, update, upsert', lang: 'php', code: `$flight = Flight::create(['name' => 'London to Paris']);
$flight->update(['name' => 'Paris to London']);
Flight::firstOrCreate(['name' => 'X'], ['delayed' => 1]);
Flight::updateOrCreate(['departure' => 'OAK'], ['price' => 99]);
Flight::upsert($rows, uniqueBy: ['departure', 'destination'], update: ['price']);
$flight->isDirty('name'); $flight->wasChanged(); $flight->getOriginal('name');` },
        { title: 'Subquery select and order', lang: 'php', code: `Destination::addSelect(['last_flight' => Flight::select('name')
    ->whereColumn('destination_id', 'destinations.id')
    ->latest('arrived_at')->limit(1),
])->get();` },
      ],
    },
    {
      title: 'Relationships',
      items: [
        { title: 'Define', lang: 'php', code: `public function posts(): HasMany      { return $this->hasMany(Post::class); }
public function user(): BelongsTo     { return $this->belongsTo(User::class); }
public function roles(): BelongsToMany
{
    return $this->belongsToMany(Role::class)->withPivot('active')->withTimestamps();
}
public function latestOrder(): HasOne { return $this->hasOne(Order::class)->latestOfMany(); }
public function comments(): MorphMany { return $this->morphMany(Comment::class, 'commentable'); }` },
        { title: 'Query and write through relations', lang: 'php', code: `$user->posts()->where('active', 1)->get();
Post::has('comments', '>=', 3)->get();
Post::whereHas('comments', fn ($q) => $q->where('approved', true))->get();
Post::whereRelation('comments', 'is_approved', false)->get();
Post::whereBelongsTo($user)->get();
$user->posts()->create(['title' => 'Hi']);
$user->roles()->attach($id); ->detach($id); ->sync([1, 2]); ->toggle([3]);` },
      ],
    },
    {
      title: 'Eager loading',
      items: [
        { title: 'Load up front', lang: 'php', code: `Book::with('author')->get();
Book::with(['author.contacts', 'publisher'])->get();
Book::with('author:id,name')->get();            // include the foreign/primary keys
User::with(['posts' => fn ($q) => $q->latest()])->get();
User::withWhereHas('posts', fn ($q) => $q->where('featured', true))->get();` },
        { title: 'Counts and aggregates without loading', lang: 'php', code: `Post::withCount('comments')->get();        // $post->comments_count
Post::withExists('comments')->get();       // $post->comments_exists
Post::withSum('orders', 'total')->get();   // withAvg, withMin, withMax
$books->load('author'); $books->loadMissing('author'); $post->loadCount('likes');` },
      ],
    },
    {
      title: 'Scopes',
      items: [
        { title: 'Local scope with #[Scope]', lang: 'php', code: `use Illuminate\\Database\\Eloquent\\Attributes\\Scope;

#[Scope]
protected function ofType(Builder $query, string $type): void
{
    $query->where('type', $type);
}

User::ofType('admin')->popular()->get();
User::popular()->orWhere->active()->get();` },
        { title: 'Global scope', lang: 'php', code: `#[ScopedBy([AncientScope::class])]
class User extends Model {}

User::withoutGlobalScope(AncientScope::class)->get();
User::withoutGlobalScopes()->get();` },
      ],
    },
    {
      title: 'Casts and accessors',
      items: [
        { title: 'casts() method', lang: 'php', code: `protected function casts(): array
{
    return [
        'is_admin'   => 'boolean',
        'options'    => AsArrayObject::class,
        'tags'       => AsCollection::class,
        'status'     => OrderStatus::class,   // backed enum
        'paid_at'    => 'immutable_datetime',
        'secret'     => 'encrypted',
        'password'   => 'hashed',
    ];
}` },
        { title: 'Accessor / mutator', lang: 'php', code: `protected function firstName(): Attribute
{
    return Attribute::make(
        get: fn (string $value) => ucfirst($value),
        set: fn (string $value) => strtolower($value),
    );
}` },
      ],
    },
    {
      title: 'Big tables: chunk, lazy, cursor',
      items: [
        { title: 'Pick the right one', lang: 'php', code: `Flight::chunk(200, fn (Collection $flights) => /* ... */);
Flight::where('departed', true)              // updating the filtered column?
    ->chunkById(200, fn ($flights) => $flights->each->update(['departed' => false]));
foreach (Flight::lazy() as $flight) { }      // chunked queries, one stream
Flight::where('departed', true)->lazyById(200)->each->update(['departed' => false]);
foreach (Flight::cursor() as $flight) { }    // one query, no eager loading` },
      ],
    },
    {
      title: 'N+1 fixes',
      items: [
        { title: 'Spot it, then fix it', lang: 'php', code: `// N+1: one query per book
foreach (Book::all() as $book) { echo $book->author->name; }

// Fix: eager load (2 queries)
foreach (Book::with('author')->get() as $book) { echo $book->author->name; }

// Counting? Don't load the rows
Post::withCount('comments')->get();

// Child needs its parent back: chaperone() sets the inverse without a query
public function comments(): HasMany { return $this->hasMany(Comment::class)->chaperone(); }

// Opt in to automatic lazy eager loading (whole app or one collection)
Model::automaticallyEagerLoadRelationships();
$users->withRelationshipAutoloading();`, note: 'Turn on Model::preventLazyLoading() outside production so every N+1 throws in development and tests.' },
      ],
    },
  ],
}

const inertia: CheatSheet = {
  slug: 'inertia',
  title: 'Inertia 3 cheat sheet for Laravel and Vue',
  short: 'Inertia 3',
  version: 'Inertia 3 · Laravel · Vue 3',
  description: 'Inertia 3 with Laravel and Vue: responses, deferred, optional, once and merge props, useForm, Link, partial reloads, shared data, validation errors and SSR.',
  lead: 'Responses, prop types (deferred, optional, once, merge), useForm, Link, partial reloads, shared data, validation errors and SSR with the @inertiajs/vite plugin.',
  checked: '2026-10-15',
  published: '2026-10-15',
  sources: [
    { label: 'Inertia v3 upgrade guide', url: 'https://inertiajs.com/docs/v3/getting-started/upgrade-guide' },
    { label: 'Deferred props', url: 'https://inertiajs.com/docs/v3/data-props/deferred-props' },
    { label: 'Forms', url: 'https://inertiajs.com/docs/v3/the-basics/forms' },
    { label: 'Server-side rendering', url: 'https://inertiajs.com/docs/v3/advanced/server-side-rendering' },
  ],
  sections: [
    {
      title: 'Install and boot',
      items: [
        { title: 'Packages', lang: 'bash', code: `composer require inertiajs/inertia-laravel:^3.0
npm install @inertiajs/vue3@^3.0 @inertiajs/vite@^3.0` },
        { title: 'resources/js/app.ts', lang: 'ts', code: `import { createInertiaApp } from '@inertiajs/vue3'

createInertiaApp({
    pages: './Pages',          // resolved by the @inertiajs/vite plugin
    progress: { color: '#6936D3' },
})` },
      ],
    },
    {
      title: 'Responses',
      items: [
        { title: 'Render a page', lang: 'php', code: `use Inertia\\Inertia;

return Inertia::render('Event/Show', [
    'event' => $event->only('id', 'title', 'start_date'),
]);

Route::inertia('/about', 'About');           // no controller needed
return to_route('users.index');              // redirects after POST/PUT/DELETE` },
        { title: 'Flash data (not kept in history)', lang: 'php', code: `Inertia::flash('message', 'User created.');
return Inertia::flash('newUserId', $user->id)->back();` },
      ],
    },
    {
      title: 'Props: lazy, optional, deferred, once, merge',
      items: [
        { title: 'Prop types', lang: 'php', code: `return Inertia::render('Users/Index', [
    'users'       => fn () => User::all(),                     // lazy: only if requested
    'companies'   => Inertia::optional(fn () => Company::all()), // never on first load
    'roles'       => Inertia::always(Role::all()),               // even on partial reloads
    'permissions' => Inertia::defer(fn () => Permission::all()), // fetched after render
    'teams'       => Inertia::defer(fn () => Team::all(), 'sidebar'), // grouped request
    'plans'       => Inertia::once(fn () => Plan::all()),        // cached across visits
    'posts'       => Inertia::merge(fn () => Post::paginate())->append('data', matchOn: 'id'),
    'chat'        => Inertia::deepMerge($chatData),
]);`, note: 'Inertia::lazy() is gone in v3: use Inertia::optional(). Prop types now work inside nested arrays and closures.' },
        { title: '<Deferred> in Vue', lang: 'vue', code: `<Deferred data="permissions">
  <template #fallback><p>Loading…</p></template>
  <template #default="{ reloading }">
    <PermissionList :items="permissions" :class="{ dim: reloading }" />
  </template>
</Deferred>
<WhenVisible data="comments"><template #fallback>…</template></WhenVisible>` },
      ],
    },
    {
      title: 'Forms with useForm',
      items: [
        { title: 'Submit, errors, progress', lang: 'vue', code: `<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const form = useForm({ email: '', password: '', avatar: null as File | null })
const submit = () => form.post('/login', {
  preserveScroll: true,
  onSuccess: () => form.reset('password'),
})
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="form.email" type="email">
    <p v-if="form.errors.email">{{ form.errors.email }}</p>
    <progress v-if="form.progress" :value="form.progress.percentage" max="100" />
    <button :disabled="form.processing">Log in</button>
    <span v-if="form.recentlySuccessful">Saved.</span>
  </form>
</template>` },
        { title: 'Helpers', lang: 'ts', code: `form.put(url); form.patch(url); form.delete(url); form.submit('post', url)
form.transform(data => ({ ...data, remember: true })).post('/login')
form.reset(); form.reset('field'); form.defaults(); form.cancel()
form.clearErrors('email'); form.setError('email', 'Taken')
form.isDirty; form.hasErrors; form.wasSuccessful
useForm('EditUser:' + user.id, data)   // remembered in history state` },
      ],
    },
    {
      title: 'Links and manual visits',
      items: [
        { title: '<Link>', lang: 'vue', code: `<Link href="/users">Users</Link>
<Link href="/logout" method="post" as="button">Log out</Link>
<Link href="/search" :data="{ query }" preserve-state preserve-scroll>Search</Link>
<Link href="/users" prefetch>Users</Link>
<Link href="/users" :class="{ active: $page.url.startsWith('/users') }">Users</Link>` },
        { title: 'router', lang: 'ts', code: `import { router } from '@inertiajs/vue3'
router.visit('/users', { method: 'get', preserveState: true })
router.post('/users', data, { onHttpException: () => false }) // stay on page
router.cancelAll()                                            // v3: replaces cancel()` },
      ],
    },
    {
      title: 'Partial reloads',
      items: [
        { title: 'Ask for some props only', lang: 'ts', code: `router.reload({ only: ['users'] })
router.reload({ except: ['companies'] })
router.reload({ only: ['auth.notifications'] })     // dot notation in v3
<Link href="/users?active=true" :only="['users']">Active</Link>`, note: 'Wrap expensive props in closures (or Inertia::optional) so a partial reload skips them.' },
      ],
    },
    {
      title: 'Shared data',
      items: [
        { title: 'HandleInertiaRequests middleware', lang: 'php', code: `public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'appName'   => config('app.name'),
        'auth.user' => fn () => $request->user()?->only('id', 'name', 'email'),
    ];
}
public function shareOnce(Request $request): array
{
    return [...parent::shareOnce($request), 'countries' => fn () => Country::all()];
}` },
        { title: 'Read it in Vue', lang: 'ts', code: `import { usePage } from '@inertiajs/vue3'
const page = usePage()
page.props.auth.user   // or $page.props in templates` },
      ],
    },
    {
      title: 'Validation errors',
      items: [
        { title: 'Server validates, client reads errors', lang: 'php', code: `$request->validate(['email' => ['required', 'email']]);  // redirects back with errors
// Inertia puts them in props.errors (first message per field by default)
protected $withAllErrors = true;   // in HandleInertiaRequests: all messages`, note: "Several forms on one page? Name an error bag: form.post('/companies', { errorBag: 'createCompany' }), then read form.errors as usual." },
      ],
    },
    {
      title: 'SSR',
      items: [
        { title: 'With the @inertiajs/vite plugin', lang: 'js', code: `// vite.config.js
plugins: [laravel({ input: ['resources/js/app.ts'], refresh: true }), inertia()]

// package.json: "build": "vite build && vite build --ssr"
// dev: npm run dev (SSR runs in Vite, no Node server)
// prod: npm run build && php artisan inertia:start-ssr`, note: 'Turn SSR off for tests with Inertia::disableSsr(app()->runningUnitTests()). Head tags use data-inertia (was inertia in v2).' },
      ],
    },
  ],
}

const vue: CheatSheet = {
  slug: 'vue-composition-api',
  title: 'Vue 3 Composition API cheat sheet',
  short: 'Vue 3 Composition API',
  version: 'Vue 3.5',
  description: 'Vue 3.5 Composition API on one page: ref, reactive, computed, watch, lifecycle hooks, props and emits, defineModel, composables and provide/inject.',
  lead: 'ref, reactive, computed and watch, lifecycle hooks, props and emits, defineModel, composables, provide/inject and the script setup macros, for Vue 3.5 with TypeScript.',
  checked: '2026-10-15',
  published: '2026-10-15',
  sources: [
    { label: 'Reactivity API: Core', url: 'https://vuejs.org/api/reactivity-core.html' },
    { label: '<script setup>', url: 'https://vuejs.org/api/sfc-script-setup.html' },
    { label: 'Component v-model', url: 'https://vuejs.org/guide/components/v-model.html' },
    { label: 'Composables', url: 'https://vuejs.org/guide/reusability/composables.html' },
  ],
  sections: [
    {
      title: 'Reactive state',
      items: [
        { title: 'ref and reactive', lang: 'ts', code: `import { ref, reactive, shallowRef, toRefs, readonly } from 'vue'

const count = ref(0)              // count.value in script, {{ count }} in template
const user = ref<User | null>(null)
const state = reactive({ items: [] as Item[], filter: '' })  // objects only
const { filter } = toRefs(state)  // destructure without losing reactivity
const big = shallowRef(hugeList)  // only .value is tracked
const locked = readonly(state)` },
        { title: 'computed', lang: 'ts', code: `const total = computed(() => cart.items.reduce((s, i) => s + i.price, 0))
const fullName = computed({
  get: () => \`\${first.value} \${last.value}\`,
  set: (v) => { [first.value, last.value] = v.split(' ') },
})` },
      ],
    },
    {
      title: 'Watchers',
      items: [
        { title: 'watch and watchEffect', lang: 'ts', code: `watch(query, (now, before) => search(now))
watch([a, () => state.b], ([a, b]) => { /* ... */ })
watch(() => state.filter, run, { immediate: true, once: true })
watch(state, save, { deep: true })            // deep: number limits depth (3.5)
watchEffect(() => console.log(count.value))   // runs now, tracks what it reads

watch(id, async (id) => {
  const controller = new AbortController()
  onWatcherCleanup(() => controller.abort()) // 3.5
  data.value = await fetch(\`/api/\${id}\`, { signal: controller.signal }).then((r) => r.json())
})
const stop = watch(src, cb); stop()          // also pause() / resume()` },
      ],
    },
    {
      title: 'Lifecycle',
      items: [
        { title: 'Hooks', lang: 'ts', code: `onBeforeMount(() => {})
onMounted(() => el.value?.focus())       // DOM is ready
onBeforeUpdate(() => {}); onUpdated(() => {})
onBeforeUnmount(() => {}); onUnmounted(() => clearInterval(timer))
onErrorCaptured((err) => false)          // stop propagation
onActivated(() => {}); onDeactivated(() => {})   // <KeepAlive>
await nextTick()                         // after the DOM updates` },
      ],
    },
    {
      title: 'Props and emits',
      items: [
        { title: 'Typed, with defaults (3.5 destructure)', lang: 'vue', code: `<script setup lang="ts">
const { title, size = 'md' } = defineProps<{
  title: string
  size?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{
  change: [id: number]
  update: [value: string]
}>()
emit('change', 1)
</script>`, note: 'Destructured props stay reactive in 3.5; pass them to watch as a getter: watch(() => size, ...).' },
      ],
    },
    {
      title: 'defineModel (v-model on components)',
      items: [
        { title: 'Child and parent', lang: 'vue', code: `<!-- Child.vue -->
<script setup lang="ts">
const model = defineModel<string>({ required: true })
const count = defineModel<number>('count', { default: 0 })
const [text, modifiers] = defineModel<string, 'trim'>({
  set: (v) => (modifiers.trim ? v.trim() : v),
})
</script>
<template><input v-model="model"></template>

<!-- Parent.vue -->
<Child v-model="name" v-model:count="n" />` },
      ],
    },
    {
      title: 'script setup macros and template refs',
      items: [
        { title: 'Everything at the top level is in the template', lang: 'vue', code: `<script setup lang="ts">
import { useTemplateRef, useId, useAttrs, useSlots } from 'vue'
defineOptions({ inheritAttrs: false })
const input = useTemplateRef<HTMLInputElement>('input')   // 3.5
const id = useId()                                       // SSR-safe id (3.5)
const slots = defineSlots<{ default(props: { item: Item }): any }>()
defineExpose({ focus: () => input.value?.focus() })
</script>
<template><label :for="id">Name</label><input :id="id" ref="input"></template>` },
      ],
    },
    {
      title: 'Composables',
      items: [
        { title: 'useX: state + logic you can reuse', lang: 'ts', code: `// composables/useFetch.ts
import { ref, toValue, watchEffect, type MaybeRefOrGetter } from 'vue'

export function useFetch<T>(url: MaybeRefOrGetter<string>) {
  const data = ref<T | null>(null)
  const error = ref<unknown>(null)
  watchEffect(async () => {
    data.value = null; error.value = null
    try { data.value = await (await fetch(toValue(url))).json() }
    catch (e) { error.value = e }
  })
  return { data, error }   // return refs, not reactive()
}

const { data } = useFetch<User[]>(() => \`/api/users?page=\${page.value}\`)` },
      ],
    },
    {
      title: 'provide / inject',
      items: [
        { title: 'Typed with an InjectionKey', lang: 'ts', code: `// keys.ts
export const ThemeKey: InjectionKey<Ref<'light' | 'dark'>> = Symbol('theme')

// Ancestor
const theme = ref<'light' | 'dark'>('light')
provide(ThemeKey, theme)                 // provide readonly(theme) to block writes
app.provide('apiBase', '/api')          // app-wide

// Any descendant
const theme = inject(ThemeKey)           // Ref | undefined
const base = inject('apiBase', '/api')  // with default` },
      ],
    },
  ],
}

const aiSdk: CheatSheet = {
  slug: 'laravel-ai-sdk',
  title: 'Laravel AI SDK cheat sheet (laravel/ai 1.2)',
  short: 'Laravel AI SDK',
  version: 'laravel/ai 1.2 · Laravel 13',
  description: 'Laravel AI SDK on two pages: agents, structured output, tools and approvals, streaming to Vue, embeddings, images, audio, classification and testing fakes.',
  lead: 'Agents, prompt/stream/queue, attachments, structured output, tools with approval, Stop middleware, conversations, streaming to Vue, embeddings and vector search, images, audio, transcription, reranking, classification, events and the testing fakes, checked against laravel/ai 1.2.3.',
  checked: '2026-10-17',
  published: '2026-10-19',
  sources: [
    { label: 'Laravel docs: AI SDK', url: 'https://laravel.com/framework/docs/13.x/ai-sdk' },
    { label: 'laravel/ai releases', url: 'https://github.com/laravel/ai/releases' },
    { label: 'laravel/ai source (1.x)', url: 'https://github.com/laravel/ai/tree/1.x/src' },
  ],
  sections: [
    {
      title: 'Install and scaffold',
      items: [
        { title: 'Package, config, migrations', lang: 'bash', code: `composer require laravel/ai
php artisan vendor:publish --provider="Laravel\\Ai\\AiServiceProvider"
php artisan migrate                # conversations, messages, approvals
# .env: OPENAI_API_KEY=... ANTHROPIC_API_KEY=... (defaults in config/ai.php)
php artisan make:agent SalesCoach  # --structured for a schema() stub
php artisan make:tool RandomNumberGenerator
php artisan make:agent-middleware EnforceBudget` },
        { title: 'An agent', lang: 'php', code: `use Laravel\\Ai\\Attributes\\{MaxSteps, Model, Provider, Temperature, Timeout};
use Laravel\\Ai\\Contracts\\{Agent, HasTools};
use Laravel\\Ai\\Enums\\Lab;
use Laravel\\Ai\\Promptable;

#[Provider([Lab::Anthropic, Lab::OpenAI])] // first wins, next is the failover
#[Model('claude-sonnet-5'), MaxSteps(8), Temperature(0.2), Timeout(120)]
class SalesCoach implements Agent, HasTools
{
    use Promptable;

    public function instructions(): string { return 'You are a sales coach...'; }
    public function tools(): iterable     { return [new RandomNumberGenerator]; }
}` },
      ],
    },
    {
      title: 'Prompt, stream, queue',
      items: [
        { title: 'Three ways to run it', lang: 'php', code: `$response = (new SalesCoach)->prompt('Analyze this transcript...');
$response->text;  $response->usage->inputTokens;  $response->steps;  $response->meta->provider;

(new SalesCoach)->prompt($text, provider: Lab::OpenAI, model: 'gpt-5', timeout: 60); // one-off override
return (new SalesCoach)->stream($text);                 // SSE response for a route
(new SalesCoach)->queue($text);                         // on the queue; ->broadcast($text) streams to a channel
Str::of($longText)->summarize();                        // one-liner helpers: summarize(), decide(), toEmbeddings(), toAudio()` },
        { title: 'Attachments', lang: 'php', code: `use Laravel\\Ai\\Files\\{Document, Image};

(new ImageAnalyzer)->prompt('What is in this image?', attachments: [
    Image::fromPath('/tmp/photo.jpg'),     // fromUrl, fromUpload($request->file('x')), fromStorage('disk', 'path'), fromBase64
    Document::fromPath('/tmp/brief.md'),   // also fromString('...')
]);` },
      ],
    },
    {
      title: 'Structured output and tools',
      items: [
        { title: 'Structured output', lang: 'php', code: `use Illuminate\\Contracts\\JsonSchema\\JsonSchema;
use Laravel\\Ai\\Contracts\\HasStructuredOutput;

class SalesCoach implements Agent, HasStructuredOutput
{
    public function schema(JsonSchema $schema): array
    {
        return ['score' => $schema->integer()->min(0)->max(100)->required(),
                'summary' => $schema->string()->required()];
    }
}
$response['score'];   // array access on the response` },
        { title: 'A tool, with approval', lang: 'php', code: `use Laravel\\Ai\\Concerns\\InteractsWithApprovals;
use Laravel\\Ai\\Contracts\\{Approvable, Tool};
use Laravel\\Ai\\Tools\\Request;

class DeleteFile implements Tool, Approvable
{
    use InteractsWithApprovals;              // the model must get a Decision first

    public function description(): string { return 'Delete a file by path.'; }
    public function schema(JsonSchema $schema): array { return ['path' => $schema->string()->required()]; }
    public function handle(Request $request): string { unlink($request['path']); return 'Deleted.'; }
}
// Resume with the user's answer
(new FileAssistant)->continue($conversationId, as: $user)
    ->prompt(Decisions::from(['call_abc' => Decision::approve(), 'call_def' => Decision::reject('Keep it.')]));` },
      ],
    },
    {
      title: 'Middleware and conversations',
      items: [
        { title: 'Stop a run early (1.2.1+)', lang: 'php', code: `use Laravel\\Ai\\Contracts\\HasMiddleware;
use Laravel\\Ai\\Middleware\\Stop;
use Laravel\\Ai\\PendingStep;

public function middleware(): array            // on an Agent implementing HasMiddleware
{
    return [
        Stop::when(fn (PendingStep $step) => Cache::has("chat:{$this->chat->id}:stopped")),
        Stop::unless(fn (PendingStep $step) => $step->usage->inputTokens < 50_000),
    ];
}
// Custom: handle(PendingStep $step, Closure $next) { return $next($step); } or StepResult::stop()` },
        { title: 'Remember the conversation', lang: 'php', code: `use Laravel\\Ai\\Concerns\\RemembersConversations;
use Laravel\\Ai\\Contracts\\Conversational;

class SupportAgent implements Agent, Conversational { use Promptable, RemembersConversations; }

$response = (new SupportAgent)->forUser($user)->prompt('Hello!');
$id = $response->conversationId;
(new SupportAgent)->continue($id, as: $user)->prompt('Tell me more.');
(new SupportAgent)->forUser($user)->continueLastConversation()->prompt('And then?');` },
      ],
    },
    {
      title: 'Streaming to Vue',
      items: [
        { title: 'Routes', lang: 'php', code: `Route::post('/chats/{chat}/stream', fn (Chat $chat, Request $r) => (new SupportAgent($chat))->stream($r->string('prompt')));
// Vercel AI SDK protocol (useChat):
Route::post('/chat', function (Request $request) {
    $chat = Vercel::chat($request);
    return (new SupportAgent)->withMessages($chat->history())->stream($chat)->usingProtocol($chat->protocol());
});` },
        { title: 'Read the SSE in a component', lang: 'ts', code: `const res = await fetch(\`/chats/\${chatId}/stream\`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrf() }, body: JSON.stringify({ prompt }) })
const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader()
let buffer = ''
while (true) {
  const { value, done } = await reader.read(); if (done) break
  buffer += value; const chunks = buffer.split('\\n\\n'); buffer = chunks.pop() ?? ''
  for (const chunk of chunks) {
    const data = chunk.replace(/^data: /, ''); if (data === '[DONE]') continue
    const event = JSON.parse(data)   // text_delta, tool_call, tool_result, tool_approval_request, stream_end
    if (event.type === 'text_delta') answer.value += event.delta
    if (event.type === 'stream_end') status.value = event.reason === 'cancelled' ? 'stopped' : 'done'
  }
}` },
      ],
    },
    {
      title: 'Embeddings, images, audio, reranking',
      items: [
        { title: 'Embeddings and similarity search', lang: 'php', code: `$response = Embeddings::for(['Napa Valley has great wine.', 'Laravel is a PHP framework.'])->generate();
$vector = Str::of('Napa Valley has great wine.')->toEmbeddings();
Document::query()->whereVectorSimilarTo('embedding', 'best wineries in Napa')->limit(10)->get(); // Laravel 13 vector columns
$store = Stores::create('Knowledge Base');  $store->add(Document::fromPath('/tmp/handbook.pdf')); // provider file stores` },
        { title: 'Images, audio, transcription, reranking', lang: 'php', code: `$image = Image::of('A donut on a kitchen counter')->landscape()->quality('high')->generate();
$image->storeAs('donut.jpg');                       // quality(), square(), portrait(), size(), attachments(), queue()
$audio = Audio::of('I love coding with Laravel.')->voice('alloy')->generate();  $audio->storeAs('hello.mp3');
$text  = Transcription::fromPath('/tmp/call.mp3')->language('en')->diarize()->generate();
$ranked = Reranking::of($documents)->limit(3)->rerank('PHP frameworks');` },
      ],
    },
    {
      title: 'Classification',
      items: [
        { title: 'Probabilities instead of generated text', lang: 'php', code: `use Laravel\\Ai\\Classification;
use Laravel\\Ai\\Classification\\{Boolean, Choice, Score};

$result = Classification::of($ticket->body, ['front' => Image::fromPath($photo)]) // attachments optional
    ->questions([
        'urgent' => new Boolean('Does this need an immediate response?'),
        'team' => new Choice('Which team?', ['billing' => 'Invoices and refunds', 'tech' => 'Bugs and outages']),
        'anger' => new Score('How frustrated is the customer?', ['Calm', 'Frustrated', 'Very angry']),
    ])
    ->classify(provider: 'openai');   // default provider: config 'default_for_classification' (typesafe)

$result['urgent']->isTrue(threshold: 0.8);  $result['urgent']->probability;
$result['team']->choice;  $result['team']->probabilityOf('tech');  $result['anger']->level();  $result['anger']->label();` },
      ],
    },
    {
      title: 'Events and testing',
      items: [
        { title: 'Listen', lang: 'php', code: `use Laravel\\Ai\\Events\\{AgentPrompted, AgentFailed, ClassificationFailed, EmbeddingsFailed, ToolInvoked};

Event::listen(AgentPrompted::class, fn (AgentPrompted $e) => /* usage, provider, model */ null);
Event::listen([EmbeddingsFailed::class, ClassificationFailed::class], RecordAiFailure::class); // 1.2.2+: *Failed per attempt` },
        { title: 'Fakes and assertions', lang: 'php', code: `SalesCoach::fake(['Scored 82/100.']);          // canned answers in order, or a closure
(new SalesCoach)->prompt('Analyze...');
SalesCoach::assertPrompted(fn (AgentPrompt $p) => $p->contains('Analyze'));   // assertPromptedTimes, assertNotPrompted, assertQueued

Embeddings::fake();   Image::fake();   Audio::fake();   Transcription::fake();   Reranking::fake();   Classification::fake();
Embeddings::assertGenerated(fn (EmbeddingsPrompt $p) => $p->contains('Laravel'));
Image::assertNothingGenerated();   Classification::assertClassified(fn (ClassificationPrompt $p) => $p->asks('urgent'));
Http::fake();  // provider HTTP is plain Laravel HTTP client: fake it to test failover and *Failed events` },
      ],
    },
  ],
}

const validation: CheatSheet = {
  slug: 'laravel-validation',
  title: 'Laravel 13 validation cheat sheet',
  short: 'Validation',
  version: 'Laravel 13.37 · Inertia 3',
  description: 'Laravel 13 validation on two pages: Form Requests, Rule:: builders, conditional and array rules, files, passwords, custom rules and errors in Vue with Inertia.',
  lead: 'Where to validate, the typed Rule:: builders that arrived in 13.36, conditional and array rules, database, date, file and password rules, custom rules, and how the errors reach a Vue form with Inertia and Precognition. Every chain was run on Laravel 13.37.',
  checked: '2026-10-17',
  published: '2026-10-19',
  sources: [
    { label: 'Laravel docs: Validation', url: 'https://laravel.com/framework/docs/13.x/validation' },
    { label: 'Illuminate\\Validation\\Rule (13.x source)', url: 'https://github.com/laravel/framework/blob/13.x/src/Illuminate/Validation/Rule.php' },
    { label: 'Laravel 13.36 rule builders (PR #61833)', url: 'https://github.com/laravel/framework/pull/61833' },
    { label: 'Inertia docs: Forms and validation', url: 'https://inertiajs.com/docs/v3/the-basics/forms' },
  ],
  sections: [
    {
      title: 'Where to validate',
      items: [
        { title: 'In the controller', lang: 'php', code: `$validated = $request->validate([
    'title' => ['bail', 'required', 'string', 'max:255'],   // bail: stop this field at the first failure
    'body' => ['required'],
]);
$request->validated();            $request->safe()->only(['title']);   $request->safe()->except(['body']);
$request->validateWithBag('post', [...]);                               // named error bag` },
        { title: 'Form Request (php artisan make:request StorePostRequest)', lang: 'php', code: `public function authorize(): bool { return $this->user()->can('create', Post::class); }
public function rules(): array      { return ['title' => [Rule::required(), Rule::string()->max(255)]]; }
public function messages(): array   { return ['title.required' => 'Give the post a title.']; }
public function attributes(): array { return ['email' => 'email address']; }   // :attribute in messages
public function after(): array      { return [fn (Validator $v) => $v->errors()->add('title', 'Nope.')]; }
// Manual: Validator::make($data, $rules)->after(fn ($v) => ...)->stopOnFirstFailure()->validate();` },
      ],
    },
    {
      title: 'Rule:: builders (13.36): typed instead of strings',
      items: [
        { title: 'Autocomplete, and comma-safe values', lang: 'php', code: `use Illuminate\\Validation\\Rule;

'account_type' => [Rule::required(), Rule::in(['personal', 'business'])],
'company'      => [Rule::missingIf('account_type', 'personal')],
'email'        => [Rule::requiredWithout('phone'), Rule::email()],
'phone'        => [Rule::requiredWithout('email'), Rule::regex('/^\\+?[0-9 ]{7,15}$/')],
'password'     => [Rule::required(), Rule::confirmed()->customField('password_repeat')],
'server_ip'    => [Rule::nullable(), Rule::ip()->version(4)],       // it is ip(), not ipAddress()
'terms'        => [Rule::accepted()],
(string) Rule::requiredWith('phone', 'email');   // "required_with:phone,email": strings still work, mix freely` },
      ],
    },
    {
      title: 'Strings, numbers, booleans, enums',
      items: [
        { title: 'Fluent type rules', lang: 'php', code: `'title'  => [Rule::string()->min(3)->max(255)],                 // alpha(), alphaDash(), ascii(), startsWith(), lowercase()...
'slug'   => [Rule::regex('/^[a-z0-9-]+$/'), Rule::notRegex('/--/')],
'price'  => [Rule::numeric(strict: true)->min(0)->decimal(0, 2)],  // strict (13.37): "9.5" fails, 9.5 passes
'qty'    => [Rule::numeric()->integer()->between(1, 100)],         // digits(), maxDigits(), multipleOf(), greaterThan('min')
'tos'    => [Rule::boolean(strict: true)],                         // only true/false, not "1"/"true"
'status' => [Rule::enum(Status::class)->only([Status::Draft, Status::Live])],   // except()
'color'  => [Rule::hexColor()],  'meta' => [Rule::json()],  'tz' => [Rule::timezone()],  'id' => [Rule::uuid()->version(7)]` },
      ],
    },
    {
      title: 'Conditional rules',
      items: [
        { title: 'Field-based, callback-based, and sometimes', lang: 'php', code: `'company'  => [Rule::requiredIf(fn () => $this->input('account_type') === 'business')], // requiredUnless, prohibitedIf, excludeIf: callback or bool
'vat'      => [Rule::presentIf('account_type', 'business'), Rule::nullable()],              // missingIf, acceptedIf, declinedIf: field + value
'notes'    => [Rule::prohibits('tagline')],  'legacy' => [Rule::excludeWith('new_field')], // excluded from validated()
'plan'     => Rule::when($this->user()->isPro(), ['required', 'in:team,business'], ['nullable']),   // Rule::unless(...)
'reason'   => ['sometimes', 'required', 'max:500'],   // only validated when present in the input

$validator->sometimes('reason', ['required', 'max:500'], fn (Fluent $input) => $input->games >= 100);` },
      ],
    },
    {
      title: 'Arrays and nested data',
      items: [
        { title: 'Wildcards, keys, per-item rules', lang: 'php', code: `'tags'    => [Rule::array(), 'max:5'],
'tags.*'  => [Rule::string()->max(20), Rule::distinct()->ignoreCase()],       // error lands on tags.1
'address' => [Rule::array(['street', 'city'])],                               // only these keys allowed; requiredArrayKeys()
'options' => [Rule::contains(['a', 'b'])],                                    // doesntContain()
'companies.*.id' => Rule::forEach(fn (?string $value, string $attribute) => [
    Rule::exists(Company::class, 'id'), new HasPermission('manage-company', $value),
]),
'username' => [Rule::required(), Rule::anyOf([['string', 'email'], ['string', 'alpha_dash', 'min:6']])],` },
      ],
    },
    {
      title: 'Database, dates, formats',
      items: [
        { title: 'unique, exists, date, email, url', lang: 'php', code: `'email' => [Rule::unique('users', 'email')->ignore($this->user())->withoutTrashed()],   // ignoreModel(), whereNull(), using(fn ($q) => ...)
'team'  => [Rule::exists('teams', 'id')->where(fn ($q) => $q->where('owner_id', $this->user()->id))],
'publish_at' => [Rule::date()->format('Y-m-d')->afterToday()],   // before(), between($a, $b), todayOrAfter(), equals('2026-10-14')
'email' => [Rule::email()->rfcCompliant(strict: true)->preventSpoofing()->validateMxRecord()],
'site'  => [Rule::url()->protocols(['https'])],  'ip' => [Rule::ip()->version(6)],  'code' => [Rule::ulid()],` },
      ],
    },
    {
      title: 'Files and passwords',
      items: [
        { title: 'File::image, File::types, Password', lang: 'php', code: `use Illuminate\\Validation\\Rules\\{File, Password};

'cover' => [Rule::nullable(), File::image()->min(1024)->max(12 * 1024)       // KB; or ->max('12mb')
    ->dimensions(Rule::dimensions()->maxWidth(2000)->ratio(16 / 9))],      // minWidth(), ratioBetween()
'report' => [File::types(['pdf', 'csv'])->max('10mb')],                      // Rule::imageFile(allowSvg: true)
'password' => [Rule::required(), Rule::confirmed(), Password::min(8)->letters()->mixedCase()->numbers()->symbols()->uncompromised()],
'current_password' => [Rule::currentPassword()],
// AppServiceProvider::boot(): Password::defaults(fn () => $this->app->isProduction() ? Password::min(12)->uncompromised() : Password::min(8));
'password' => ['required', Password::defaults()],` },
      ],
    },
    {
      title: 'Custom rules',
      items: [
        { title: 'make:rule, closures, implicit', lang: 'php', code: `php artisan make:rule Uppercase            # --implicit to run on empty values too

class Uppercase implements ValidationRule   // DataAwareRule to see other fields, ValidatorAwareRule for the validator
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (strtoupper($value) !== $value) $fail('The :attribute must be uppercase.');
    }
}
'name' => ['required', new Uppercase, fn (string $attribute, mixed $value, Closure $fail) => $value === 'foo' && $fail("{$attribute} is invalid.")],` },
      ],
    },
    {
      title: 'Errors in Vue with Inertia',
      items: [
        { title: 'useForm, <Form> and Precognition', lang: 'vue', code: `<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
const form = useForm({ title: '', email: '' })
const submit = () => form.post('/posts', { onError: (errors) => console.log(errors) }) // 422 → form.errors, no page change
</script>
<template>
  <form @submit.prevent="submit">
    <input v-model="form.title" @input="form.clearErrors('title')" />
    <p v-if="form.errors.title">{{ form.errors.title }}</p>     <!-- first message per field -->
    <button :disabled="form.processing">Save</button>
  </form>
  <!-- Live validation with the same rules (Precognition middleware on the route): -->
  <Form action="/posts" method="post" #default="{ errors, invalid, validate, validating }">
    <input name="title" @change="validate('title')" />  <p v-if="invalid('title')">{{ errors.title }}</p>
  </Form>
</template>
<!-- JSON clients get 422 { message, errors: { title: ['...'] } } -->` },
      ],
    },
  ],
}

export const CHEATSHEETS: CheatSheet[] = [eloquent, inertia, vue, aiSdk, validation]
export const cheatsheetBySlug = (slug: string) => CHEATSHEETS.find((s) => s.slug === slug)
export const pdfPath = (slug: string) => `/cheatsheets/pdf/${slug}-cheat-sheet.pdf`
