// Short Laravel and Vue topics. The wording is ours. Each track links the
// public roadmap.sh map it leans on. Do not paste those maps in here.

export type PathSource = { label: string; href: string };

export const PATH_SOURCES = {
  php: { label: "PHP", href: "https://roadmap.sh/php" },
  laravel: { label: "Laravel", href: "https://roadmap.sh/laravel" },
  vue: { label: "Vue", href: "https://roadmap.sh/vue" },
  frontend: { label: "Frontend", href: "https://roadmap.sh/frontend" },
  backend: { label: "Backend", href: "https://roadmap.sh/backend" },
  fullstack: { label: "Full stack", href: "https://roadmap.sh/full-stack" },
  devops: { label: "DevOps", href: "https://roadmap.sh/devops" },
  system: { label: "System design", href: "https://roadmap.sh/system-design" },
  design: {
    label: "Software design and architecture",
    href: "https://roadmap.sh/software-design-architecture",
  },
  architect: {
    label: "Software architect",
    href: "https://roadmap.sh/software-architect",
  },
} as const satisfies Record<string, PathSource>;

export const PATH_SOURCE_LIST: PathSource[] = [
  PATH_SOURCES.laravel,
  PATH_SOURCES.vue,
  PATH_SOURCES.devops,
  PATH_SOURCES.backend,
  PATH_SOURCES.fullstack,
  PATH_SOURCES.frontend,
  PATH_SOURCES.php,
  PATH_SOURCES.system,
  PATH_SOURCES.architect,
  PATH_SOURCES.design,
];

type TopicBody = {
  title: string;
  detail: string;
  guide?: string;
  when?: string;
};

