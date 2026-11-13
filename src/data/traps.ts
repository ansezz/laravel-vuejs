export type TrapLine = { text: string; bad?: boolean };

export type Trap = {
  id: string;
  task: string;
  /** Path of the guide that forbids the bad line. */
  guide: string;
  guideTitle: string;
  rule: string;
  lines: TrapLine[];
};

export const traps: Trap[] = [
  {
    id: "cursor",
    task: "Paginate the posts list.",
    guide: "/laravel-vue-pagination",
    guideTitle: "Laravel and Vue pagination",
    rule: "Two rows with the same published_at do not give the cursor a stable bound, so order by id.",
    lines: [
      { text: "Read the pagination guide, then change the posts index query." },
      { text: "Order by published_at and call cursorPaginate(10).", bad: true },
      { text: "Return the paginator to the Vue page as a prop." },
      {
        text: "Render next_page_url and prev_page_url. A cursor page has no last_page.",
      },
    ],
  },
  {
    id: "ziggy",
    task: "Point a Vue form at the posts store route.",
    guide: "/laravel-ziggy-vue",
    guideTitle: "Ziggy or Wayfinder for Laravel routes in Vue",
    rule: "Do not install Ziggy on the Vue starter kit. You would have two ways to build the same URL.",
    lines: [
      {
        text: "Call the Wayfinder store() function the Vue starter kit generates.",
      },
      {
        text: "Install tightenco/ziggy and call route('posts.store') from the form.",
        bad: true,
      },
      {
        text: "Post the Inertia form to that function. Do not type the URL by hand.",
      },
      { text: "Show the diff. Do not commit." },
    ],
  },
  {
    id: "router",
    task: "Add a posts page to the Vue starter kit.",
    guide: "/laravel-wayfinder-vue",
    guideTitle: "Typed Laravel routes in Vue with Wayfinder",
    rule: "Wayfinder is not Vue Router. Inertia still navigates. A client router beside it is the mistake.",
    lines: [
      {
        text: "Add a web route that returns Inertia::render for the posts page.",
      },
      { text: "Link to it with the Inertia Link component." },
      {
        text: "Add vue-router and register /posts in createRouter.",
        bad: true,
      },
      { text: "Let Wayfinder generate the URL. Keep the visit on Inertia." },
    ],
  },
  {
    id: "cloud",
    task: "Store a cover image on Laravel Cloud.",
    guide: "/deploy-laravel-vue",
    guideTitle: "Deploy a Laravel and Vue app",
    rule: "Do not add storage:link to a Cloud deploy. The disk resets on every deploy, so the symlink does not survive.",
    lines: [
      { text: "Validate the cover as an image, max 2048 kilobytes." },
      { text: "Store the file on the bucket Cloud attaches." },
      {
        text: "Save the path on the post. Do not write the file bytes into the database.",
      },
      {
        text: "Run php artisan storage:link in the Laravel Cloud deploy.",
        bad: true,
      },
    ],
  },
  {
    id: "breeze",
    task: "Add login to a new Vue starter kit app.",
    guide: "/laravel-breeze-jetstream-vue",
    guideTitle: "Breeze, Jetstream, and the Vue starter kit",
    rule: "Do not install Breeze or Jetstream on the Vue starter kit. You would get two login stacks.",
    lines: [
      {
        text: "composer require laravel/breeze --dev and install the Vue stack on this app.",
        bad: true,
      },
      { text: "Use the login pages the Vue starter kit already ships." },
      { text: "Post the login form to Fortify." },
      { text: "Do not publish a second Vite config." },
    ],
  },
  {
    id: "hot",
    task: "Ship the Vue build to production.",
    guide: "/deploy-laravel-vue",
    guideTitle: "Deploy a Laravel and Vue app",
    rule: "Vite writes public/hot while npm run dev is running. If that file is on the server, every page loads JavaScript from the laptop. Do not commit it.",
    lines: [
      { text: "Run npm run build so the server serves public/build." },
      { text: "Point the web server at the public directory." },
      {
        text: "Commit public/hot so production loads JavaScript from the laptop.",
        bad: true,
      },
      { text: "Delete public/hot before the deploy. Do not commit it." },
    ],
  },
  {
    id: "conflict",
    task: "Tell the author this post changed under them.",
    guide: "/deploy-laravel-vue",
    guideTitle: "Read an Inertia 409 after deploy",
    rule: "Do not abort(409) from a controller to mean this record changed. Inertia already uses 409 for the asset version, and the client will reload instead of showing your sentence.",
    lines: [
      {
        text: "Send updated_at with the form and compare it to the model timestamp.",
      },
      { text: "Put the stale-record sentence in the error bag." },
      { text: "Leave the Inertia asset version check on." },
      {
        text: "abort(409) from the controller so the page shows that the record changed.",
        bad: true,
      },
    ],
  },
  {
    id: "cors",
    task: "Let a separate Vue app send the session cookie.",
    guide: "/laravel-vue-cors",
    guideTitle: "Turn on CORS credentials for a separate Vue app",
    rule: "Do not set allowed_origins to ['*'] in the same file as supports_credentials => true.",
    lines: [
      {
        text: "Set allowed_origins to ['*'] in the same file as supports_credentials => true.",
        bad: true,
      },
      {
        text: "Set supports_credentials to true and list the Vue origin with its scheme and port.",
      },
      {
        text: "Treat http://localhost:5173 and http://127.0.0.1:5173 as different origins.",
      },
      {
        text: "Leave a 419 alone. Editing this file does not replace a missing CSRF cookie.",
      },
    ],
  },
  {
    id: "csrf",
    task: "Stop the 419 on a same-host Inertia form.",
    guide: "/deploy-laravel-vue",
    guideTitle: "Fix a 419 after you deploy",
    rule: "Do not disable VerifyCsrfToken for the whole web group. The token is the check.",
    lines: [
      {
        text: "Leave SESSION_DOMAIN empty when the Vue page and Laravel are the same host.",
      },
      {
        text: "Disable VerifyCsrfToken for the whole web group.",
        bad: true,
      },
      { text: "Generate one APP_KEY per environment and leave it stable." },
      {
        text: "Do not copy the laptop key into production to keep the session.",
      },
    ],
  },
  {
    id: "worker",
    task: "Run a queued job after the Vue form saves.",
    guide: "/laravel-vue-queued-job",
    guideTitle: "queue:work in production, listen locally",
    rule: "Do not call queue:work from a controller so a Vue button starts the worker. The button dispatches a job.",
    lines: [
      {
        text: "Dispatch the job from the controller. The button does not start a worker.",
      },
      { text: "Let a supervisor, or the platform, run queue:work." },
      {
        text: "Call queue:work from the controller that handled the click.",
        bad: true,
      },
      { text: "On Laravel Cloud, do not add queue:restart to the release." },
    ],
  },
  {
    id: "toast",
    task: "Show Saved. after the post form redirects.",
    guide: "/laravel-vue-flash",
    guideTitle: "Show a saved message in Vue",
    rule: "Do not register a second router.on('flash'). The Vue starter kit already listens.",
    lines: [
      { text: "Flash toast with Inertia::flash before the redirect." },
      { text: "Match the kit shape: type success and message Saved." },
      {
        text: "Register router.on('flash') again in the posts page.",
        bad: true,
      },
      { text: "Leave the kit listener in resources/js/app.ts alone." },
    ],
  },
  {
    id: "echo",
    task: "Hear a published post in the Vue page.",
    guide: "/laravel-reverb-vue",
    guideTitle: "Queue a broadcast instead of blocking the save",
    rule: "Do not listen with useEcho on a public channel.",
    lines: [
      { text: "Dispatch the event after the row exists." },
      { text: "Listen with useEcho on the public channel.", bad: true },
      { text: "Run the queue worker before you rewrite the Vue listener." },
      { text: "Use ShouldBroadcast so the save does not wait on the socket." },
    ],
  },
  {
    id: "simple",
    task: "Show the next page of posts.",
    guide: "/laravel-vue-pagination",
    guideTitle: "Render simplePaginate without a last page",
    rule: "simplePaginate omits last_page. Do not compute page 2 of undefined.",
    lines: [
      { text: "Call simplePaginate(10) and return it to the Vue page." },
      {
        text: "Render previous and next from prev_page_url and next_page_url.",
      },
      { text: "If the product needs the count, use paginate." },
      { text: "Print last_page under the simplePaginate result.", bad: true },
    ],
  },
  {
    id: "proxy",
    task: "Make HTTPS stick on a public server.",
    guide: "/deploy-laravel-vue#trust-proxies-so-https-sticks",
    guideTitle: "Trust proxies so HTTPS sticks",
    rule: "Do not call trustProxies(at: '*') on a machine exposed directly.",
    lines: [
      {
        text: "Call trustProxies(at: '*') on the machine exposed directly.",
        bad: true,
      },
      {
        text: "Behind one load balancer, trustProxies(at: '*') is how Laravel sees HTTPS.",
      },
      { text: "Set APP_URL to the https URL people type." },
      { text: "Fix the proxy headers before you reach for URL::forceScheme." },
    ],
  },
  {
    id: "pinia",
    task: "Let every component read the posts list.",
    guide: "/pinia-laravel-inertia",
    guideTitle: "When to use Pinia with Laravel and Inertia",
    rule: "Do not router.reload into a Pinia store so every component can read it. Pass the prop.",
    lines: [
      {
        text: "Load the posts in the controller and type them with defineProps.",
      },
      { text: "Pass the prop, or read a shared prop Inertia already keeps." },
      {
        text: "router.reload the posts into a Pinia store so every component can read it.",
        bad: true,
      },
      { text: "Use Pinia for a draft title that a refresh should forget." },
    ],
  },
  {
    id: "boost",
    task: "Install Laravel Boost for the coding agent.",
    guide: "/laravel-boost-vue",
    guideTitle: "Install Laravel Boost on a Vue starter kit",
    rule: "Do not install Boost inside the Vue app with npm. There is no Boost component to mount.",
    lines: [
      {
        text: "composer require laravel/boost --dev and run php artisan boost:install.",
      },
      { text: "npm install laravel/boost in the Vue app.", bad: true },
      {
        text: "Run php artisan boost:install again and restart the agent.",
      },
      { text: "Point the agent at a page that already exists." },
    ],
  },
  {
    id: "upload",
    task: "Update a post cover from the Vue form.",
    guide: "/laravel-vue-file-upload",
    guideTitle: "Upload files from Vue to Laravel with Inertia",
    rule: "PHP does not fill a file on a real PUT, PATCH, or DELETE. Post the form and send _method of put.",
    lines: [
      { text: "Validate the cover as an image, max 2048 kilobytes." },
      { text: "Send the cover with method put.", bad: true },
      { text: "Post the form and send _method of put." },
      { text: "Save the path. Do not write the file bytes into the database." },
    ],
  },
  {
    id: "force",
    task: "Delete a post from the Vue index.",
    guide: "/laravel-soft-deletes-index-vue",
    guideTitle: "Keep soft-deleted rows off a Vue index",
    rule: "Do not call forceDelete() from the button you labeled Delete. That removes the row. Soft delete is the one you can restore.",
    lines: [
      { text: "Call delete() from the Delete button." },
      { text: "Leave trashed rows off the public index." },
      { text: "Call forceDelete() from the Delete button.", bad: true },
      { text: "Give the trash screen its own page and its own policy." },
    ],
  },
  {
    id: "logout",
    task: "Log the user out from the Vue page.",
    guide: "/inertia-form-component-vue",
    guideTitle: "preserveState keeps the Vue page you have",
    rule: "Do not set preserveState: true on a logout request. The old page's props, including the user, stay on screen until something else navigates.",
    lines: [
      { text: "Post the logout form to the Fortify logout route." },
      { text: "Set preserveState: true on the logout request.", bad: true },
      { text: "Keep preserveState for a save that still has errors." },
      { text: "Let a clean response replace the page." },
    ],
  },
  {
    id: "migrate",
    task: "Run the new migration when you deploy.",
    guide: "/deploy-laravel-vue#run-migrations-in-the-release-not-in-a-request",
    guideTitle: "Run migrations in the release, not in a request",
    rule: "Do not call Artisan::call('migrate') from a controller the Vue page can hit. Two deploys, or two curious browsers, should not race that.",
    lines: [
      { text: "Run php artisan migrate --force in the release." },
      { text: "Read the migration before you ship it." },
      {
        text: "Call Artisan::call('migrate') from the controller the Vue page can hit.",
        bad: true,
      },
      { text: "Do not migrate from a queued job so the request stays fast." },
    ],
  },
  {
    id: "telescope",
    task: "Open Telescope from a Vue admin link.",
    guide: "/application-setup",
    guideTitle: "Install Telescope for local debugging",
    rule: "Do not return true for every user so a Vue admin link can open Telescope. Leave the viewTelescope gate on local.",
    lines: [
      { text: "composer require laravel/telescope --dev." },
      { text: "Leave the viewTelescope gate on local." },
      {
        text: "return true from viewTelescope so every user can open it.",
        bad: true,
      },
      { text: "Do not iframe Telescope in the Vue page." },
    ],
  },
  {
    id: "window",
    task: "Read the browser location during setup.",
    guide: "/inertia-ssr",
    guideTitle: "Keep the Inertia SSR process running",
    rule: "Do not read window in setup.",
    lines: [
      { text: "Supervise one SSR process in production." },
      { text: "Point config/inertia.php at that process." },
      { text: "Read window.location in setup.", bad: true },
      { text: "Skip SSR when the whole app is behind login." },
    ],
  },
];
