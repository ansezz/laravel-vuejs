export type StrikeRule = {
  id: string;
  guide: string;
  guideTitle: string;
  reason: string;
  find: (line: string) => number;
};

export type MarkedLine = {
  text: string;
  rule?: StrikeRule;
};

const at = (pattern: RegExp) => (line: string) => {
  const found = line.match(pattern);
  return found?.index ?? -1;
};

/** Same moves the trap page teaches. A line is crossed out only when it tells the editor to do one. */
export const strikes: StrikeRule[] = [
  {
    id: "ziggy",
    guide: "/laravel-ziggy-vue",
    guideTitle: "Ziggy or Wayfinder for Laravel routes in Vue",
    reason:
      "Do not install Ziggy on the Vue starter kit. You would have two ways to build the same URL.",
    find: at(/\bziggy\b/i),
  },
  {
    id: "router",
    guide: "/laravel-wayfinder-vue",
    guideTitle: "Typed Laravel routes in Vue with Wayfinder",
    reason: "Wayfinder is not Vue Router. Inertia still navigates.",
    find: at(/\bvue-router\b|\bcreateRouter\b|\bVueRouter\b/),
  },
  {
    id: "hot",
    guide: "/deploy-laravel-vue",
    guideTitle: "Deploy a Laravel and Vue app",
    reason:
      "If public/hot is on the server, every page loads JavaScript from the laptop. Do not commit it.",
    find: (line) => {
      const hot = line.match(/public\/hot/i);
      if (hot?.index === undefined) return -1;
      if (/\b(delete|remove|without|gitignore)\b/i.test(line)) return -1;
      if (!/\b(commit|deploy|ship|push|add)\b/i.test(line)) return -1;
      return hot.index;
    },
  },
  {
    id: "conflict",
    guide: "/deploy-laravel-vue",
    guideTitle: "Read an Inertia 409 after deploy",
    reason:
      "Do not abort(409) from a controller to mean this record changed. Inertia already uses 409 for the asset version.",
    find: at(/abort\s*\(\s*409\s*\)/),
  },
  {
    id: "cors",
    guide: "/laravel-vue-cors",
    guideTitle: "Turn on CORS credentials for a separate Vue app",
    reason:
      "Do not set allowed_origins to ['*'] in the same file as supports_credentials => true.",
    find: (line) => {
      const origins = line.match(/allowed_origins/i);
      if (origins?.index === undefined) return -1;
      if (!/['"`]\*['"`]/.test(line)) return -1;
      return origins.index;
    },
  },
  {
    id: "csrf",
    guide: "/deploy-laravel-vue",
    guideTitle: "Fix a 419 after you deploy",
    reason:
      "Do not disable VerifyCsrfToken for the whole web group. The token is the check.",
    find: (line) => {
      const token = line.match(/VerifyCsrfToken/);
      if (token?.index === undefined) return -1;
      if (!/\b(disable|except|comment|remove|skip)\b/i.test(line)) return -1;
      return token.index;
    },
  },
  {
    id: "worker",
    guide: "/laravel-vue-queued-job",
    guideTitle: "queue:work in production, listen locally",
    reason:
      "Do not call queue:work from a controller so a Vue button starts the worker. The button dispatches a job.",
    find: (line) => {
      const work = line.match(/queue:work/i);
      if (work?.index === undefined) return -1;
      if (!/\b(controller|button|click|request)\b/i.test(line)) return -1;
      return work.index;
    },
  },
  {
    id: "breeze",
    guide: "/laravel-breeze-jetstream-vue",
    guideTitle: "Breeze, Jetstream, and the Vue starter kit",
    reason:
      "Do not install Breeze or Jetstream on the Vue starter kit. You would get two login stacks.",
    find: at(/\b(breeze|jetstream)\b/i),
  },
  {
    id: "cloud",
    guide: "/deploy-laravel-vue",
    guideTitle: "Deploy a Laravel and Vue app",
    reason:
      "Do not add storage:link to a Cloud deploy. The disk resets on every deploy, so the symlink does not survive.",
    find: (line) => {
      const link = line.match(/storage:link/i);
      if (link?.index === undefined) return -1;
      if (!/\bcloud\b/i.test(line)) return -1;
      return link.index;
    },
  },
  {
    id: "cursor",
    guide: "/laravel-vue-pagination",
    guideTitle: "Laravel and Vue pagination",
    reason:
      "Two rows with the same published_at do not give the cursor a stable bound, so order by id.",
    find: (line) => {
      const page = line.match(/cursorPaginate/i);
      if (page?.index === undefined) return -1;
      if (!/published_at/i.test(line)) return -1;
      return page.index;
    },
  },
  {
    id: "toast",
    guide: "/laravel-vue-flash",
    guideTitle: "Show a saved message in Vue",
    reason:
      "Do not register a second router.on('flash'). The Vue starter kit already listens.",
    find: (line) => {
      const hits = [
        line.match(/router\.on\(\s*['"]flash['"]\s*\)/)?.index,
        line.match(
          /\b(vue-sonner|vue-toastification|notivue|mosha-vue-toastify)\b/i,
        )?.index,
      ].filter((index): index is number => index !== undefined);
      return hits.length ? Math.min(...hits) : -1;
    },
  },
  {
    id: "echo",
    guide: "/laravel-reverb-vue",
    guideTitle: "Queue a broadcast instead of blocking the save",
    reason: "Do not listen with useEcho on a public channel.",
    find: (line) => {
      const hook = line.match(/\buseEcho\b/);
      if (hook?.index === undefined) return -1;
      if (!/\bpublic\b/i.test(line)) return -1;
      return hook.index;
    },
  },
  {
    id: "simple",
    guide: "/laravel-vue-pagination",
    guideTitle: "Render simplePaginate without a last page",
    reason:
      "simplePaginate omits last_page. Do not compute page 2 of undefined.",
    find: (line) => {
      const page = line.match(/simplePaginate/i);
      if (page?.index === undefined) return -1;
      if (!/last_page/i.test(line)) return -1;
      return page.index;
    },
  },
  {
    id: "proxy",
    guide: "/laravel-trust-proxies-https",
    guideTitle: "Trust proxies so HTTPS sticks",
    reason: "Do not call trustProxies(at: '*') on a machine exposed directly.",
    find: (line) => {
      const trust = line.match(/trustProxies\s*\(/i);
      if (trust?.index === undefined) return -1;
      if (!/\b(exposed|directly)\b/i.test(line) && !/public port/i.test(line))
        return -1;
      return trust.index;
    },
  },
  {
    id: "pinia",
    guide: "/pinia-laravel-inertia",
    guideTitle: "When to use Pinia with Laravel and Inertia",
    reason:
      "Do not router.reload into a Pinia store so every component can read it. Pass the prop.",
    find: (line) => {
      const reload = line.match(/router\.reload\b/);
      if (reload?.index === undefined) return -1;
      if (!/\bpinia\b/i.test(line)) return -1;
      return reload.index;
    },
  },
  {
    id: "boost",
    guide: "/laravel-boost-vue",
    guideTitle: "Install Laravel Boost on a Vue starter kit",
    reason:
      "Do not install Boost inside the Vue app with npm. There is no Boost component to mount.",
    find: (line) => {
      const npm = line.match(/\bnpm\b/i);
      if (npm?.index === undefined || !/laravel\/boost\b/i.test(line))
        return -1;
      return npm.index;
    },
  },
  {
    id: "upload",
    guide: "/laravel-vue-file-upload",
    guideTitle: "Upload files from Vue to Laravel with Inertia",
    reason:
      "PHP does not fill a file on a real PUT, PATCH, or DELETE. Post the form and send _method of put.",
    find: (line) => {
      const method = line.match(
        /\bmethod\s+put\b|\bmethod:\s*['"]put['"]|\.put\s*\(/i,
      );
      if (method?.index === undefined) return -1;
      if (!/\b(file|cover|upload|multipart)\b/i.test(line)) return -1;
      return method.index;
    },
  },
  {
    id: "force",
    guide: "/laravel-soft-deletes-index-vue",
    guideTitle: "Keep soft-deleted rows off a Vue index",
    reason:
      "Do not call forceDelete() from the button you labeled Delete. That removes the row. Soft delete is the one you can restore.",
    find: (line) => {
      const call = line.match(/forceDelete\s*\(/);
      if (call?.index === undefined) return -1;
      if (!/\bbutton\b/i.test(line)) return -1;
      return call.index;
    },
  },
  {
    id: "logout",
    guide: "/inertia-form-component-vue",
    guideTitle: "preserveState keeps the Vue page you have",
    reason:
      "Do not set preserveState: true on a logout request. The old page's props, including the user, stay on screen until something else navigates.",
    find: (line) => {
      const flag = line.match(/preserveState/i);
      if (flag?.index === undefined) return -1;
      if (!/\blogout\b/i.test(line)) return -1;
      return flag.index;
    },
  },
  {
    id: "migrate",
    guide: "/laravel-migrate-on-deploy-vue",
    guideTitle: "Run migrations in the release, not in a request",
    reason:
      "Do not call Artisan::call('migrate') from a controller the Vue page can hit. Two deploys, or two curious browsers, should not race that.",
    find: (line) => {
      const call = line.match(/Artisan::call\(\s*['"]migrate['"]\s*\)/);
      if (call?.index === undefined) return -1;
      if (!/\b(controller|job)\b/i.test(line)) return -1;
      return call.index;
    },
  },
  {
    id: "telescope",
    guide: "/application-setup",
    guideTitle: "Install Telescope for local debugging",
    reason:
      "Do not return true for every user so a Vue admin link can open Telescope. Leave the viewTelescope gate on local.",
    find: (line) => {
      const gate = line.match(/viewTelescope/);
      if (gate?.index === undefined) return -1;
      if (!/return\s+true/i.test(line)) return -1;
      return gate.index;
    },
  },
  {
    id: "window",
    guide: "/inertia-ssr",
    guideTitle: "Keep the Inertia SSR process running",
    reason: "Do not read window in setup.",
    find: (line) => {
      const browser = line.match(/window\s*\.\s*\w+/);
      if (browser?.index === undefined) return -1;
      if (!/\bsetup\b/i.test(line)) return -1;
      return browser.index;
    },
  },
];

const negation = /\b(do not|don't|dont|never|avoid)\b/gi;

function negatedBefore(line: string, index: number) {
  negation.lastIndex = 0;
  let found: RegExpExecArray | null;
  while ((found = negation.exec(line))) {
    if (found.index < index) return true;
  }
  return false;
}

export function markLines(source: string): MarkedLine[] {
  const marks: MarkedLine[] = [];
  for (const raw of source.split(/\r?\n/)) {
    const text = raw.trim();
    if (!text) continue;
    const line = text.replaceAll("\u2019", "'");
    let rule: StrikeRule | undefined;
    for (const candidate of strikes) {
      const index = candidate.find(line);
      if (index < 0 || negatedBefore(line, index)) continue;
      rule = candidate;
      break;
    }
    marks.push(rule ? { text, rule } : { text });
  }
  return marks;
}

export function keptText(marks: MarkedLine[]) {
  return marks
    .filter((mark) => !mark.rule)
    .map((mark) => mark.text)
    .join("\n");
}
