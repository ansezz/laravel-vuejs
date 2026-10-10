import { SITE_URL } from "../config/site.ts";
import { PACKAGES, SNAPSHOT, type Ecosystem } from "./packages.ts";

// Jobs a developer can tick. Every package name is in the download chart.
export type RecipeJob = {
  id: string;
  label: string;
  detail: string;
  ecosystem: Ecosystem;
  names: readonly string[];
  defaultOn: boolean;
};

export const RECIPE_JOBS: readonly RecipeJob[] = [
  {
    id: "api",
    label: "API auth",
    detail: "Sanctum and permissions",
    ecosystem: "laravel",
    names: ["laravel/sanctum", "spatie/laravel-permission"],
    defaultOn: false,
  },
  {
    id: "login",
    label: "App login",
    detail: "Fortify and Socialite",
    ecosystem: "laravel",
    names: ["laravel/fortify", "laravel/socialite"],
    defaultOn: false,
  },
  {
    id: "inertia",
    label: "Inertia",
    detail: "Laravel adapter and Ziggy",
    ecosystem: "laravel",
    names: ["inertiajs/inertia-laravel", "tightenco/ziggy"],
    defaultOn: true,
  },
  {
    id: "quality",
    label: "Pest and Larastan",
    detail: "Tests and static analysis",
    ecosystem: "laravel",
    names: ["pestphp/pest-plugin-laravel", "larastan/larastan"],
    defaultOn: true,
  },
  {
    id: "ops",
    label: "Queues and insight",
    detail: "Horizon and Telescope",
    ecosystem: "laravel",
    names: ["laravel/horizon", "laravel/telescope"],
    defaultOn: false,
  },
  {
    id: "debug",
    label: "Local debugging",
    detail: "Debugbar and IDE Helper",
    ecosystem: "laravel",
    names: ["barryvdh/laravel-debugbar", "barryvdh/laravel-ide-helper"],
    defaultOn: false,
  },
  {
    id: "exports",
    label: "Exports",
    detail: "Excel and DomPDF",
    ecosystem: "laravel",
    names: ["maatwebsite/excel", "barryvdh/laravel-dompdf"],
    defaultOn: false,
  },
  {
    id: "pinia",
    label: "Pinia",
    detail: "Vue store",
    ecosystem: "vue",
    names: ["pinia"],
    defaultOn: true,
  },
  {
    id: "router",
    label: "Vue Router",
    detail: "For a Vue SPA, not beside Inertia",
    ecosystem: "vue",
    names: ["vue-router"],
    defaultOn: false,
  },
  {
    id: "vite",
    label: "Vite and types",
    detail: "Vue plugin and vue-tsc",
    ecosystem: "vue",
    names: ["@vitejs/plugin-vue", "vue-tsc"],
    defaultOn: true,
  },
  {
    id: "headless",
    label: "Headless UI",
    detail: "Headless UI and Floating UI",
    ecosystem: "vue",
    names: ["@headlessui/vue", "@floating-ui/vue"],
    defaultOn: false,
  },
  {
    id: "components",
    label: "SFC components",
    detail: "Vue plugin and unplugin-vue-components",
    ecosystem: "vue",
    names: ["@vitejs/plugin-vue", "unplugin-vue-components"],
    defaultOn: false,
  },
];

export type RecipePackage = { name: string; ecosystem: Ecosystem };

export type Recipe = {
  composer: string | null;
  npm: string | null;
  packages: RecipePackage[];
  warnings: string[];
  markdown: string;
};

const byName = new Map(PACKAGES.map((pkg) => [pkg.name, pkg]));

export function defaultJobIds(): string[] {
  return RECIPE_JOBS.filter((job) => job.defaultOn).map((job) => job.id);
}

