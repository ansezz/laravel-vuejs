import { SITE_URL } from "../config/site";

export type ShapeId = "inertia" | "spa" | "nuxt";

export type GuideBrief = {
  intent: string;
  steps: string[];
  avoid: string[];
};

export type StarterShape = {
  id: ShapeId;
  label: string;
  detail: string;
  note: string;
  reads: string[];
  intent: string;
};

export type ModuleGroup = "accounts" | "screens" | "api" | "live" | "ship";

export type StarterModule = {
  id: string;
  label: string;
  detail: string;
  slug: string;
  group: ModuleGroup;
  shapes: ShapeId[];
  /** Shapes that tick this module when the app changes. */
  defaults: ShapeId[];
};

export const GROUPS: { id: ModuleGroup; label: string }[] = [
  { id: "accounts", label: "Accounts and access" },
  { id: "screens", label: "Screens" },
  { id: "api", label: "API and jobs" },
  { id: "live", label: "Live updates" },
  { id: "ship", label: "Ship it" },
];

export const SHAPES: StarterShape[] = [
  {
    id: "inertia",
    label: "Inertia app",
    detail: "Laravel, Vue, and the Fortify login screens.",
    note: "Laravel 13 and Vue 3 stay on every prompt. Login, registration, password reset, and email verification are already in this kit.",
    reads: ["application-setup"],
    intent:
      "Build this on Laravel and Vue with the official Vue starter kit. Inertia navigates.",
  },
  {
    id: "spa",
    label: "Sanctum SPA",
    detail: "Laravel API, Vue Router, and a Sanctum cookie login.",
    note: "Laravel 13 is the API. Your own Vue app logs in with a Sanctum cookie. Passport is a separate tick, only when another product must use OAuth.",
    reads: ["vue-router-laravel-spa", "laravel-sanctum-vue-spa"],
    intent:
      "Build a Laravel API and a Vue Router app. Log in through Sanctum. Keep it off the Inertia kit.",
  },
  {
    id: "nuxt",
    label: "Nuxt site",
    detail: "Nuxt 4 in front. Laravel stays the API.",
    note: "Laravel 13 stays the API. Nuxt does not get the Inertia screens.",
    reads: ["nuxt-laravel-api"],
    intent: "Use Nuxt 4 for the public site. Laravel stays the API.",
  },
];

