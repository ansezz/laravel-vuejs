// Checks the developer tools against the same module the pages and the browser use.
import { PACKAGES } from "../src/data/packages.ts";
import {
  RECIPE_JOBS,
  COMPAT_ROWS,
  ERA_ROWS,
  FILE_ROWS,
  SHIPPED_ROWS,
  defaultJobIds,
  recipeFromJobs,
  compatibilityMarkdown,
  nowMarkdown,
  filesMarkdown,
  shippedMarkdown,
  agentsMarkdown,
} from "../src/data/dev-tools.ts";

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const catalog = new Map(PACKAGES.map((pkg) => [pkg.name, pkg]));
for (const job of RECIPE_JOBS) {
  for (const name of job.names) {
    const pkg = catalog.get(name);
    if (!pkg)
      fail(`recipe job ${job.id} names ${name}, which is not in the chart`);
    if (pkg.ecosystem !== job.ecosystem) {
      fail(
        `${name} is ${pkg.ecosystem} in the chart and ${job.ecosystem} on job ${job.id}`,
      );
    }
  }
}

const recipe = recipeFromJobs(defaultJobIds());
const composer =
  "composer require inertiajs/inertia-laravel tightenco/ziggy pestphp/pest-plugin-laravel larastan/larastan";
const npm = "npm install pinia @vitejs/plugin-vue vue-tsc";
if (recipe.composer !== composer) fail(`default composer:\n${recipe.composer}`);
if (recipe.npm !== npm) fail(`default npm:\n${recipe.npm}`);
if (recipe.warnings.length)
  fail(`default recipe has warnings: ${recipe.warnings.join(" | ")}`);
if (!recipe.markdown.includes("2026-10-10"))
  fail("recipe markdown is missing the snapshot date");
if (!recipe.markdown.includes("/tools/compatibility.md"))
  fail("recipe markdown is missing the compatibility link");
if (!recipe.markdown.includes("/llms.txt"))
  fail("recipe markdown is missing llms.txt");
if (/--dev|\d+\.\d+\.\d+/.test(recipe.markdown))
  fail("recipe markdown pins a version");

const deduped = recipeFromJobs(["vite", "components"]);
if (
  deduped.npm !==
  "npm install @vitejs/plugin-vue vue-tsc unplugin-vue-components"
) {
  fail(`vite + components order:\n${deduped.npm}`);
}
if (
  deduped.packages.filter((pkg) => pkg.name === "@vitejs/plugin-vue").length !==
  1
) {
  fail("@vitejs/plugin-vue was not deduped");
}

const routerWarning = recipeFromJobs(["inertia", "router"]).warnings.join("\n");
if (!routerWarning.includes("Vue Router"))
  fail("Inertia plus Vue Router did not warn");
const authWarning = recipeFromJobs(["api", "login"]).warnings.join("\n");
if (!authWarning.includes("Fortify") || !authWarning.includes("Sanctum")) {
  fail("API auth plus app login did not warn");
}

const empty = recipeFromJobs([]);
if (empty.composer !== null || empty.npm !== null)
  fail("empty recipe still has a command");
if (!empty.markdown.includes("No packages selected."))
  fail("empty recipe markdown is missing the empty line");

const card = compatibilityMarkdown();
if (!card.includes("PHP 8.3 to 8.5"))
  fail("compatibility card is missing the Laravel 13 PHP range");
if (!card.includes("https://laravel-vuejs.space/requirements"))
  fail("compatibility card is missing the requirements URL");
for (const row of COMPAT_ROWS) {
  if (!card.includes(row.pair) || !card.includes(row.use))
    fail(`compatibility card dropped ${row.id}`);
}

const agents = agentsMarkdown();
for (const phrase of [
  "Laravel 13",
  "Vue 3.5",
  "Pinia",
  "vue-router",
  "radix-vue",
  "reka-ui",
  "Fortify",
  "Sanctum",
]) {
  if (!agents.includes(phrase)) fail(`default AGENTS.md is missing ${phrase}`);
}

const livewire = agentsMarkdown({ bridge: "livewire" });
if (livewire.includes("inertiajs/inertia-laravel"))
  fail("Livewire rules still install Inertia");
if (!livewire.includes("livewire/livewire"))
  fail("Livewire rules omit livewire/livewire");
if (!livewire.includes("not in the download chart"))
  fail("Livewire rules do not say the package is off the chart");

const vuex = agentsMarkdown({ state: "vuex" });
if (!vuex.includes("Vuex")) fail("Vuex rules omit Vuex");
if (
  !vuex.includes("Do not add Pinia beside it unless the task is a migration")
) {
  fail("Vuex rules do not keep Pinia out");
}

if (!agentsMarkdown({ laravel: "12" }).includes("PHP 8.2"))
  fail("Laravel 12 rules omit PHP 8.2");

const api = agentsMarkdown({ bridge: "api" });
if (!api.includes("composer require laravel/sanctum"))
  fail("API rules omit Sanctum");
if (api.includes("inertiajs/inertia-laravel"))
  fail("API rules still install Inertia");

if (
  !agentsMarkdown({ tests: "phpunit" }).includes(
    "Do not convert them to Pest unless asked.",
  )
) {
  fail("PHPUnit rules offer a Pest conversion");
}