function warningsFor(ids: ReadonlySet<string>): string[] {
  const warnings: string[] = [];
  if (ids.has("inertia") && ids.has("router")) {
    warnings.push(
      "Inertia owns page navigation. Vue Router is a second router. Leave it out unless this app is not an Inertia app.",
    );
  }
  if (ids.has("api") && ids.has("login")) {
    warnings.push(
      "Fortify is app login. Sanctum is API tokens. Install both only when the app has a browser login and a token API.",
    );
  }
  return warnings;
}

export function recipeFromJobs(ids: readonly string[]): Recipe {
  const chosen = new Set(ids);
  const jobs = RECIPE_JOBS.filter((job) => chosen.has(job.id));
  const seen = new Set<string>();
  const packages: RecipePackage[] = [];
  for (const job of jobs) {
    for (const name of job.names) {
      if (seen.has(name)) continue;
      seen.add(name);
      const pkg = byName.get(name);
      packages.push({ name, ecosystem: pkg?.ecosystem ?? job.ecosystem });
    }
  }
  const composerNames = packages
    .filter((pkg) => pkg.ecosystem === "laravel")
    .map((pkg) => pkg.name);
  const npmNames = packages
    .filter((pkg) => pkg.ecosystem === "vue")
    .map((pkg) => pkg.name);
  const warnings = warningsFor(chosen);
  const composer = composerNames.length
    ? `composer require ${composerNames.join(" ")}`
    : null;
  const npm = npmNames.length ? `npm install ${npmNames.join(" ")}` : null;
  return {
    composer,
    npm,
    packages,
    warnings,
    markdown: recipeMarkdown({ composer, npm, packages, warnings }),
  };
}

function recipeMarkdown(recipe: {
  composer: string | null;
  npm: string | null;
  packages: readonly RecipePackage[];
  warnings: readonly string[];
}): string {
  const lines = [
    "# Laravel and Vue stack",
    "",
    `Package names from the download chart on ${SITE_URL}/packages. Snapshot ${SNAPSHOT.asOf}. This card does not pin versions.`,
    "",
    "## Install",
    "",
  ];
  if (recipe.composer) lines.push("```bash", recipe.composer, "```", "");
  if (recipe.npm) lines.push("```bash", recipe.npm, "```", "");
  if (!recipe.composer && !recipe.npm) {
    lines.push("No packages selected.", "");
  }
  if (recipe.warnings.length) {
    lines.push("## Check before you install", "");
    for (const warning of recipe.warnings) lines.push(`- ${warning}`);
    lines.push("");
  }
  if (recipe.packages.length) {
    lines.push("## Packages", "");
    for (const item of recipe.packages) {
      const pkg = byName.get(item.name);
      const page = pkg
        ? `${SITE_URL}/packages/${pkg.slug}`
        : `${SITE_URL}/packages`;
      lines.push(`- [${item.name}](${page})`);
    }
    lines.push("");
  }
  lines.push(
    `Compatibility notes: ${SITE_URL}/tools/compatibility.md`,
    `Articles for assistants: ${SITE_URL}/llms.txt`,
  );
  return lines.join("\n");
}

export type CompatRow = {
  id: string;
  pair: string;
  use: string;
  avoid: string;
  sourcePath: string;
  sourceTitle: string;
};

