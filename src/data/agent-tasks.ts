import { SITE_URL } from "../config/site";

export type AgentTask = {
  slug: string;
  ask: string;
  intent: string;
  command: string;
  files: string[];
  steps: string[];
  avoid: string[];
  /** When set, the prompt reads these guides in order instead of only `slug`. */
  reads?: string[];
};

export const agentTasks: AgentTask[] = [
  {
    slug: "laravel-vue-file-upload",
    ask: "Upload a file",
    intent: "Add a cover image on the existing post form.",
    command: "php artisan storage:link",
    files: [
      "a migration that adds cover_path",
      "Post $fillable",
      "update() on the post controller",
      "the Vue page that already edits the post",
    ],
    steps: [
      "Post the form with method post and a hidden _method of put.",
      "Validate cover as an image, max 2048 kilobytes.",
      "Store it with store('covers', 'public') and save the path.",
    ],
    avoid: [
      "Do not send the file with PUT, PATCH, or DELETE.",
      "Do not run storage:link on Laravel Cloud.",
      "Do not write the file bytes into the database.",
    ],
  },
  {
    slug: "laravel-vue-pagination",
    ask: "Paginate a list",
    intent:
      "Page a Laravel list in Vue with the links that method actually returns.",
    command: "orderBy('id')->cursorPaginate()",
    files: ["the controller query", "resources/js/pages/posts/Index.vue"],
    steps: [
      "Use paginate or simplePaginate when offset pages can skip or repeat.",
      "Use cursorPaginate only when the order column is unique. Order by id.",
    ],
    avoid: [
      "Do not use a duplicated published_at as the cursor bound.",
      "Do not read last_page or total off simplePaginate.",
    ],
  },
  {
    slug: "deploy-laravel-vue",
    ask: "Deploy the app",
    intent:
      "Ship the Vue starter kit without leaving the dev server file on the machine.",
    command: "npm run build:ssr",
    files: [
      "the Cloud or Forge build command",
      "the deploy command",
      "bootstrap/ssr when pages need server HTML",
    ],
    steps: [
      "On Laravel Cloud, the deploy command is php artisan migrate --force.",
      "Use npm run build:ssr when those pages need server HTML.",
      "On a VPS, run storage:link once for the public disk and supervise the queue.",
    ],
    avoid: [
      "Do not put storage:link or queue:restart in the Cloud deploy command.",
      "Do not deploy public/hot.",
      "Do not run composer dev:ssr. The kit has no such script.",
    ],
  },
  {
    slug: "laravel-sanctum-vue-spa",
    ask: "Log in from a Vue SPA",
    intent:
      "Log the SPA in with the session cookie, then read the current user.",
    command: "php artisan install:api",
    files: [
      "bootstrap/app.php",
      "SANCTUM_STATEFUL_DOMAINS",
      "config/cors.php",
      "resources/js/api.ts",
    ],
    steps: [
      "POST /login on the web routes. The response is 204, with no body.",
      "Then call currentUser() on the credentialed api client.",
    ],
    avoid: [
      'Do not call axios.get("/api/user"). That request does not send the session cookie.',
      "Do not treat a missing SANCTUM_STATEFUL_DOMAINS as a 419. That case is 401.",
      "A 419 is CSRF: check SESSION_DOMAIN and supports_credentials.",
    ],
  },
  {
    slug: "laravel-ai-sdk-vue",
    ask: "Draft a reply with the AI SDK",
    intent:
      "Add one Laravel AI SDK agent and show its reply on an existing Inertia Vue page.",
    command: "composer require laravel/ai",
    files: [
      "app/Ai/Agents/DraftReply.php",
      "the controller that already renders the page",
      "the Vue page that posts the note",
    ],
    steps: [
      "Publish the AI SDK config and migrate only if the agent stores a conversation.",
      "Validate note as a required string, max 2000 characters, and pass only that string to prompt().",
      "Redirect back with the reply string. Render it from a prop.",
      "Fake DraftReply in a test and assert the prompt.",
    ],
    avoid: [
      "Do not put the provider key in a VITE_ variable or call the provider from the browser.",
      "Do not leave the prompt route public.",
      "Do not pass $request->all() to prompt().",
      "Do not store a conversation or add tools on this change.",
    ],
  },
  {
    slug: "laravel-boost-vue",
    ask: "Install Laravel Boost",
    intent:
      "Install Laravel Boost as a dev dependency so the coding agent follows the Vue and Inertia versions in this app.",
    command: "composer require laravel/boost --dev",
    files: ["composer.json", "the agent guideline files boost:install writes"],
    steps: [
      "Run php artisan boost:install and enable the agents you actually use.",
      "Restart the agent and confirm the Laravel Boost MCP server is connected.",
      "After an Inertia or Laravel upgrade, run php artisan boost:update.",
    ],
    avoid: [
      "Do not install Boost with npm or mount it in a Vue page.",
      "Do not put a provider API key in boost.json.",
      "Do not add Vue Router or Ziggy because an older prompt mentioned them.",
    ],
  },
];

const editorial = new Set([
  "roadmap",
  "who-we-are",
  "laravel-vuejs-open-source-cms",
]);