export const MODULES: StarterModule[] = [
  {
    id: "fortify",
    label: "Login and registration",
    detail:
      "Name, email, and password. On the starter kit those screens already exist.",
    slug: "laravel-fortify-vue",
    group: "accounts",
    shapes: ["inertia", "spa"],
    defaults: ["inertia", "spa"],
  },
  {
    id: "socialite",
    label: "Social login",
    detail:
      "GitHub or another provider. The callback finds or creates the user and logs them in.",
    slug: "laravel-socialite-vue",
    group: "accounts",
    shapes: ["inertia", "spa"],
    defaults: [],
  },
  {
    id: "passport",
    label: "Passport",
    detail:
      "OAuth for another product with its own client id. Not the login for your own Vue app.",
    slug: "laravel-sanctum-vs-passport",
    group: "accounts",
    shapes: ["inertia", "spa", "nuxt"],
    defaults: [],
  },
  {
    id: "policies",
    label: "Who can edit",
    detail:
      "Whether this user can update this record. The controller still authorizes.",
    slug: "laravel-vue-policies",
    group: "accounts",
    shapes: ["inertia"],
    defaults: ["inertia"],
  },
  {
    id: "permissions",
    label: "Roles and permissions",
    detail: "Spatie stores the role. A hidden button is not the check.",
    slug: "laravel-vue-policies",
    group: "accounts",
    shapes: ["inertia"],
    defaults: [],
  },
  {
    id: "cors",
    label: "CORS",
    detail:
      "A separate front end needs it. A same-origin Inertia app does not.",
    slug: "laravel-vue-cors",
    group: "api",
    shapes: ["spa", "nuxt"],
    defaults: ["spa"],
  },
  {
    id: "crud",
    label: "Posts screens",
    detail: "Create, edit, and delete posts from a Vue page.",
    slug: "laravel-inertia-vue-crud",
    group: "screens",
    shapes: ["inertia"],
    defaults: ["inertia"],
  },
  {
    id: "pagination",
    label: "Pagination",
    detail: "Render only the links that method returns.",
    slug: "laravel-vue-pagination",
    group: "screens",
    shapes: ["inertia"],
    defaults: ["inertia"],
  },
  {
    id: "datatable",
    label: "Sortable table",
    detail: "Allow-list the sort column. Keep the page links.",
    slug: "laravel-vue-datatable",
    group: "screens",
    shapes: ["inertia"],
    defaults: [],
  },
  {
    id: "upload",
    label: "File upload",
    detail: "A cover image on the post form.",
    slug: "laravel-vue-file-upload",
    group: "screens",
    shapes: ["inertia"],
    defaults: [],
  },
  {
    id: "flash",
    label: "Saved message",
    detail: "One toast after a save. The kit already displays it.",
    slug: "laravel-vue-flash",
    group: "screens",
    shapes: ["inertia"],
    defaults: [],
  },
  {
    id: "typescript",
    label: "Typed pages",
    detail: "defineProps matches the controller payload.",
    slug: "typescript-laravel-vue-pages",
    group: "screens",
    shapes: ["inertia"],
    defaults: ["inertia"],
  },
  {
    id: "i18n",
    label: "Translations",
    detail: "Laravel holds the strings. Vue renders them.",
    slug: "laravel-vue-i18n",
    group: "screens",
    shapes: ["inertia", "spa"],
    defaults: [],
  },
  {
    id: "precognition",
    label: "Live validation",
    detail: "Check one field when the person leaves it.",
    slug: "laravel-precognition-vue",
    group: "screens",
    shapes: ["inertia"],
    defaults: [],
  },
  {
    id: "resources",
    label: "API resources",
    detail: "The JSON shape a SPA or Nuxt reads.",
    slug: "laravel-api-resources-vue",
    group: "api",
    shapes: ["inertia", "spa", "nuxt"],
    defaults: ["spa", "nuxt"],
  },
  {
    id: "queue",
    label: "Queued job",
    detail: "Show pending, ready, or failed on the page.",
    slug: "laravel-vue-queued-job",
    group: "api",
    shapes: ["inertia", "spa", "nuxt"],
    defaults: [],
  },
  {
    id: "notifications",
    label: "Notifications",
    detail: "The next visit receives the database row.",
    slug: "laravel-vue-notifications",
    group: "live",
    shapes: ["inertia"],
    defaults: [],
  },
  {
    id: "reverb",
    label: "Reverb",
    detail: "A public event, then useEchoPublic on the Vue page.",
    slug: "laravel-reverb-vue",
    group: "live",
    shapes: ["inertia", "spa"],
    defaults: [],
  },
  {
    id: "pinia",
    label: "Pinia",
    detail: "Client state that should survive the next visit.",
    slug: "pinia-laravel-inertia",
    group: "live",
    shapes: ["inertia", "spa"],
    defaults: [],
  },
  {
    id: "tests",
    label: "Tests",
    detail: "Pest hits the Laravel routes.",
    slug: "test-laravel-vue",
    group: "ship",
    shapes: ["inertia", "spa"],
    defaults: ["inertia", "spa"],
  },
  {
    id: "ssr",
    label: "Server rendering",
    detail: "HTML on the first response for public pages.",
    slug: "inertia-ssr",
    group: "ship",
    shapes: ["inertia"],
    defaults: [],
  },
  {
    id: "sail",
    label: "Sail",
    detail: "PHP, the database, and npm in Docker.",
    slug: "laravel-sail-vue",
    group: "ship",
    shapes: ["inertia", "spa"],
    defaults: [],
  },
  {
    id: "vite",
    label: "Vite",
    detail: "The @ alias, VITE_ secrets, and public/hot.",
    slug: "laravel-vite-vue",
    group: "ship",
    shapes: ["inertia", "spa"],
    defaults: [],
  },
  {
    id: "deploy",
    label: "Deploy",
    detail: "Ship it without leaving the dev server file up.",
    slug: "deploy-laravel-vue",
    group: "ship",
    shapes: ["inertia", "spa", "nuxt"],
    defaults: ["inertia", "spa", "nuxt"],
  },
];