// Facts stated in published articles on this site. Not a live compatibility API.
export const COMPAT_ROWS: readonly CompatRow[] = [
  {
    id: "php-laravel-13",
    pair: "PHP and Laravel 13",
    use: "PHP 8.3 to 8.5",
    avoid: "PHP 8.2 on a new Laravel 13 app",
    sourcePath: "/requirements",
    sourceTitle: "What you need to build with Laravel 13 and Vue 3 in 2026",
  },
  {
    id: "php-laravel-12",
    pair: "PHP and Laravel 12",
    use: "PHP 8.2 to 8.5. Bug fixes stopped in August 2026. Security fixes run until February 2027.",
    avoid: "Starting a new project on Laravel 12",
    sourcePath: "/requirements",
    sourceTitle: "What you need to build with Laravel 13 and Vue 3 in 2026",
  },
  {
    id: "node",
    pair: "Node.js",
    use: "22.12 or newer, or 24 LTS",
    avoid: "Node 18 or 20 for a new Laravel 13 front end",
    sourcePath: "/requirements",
    sourceTitle: "What you need to build with Laravel 13 and Vue 3 in 2026",
  },
  {
    id: "vue",
    pair: "Vue",
    use: "Vue 3.5, the current stable line",
    avoid:
      "Vue 2. Vue 3.6 Vapor mode was a release candidate in October 2026, not the default.",
    sourcePath: "/requirements",
    sourceTitle: "What you need to build with Laravel 13 and Vue 3 in 2026",
  },
  {
    id: "inertia-generation",
    pair: "Inertia generation",
    use: "Inertia 3",
    avoid:
      "Inertia 2 for a new app. Bug fixes for Inertia 2 stopped on September 26, 2026.",
    sourcePath: "/requirements",
    sourceTitle: "What you need to build with Laravel 13 and Vue 3 in 2026",
  },
  {
    id: "inertia-pair",
    pair: "Inertia Laravel and Vue packages",
    use: "inertiajs/inertia-laravel 3.5 with @inertiajs/vue3 3.9.1",
    avoid: "Assuming a Vue adapter bump requires a Laravel adapter bump",
    sourcePath: "/inertia-3-9-background-polling-navigate-type",
    sourceTitle:
      "Inertia 3.9: pause polling in background tabs and detect back-button visits",
  },
  {
    id: "state",
    pair: "Vue state",
    use: "Pinia, or Inertia page props",
    avoid: "Vuex on a new Vue 3 app",
    sourcePath: "/requirements",
    sourceTitle: "What you need to build with Laravel 13 and Vue 3 in 2026",
  },
  {
    id: "vite",
    pair: "Vite",
    use: "Vite 8, which Laravel uses to build front-end assets",
    avoid: "An older Vite major on a new Laravel 13 app",
    sourcePath: "/requirements",
    sourceTitle: "What you need to build with Laravel 13 and Vue 3 in 2026",
  },
];

export type EraRow = {
  id: string;
  job: string;
  then: string;
  now: string;
  packages: readonly string[];
  absent: string;
};

// The "Then and now" table in the published requirements article.
// packages are chart names. absent names are stated as off the chart, with no download count.
export const ERA_ROWS: readonly EraRow[] = [
  {
    id: "framework",
    job: "Framework",
    then: "Laravel 5.8",
    now: "Laravel 13",
    packages: ["laravel/framework"],
    absent: "",
  },
  {
    id: "admin",
    job: "Admin panel",
    then: "Nova",
    now: "Nova 5 or Filament",
    packages: [],
    absent: "Not in this chart",
  },
  {
    id: "api",
    job: "API",
    then: "GraphQL with Lighthouse",
    now: "Inertia 3 for app pages. JSON:API resources or Lighthouse for a public API.",
    packages: ["inertiajs/inertia-laravel"],
    absent: "Lighthouse is not in this chart",
  },
  {
    id: "frontend",
    job: "Front end",
    then: "Nuxt 2, Vue 2, Options API",
    now: "Vue 3.5 with script setup and TypeScript, via Inertia or Nuxt 4.",
    packages: ["vue", "nuxt"],
    absent: "",
  },
  {
    id: "state",
    job: "State",
    then: "Vuex",
    now: "Pinia, or Inertia page props.",
    packages: ["pinia"],
    absent: "",
  },
  {
    id: "styling",
    job: "Styling",
    then: "Bootstrap 3, Stylus",
    now: "Tailwind CSS 4",
    packages: [],
    absent: "Not in this chart",
  },
  {
    id: "auth",
    job: "Auth",
    then: "Passport, Socialite",
    now: "Starter kit auth or WorkOS AuthKit. Sanctum for SPA and mobile tokens. Socialite for OAuth.",
    packages: ["laravel/sanctum", "laravel/socialite"],
    absent: "WorkOS AuthKit is not in this chart",
  },
  {
    id: "search",
    job: "Search",
    then: "Scout + Algolia",
    now: "Scout with Algolia, Meilisearch, or Typesense, or vector search with pgvector.",
    packages: ["laravel/scout"],
    absent: "",
  },
  {
    id: "debug",
    job: "Debugging",
    then: "Telescope",
    now: "Telescope, Pail, and Pulse or Nightwatch in production.",
    packages: ["laravel/telescope", "laravel/pail"],
    absent: "Pulse and Nightwatch are not in this chart",
  },
  {
    id: "testing",
    job: "Testing",
    then: "PHPUnit",
    now: "Pest, plus Vitest for components.",
    packages: ["pestphp/pest-plugin-laravel"],
    absent: "Vitest is not in this chart",
  },
];