const TOPIC = {
  "stack-2026": {
    title: "The 2026 stack",
    detail:
      "Laravel 13, Vue 3, Inertia 3, Vite, TypeScript, and Pest. That is the default on this site.",
    guide: "laravel-vue-in-2026",
  },
  "php-need": {
    title: "PHP for this stack",
    detail: "PHP 8.3 or newer, plus the Node floor Vite 8 asks for.",
    guide: "requirements",
  },
  "php-types": {
    title: "Types, functions, and classes",
    detail:
      "Read a Laravel class and know what the types, returns, and namespaces mean.",
  },
  "php-errors": {
    title: "Errors and exceptions",
    detail:
      "Follow a stack trace to the line that threw, then to the request that caused it.",
  },
  composer: {
    title: "Composer and autoloading",
    detail:
      "Require a package, commit composer.lock, and leave vendor/ to install.",
  },
  "php-http": {
    title: "HTTP and JSON",
    detail:
      "A request, a status code, headers, and a JSON body. Laravel and Vue meet here.",
  },
  "php-security": {
    title: "Injection, XSS, and CSRF",
    detail:
      "Know the three failures the framework is already blocking, so a raw query does not open them again.",
  },
  routing: {
    title: "Routes and a first page",
    detail: "A Laravel route that renders a Vue page through Inertia.",
    guide: "application-setup",
  },
  eloquent: {
    title: "Eloquent, migrations, and factories",
    detail:
      "A table, a model, and a factory so a test does not invent rows by hand.",
  },
  validation: {
    title: "Server-side validation",
    detail:
      "Validate in Laravel. Inertia redirects back, and the page reads the errors.",
  },
  fortify: {
    title: "Login and registration",
    detail:
      "The Vue starter kit already ships Fortify: login, registration, password reset, and email verification.",
    guide: "laravel-fortify-vue",
  },
  socialite: {
    title: "Social login",
    detail:
      "GitHub login is a normal link. The callback finds or creates the user.",
    guide: "laravel-socialite-vue",
    when: "Social login",
  },
  policies: {
    title: "Who can edit",
    detail:
      "A policy decides edit and delete. The Vue page hides the button the policy refuses.",
    guide: "laravel-vue-policies",
  },
  permissions: {
    title: "Roles and permissions",
    detail:
      "Spatie permissions when a policy per model is not the right split.",
    guide: "laravel-vue-policies",
    when: "Roles",
  },
  passport: {
    title: "Passport",
    detail:
      "Passport is for another product that brings its own client id. Your own users stay on Fortify or Sanctum.",
    guide: "laravel-sanctum-vs-passport",
    when: "Third-party OAuth",
  },
  resources: {
    title: "API resources",
    detail:
      "Shape the JSON in a resource. The Vue page depends on that shape, not on the table.",
    guide: "laravel-api-resources-vue",
  },
  pagination: {
    title: "Pagination",
    detail: "Length-aware pages, or a cursor on a unique column such as id.",
    guide: "laravel-vue-pagination",
  },
  datatable: {
    title: "A data table",
    detail:
      "Sort and filter on the server. The Vue table renders the page Laravel returns.",
    guide: "laravel-vue-datatable",
  },
  queues: {
    title: "Queued jobs",
    detail:
      "Mail, exports, and slow work leave the request. The job is safe to run twice.",
    guide: "laravel-vue-queued-job",
  },
  notifications: {
    title: "Notifications",
    detail: "Store a notification and show it on a Vue page.",
    guide: "laravel-vue-notifications",
  },
  reverb: {
    title: "Live updates",
    detail:
      "Reverb for a public or private channel. A public channel uses useEchoPublic.",
    guide: "laravel-reverb-vue",
    when: "Live updates",
  },
  pest: {
    title: "Feature tests with Pest",
    detail:
      "The starter kit uses Pest. Hit the route and assert the Inertia page.",
    guide: "test-laravel-vue",
  },
  "query-routes": {
    title: "QUERY routes and markdown responses",
    detail:
      "QUERY matches Route::any and Route::redirect with no opt-in. response()->markdown() and Route::query() are opt-in.",
    guide: "laravel-13-35-query-routes-markdown-responses",
  },
  precognition: {
    title: "Early validation",
    detail: "Precognition checks the field before the real submit.",
    guide: "laravel-precognition-vue",
    when: "Early validation",
  },
  sfc: {
    title: "Single-file components",
    detail:
      "Template, script setup, props, and emits. One component does one job.",
  },
  composables: {
    title: "Reactivity and composables",
    detail:
      "ref and computed for local state. A composable when a second component needs the same logic.",
  },
  pinia: {
    title: "Pinia",
    detail:
      "Pinia when the screen owns the state. Server data stays in Inertia props.",
    guide: "pinia-laravel-inertia",
    when: "Screen-owned state",
  },
  typescript: {
    title: "Typed pages",
    detail:
      "Type the props the controller sends. The page stops guessing the payload.",
    guide: "typescript-laravel-vue-pages",
  },
  vite: {
    title: "Vite",
    detail:
      "The alias, the env, and the hot file. A missing manifest usually means public/hot is still there.",
    guide: "laravel-vite-vue",
  },
  "vue-router": {
    title: "Vue Router",
    detail:
      "Vue Router belongs on a Sanctum SPA. The Inertia kit navigates without it.",
    guide: "vue-router-laravel-spa",
    when: "Separate SPA",
  },
  wayfinder: {
    title: "Wayfinder",
    detail:
      "Named routes from Laravel, generated into resources/js. One URL helper on the kit.",
    guide: "laravel-wayfinder-vue",
  },
  ziggy: {
    title: "Ziggy",
    detail:
      "Read the guide before adding Ziggy. The kit already has Wayfinder.",
    guide: "laravel-ziggy-vue",
    when: "Read before adding",
  },
  flash: {
    title: "Flash messages",
    detail: "Flash data survives the next request. The page shows it once.",
    guide: "laravel-vue-flash",
  },
  layout: {
    title: "A layout that stays",
    detail:
      "A persistent layout keeps the shell mounted while the page changes.",
    guide: "inertia-vue-persistent-layout",
  },
  title: {
    title: "The document title",
    detail: "Set the title from the server so the tab matches the page.",
    guide: "inertia-vue-document-title",
  },
  partial: {
    title: "Partial reloads",
    detail: "Reload one prop when the rest of the page should stay.",
    guide: "inertia-partial-reloads",
  },
  polling: {
    title: "Background polling",
    detail:
      "Inertia 3.9 polls in the background. The default mode is throttle.",
    guide: "inertia-3-9-background-polling-navigate-type",
    when: "Inertia 3.9",
  },
  i18n: {
    title: "Translations",
    detail:
      "Strings the visitor can switch, with Laravel and Vue sharing the locale.",
    guide: "laravel-vue-i18n",
  },
  upload: {
    title: "File uploads",
    detail:
      "An Inertia file upload is POST, with _method: put when the route is PUT.",
    guide: "laravel-vue-file-upload",
  },
  "html-a11y": {
    title: "Semantic HTML",
    detail:
      "A label for every field, a heading order, and a control that works from the keyboard.",
  },
  "css-layout": {
    title: "Layout at phone width",
    detail:
      "The page still reads at 390px. The starter kit uses Tailwind 4 for that layout.",
  },
  forms: {
    title: "Forms and server errors",
    detail:
      "The form posts to Laravel. The page shows the error bag beside the fields.",
    guide: "laravel-inertia-vue-crud",
  },
  rest: {
    title: "Resources and verbs",
    detail:
      "A URL is a thing. GET reads it, POST creates it, PUT or PATCH updates it, DELETE removes it.",
  },
  sql: {
    title: "Tables and indexes",
    detail:
      "An index for the column you filter or order by. Cursor pagination needs a unique column.",
    guide: "laravel-vue-pagination",
  },
  "auth-session": {
    title: "Session or token",
    detail:
      "Your own SPA can use the Sanctum session cookie. A bearer token is for a client that cannot keep that cookie.",
    guide: "laravel-sanctum-vue-spa",
  },
  cors: {
    title: "CORS",
    detail:
      "A separate origin is blocked until Laravel sends the right Access-Control-Allow-Origin.",
    guide: "laravel-vue-cors",
  },
  cache: {
    title: "Cache",
    detail:
      "Cache a read that is allowed to be a little old, and know which write clears it.",
  },
  secrets: {
    title: "Secrets and env",
    detail: "Secrets stay in the environment. .env stays off git.",
  },
  nuxt: {
    title: "Nuxt against a Laravel API",
    detail: "Nuxt 4 when the front end is its own app. The API is Laravel.",
    guide: "nuxt-laravel-api",
    when: "Separate front end",
  },
  livewire: {
    title: "Inertia or Livewire",
    detail:
      "This site's default join is Inertia and Vue. The guide compares that with Livewire.",
    guide: "livewire-vs-inertia",
  },
  breeze: {
    title: "Breeze and Jetstream",
    detail:
      "Read the guide before installing either one. The Vue starter kit already has auth.",
    guide: "laravel-breeze-jetstream-vue",
    when: "Read before adding",
  },
  shell: {
    title: "Shell, processes, and logs",
    detail:
      "See the PHP process, the queue worker, and the log line from the request you just sent.",
  },
  ssr: {
    title: "Inertia SSR",
    detail:
      "npm run build:ssr writes the server bundle. php artisan inertia:start-ssr runs it.",
    guide: "inertia-ssr",
    when: "Server-rendered HTML",
  },
  sail: {
    title: "Sail",
    detail:
      "sail:install writes compose.yaml. down -v deletes the database volume.",
    guide: "laravel-sail-vue",
  },
  deploy: {
    title: "Deploy",
    detail:
      "Leave public/hot off the server. Cloud runs migrate --force. A VPS also needs storage:link once and queue:restart.",
    guide: "deploy-laravel-vue",
  },
  stateless: {
    title: "More than one app server",
    detail:
      "Keep the session in the cookie or the database, so the next server can answer the same user.",
  },
  boundaries: {
    title: "A place for each layer",
    detail:
      "HTTP stays in controllers, rules in actions, and the screen in a Vue page.",
  },
  modules: {
    title: "A home for a feature",
    detail:
      "A feature has a folder. Helpers that every feature grabs become a second framework.",
  },
} as const satisfies Record<string, TopicBody>;