for (const row of ERA_ROWS) {
  for (const name of row.packages) {
    if (!catalog.has(name))
      fail(
        `then-and-now row ${row.id} names ${name}, which is not in the chart`,
      );
  }
  if (row.packages.includes("vuex"))
    fail("Vuex is the 2019 store, not a 2026 chart pick");
}
const now = nowMarkdown();
for (const phrase of [
  "Laravel 13",
  "Pinia",
  "Tailwind CSS 4",
  "https://laravel-vuejs.space/requirements",
  "https://laravel-vuejs.space/application-setup",
  "not from `composer require laravel/framework`",
]) {
  if (!now.includes(phrase)) fail(`then-and-now markdown is missing ${phrase}`);
}
const stateLine = now.split("\n").find((line) => line.startsWith("| State |"));
if (!stateLine?.includes("Vuex") || !stateLine.includes("/packages/pinia")) {
  fail(`state row: ${stateLine}`);
}
if (stateLine.includes("/packages/vuex"))
  fail("state row links the old Vuex package as the 2026 pick");
if (!now.includes("Nova 5 or Filament") || !now.includes("Not in this chart")) {
  fail("admin and styling rows must say they are off the chart");
}
for (const absent of [
  "Lighthouse is not in this chart",
  "WorkOS AuthKit is not in this chart",
  "Pulse and Nightwatch are not in this chart",
  "Vitest is not in this chart",
]) {
  if (!now.includes(absent)) fail(`then-and-now markdown dropped: ${absent}`);
}
if (
  /\b\d{7,}\b/.test(now) ||
  now.includes("Pest 4") ||
  now.includes("upgrade-inertia")
) {
  fail("then-and-now markdown invented a count or cited an unpublished post");
}

const allowedFileSources = new Set([
  "/application-setup",
  "/inertia-3-9-background-polling-navigate-type",
]);
for (const row of FILE_ROWS) {
  if (!allowedFileSources.has(row.sourcePath)) {
    fail(`file row ${row.id} cites ${row.sourcePath}`);
  }
  if (row.path.includes("resources/js/Pages")) {
    fail(`file row ${row.id} uses a capital Pages folder`);
  }
}
const pageRow = FILE_ROWS.find((row) => row.id === "page");
if (pageRow?.path !== "resources/js/pages/posts/Index.vue") {
  fail(`vue page path: ${pageRow?.path}`);
}
if (!pageRow.rule.includes("posts/Index")) {
  fail("vue page rule dropped the Inertia component name");
}
const files = filesMarkdown();
for (const phrase of [
  "laravel new blog",
  "composer run dev",
  "resources/js/pages/posts/Index.vue",
  "posts/Index",
  "tests/Feature/PostsTest.php",
  "npm run build:ssr",
  "resources/js/app.ts",
  "https://laravel-vuejs.space/application-setup",
  "https://laravel-vuejs.space/inertia-3-9-background-polling-navigate-type",
  "not in the download chart",
]) {
  if (!files.includes(phrase)) fail(`file map markdown is missing ${phrase}`);
}
if (
  files.includes("resources/js/Pages") ||
  files.includes("vue-router") ||
  files.includes("Pest 4") ||
  files.includes("upgrade-inertia") ||
  /\b\d{7,}\b/.test(files)
) {
  fail("file map invented a path, a count, or an unpublished post");
}
if (!files.includes("paths the guide names")) {
  fail("file map intro dropped the article");
}
if (!files.includes("The app is at http://localhost:8000.")) {
  fail("file map does not say where the app is served");
}
if (files.includes("Vite at http://localhost:8000")) {
  fail("file map puts Vite on the PHP URL");
}
if (files.includes("`command only`") || files.includes("`edit the file`")) {
  fail("file map backticks an empty path or command");
}
if (
  !files.includes("| Command only |") ||
  !files.includes("| Edit the file |")
) {
  fail("file map dropped the plain empty-cell labels");
}

const allowedShippedSources = new Set([
  "/laravel-13-35-query-routes-markdown-responses",
  "/inertia-3-9-background-polling-navigate-type",
]);
for (const row of SHIPPED_ROWS) {
  if (!allowedShippedSources.has(row.sourcePath)) {
    fail(`shipped row ${row.id} cites ${row.sourcePath}`);
  }
}
const shipped = shippedMarkdown();
for (const phrase of [
  "Route::query()",
  "HTML forms cannot send QUERY",
  "response()->markdown()",
  "text/markdown",
  "Schedule::alwaysOnOneServer()",
  "php artisan queue:work --memory=75%",
  "HasDefaultAttributes",
  "background pause",
  "keepAlive",
  "deprecated",
  "detail.type",
  "3.9.1",
  "X-XSRF-TOKEN",
  "inertiajs/inertia-laravel",
  "https://laravel-vuejs.space/laravel-13-35-query-routes-markdown-responses",
  "https://laravel-vuejs.space/inertia-3-9-background-polling-navigate-type",
  "October 6, 2026",
  "October 9, 2026",
]) {
  if (!shipped.includes(phrase)) fail(`shipped markdown is missing ${phrase}`);
}
if (
  shipped.includes("upgrade-inertia") ||
  shipped.includes("Pest 4") ||
  shipped.includes("optimistic") ||
  /\b\d{7,}\b/.test(shipped)
) {
  fail("shipped markdown cited an unpublished post or invented a count");
}
if (shipped.includes("HTML forms can send QUERY")) {
  fail("shipped markdown says HTML forms can send QUERY");
}
if (shipped.includes("including a useHttp call to another domain")) {
  fail("shipped markdown sends the XSRF header off origin");
}
if (!shipped.includes("only for your own origin")) {
  fail("shipped markdown dropped the same-origin XSRF rule");
}
if (shipped.includes("3.9.0") && shipped.includes("Install 3.9.0")) {
  fail("shipped markdown tells assistants to install 3.9.0");
}

console.log("tools ok");