export function eraChart(row: EraRow): { name: string; slug: string }[] {
  return row.packages.flatMap((name) => {
    const pkg = byName.get(name);
    return pkg ? [{ name, slug: pkg.slug }] : [];
  });
}

export function nowMarkdown(): string {
  const lines = [
    "# Laravel and Vue, then and now",
    "",
    `Copied from the requirements article at ${SITE_URL}/requirements. The chart column only links packages in the download snapshot ${SNAPSHOT.asOf}. A name that is not in that snapshot has no download count.`,
    "",
    "| Job | Then (2019) | Now (2026) | On the chart |",
    "| --- | --- | --- | --- |",
  ];
  for (const row of ERA_ROWS) {
    const links = eraChart(row).map(
      (pkg) => `[${pkg.name}](${SITE_URL}/packages/${pkg.slug})`,
    );
    const absent = row.absent ? [row.absent] : [];
    const chart = [...links, ...absent].join(". ") || "Not in this chart";
    lines.push(`| ${row.job} | ${row.then} | ${row.now} | ${chart} |`);
  }
  lines.push(
    "",
    "A new project starts from the official Laravel and Vue starter kit, not from `composer require laravel/framework`.",
    `Setup guide: ${SITE_URL}/application-setup`,
    `Requirements article: ${SITE_URL}/requirements`,
    `Package chart: ${SITE_URL}/packages`,
    `HTML table: ${SITE_URL}/tools#now`,
  );
  return lines.join("\n");
}

export type FileRow = {
  id: string;
  thing: string;
  path: string;
  command: string;
  rule: string;
  sourcePath: string;
};