type TopicId = keyof typeof TOPIC;
type SourceId = keyof typeof PATH_SOURCES;

export type PathTopic = TopicBody & { id: TopicId };

export type PathStage = {
  title: string;
  source?: PathSource;
  topics: PathTopic[];
};

export type PathTrack = {
  id: string;
  title: string;
  heading: string;
  summary: string;
  accent: "brand" | "accent" | "ink";
  source?: PathSource;
  stages: PathStage[];
};

function stage(title: string, ids: TopicId[], source?: SourceId): PathStage {
  return {
    title,
    source: source ? PATH_SOURCES[source] : undefined,
    topics: ids.map((id) => ({ id, ...TOPIC[id] })),
  };
}

export const PATH_TRACKS: PathTrack[] = [
  {
    id: "ours",
    title: "Our path",
    heading: "Our path",
    summary:
      "The order we would hand someone building Laravel and Vue. Tick a topic when you can do it with the guide closed.",
    accent: "ink",
    stages: [
      stage(
        "Before the framework",
        ["stack-2026", "php-need", "php-types", "composer"],
        "php",
      ),
      stage(
        "Laravel on the kit",
        ["routing", "eloquent", "validation", "fortify", "policies", "pest"],
        "laravel",
      ),
      stage(
        "Vue on the kit",
        ["sfc", "composables", "typescript", "vite", "layout", "flash"],
        "vue",
      ),
      stage(
        "One app",
        ["forms", "wayfinder", "pagination", "upload"],
        "fullstack",
      ),
      stage("Ship it", ["sail", "deploy", "ssr"], "devops"),
      stage(
        "When the kit is the wrong shape",
        ["auth-session", "vue-router", "nuxt", "passport", "pinia", "reverb"],
        "architect",
      ),
    ],
  },
  {
    id: "php",
    title: "PHP",
    heading: "PHP",
    summary: "The PHP you need before a Laravel file reads cleanly.",
    accent: "ink",
    source: PATH_SOURCES.php,
    stages: [
      stage("Language", ["php-need", "php-types", "php-errors"]),
      stage("Packages", ["composer"]),
      stage("The web request", ["php-http", "php-security"]),
    ],
  },
  {
    id: "laravel",
    title: "Laravel",
    heading: "Laravel",
    summary: "The framework topics behind the guides on this site.",
    accent: "brand",
    source: PATH_SOURCES.laravel,
    stages: [
      stage("The request", [
        "routing",
        "validation",
        "precognition",
        "query-routes",
      ]),
      stage("Data", ["eloquent", "resources", "pagination", "datatable"]),
      stage("Accounts", [
        "fortify",
        "socialite",
        "policies",
        "permissions",
        "passport",
      ]),
      stage("After the response", [
        "queues",
        "notifications",
        "reverb",
        "pest",
      ]),
    ],
  },
  {
    id: "vue",
    title: "Vue",
    heading: "Vue",
    summary: "Vue 3 on the official starter kit, and the separate SPA case.",
    accent: "accent",
    source: PATH_SOURCES.vue,
    stages: [
      stage("The component", ["sfc", "composables", "typescript"]),
      stage("The shell", ["layout", "title", "flash", "partial", "polling"]),
      stage("State and URLs", ["pinia", "wayfinder", "ziggy", "vue-router"]),
      stage("Build and pages", ["vite", "i18n", "upload"]),
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    heading: "Frontend",
    summary: "The browser skills under every Vue page.",
    accent: "accent",
    source: PATH_SOURCES.frontend,
    stages: [
      stage("The page", ["html-a11y", "css-layout", "forms"]),
      stage("The browser", ["vite", "typescript", "title"]),
      stage("What the visitor touches", ["upload", "i18n", "flash"]),
    ],
  },
  {
    id: "backend",
    title: "Backend",
    heading: "Backend",
    summary: "The server skills under every Laravel app.",
    accent: "brand",
    source: PATH_SOURCES.backend,
    stages: [
      stage("The protocol", ["php-http", "rest", "cors"]),
      stage("Data", ["sql", "eloquent", "resources", "cache"]),
      stage("Trust", ["auth-session", "php-security", "secrets", "queues"]),
    ],
  },
  {
    id: "fullstack",
    title: "Full stack",
    heading: "Full stack",
    summary: "Three ways to join Laravel and Vue, and the work they share.",
    accent: "ink",
    source: PATH_SOURCES.fullstack,
    stages: [
      stage("Pick the join", [
        "stack-2026",
        "routing",
        "auth-session",
        "nuxt",
        "livewire",
      ]),
      stage("Shared product work", [
        "forms",
        "pagination",
        "datatable",
        "upload",
        "i18n",
      ]),
      stage("Read before you add a kit", ["breeze", "wayfinder", "cors"]),
    ],
  },
  {
    id: "devops",
    title: "DevOps",
    heading: "DevOps",
    summary: "Get the app off your laptop and keep the worker running.",
    accent: "ink",
    source: PATH_SOURCES.devops,
    stages: [
      stage("The machine", ["shell", "sail", "secrets"]),
      stage("Ship", ["pest", "deploy", "ssr"]),
      stage("Keep it running", ["queues", "reverb"]),
    ],
  },
  {
    id: "system",
    title: "System design",
    heading: "System design",
    summary:
      "How the same Laravel and Vue app behaves for more than one person.",
    accent: "ink",
    source: PATH_SOURCES.system,
    stages: [
      stage("Data", ["sql", "pagination", "cache"]),
      stage("Work that can wait", ["queues", "stateless"]),
      stage("Live", ["reverb", "polling"]),
    ],
  },
  {
    id: "design",
    title: "Design",
    heading: "Software design and architecture",
    summary: "Where the next Laravel and Vue feature is allowed to live.",
    accent: "ink",
    source: PATH_SOURCES.design,
    stages: [
      stage("Boundaries", ["boundaries", "modules", "policies"]),
      stage("The contract", ["resources", "typescript", "wayfinder"]),
    ],
  },
  {
    id: "architect",
    title: "Architect",
    heading: "Software architect",
    summary:
      "Decisions to write down before a second stack appears in the repo.",
    accent: "ink",
    source: PATH_SOURCES.architect,
    stages: [
      stage("The shape", ["stack-2026", "livewire", "auth-session", "nuxt"]),
      stage("One of each", ["fortify", "breeze", "passport", "ziggy"]),
      stage("The bar", ["pest", "deploy"]),
    ],
  },
];

export function pathTopicTotal(): number {
  const ids = new Set<string>();
  for (const track of PATH_TRACKS) {
    for (const group of track.stages) {
      for (const topic of group.topics) ids.add(topic.id);
    }
  }
  return ids.size;
}

export function pathTrackCount(track: PathTrack): number {
  return new Set(
    track.stages.flatMap((group) => group.topics.map((topic) => topic.id)),
  ).size;
}