const shapeById = (id: string) =>
  SHAPES.find((shape) => shape.id === id) ?? SHAPES[0];

export function defaultModuleIds(shape: ShapeId): string[] {
  return MODULES.filter(
    (mod) => mod.shapes.includes(shape) && mod.defaults.includes(shape),
  ).map((mod) => mod.id);
}

const SHAPE_IDS: ShapeId[] = ["inertia", "spa", "nuxt"];

function asShape(value: string | null): ShapeId {
  return SHAPE_IDS.find((id) => id === value) ?? "inertia";
}

/** `?app=spa&m=fortify,socialite` opens those ticks. A missing `m` uses the usual set. */
export function selectionFromSearch(
  params: URLSearchParams,
  allowed: string[] = MODULES.map((mod) => mod.id),
): { shape: ShapeId; ids: string[] } {
  const shape = asShape(params.get("app"));
  const allow = new Set(allowed);
  if (!params.has("m")) {
    return {
      shape,
      ids: defaultModuleIds(shape).filter((id) => allow.has(id)),
    };
  }
  const wanted = new Set(
    (params.get("m") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
  return {
    shape,
    ids: MODULES.filter(
      (mod) =>
        wanted.has(mod.id) && mod.shapes.includes(shape) && allow.has(mod.id),
    ).map((mod) => mod.id),
  };
}

export function starterSearch(shape: string, ids: string[]): string {
  const params = new URLSearchParams();
  params.set("app", asShape(shape));
  params.set("m", ids.join(","));
  return params.toString();
}

/** The same prompt, saved where the agent in the repo will read it. */
export function agentsDocument(prompt: string): string {
  return [
    "# AGENTS.md",
    "",
    "Laravel and Vue rules for this app. Keep this file at the project root.",
    "Follow it before inventing a different stack.",
    "",
    prompt.trim(),
    "",
  ].join("\n");
}

export function guideBlocks(
  slugs: string[],
  guides: Record<string, GuideBrief>,
): string[] {
  const seen: string[] = [];
  const blocks: string[] = [];
  for (const slug of slugs) {
    if (seen.includes(slug)) continue;
    seen.push(slug);
    const guide = guides[slug];
    if (!guide) continue;
    blocks.push(
      [
        `Read ${SITE_URL}/${slug}.md`,
        guide.intent,
        ...guide.steps,
        ...guide.avoid.slice(0, 4),
      ].join("\n"),
    );
  }
  return blocks;
}

function uniqueSlugs(shapeId: string, moduleIds: string[]): string[] {
  const shape = shapeById(shapeId);
  const slugs: string[] = [];
  const push = (slug: string) => {
    if (!slugs.includes(slug)) slugs.push(slug);
  };
  for (const slug of shape.reads) push(slug);
  for (const mod of MODULES) {
    if (!moduleIds.includes(mod.id)) continue;
    if (!mod.shapes.includes(shape.id)) continue;
    push(mod.slug);
  }
  return slugs;
}

/** One prompt. Shape reads come first, then modules in list order. Missing guides are skipped. */
export function starterPrompt(
  shapeId: string,
  moduleIds: string[],
  guides: Record<string, GuideBrief>,
): { prompt: string; count: number } {
  const shape = shapeById(shapeId);
  const blocks = guideBlocks(uniqueSlugs(shape.id, moduleIds), guides);
  return {
    count: blocks.length,
    prompt: [
      shape.intent,
      "Follow the guides in this order. Each block is that guide.",
      ...blocks,
      "Show the diff. Do not commit.",
    ].join("\n\n"),
  };
}