// Paths named in the published setup guide, plus the app entry from the
// published Inertia 3.9 article. No other folders are invented here.
export const FILE_ROWS: readonly FileRow[] = [
  {
    id: "project",
    thing: "New app",
    path: "blog/",
    command: "laravel new blog",
    rule: "Starter kit Vue, built-in authentication, and Pest.",
    sourcePath: "/application-setup",
  },
  {
    id: "dev",
    thing: "Dev servers",
    path: "blog/",
    command: "composer run dev",
    rule: "Starts the PHP server, the queue worker, the log viewer, and Vite. The app is at http://localhost:8000.",
    sourcePath: "/application-setup",
  },
  {
    id: "model",
    thing: "Model",
    path: "app/Models/Post.php",
    command: "php artisan make:model Post -mfs",
    rule: "The same command creates the migration, factory, and seeder.",
    sourcePath: "/application-setup",
  },
  {
    id: "migration",
    thing: "Migration",
    path: "database/migrations/xxxx_xx_xx_create_posts_table.php",
    command: "php artisan migrate",
    rule: "Title, unique slug, excerpt, and a nullable published_at.",
    sourcePath: "/application-setup",
  },
  {
    id: "factory",
    thing: "Factory",
    path: "database/factories/PostFactory.php",
    command: "",
    rule: "Fake title, slug, excerpt, and published_at.",
    sourcePath: "/application-setup",
  },
  {
    id: "seeder",
    thing: "Seeder",
    path: "database/seeders/PostSeeder.php",
    command: "php artisan db:seed --class=PostSeeder",
    rule: "Creates 12 posts from the factory.",
    sourcePath: "/application-setup",
  },
  {
    id: "controller",
    thing: "Controller",
    path: "app/Http/Controllers/PostController.php",
    command: "php artisan make:controller PostController",
    rule: "Inertia::render('posts/Index') passes the posts prop. The guide adds no API route for this list.",
    sourcePath: "/application-setup",
  },
  {
    id: "route",
    thing: "Route",
    path: "routes/web.php",
    command: "",
    rule: "GET /posts, named posts.index.",
    sourcePath: "/application-setup",
  },
  {
    id: "page",
    thing: "Vue page",
    path: "resources/js/pages/posts/Index.vue",
    command: "",
    rule: "The folder is pages, lowercase. The Inertia component name is posts/Index. Props use defineProps in script setup.",
    sourcePath: "/application-setup",
  },
  {
    id: "test",
    thing: "Feature test",
    path: "tests/Feature/PostsTest.php",
    command: "php artisan test",
    rule: "Pest. assertInertia checks the component posts/Index.",
    sourcePath: "/application-setup",
  },
  {
    id: "entry",
    thing: "App entry",
    path: "resources/js/app.ts",
    command: "",
    rule: "Register an Inertia navigate listener here once.",
    sourcePath: "/inertia-3-9-background-polling-navigate-type",
  },
  {
    id: "build",
    thing: "Production",
    path: "",
    command: "npm run build:ssr",
    rule: "npm run dev already server-renders. Deploy the SSR bundle with npm run build:ssr.",
    sourcePath: "/application-setup",
  },
];

export function filesMarkdown(): string {
  const lines = [
    "# Where a Laravel and Vue file goes",
    "",
    `Copied from the setup guide at ${SITE_URL}/application-setup. The app entry row is from the Inertia 3.9 article. These are the paths the guide names for the official Vue starter kit.`,
    "",
    "| Thing | Path | Command | Rule | Source |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const row of FILE_ROWS) {
    const source =
      row.sourcePath === "/application-setup"
        ? `[Setup guide](${SITE_URL}/application-setup)`
        : `[Inertia 3.9](${SITE_URL}/inertia-3-9-background-polling-navigate-type)`;
    const pathCell = row.path ? `\`${row.path}\`` : "Command only";
    const commandCell = row.command ? `\`${row.command}\`` : "Edit the file";
    lines.push(
      `| ${row.thing} | ${pathCell} | ${commandCell} | ${row.rule} | ${source} |`,
    );
  }
  lines.push(
    "",
    "Vue pages live in `resources/js/pages/posts/Index.vue`. The Inertia component name for that list is `posts/Index`.",
    "The list is an Inertia page on a web route. The setup guide does not add an API route for it.",
    "The first test is Pest in `tests/Feature/PostsTest.php`, run with `php artisan test`.",
    "Dev servers start with `composer run dev`. The app is at http://localhost:8000.",
    "Create the app with `laravel new blog`. Pick the Vue starter kit, Laravel's built-in authentication, and Pest.",
    "The Vue starter kit in that guide includes Inertia 3, Vue 3, TypeScript, Tailwind CSS 4, and shadcn-vue. Tailwind CSS 4 and shadcn-vue are not in the download chart.",
    `Setup guide: ${SITE_URL}/application-setup`,
    `Inertia 3.9 article: ${SITE_URL}/inertia-3-9-background-polling-navigate-type`,
    `HTML table: ${SITE_URL}/tools#files`,
  );
  return lines.join("\n");
}

export type ShippedRow = {
  id: string;
  release: string;
  change: string;
  use: string;
  watch: string;
  sourcePath: string;
};

