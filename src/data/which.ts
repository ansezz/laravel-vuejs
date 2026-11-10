export type WhichLine = { text: string; bad?: boolean };

export type WhichFile = { name: string; lines: WhichLine[] };

export type WhichCase = {
  id: string;
  task: string;
  guide: string;
  guideTitle: string;
  rule: string;
  files: WhichFile[];
};

export const cases: WhichCase[] = [
  {
    id: "ziggy",
    task: "Point a Vue form at the posts store route.",
    guide: "/laravel-ziggy-vue",
    guideTitle: "Ziggy or Wayfinder for Laravel routes in Vue",
    rule: "Do not install Ziggy on the Vue starter kit. You would have two ways to build the same URL.",
    files: [
      {
        name: "routes/web.php",
        lines: [
          {
            text: "Add a web route that returns Inertia::render for the posts page.",
          },
          { text: "Name the route posts.store." },
          { text: "Keep the route behind auth." },
        ],
      },
      {
        name: "resources/js/Pages/Posts/Create.vue",
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
        ],
      },
      {
        name: "composer.json",
        lines: [
          { text: "Require laravel/framework and inertiajs/inertia-laravel." },
          { text: "Keep the Vue starter kit versions." },
          { text: "Do not add a second auth package." },
        ],
      },
      {
        name: "vite.config.ts",
        lines: [
          { text: "Keep the Vue plugin the starter kit already registers." },
          { text: "Leave the Laravel Vite plugin in place." },
          { text: "Build with npm run build." },
        ],
      },
    ],
  },
  {
    id: "router",
    task: "Add a posts page to the Vue starter kit.",
    guide: "/laravel-wayfinder-vue",
    guideTitle: "Typed Laravel routes in Vue with Wayfinder",
    rule: "Wayfinder is not Vue Router. Inertia still navigates. A client router beside it is the mistake.",
    files: [
      {
        name: "routes/web.php",
        lines: [
          {
            text: "Add a web route that returns Inertia::render for the posts page.",
          },
          { text: "Name the route posts.index." },
          { text: "Keep the route in routes/web.php." },
        ],
      },
      {
        name: "resources/js/app.ts",
        lines: [
          { text: "Keep the Inertia setup the starter kit ships." },
          {
            text: "Add vue-router and register /posts in createRouter.",
            bad: true,
          },
          {
            text: "Let Wayfinder generate the URL. Keep the visit on Inertia.",
          },
        ],
      },
      {
        name: "resources/js/Pages/Posts/Index.vue",
        lines: [
          { text: "Link to the page with the Inertia Link component." },
          { text: "Read the posts from the page props." },
          { text: "Render the list in this page." },
        ],
      },
      {
        name: "vite.config.ts",
        lines: [
          { text: "Keep the Vue plugin the starter kit already registers." },
          { text: "Leave the Laravel Vite plugin in place." },
          { text: "Do not publish a second Vite config." },
        ],
      },
    ],
  },
  {
    id: "hot",
    task: "Ship the Vue build to production.",
    guide: "/deploy-laravel-vue",
    guideTitle: "Deploy a Laravel and Vue app",
    rule: "Vite writes public/hot while npm run dev is running. If that file is on the server, every page loads JavaScript from the laptop. Do not commit it.",
    files: [
      {
        name: "scripts/deploy.sh",
        lines: [
          { text: "Run npm run build so the server serves public/build." },
          {
            text: "Commit public/hot so production loads JavaScript from the laptop.",
            bad: true,
          },
          { text: "Point the web server at the public directory." },
        ],
      },
      {
        name: "public/build/manifest.json",
        lines: [
          { text: "This file is the Vite build output." },
          { text: "Deploy this directory with the release." },
          { text: "Leave the hashed file names as Vite wrote them." },
        ],
      },
      {
        name: ".gitignore",
        lines: [
          { text: "Ignore node_modules." },
          { text: "Ignore public/hot." },
          { text: "Delete public/hot before the deploy." },
        ],
      },
      {
        name: "vite.config.ts",
        lines: [
          { text: "Keep the Vue plugin the starter kit already registers." },
          { text: "Do not commit public/hot." },
          { text: "Build with npm run build." },
        ],
      },
    ],
  },
  {
    id: "breeze",
    task: "Add login to a new Vue starter kit app.",
    guide: "/laravel-breeze-jetstream-vue",
    guideTitle: "Breeze, Jetstream, and the Vue starter kit",
    rule: "Do not install Breeze or Jetstream on the Vue starter kit. You would get two login stacks.",
    files: [
      {
        name: "composer.json",
        lines: [
          {
            text: "composer require laravel/breeze --dev and install the Vue stack on this app.",
            bad: true,
          },
          {
            text: "Require laravel/fortify, which the Vue starter kit already uses.",
          },
          { text: "Do not add a second login package." },
        ],
      },
      {
        name: "resources/js/Pages/auth/Login.vue",
        lines: [
          { text: "Use the login page the Vue starter kit already ships." },
          { text: "Post the login form to Fortify." },
          { text: "Keep the email and password fields the kit renders." },
        ],
      },
      {
        name: "routes/web.php",
        lines: [
          { text: "Leave the Fortify routes registered." },
          { text: "Do not publish a second set of login routes." },
          { text: "Keep the guest middleware on the login page." },
        ],
      },
      {
        name: "vite.config.ts",
        lines: [
          { text: "Keep the one Vite config the kit ships." },
          { text: "Do not publish a second Vite config." },
          { text: "Build with npm run build." },
        ],
      },
    ],
  },
  {
    id: "cursor",
    task: "Paginate the posts list.",
    guide: "/laravel-vue-pagination",
    guideTitle: "Laravel and Vue pagination",
    rule: "Two rows with the same published_at do not give the cursor a stable bound, so order by id.",
    files: [
      {
        name: "app/Http/Controllers/PostController.php",
        lines: [
          {
            text: "Read the pagination guide, then change the posts index query.",
          },
          {
            text: "Order by published_at and call cursorPaginate(10).",
            bad: true,
          },
          { text: "Return the paginator to the Vue page as a prop." },
        ],
      },
      {
        name: "resources/js/Pages/Posts/Index.vue",
        lines: [
          { text: "Render next_page_url and prev_page_url." },
          { text: "A cursor page has no last_page." },
          { text: "Link next and previous with the Inertia Link component." },
        ],
      },
      {
        name: "routes/web.php",
        lines: [
          { text: "Point the posts index route at PostController." },
          { text: "Keep the route behind auth." },
          { text: "Name the route posts.index." },
        ],
      },
      {
        name: "app/Models/Post.php",
        lines: [
          { text: "Keep published_at on the model." },
          { text: "Leave the order to the controller." },
          { text: "Leave the fillable list as the kit has it." },
        ],
      },
    ],
  },
  {
    id: "worker",
    task: "Run a queued job after the Vue form saves.",
    guide: "/laravel-queue-work-vs-listen",
    guideTitle: "queue:work in production, listen locally",
    rule: "Do not call queue:work from a controller so a Vue button starts the worker. The button dispatches a job.",
    files: [
      {
        name: "app/Http/Controllers/PostController.php",
        lines: [
          { text: "Dispatch the job from the controller." },
          {
            text: "Call queue:work from the controller that handled the click.",
            bad: true,
          },
          { text: "The button does not start a worker." },
        ],
      },
      {
        name: "app/Jobs/PublishPost.php",
        lines: [
          { text: "Put the work in this job class." },
          { text: "Use ShouldQueue." },
          { text: "Keep the constructor arguments small." },
        ],
      },
      {
        name: "routes/console.php",
        lines: [
          { text: "Leave the worker to a supervisor, or the platform." },
          {
            text: "On Laravel Cloud, do not add queue:restart to the release.",
          },
          { text: "Schedule only the tasks the deploy guide already names." },
        ],
      },
      {
        name: "resources/js/Pages/Posts/Create.vue",
        lines: [
          { text: "Post the form with Inertia." },
          { text: "Show a saved state from the redirect." },
          { text: "Do not start a process from the button." },
        ],
      },
    ],
  },
  {
    id: "cloud",
    task: "Store a cover image on Laravel Cloud.",
    guide: "/deploy-laravel-vue",
    guideTitle: "Deploy a Laravel and Vue app",
    rule: "Do not add storage:link to a Cloud deploy. The disk resets on every deploy, so the symlink does not survive.",
    files: [
      {
        name: "app/Http/Controllers/PostController.php",
        lines: [
          { text: "Validate the cover as an image, max 2048 kilobytes." },
          { text: "Store the file on the bucket Cloud attaches." },
          { text: "Save the path on the post." },
        ],
      },
      {
        name: "scripts/deploy.sh",
        lines: [
          { text: "Run npm run build before the release." },
          {
            text: "Run php artisan storage:link in the Laravel Cloud deploy.",
            bad: true,
          },
          { text: "Point the web server at the public directory." },
        ],
      },
      {
        name: "resources/js/Pages/Posts/Edit.vue",
        lines: [
          { text: "Post the cover with the Inertia form." },
          { text: "Show the stored path from the page props." },
          { text: "Keep the file input name cover." },
        ],
      },
      {
        name: "config/filesystems.php",
        lines: [
          { text: "Use the disk Cloud attaches." },
          { text: "Leave the local disk for development." },
          { text: "Do not write the file bytes into the database." },
        ],
      },
    ],
  },
  {
    id: "conflict",
    task: "Tell the author this post changed under them.",
    guide: "/inertia-error-409-vue",
    guideTitle: "Read an Inertia 409 after deploy",
    rule: "Do not abort(409) from a controller to mean this record changed. Inertia already uses 409 for the asset version, and the client will reload instead of showing your sentence.",
    files: [
      {
        name: "app/Http/Controllers/PostController.php",
        lines: [
          {
            text: "Send updated_at with the form and compare it to the model timestamp.",
          },
          { text: "Put the stale-record sentence in the error bag." },
          {
            text: "abort(409) from the controller so the page shows that the record changed.",
            bad: true,
          },
        ],
      },
      {
        name: "resources/js/Pages/Posts/Edit.vue",
        lines: [
          { text: "Send the form's updated_at with the save." },
          { text: "Show the error bag sentence under the form." },
          { text: "Keep the Inertia form helper." },
        ],
      },
      {
        name: "app/Http/Middleware/HandleInertiaRequests.php",
        lines: [
          { text: "Leave the Inertia asset version check on." },
          { text: "Keep the version the starter kit already sends." },
          { text: "Do not turn the version check off to hide a reload." },
        ],
      },
      {
        name: "routes/web.php",
        lines: [
          { text: "Point the update route at PostController." },
          { text: "Keep the route behind auth." },
          { text: "Name the route posts.update." },
        ],
      },
    ],
  },
  {
    id: "cors",
    task: "Let a separate Vue app send the session cookie.",
    guide: "/laravel-vue-cors",
    guideTitle: "Turn on CORS credentials for a separate Vue app",
    rule: "Do not set allowed_origins to ['*'] in the same file as supports_credentials => true.",
    files: [
      {
        name: "config/cors.php",
        lines: [
          {
            text: "Set supports_credentials to true and list the Vue origin with its scheme and port.",
          },
          {
            text: "Set allowed_origins to ['*'] in the same file as supports_credentials => true.",
            bad: true,
          },
          {
            text: "Treat http://localhost:5173 and http://127.0.0.1:5173 as different origins.",
          },
        ],
      },
      {
        name: "routes/web.php",
        lines: [
          { text: "Keep the Inertia routes on the same host when you can." },
          { text: "Leave a 419 for the session guide." },
          { text: "Do not edit this file to invent a cookie." },
        ],
      },
      {
        name: ".env",
        lines: [
          { text: "Leave SESSION_DOMAIN empty on one host." },
          { text: "Set APP_URL to the Laravel origin." },
          { text: "Keep the session driver the kit already uses." },
        ],
      },
      {
        name: "resources/js/app.ts",
        lines: [
          {
            text: "Send the cookie from the separate Vue origin only after CORS allows it.",
          },
          { text: "Keep the Inertia setup for a same-host app." },
          { text: "Do not add a second router." },
        ],
      },
    ],
  },
  {
    id: "csrf",
    task: "Stop the 419 on a same-host Inertia form.",
    guide: "/laravel-vue-419-after-deploy",
    guideTitle: "Fix a 419 after you deploy",
    rule: "Do not disable VerifyCsrfToken for the whole web group. The token is the check.",
    files: [
      {
        name: "bootstrap/app.php",
        lines: [
          {
            text: "Leave SESSION_DOMAIN empty when the Vue page and Laravel are the same host.",
          },
          {
            text: "Disable VerifyCsrfToken for the whole web group.",
            bad: true,
          },
          { text: "Generate one APP_KEY per environment and leave it stable." },
        ],
      },
      {
        name: "resources/js/Pages/Posts/Create.vue",
        lines: [
          { text: "Post the form with the Inertia form helper." },
          { text: "Load a fresh page after a new APP_KEY." },
          { text: "Keep the form on the same host as Laravel." },
        ],
      },
      {
        name: ".env",
        lines: [
          { text: "Leave SESSION_DOMAIN empty on this host." },
          { text: "Keep one APP_KEY for this environment." },
          { text: "Set APP_URL to the https URL people type." },
        ],
      },
      {
        name: "routes/web.php",
        lines: [
          { text: "Keep the posts routes in the web group." },
          { text: "Leave the CSRF middleware on that group." },
          { text: "Name the route posts.store." },
        ],
      },
    ],
  },
  {
    id: "toast",
    task: "Show Saved. after the post form redirects.",
    guide: "/laravel-vue-flash",
    guideTitle: "Show a saved message in Vue",
    rule: "Do not register a second router.on('flash'). The Vue starter kit already listens.",
    files: [
      {
        name: "app/Http/Controllers/PostController.php",
        lines: [
          { text: "Flash toast with Inertia::flash before the redirect." },
          { text: "Match the kit shape: type success and message Saved." },
          { text: "Return to the posts index." },
        ],
      },
      {
        name: "resources/js/app.ts",
        lines: [
          { text: "Leave the kit listener in this file alone." },
          { text: "Keep initializeFlashToast() where the kit put it." },
          { text: "Do not register a second listener here." },
        ],
      },
      {
        name: "resources/js/Pages/Posts/Create.vue",
        lines: [
          { text: "Post the form and let the redirect carry the flash." },
          {
            text: "Register router.on('flash') again in the posts page.",
            bad: true,
          },
          { text: "Read the saved state from the kit toast." },
        ],
      },
      {
        name: "routes/web.php",
        lines: [
          { text: "Point the store route at PostController." },
          { text: "Keep the route behind auth." },
          { text: "Name the route posts.store." },
        ],
      },
    ],
  },
  {
    id: "echo",
    task: "Hear a published post in the Vue page.",
    guide: "/laravel-should-broadcast-vue",
    guideTitle: "Queue a broadcast instead of blocking the save",
    rule: "Do not listen with useEcho on a public channel.",
    files: [
      {
        name: "app/Events/PostPublished.php",
        lines: [
          { text: "Dispatch the event after the row exists." },
          {
            text: "Use ShouldBroadcast so the save does not wait on the socket.",
          },
          { text: "Keep the payload to the post id and the title." },
        ],
      },
      {
        name: "resources/js/Pages/Posts/Index.vue",
        lines: [
          { text: "Listen on the private channel the Reverb guide shows." },
          { text: "Listen with useEcho on the public channel.", bad: true },
          { text: "Render the new title when the event arrives." },
        ],
      },
      {
        name: "routes/channels.php",
        lines: [
          { text: "Authorize the private channel for the signed-in user." },
          { text: "Leave the public channel unused." },
          { text: "Return true only for the owner." },
        ],
      },
      {
        name: "routes/console.php",
        lines: [
          { text: "Run the queue worker before you rewrite the Vue listener." },
          { text: "Leave the worker to a supervisor, or the platform." },
          { text: "Do not call queue:work from the controller." },
        ],
      },
    ],
  },
  {
    id: "simple",
    task: "Show the next page of posts.",
    guide: "/laravel-vue-pagination",
    guideTitle: "Render simplePaginate without a last page",
    rule: "simplePaginate omits last_page. Do not compute page 2 of undefined.",
    files: [
      {
        name: "app/Http/Controllers/PostController.php",
        lines: [
          { text: "Call simplePaginate(10) and return it to the Vue page." },
          { text: "If the product needs the count, use paginate." },
          { text: "Order by id." },
        ],
      },
      {
        name: "resources/js/Pages/Posts/Index.vue",
        lines: [
          {
            text: "Render previous and next from prev_page_url and next_page_url.",
          },
          {
            text: "Print last_page under the simplePaginate result.",
            bad: true,
          },
          { text: "Link next and previous with the Inertia Link component." },
        ],
      },
      {
        name: "routes/web.php",
        lines: [
          { text: "Point the index route at PostController." },
          { text: "Keep the route behind auth." },
          { text: "Name the route posts.index." },
        ],
      },
      {
        name: "app/Models/Post.php",
        lines: [
          { text: "Leave the query in the controller." },
          { text: "Keep the model free of a second count." },
          { text: "Leave the fillable list as the kit has it." },
        ],
      },
    ],
  },
  {
    id: "proxy",
    task: "Make HTTPS stick on a public server.",
    guide: "/laravel-trust-proxies-https",
    guideTitle: "Trust proxies so HTTPS sticks",
    rule: "Do not call trustProxies(at: '*') on a machine exposed directly.",
    files: [
      {
        name: "bootstrap/app.php",
        lines: [
          {
            text: "Behind one load balancer, trustProxies(at: '*') is how Laravel sees HTTPS.",
          },
          {
            text: "Call trustProxies(at: '*') on the machine exposed directly.",
            bad: true,
          },
          {
            text: "Fix the proxy headers before you reach for URL::forceScheme.",
          },
        ],
      },
      {
        name: ".env",
        lines: [
          { text: "Set APP_URL to the https URL people type." },
          { text: "Leave the session secure cookie on for that https URL." },
          { text: "Keep one APP_URL for this environment." },
        ],
      },
      {
        name: "routes/web.php",
        lines: [
          { text: "Leave the routes as they are." },
          { text: "Do not force a scheme in a route." },
          { text: "Keep the posts routes in the web group." },
        ],
      },
      {
        name: "vite.config.ts",
        lines: [
          { text: "Keep the Vue plugin the starter kit already registers." },
          { text: "Build with npm run build." },
          { text: "Do not commit public/hot." },
        ],
      },
    ],
  },
  {
    id: "pinia",
    task: "Let every component read the posts list.",
    guide: "/pinia-laravel-inertia",
    guideTitle: "When to use Pinia with Laravel and Inertia",
    rule: "Do not router.reload into a Pinia store so every component can read it. Pass the prop.",
    files: [
      {
        name: "app/Http/Controllers/PostController.php",
        lines: [
          {
            text: "Load the posts in the controller and return them as a prop.",
          },
          { text: "Redirect back to the index after a save." },
          { text: "Leave the list as server state." },
        ],
      },
      {
        name: "resources/js/Pages/Posts/Index.vue",
        lines: [
          { text: "Type the posts with defineProps." },
          {
            text: "Pass the prop, or read a shared prop Inertia already keeps.",
          },
          { text: "Render the list from that prop." },
        ],
      },
      {
        name: "resources/js/stores/posts.ts",
        lines: [
          { text: "Use Pinia for a draft title that a refresh should forget." },
          {
            text: "router.reload the posts into a Pinia store so every component can read it.",
            bad: true,
          },
          { text: "Leave Eloquent rows out of this store." },
        ],
      },
      {
        name: "routes/web.php",
        lines: [
          { text: "Point the index route at PostController." },
          { text: "Keep the route behind auth." },
          { text: "Name the route posts.index." },
        ],
      },
    ],
  },
  {
    id: "boost",
    task: "Install Laravel Boost for the coding agent.",
    guide: "/laravel-boost-vue",
    guideTitle: "Install Laravel Boost on a Vue starter kit",
    rule: "Do not install Boost inside the Vue app with npm. There is no Boost component to mount.",
    files: [
      {
        name: "composer.json",
        lines: [
          {
            text: "composer require laravel/boost --dev and run php artisan boost:install.",
          },
          { text: "Keep Boost in require-dev." },
          { text: "Do not add Boost to the Vue dependencies." },
        ],
      },
      {
        name: "package.json",
        lines: [
          { text: "Keep the Vue starter kit dependencies." },
          { text: "npm install laravel/boost in the Vue app.", bad: true },
          { text: "Leave the scripts the kit already ships." },
        ],
      },
      {
        name: "resources/js/app.ts",
        lines: [
          { text: "Do not mount a Boost component." },
          { text: "Keep the Inertia setup the starter kit ships." },
          { text: "Point the agent at a page that already exists." },
        ],
      },
      {
        name: "vite.config.ts",
        lines: [
          { text: "Keep the one Vite config the kit ships." },
          {
            text: "Run php artisan boost:install again and restart the agent.",
          },
          { text: "Build with npm run build." },
        ],
      },
    ],
  },
  {
    id: "upload",
    task: "Update a post cover from the Vue form.",
    guide: "/laravel-vue-file-upload",
    guideTitle: "Upload files from Vue to Laravel with Inertia",
    rule: "PHP does not fill a file on a real PUT, PATCH, or DELETE. Post the form and send _method of put.",
    files: [
      {
        name: "app/Http/Controllers/PostController.php",
        lines: [
          { text: "Validate the cover as an image, max 2048 kilobytes." },
          { text: "Save the path the disk returns." },
          { text: "Store the file on the disk." },
        ],
      },
      {
        name: "resources/js/Pages/Posts/Edit.vue",
        lines: [
          { text: "Post the form as multipart." },
          { text: "Send the cover with method put.", bad: true },
          { text: "Keep the input name cover." },
        ],
      },
      {
        name: "routes/web.php",
        lines: [
          { text: "Point the update route at PostController." },
          { text: "Keep the route behind auth." },
          { text: "Name the route posts.update." },
        ],
      },
      {
        name: "config/filesystems.php",
        lines: [
          { text: "Use the disk the deploy guide names." },
          { text: "Leave the local disk for development." },
          { text: "Do not write the file bytes into the database." },
        ],
      },
    ],
  },
  {
    id: "force",
    task: "Delete a post from the Vue index.",
    guide: "/laravel-soft-deletes-index-vue",
    guideTitle: "Keep soft-deleted rows off a Vue index",
    rule: "Do not call forceDelete() from the button you labeled Delete. That removes the row. Soft delete is the one you can restore.",
    files: [
      {
        name: "app/Http/Controllers/PostController.php",
        lines: [
          { text: "Call delete() so the row can be restored." },
          { text: "Leave trashed rows off the public index query." },
          { text: "Authorize the delete with the post policy." },
        ],
      },
      {
        name: "resources/js/Pages/Posts/Index.vue",
        lines: [
          { text: "Label the button Delete." },
          { text: "Call forceDelete() from the Delete button.", bad: true },
          { text: "Post the delete with the Inertia form helper." },
        ],
      },
      {
        name: "app/Models/Post.php",
        lines: [
          { text: "Use the SoftDeletes trait." },
          { text: "Keep deleted_at nullable." },
          { text: "Leave the public query to the trait." },
        ],
      },
      {
        name: "routes/web.php",
        lines: [
          { text: "Point the destroy route at PostController." },
          { text: "Keep the route behind auth." },
          { text: "Give the trash screen its own route." },
        ],
      },
    ],
  },
  {
    id: "logout",
    task: "Log the user out from the Vue page.",
    guide: "/inertia-form-component-vue",
    guideTitle: "preserveState keeps the Vue page you have",
    rule: "Do not set preserveState: true on a logout request. The old page's props, including the user, stay on screen until something else navigates.",
    files: [
      {
        name: "resources/js/Layouts/AppLayout.vue",
        lines: [
          { text: "Post the logout form to the Fortify logout route." },
          { text: "Set preserveState: true on the logout request.", bad: true },
          { text: "Let a clean response replace the page." },
        ],
      },
      {
        name: "resources/js/Pages/Posts/Create.vue",
        lines: [
          { text: "Keep preserveState for a save that still has errors." },
          { text: "Replace the page when the save is clean." },
          { text: "Post the form with the Inertia form helper." },
        ],
      },
      {
        name: "routes/web.php",
        lines: [
          { text: "Leave the Fortify logout route registered." },
          { text: "Keep the route behind auth." },
          { text: "Do not add a second logout route." },
        ],
      },
      {
        name: "app/Http/Controllers/PostController.php",
        lines: [
          { text: "Leave logout to Fortify." },
          { text: "Return the posts page after a save." },
          { text: "Do not clear the session from this controller." },
        ],
      },
    ],
  },
  {
    id: "migrate",
    task: "Run the new migration when you deploy.",
    guide: "/laravel-migrate-on-deploy-vue",
    guideTitle: "Run migrations in the release, not in a request",
    rule: "Do not call Artisan::call('migrate') from a controller the Vue page can hit. Two deploys, or two curious browsers, should not race that.",
    files: [
      {
        name: "scripts/deploy.sh",
        lines: [
          { text: "Run php artisan migrate --force in the release." },
          { text: "Read the migration before you ship it." },
          { text: "Run npm run build in the same release." },
        ],
      },
      {
        name: "app/Http/Controllers/PostController.php",
        lines: [
          { text: "Return the posts page after a save." },
          {
            text: "Call Artisan::call('migrate') from the controller the Vue page can hit.",
            bad: true,
          },
          { text: "Leave the schema to the release." },
        ],
      },
      {
        name: "database/migrations/2026_10_12_000000_add_excerpt_to_posts.php",
        lines: [
          { text: "Add the excerpt column in this migration." },
          { text: "Keep down() from dropping a column you still read." },
          { text: "Leave the migration uncalled from a route." },
        ],
      },
      {
        name: "routes/web.php",
        lines: [
          { text: "Point the posts routes at PostController." },
          { text: "Do not add a route that migrates." },
          { text: "Keep the routes behind auth." },
        ],
      },
    ],
  },
  {
    id: "telescope",
    task: "Open Telescope from a Vue admin link.",
    guide: "/laravel-telescope-dev-only",
    guideTitle: "Install Telescope for local debugging",
    rule: "Do not return true for every user so a Vue admin link can open Telescope. Leave the viewTelescope gate on local.",
    files: [
      {
        name: "composer.json",
        lines: [
          { text: "composer require laravel/telescope --dev." },
          { text: "Keep Telescope in require-dev." },
          { text: "Do not move it to require." },
        ],
      },
      {
        name: "app/Providers/TelescopeServiceProvider.php",
        lines: [
          { text: "Leave the viewTelescope gate on local." },
          {
            text: "return true from viewTelescope so every user can open it.",
            bad: true,
          },
          { text: "Keep the gate the installer published." },
        ],
      },
      {
        name: "resources/js/Pages/Dashboard.vue",
        lines: [
          { text: "Do not iframe Telescope in this page." },
          { text: "Leave Telescope on the local machine." },
          { text: "Link the admin tools the app actually ships." },
        ],
      },
      {
        name: ".env",
        lines: [
          { text: "Keep APP_ENV=local on your machine." },
          { text: "Leave Telescope off the production env file." },
          { text: "Do not register Telescope because CI missed the provider." },
        ],
      },
    ],
  },
  {
    id: "window",
    task: "Read the browser location during setup.",
    guide: "/inertia-ssr",
    guideTitle: "Keep the Inertia SSR process running",
    rule: "Do not read window in setup.",
    files: [
      {
        name: "resources/js/Pages/Posts/Index.vue",
        lines: [
          { text: "Read the posts from the page props." },
          { text: "Read window.location in setup.", bad: true },
          { text: "Render the list from the prop." },
        ],
      },
      {
        name: "config/inertia.php",
        lines: [
          { text: "Point the SSR URL at the supervised process." },
          { text: "Do not start a second SSR process on another port." },
          { text: "Leave the bundle path the kit already sets." },
        ],
      },
      {
        name: "scripts/deploy.sh",
        lines: [
          { text: "Supervise one SSR process in production." },
          { text: "Restart that process on release." },
          { text: "Skip SSR when the whole app is behind login." },
        ],
      },
      {
        name: "resources/js/app.ts",
        lines: [
          { text: "Keep the Inertia setup the starter kit ships." },
          { text: "Do not read window.location in this setup." },
          { text: "Leave the SSR bundle for the server process." },
        ],
      },
    ],
  },
];