/** The first thing someone with an empty app can paste. The three guides already exist. */
export const firstApp: AgentTask = {
  slug: "application-setup",
  ask: "Build the first app",
  intent:
    "Set up the Vue starter kit, then add the posts screens, then deploy.",
  command: "",
  files: [],
  reads: [
    "application-setup",
    "laravel-inertia-vue-crud",
    "deploy-laravel-vue",
  ],
  steps: [
    "Follow the guides in that order. Finish setup before adding screens.",
  ],
  avoid: [
    "Do not add Vue Router on the Inertia kit.",
    "Do not install Breeze or Jetstream on the Vue starter kit.",
    "Do not deploy public/hot.",
  ],
};

const cleanLine = (line: string) =>
  line
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^>\s*/, "")
    .replace(/[#*_]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** "Do not ..." sentences already written in a guide. Code fences are skipped. */
export function constraintsFrom(body: string): string[] {
  // Skip code fences, MDX imports, the FAQ props and component tags (posts can be MDX, see docs/POST-STYLE.md).
  const prose = body
    .replace(/```[\s\S]*?```/g, "\n")
    .replace(/<FAQ[\s\S]*?\/>/g, "\n")
    .replace(/^import .*$/gm, "\n")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "\n")
    .replace(/<\/?[A-Z][^>]*>/g, "\n");
  const hits: string[] = [];
  for (const part of prose.split(/(?<=[.!?])\s+|\n+/)) {
    const clean = cleanLine(part);
    const at = clean.search(/\bDo not\b/);
    if (at < 0) continue;
    let line = clean.slice(at);
    if (!/[.!?]$/.test(line)) line += ".";
    if (line.split(" ").length < 6 || line.length > 280) continue;
    if (!hits.includes(line)) hits.push(line);
    if (hits.length === 6) break;
  }
  return hits;
}

export function agentPrompt(task: AgentTask): string {
  const slugs = task.reads?.length ? task.reads : [task.slug];
  return [
    ...slugs.map((slug) => `Read ${SITE_URL}/${slug}.md`),
    task.intent,
    ...task.steps,
    ...task.avoid,
    "Show the diff. Do not commit.",
  ].join("\n");
}

type GuidePost = {
  slug: string;
  title: string;
  excerpt: string;
  tags: { slug: string }[];
  body?: string;
};

/**
 * The guide a reader opens next. CRUD, pagination, and upload stay in that
 * order. Wayfinder follows the upload so it does not sit between them.
 * Future slugs stay here and drop out until the post is in the published list.
 */
export const stationOrder = [
  "laravel-vue-in-2026",
  "requirements",
  "application-setup",
  "laravel-fortify-vue",
  "laravel-vue-policies",
  "test-laravel-vue",
  "typescript-laravel-vue-pages",
  "laravel-vite-vue",
  "inertia-vue-persistent-layout",
  "laravel-vue-flash",
  "laravel-inertia-vue-crud",
  "laravel-vue-pagination",
  "laravel-vue-file-upload",
  "laravel-wayfinder-vue",
  "laravel-sail-vue",
  "deploy-laravel-vue",
  "inertia-ssr",
  "laravel-sanctum-vue-spa",
  "vue-router-laravel-spa",
  "nuxt-laravel-api",
  "laravel-sanctum-vs-passport",
  "pinia-laravel-inertia",
  "laravel-reverb-vue",
  "laravel-socialite-vue",
  "laravel-vue-policies",
  "laravel-breeze-jetstream-vue",
  "laravel-api-resources-vue",
  "laravel-vue-datatable",
  "laravel-vue-queued-job",
  "laravel-vue-notifications",
  "laravel-precognition-vue",
  "inertia-vue-document-title",
  "inertia-partial-reloads",
  "upgrade-inertia-2-to-3",
  "inertia-3-optimistic-updates-usehttp",
  "inertia-3-9-background-polling-navigate-type",
  "laravel-vue-i18n",
  "laravel-vue-cors",
  "livewire-vs-inertia",
  "laravel-ziggy-vue",
  "laravel-13-35-query-routes-markdown-responses",
] as const;

/** The following published guide, with that guide's real prompt. */
export function nextStation(
  slug: string,
  posts: GuidePost[],
): AgentTask | undefined {
  const at = stationOrder.indexOf(slug as (typeof stationOrder)[number]);
  if (at < 0) return undefined;
  const published = new Map(posts.map((post) => [post.slug, post]));
  for (const id of stationOrder.slice(at + 1)) {
    const post = published.get(id);
    if (!post) continue;
    const task = agentTaskFor(post);
    if (task) return task;
  }
  return undefined;
}

/** Written prompts stay as written. Every other practical guide adds the constraints from its own text. */
export function agentTaskFor(post: GuidePost): AgentTask | undefined {
  const written = agentTasks.find((task) => task.slug === post.slug);
  if (written) return written;
  if (editorial.has(post.slug)) return undefined;
  if (
    post.tags.some((tag) =>
      ["community", "roadmap", "open-source"].includes(tag.slug),
    )
  ) {
    return undefined;
  }
  return {
    slug: post.slug,
    ask: post.title,
    intent: post.excerpt,
    command: "",
    files: [],
    steps: [],
    avoid: post.body ? constraintsFrom(post.body) : [],
  };
}