// New APIs from the two release articles published on 2026-10-10.
// Bug-fix lists stay in the articles. No unpublished post is cited here.
export const SHIPPED_ROWS: readonly ShippedRow[] = [
  {
    id: "query",
    release: "Laravel 13.35",
    change: "QUERY routes",
    use: "Route::query() registers the HTTP QUERY method. It is safe like GET and can carry a JSON body. Call it from Vue with fetch method QUERY. Tests use queryJson.",
    watch:
      "Web routes CSRF-check QUERY the same way they check POST. Send the X-XSRF-TOKEN header, or use an api route. HTML forms cannot send QUERY. Route::any() and Route::redirect() match QUERY too.",
    sourcePath: "/laravel-13-35-query-routes-markdown-responses",
  },
  {
    id: "markdown",
    release: "Laravel 13.35",
    change: "Markdown responses",
    use: "response()->markdown() answers with Content-Type text/markdown. Use it when wantsMarkdown() is true, and return the Inertia page otherwise.",
    watch:
      "The content type stays text/markdown even if you pass a different header.",
    sourcePath: "/laravel-13-35-query-routes-markdown-responses",
  },
  {
    id: "schedule",
    release: "Laravel 13.35",
    change: "One server",
    use: "Schedule::alwaysOnOneServer() in AppServiceProvider boot makes every scheduled task run on one server.",
    watch:
      "It needs a shared cache: Redis, Memcached, database, or DynamoDB. A closure without a name is skipped.",
    sourcePath: "/laravel-13-35-query-routes-markdown-responses",
  },
  {
    id: "memory",
    release: "Laravel 13.35",
    change: "Worker memory",
    use: "php artisan queue:work --memory=75% restarts the worker from a percentage of PHP memory_limit.",
    watch:
      "This is for workers you run yourself. Laravel Cloud managed queues do not take custom worker options.",
    sourcePath: "/laravel-13-35-query-routes-markdown-responses",
  },
  {
    id: "assert",
    release: "Laravel 13.35",
    change: "Fake assertions",
    use: "Queue, Bus, Event, and Notification fakes accept an array of properties. Models are compared with is().",
    watch:
      "A closure still works when the check is more than property equality.",
    sourcePath: "/laravel-13-35-query-routes-markdown-responses",
  },
  {
    id: "defaults",
    release: "Laravel 13.35",
    change: "Model defaults",
    use: "Add the HasDefaultAttributes trait and a defaults() method when a default comes from an enum or from config.",
    watch:
      "Values passed to the constructor or create() win. Defaults do not mark the model dirty. Models without the trait stay as they are.",
    sourcePath: "/laravel-13-35-query-routes-markdown-responses",
  },
  {
    id: "poll",
    release: "Inertia 3.9",
    change: "Poll while hidden",
    use: "usePoll and router.poll take background throttle (the default, every 10th interval while the tab is hidden), background pause (stop until the tab is visible), or background continue (full speed).",
    watch:
      "keepAlive true is deprecated. Replace it with background continue. Use pause for a dashboard, a list, or an admin screen. Use continue for a session keepalive or a long job. A poll started while the tab is already hidden follows that choice from the start. Return the polled prop as a closure so a partial reload skips the rest.",
    sourcePath: "/inertia-3-9-background-polling-navigate-type",
  },
  {
    id: "navigate",
    release: "Inertia 3.9",
    change: "How the user arrived",
    use: "The navigate event detail.type is initial on the first load and on a reload, visit on a link, router.visit, or a form, and history when back or forward restores the page.",
    watch:
      "History props are the ones saved when the user left. Register one listener in resources/js/app.ts and reload only the props that page needs. Coming back from a non-Inertia page is also history.",
    sourcePath: "/inertia-3-9-background-polling-navigate-type",
  },
  {
    id: "harden",
    release: "Inertia 3.9",
    change: "3.9.1 hardening",
    use: "Install @inertiajs/vue3 3.9.1. The X-XSRF-TOKEN header is added only for your own origin. Add it yourself in an http.onRequest handler when a useHttp call to another domain needs it. encryptHistory uses a new IV for every history entry.",
    watch:
      "No Laravel change is required. inertiajs/inertia-laravel 3.5 works with @inertiajs/vue3 3.9.1. Nothing in 3.9 is a breaking change. Older encrypted history entries are loaded from the server again. On Inertia 2, version 2.3.29 from the same day has the history IV fix and the prefetch cache flush.",
    sourcePath: "/inertia-3-9-background-polling-navigate-type",
  },
];

export function shippedMarkdown(): string {
  const lines = [
    "# What just shipped for Laravel and Vue",
    "",
    `Copied from the two release articles on ${SITE_URL}. Laravel 13.35.0 was tagged on October 6, 2026. Inertia 3.9.0 came out on October 9, 2026, and 3.9.1 followed the same day. Install 3.9.1. These rows are the new opt-in APIs. The articles also list bug fixes.`,
    "",
    "Update Laravel with `composer update laravel/framework` for 13.35.0 or later. Update the Vue adapter with `npm install @inertiajs/vue3@^3.9.1`.",
    "",
    "| Release | Change | Use | Watch | Source |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const row of SHIPPED_ROWS) {
    const source =
      row.sourcePath === "/laravel-13-35-query-routes-markdown-responses"
        ? `[Laravel 13.35](${SITE_URL}${row.sourcePath})`
        : `[Inertia 3.9](${SITE_URL}${row.sourcePath})`;
    lines.push(
      `| ${row.release} | ${row.change} | ${row.use} | ${row.watch} | ${source} |`,
    );
  }
  lines.push(
    "",
    `Laravel 13.35 article: ${SITE_URL}/laravel-13-35-query-routes-markdown-responses`,
    `Inertia 3.9 article: ${SITE_URL}/inertia-3-9-background-polling-navigate-type`,
    `HTML table: ${SITE_URL}/tools#shipped`,
  );
  return lines.join("\n");
}

export function compatibilityMarkdown(): string {
  const lines = [
    "# Laravel and Vue compatibility",
    "",
    `These rows are copied from published articles on ${SITE_URL}. They are not a live compatibility API. Snapshot of the notes: 2026-10-10.`,
    "",
    "| Pair | Use | Avoid | Source |",
    "| --- | --- | --- | --- |",
  ];
  for (const row of COMPAT_ROWS) {
    lines.push(
      `| ${row.pair} | ${row.use} | ${row.avoid} | [${row.sourceTitle}](${SITE_URL}${row.sourcePath}) |`,
    );
  }
  lines.push(
    "",
    `HTML table: ${SITE_URL}/tools#compatibility`,
    `Package chart: ${SITE_URL}/packages`,
  );
  return lines.join("\n");
}

export type AgentsChoices = {
  laravel: "13" | "12";
  vue: "3.5" | "3.6";
  bridge: "inertia" | "livewire" | "api";
  tests: "pest" | "phpunit";
  state: "pinia" | "props" | "vuex";
};

export const AGENTS_DEFAULT: AgentsChoices = {
  laravel: "13",
  vue: "3.5",
  bridge: "inertia",
  tests: "pest",
  state: "pinia",
};

const LARAVEL_CHOICES = ["13", "12"] as const;
const VUE_CHOICES = ["3.5", "3.6"] as const;
const BRIDGE_CHOICES = ["inertia", "livewire", "api"] as const;
const TEST_CHOICES = ["pest", "phpunit"] as const;
const STATE_CHOICES = ["pinia", "props", "vuex"] as const;

function oneOf<T extends string>(
  value: string,
  allowed: readonly T[],
  fallback: T,
): T {
  return (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function normalizeAgents(
  input: Partial<AgentsChoices> | undefined,
): AgentsChoices {
  return {
    laravel: oneOf(
      input?.laravel ?? "",
      LARAVEL_CHOICES,
      AGENTS_DEFAULT.laravel,
    ),
    vue: oneOf(input?.vue ?? "", VUE_CHOICES, AGENTS_DEFAULT.vue),
    bridge: oneOf(input?.bridge ?? "", BRIDGE_CHOICES, AGENTS_DEFAULT.bridge),
    tests: oneOf(input?.tests ?? "", TEST_CHOICES, AGENTS_DEFAULT.tests),
    state: oneOf(input?.state ?? "", STATE_CHOICES, AGENTS_DEFAULT.state),
  };
}

export function agentsMarkdown(input?: Partial<AgentsChoices>): string {
  const choices = normalizeAgents(input);
  const laravelLine =
    choices.laravel === "13"
      ? "Laravel 13 on PHP 8.3 to 8.5."
      : "Laravel 12 on PHP 8.2 to 8.5. Bug fixes have stopped. Do not upgrade the framework unless asked.";
  const vueLine =
    choices.vue === "3.5"
      ? "Vue 3.5 with <script setup> and TypeScript."
      : "Vue 3.6 is in use here. Vapor mode was a release candidate in October 2026. Do not enable it unless the task says so.";
  const bridgeLine = {
    inertia:
      "Inertia 3 owns page navigation. Do not add vue-router unless asked. The Laravel packages are inertiajs/inertia-laravel and tightenco/ziggy.",
    livewire:
      "Livewire owns the UI. Do not add Inertia or vue-router unless asked. The package is livewire/livewire. It is not in the download chart on this site.",
    api: "This is an API, not an Inertia app. Token auth is laravel/sanctum. Do not add Inertia unless asked.",
  }[choices.bridge];
  const testsLine =
    choices.tests === "pest"
      ? "Tests use Pest. The chart packages are pestphp/pest-plugin-laravel and larastan/larastan. Do not rewrite tests to PHPUnit unless asked."
      : "Tests use PHPUnit. Do not convert them to Pest unless asked.";
  const stateLine = {
    pinia: "Client state uses Pinia. Do not add Vuex.",
    props:
      "Page data comes from Inertia props or API responses. Do not add Pinia or Vuex unless asked.",
    vuex: "This repo still uses Vuex. Do not add Pinia beside it unless the task is a migration. New Vue 3 apps on this site use Pinia.",
  }[choices.state];

  const install: string[] = [];
  if (choices.bridge === "inertia") {
    install.push("composer require inertiajs/inertia-laravel tightenco/ziggy");
  }
  if (choices.bridge === "api")
    install.push("composer require laravel/sanctum");
  if (choices.tests === "pest") {
    install.push(
      "composer require pestphp/pest-plugin-laravel larastan/larastan",
    );
  }
  if (choices.state === "pinia") install.push("npm install pinia");
  if (choices.state === "vuex") install.push("npm install vuex");
  install.push("npm install @vitejs/plugin-vue vue-tsc");

  return [
    "# AGENTS.md",
    "",
    "Generated from the Laravel & VueJs tools. Read this before changing framework code.",
    "",
    "## Stack",
    "",
    `- ${laravelLine}`,
    `- ${vueLine}`,
    `- ${bridgeLine}`,
    `- ${testsLine}`,
    `- ${stateLine}`,
    `- Front-end build is Vite 8.`,
    "",
    "## Do not mix these up",
    "",
    "- Fortify is app login. Sanctum is API tokens.",
    "- radix-vue is the old package. reka-ui is the current Vue port of Radix.",
    "- Vuex is the old store. New Vue 3 work uses Pinia, or Inertia page props.",
    "- Do not invent package versions. Compatibility notes are at " +
      `${SITE_URL}/tools/compatibility.md.`,
    "",
    "## Install lines from the package chart",
    "",
    ...install.map((line) => `- \`${line}\``),
    "",
    "## When a fact is not in this file",
    "",
    `- Articles for assistants: ${SITE_URL}/llms.txt`,
    `- Package chart, snapshot ${SNAPSHOT.asOf}: ${SITE_URL}/packages`,
    `- Requirements article: ${SITE_URL}/requirements`,
    "",
  ].join("\n");
}
