// Public package snapshot researched on 2026-10-10.
// Laravel downloads are Packagist totals from packagist.org/packages/<name>.json (downloads.total).
// Vue downloads are npm's last-month window, 2026-09-09 through 2026-10-08, one window for every Vue package.
// Descriptions that npm left blank (vue-router, @vue/test-utils) or filled with a badge image (vue-tsc, vue-demi)
// use the public GitHub or README sentence from that same research pass.
// Packagist totals and npm counts are different units and are never sorted together.

export type Ecosystem = "laravel" | "vue";

export const ROLES = [
  "auth",
  "queues",
  "files",
  "testing",
  "ui",
  "state",
  "router",
  "tooling",
] as const;

export type PackageRole = (typeof ROLES)[number];

export const ROLE_LABEL: Record<PackageRole, string> = {
  auth: "Auth",
  queues: "Queues",
  files: "Files",
  testing: "Testing",
  ui: "UI",
  state: "State",
  router: "Router",
  tooling: "Tooling",
};

export type PackageRecord = {
  ecosystem: Ecosystem;
  name: string;
  slug: string;
  description: string;
  downloads: number;
  registryUrl: string;
  repositoryUrl: string | null;
  install: string;
};

export type RankedPackage = PackageRecord & {
  role: PackageRole | null;
  rank: number;
  total: number;
  bar: number;
};

export const SNAPSHOT = {
  asOf: "2026-10-10",
  laravelMetric: "Packagist total downloads",
  vueMetric: "npm downloads, last 30 days",
} as const;

export const PACKAGES: PackageRecord[] = [
  {
    ecosystem: "laravel",
    name: "laravel/framework",
    slug: "laravel-framework",
    description: "The Laravel Framework.",
    downloads: 593063708,
    registryUrl: "https://packagist.org/packages/laravel/framework",
    repositoryUrl: "https://github.com/laravel/framework",
    install: "composer require laravel/framework",
  },
  {
    ecosystem: "laravel",
    name: "laravel/tinker",
    slug: "laravel-tinker",
    description: "Powerful REPL for the Laravel framework.",
    downloads: 502216521,
    registryUrl: "https://packagist.org/packages/laravel/tinker",
    repositoryUrl: "https://github.com/laravel/tinker",
    install: "composer require laravel/tinker",
  },
  {
    ecosystem: "laravel",
    name: "laravel/sail",
    slug: "laravel-sail",
    description: "Docker files for running a basic Laravel application.",
    downloads: 232953286,
    registryUrl: "https://packagist.org/packages/laravel/sail",
    repositoryUrl: "https://github.com/laravel/sail",
    install: "composer require laravel/sail",
  },
  {
    ecosystem: "laravel",
    name: "intervention/image",
    slug: "intervention-image",
    description: "PHP Image Processing",
    downloads: 230026890,
    registryUrl: "https://packagist.org/packages/intervention/image",
    repositoryUrl: "https://github.com/Intervention/image",
    install: "composer require intervention/image",
  },
  {
    ecosystem: "laravel",
    name: "laravel/sanctum",
    slug: "laravel-sanctum",
    description:
      "Laravel Sanctum provides a featherweight authentication system for SPAs and simple APIs.",
    downloads: 223649691,
    registryUrl: "https://packagist.org/packages/laravel/sanctum",
    repositoryUrl: "https://github.com/laravel/sanctum",
    install: "composer require laravel/sanctum",
  },
  {
    ecosystem: "laravel",
    name: "spatie/laravel-ignition",
    slug: "spatie-laravel-ignition",
    description: "A beautiful error page for Laravel applications.",
    downloads: 177010144,
    registryUrl: "https://packagist.org/packages/spatie/laravel-ignition",
    repositoryUrl: "https://github.com/spatie/laravel-ignition",
    install: "composer require spatie/laravel-ignition",
  },
  {
    ecosystem: "laravel",
    name: "maatwebsite/excel",
    slug: "maatwebsite-excel",
    description: "Supercharged Excel exports and imports in Laravel",
    downloads: 175268023,
    registryUrl: "https://packagist.org/packages/maatwebsite/excel",
    repositoryUrl: "https://github.com/SpartnerNL/Laravel-Excel",
    install: "composer require maatwebsite/excel",
  },
  {
    ecosystem: "laravel",
    name: "laravel/ui",
    slug: "laravel-ui",
    description: "Laravel UI utilities and presets.",
    downloads: 156102811,
    registryUrl: "https://packagist.org/packages/laravel/ui",
    repositoryUrl: "https://github.com/laravel/ui",
    install: "composer require laravel/ui",
  },
  {
    ecosystem: "laravel",
    name: "sentry/sentry-laravel",
    slug: "sentry-sentry-laravel",
    description: "Laravel SDK for Sentry (https://sentry.io)",
    downloads: 146973181,
    registryUrl: "https://packagist.org/packages/sentry/sentry-laravel",
    repositoryUrl: "https://github.com/getsentry/sentry-laravel",
    install: "composer require sentry/sentry-laravel",
  },
  {
    ecosystem: "laravel",
    name: "barryvdh/laravel-ide-helper",
    slug: "barryvdh-laravel-ide-helper",
    description:
      "Laravel IDE Helper, generates correct PHPDocs for all Facade classes, to improve auto-completion.",
    downloads: 146161472,
    registryUrl: "https://packagist.org/packages/barryvdh/laravel-ide-helper",
    repositoryUrl: "https://github.com/barryvdh/laravel-ide-helper",
    install: "composer require barryvdh/laravel-ide-helper",
  },
  {
    ecosystem: "laravel",
    name: "barryvdh/laravel-debugbar",
    slug: "barryvdh-laravel-debugbar",
    description: "PHP Debugbar integration for Laravel",
    downloads: 144663117,
    registryUrl: "https://packagist.org/packages/barryvdh/laravel-debugbar",
    repositoryUrl: "https://github.com/fruitcake/laravel-debugbar",
    install: "composer require barryvdh/laravel-debugbar",
  },
  {
    ecosystem: "laravel",
    name: "laravel/socialite",
    slug: "laravel-socialite",
    description: "Laravel wrapper around OAuth 1 & OAuth 2 libraries.",
    downloads: 127218524,
    registryUrl: "https://packagist.org/packages/laravel/socialite",
    repositoryUrl: "https://github.com/laravel/socialite",
    install: "composer require laravel/socialite",
  },
  {
    ecosystem: "laravel",
    name: "spatie/laravel-permission",
    slug: "spatie-laravel-permission",
    description: "Permission handling for Laravel 12 and up",
    downloads: 122951147,
    registryUrl: "https://packagist.org/packages/spatie/laravel-permission",
    repositoryUrl: "https://github.com/spatie/laravel-permission",
    install: "composer require spatie/laravel-permission",
  },
  {
    ecosystem: "laravel",
    name: "barryvdh/laravel-dompdf",
    slug: "barryvdh-laravel-dompdf",
    description: "A DOMPDF Wrapper for Laravel",
    downloads: 118773304,
    registryUrl: "https://packagist.org/packages/barryvdh/laravel-dompdf",
    repositoryUrl: "https://github.com/barryvdh/laravel-dompdf",
    install: "composer require barryvdh/laravel-dompdf",
  },
  {
    ecosystem: "laravel",
    name: "laravel/horizon",
    slug: "laravel-horizon",
    description: "Dashboard and code-driven configuration for Laravel queues.",
    downloads: 113450276,
    registryUrl: "https://packagist.org/packages/laravel/horizon",
    repositoryUrl: "https://github.com/laravel/horizon",
    install: "composer require laravel/horizon",
  },
  {
    ecosystem: "laravel",
    name: "facade/ignition",
    slug: "facade-ignition",
    description: "A beautiful error page for Laravel applications.",
    downloads: 105139315,
    registryUrl: "https://packagist.org/packages/facade/ignition",
    repositoryUrl: "https://github.com/facade/ignition",
    install: "composer require facade/ignition",
  },
  {
    ecosystem: "laravel",
    name: "laravel/passport",
    slug: "laravel-passport",
    description: "Laravel Passport provides OAuth2 server support to Laravel.",
    downloads: 103219641,
    registryUrl: "https://packagist.org/packages/laravel/passport",
    repositoryUrl: "https://github.com/laravel/passport",
    install: "composer require laravel/passport",
  },
  {
    ecosystem: "laravel",
    name: "laravel/pail",
    slug: "laravel-pail",
    description:
      "Easily delve into your Laravel application's log files directly from the command line.",
    downloads: 88227441,
    registryUrl: "https://packagist.org/packages/laravel/pail",
    repositoryUrl: "https://github.com/laravel/pail",
    install: "composer require laravel/pail",
  },
  {
    ecosystem: "laravel",
    name: "laravel/telescope",
    slug: "laravel-telescope",
    description: "An elegant debug assistant for the Laravel framework.",
    downloads: 87094975,
    registryUrl: "https://packagist.org/packages/laravel/telescope",
    repositoryUrl: "https://github.com/laravel/telescope",
    install: "composer require laravel/telescope",
  },
  {
    ecosystem: "laravel",
    name: "laravel/slack-notification-channel",
    slug: "laravel-slack-notification-channel",
    description: "Slack Notification Channel for laravel.",
    downloads: 83118024,
    registryUrl:
      "https://packagist.org/packages/laravel/slack-notification-channel",
    repositoryUrl: "https://github.com/laravel/slack-notification-channel",
    install: "composer require laravel/slack-notification-channel",
  },
  {
    ecosystem: "laravel",
    name: "inertiajs/inertia-laravel",
    slug: "inertiajs-inertia-laravel",
    description: "The Laravel adapter for Inertia.js.",
    downloads: 82315716,
    registryUrl: "https://packagist.org/packages/inertiajs/inertia-laravel",
    repositoryUrl: "https://github.com/inertiajs/inertia-laravel",
    install: "composer require inertiajs/inertia-laravel",
  },
  {
    ecosystem: "laravel",
    name: "larastan/larastan",
    slug: "larastan-larastan",
    description:
      "Larastan - Discover bugs in your code without running it. A phpstan/phpstan extension for Laravel",
    downloads: 77836739,
    registryUrl: "https://packagist.org/packages/larastan/larastan",
    repositoryUrl: "https://github.com/larastan/larastan",
    install: "composer require larastan/larastan",
  },
  {
    ecosystem: "laravel",
    name: "jenssegers/agent",
    slug: "jenssegers-agent",
    description:
      "Desktop/mobile user agent parser with support for Laravel, based on Mobiledetect",
    downloads: 77778181,
    registryUrl: "https://packagist.org/packages/jenssegers/agent",
    repositoryUrl: "https://github.com/jenssegers/agent",
    install: "composer require jenssegers/agent",
  },
  {
    ecosystem: "laravel",
    name: "pestphp/pest-plugin-laravel",
    slug: "pestphp-pest-plugin-laravel",
    description: "The Pest Laravel Plugin",
    downloads: 73591177,
    registryUrl: "https://packagist.org/packages/pestphp/pest-plugin-laravel",
    repositoryUrl: "https://github.com/pestphp/pest-plugin-laravel",
    install: "composer require pestphp/pest-plugin-laravel",
  },
  {
    ecosystem: "laravel",
    name: "laravel/helpers",
    slug: "laravel-helpers",
    description:
      "Provides backwards compatibility for helpers in the latest Laravel release.",
    downloads: 68356269,
    registryUrl: "https://packagist.org/packages/laravel/helpers",
    repositoryUrl: "https://github.com/laravel/helpers",
    install: "composer require laravel/helpers",
  },
  {
    ecosystem: "laravel",
    name: "laravel/fortify",
    slug: "laravel-fortify",
    description:
      "Backend controllers and scaffolding for Laravel authentication.",
    downloads: 67217552,
    registryUrl: "https://packagist.org/packages/laravel/fortify",
    repositoryUrl: "https://github.com/laravel/fortify",
    install: "composer require laravel/fortify",
  },
  {
    ecosystem: "laravel",
    name: "laravel/laravel",
    slug: "laravel-laravel",
    description: "The skeleton application for the Laravel framework.",
    downloads: 65462083,
    registryUrl: "https://packagist.org/packages/laravel/laravel",
    repositoryUrl: "https://github.com/laravel/laravel",
    install: "composer require laravel/laravel",
  },
  {
    ecosystem: "laravel",
    name: "spatie/laravel-activitylog",
    slug: "spatie-laravel-activitylog",
    description:
      "A very simple activity logger to monitor the users of your website or application",
    downloads: 65248162,
    registryUrl: "https://packagist.org/packages/spatie/laravel-activitylog",
    repositoryUrl: "https://github.com/spatie/laravel-activitylog",
    install: "composer require spatie/laravel-activitylog",
  },
  {
    ecosystem: "laravel",
    name: "laravel/scout",
    slug: "laravel-scout",
    description:
      "Laravel Scout provides a driver based solution to searching your Eloquent models.",
    downloads: 63480297,
    registryUrl: "https://packagist.org/packages/laravel/scout",
    repositoryUrl: "https://github.com/laravel/scout",
    install: "composer require laravel/scout",
  },
  {
    ecosystem: "laravel",
    name: "tightenco/ziggy",
    slug: "tightenco-ziggy",
    description: "Use your Laravel named routes in JavaScript.",
    downloads: 57775318,
    registryUrl: "https://packagist.org/packages/tightenco/ziggy",
    repositoryUrl: "https://github.com/tighten/ziggy",
    install: "composer require tightenco/ziggy",
  },
  {
    ecosystem: "vue",
    name: "vue",
    slug: "vue",
    description:
      "The progressive JavaScript framework for building modern web UI.",
    downloads: 75696902,
    registryUrl: "https://www.npmjs.com/package/vue",
    repositoryUrl: "https://github.com/vuejs/core",
    install: "npm install vue",
  },
  {
    ecosystem: "vue",
    name: "@vueuse/core",
    slug: "vueuse-core",
    description: "Collection of essential Vue Composition Utilities",
    downloads: 54606645,
    registryUrl: "https://www.npmjs.com/package/@vueuse/core",
    repositoryUrl: "https://github.com/vueuse/vueuse",
    install: "npm install @vueuse/core",
  },
  {
    ecosystem: "vue",
    name: "@vitejs/plugin-vue",
    slug: "vitejs-plugin-vue",
    description: "The official plugin for Vue SFC support in Vite.",
    downloads: 43783139,
    registryUrl: "https://www.npmjs.com/package/@vitejs/plugin-vue",
    repositoryUrl: "https://github.com/vitejs/vite-plugin-vue",
    install: "npm install @vitejs/plugin-vue",
  },
  {
    ecosystem: "vue",
    name: "vue-demi",
    slug: "vue-demi",
    description:
      "A developing utility that lets you write universal Vue libraries for Vue 2 and Vue 3.",
    downloads: 41693278,
    registryUrl: "https://www.npmjs.com/package/vue-demi",
    repositoryUrl: "https://github.com/vueuse/vue-demi",
    install: "npm install vue-demi",
  },
  {
    ecosystem: "vue",
    name: "vue-router",
    slug: "vue-router",
    description: "The official router for Vue.js.",
    downloads: 39617825,
    registryUrl: "https://www.npmjs.com/package/vue-router",
    repositoryUrl: "https://github.com/vuejs/router",
    install: "npm install vue-router",
  },
  {
    ecosystem: "vue",
    name: "eslint-plugin-vue",
    slug: "eslint-plugin-vue",
    description: "Official ESLint plugin for Vue.js",
    downloads: 30711906,
    registryUrl: "https://www.npmjs.com/package/eslint-plugin-vue",
    repositoryUrl: "https://github.com/vuejs/eslint-plugin-vue",
    install: "npm install eslint-plugin-vue",
  },
  {
    ecosystem: "vue",
    name: "highlightjs-vue",
    slug: "highlightjs-vue",
    description: "Highlight Single-File Components of Vue.js Framework",
    downloads: 28544070,
    registryUrl: "https://www.npmjs.com/package/highlightjs-vue",
    repositoryUrl: "https://github.com/highlightjs/highlightjs-vue",
    install: "npm install highlightjs-vue",
  },
  {
    ecosystem: "vue",
    name: "vue-tsc",
    slug: "vue-tsc",
    description:
      "A command-line type checking tool for Vue, based on a tsc wrapper, enabling the TypeScript compiler to understand .vue files.",
    downloads: 28304118,
    registryUrl: "https://www.npmjs.com/package/vue-tsc",
    repositoryUrl: "https://github.com/vuejs/language-tools",
    install: "npm install vue-tsc",
  },
  {
    ecosystem: "vue",
    name: "pinia",
    slug: "pinia",
    description: "Intuitive, type safe and flexible Store for Vue",
    downloads: 23338204,
    registryUrl: "https://www.npmjs.com/package/pinia",
    repositoryUrl: "https://github.com/vuejs/pinia",
    install: "npm install pinia",
  },
  {
    ecosystem: "vue",
    name: "@vue/test-utils",
    slug: "vue-test-utils",
    description: "Vue Test Utils for Vue 3.",
    downloads: 22701549,
    registryUrl: "https://www.npmjs.com/package/@vue/test-utils",
    repositoryUrl: "https://github.com/vuejs/test-utils",
    install: "npm install @vue/test-utils",
  },
  {
    ecosystem: "vue",
    name: "@floating-ui/vue",
    slug: "floating-ui-vue",
    description: "Floating UI for Vue",
    downloads: 19233985,
    registryUrl: "https://www.npmjs.com/package/@floating-ui/vue",
    repositoryUrl: "https://github.com/floating-ui/floating-ui",
    install: "npm install @floating-ui/vue",
  },
  {
    ecosystem: "vue",
    name: "@unhead/vue",
    slug: "unhead-vue",
    description: "Full-stack <head> manager built for Vue.",
    downloads: 18580949,
    registryUrl: "https://www.npmjs.com/package/@unhead/vue",
    repositoryUrl: "https://github.com/unjs/unhead",
    install: "npm install @unhead/vue",
  },
  {
    ecosystem: "vue",
    name: "@tanstack/vue-virtual",
    slug: "tanstack-vue-virtual",
    description: "Headless UI for virtualizing scrollable elements in Vue",
    downloads: 17697503,
    registryUrl: "https://www.npmjs.com/package/@tanstack/vue-virtual",
    repositoryUrl: "https://github.com/TanStack/virtual",
    install: "npm install @tanstack/vue-virtual",
  },
  {
    ecosystem: "vue",
    name: "vue-i18n",
    slug: "vue-i18n",
    description: "Internationalization plugin for Vue.js",
    downloads: 17261450,
    registryUrl: "https://www.npmjs.com/package/vue-i18n",
    repositoryUrl: "https://github.com/intlify/vue-i18n",
    install: "npm install vue-i18n",
  },
  {
    ecosystem: "vue",
    name: "@vueuse/integrations",
    slug: "vueuse-integrations",
    description: "Integration wrappers for utility libraries",
    downloads: 16930379,
    registryUrl: "https://www.npmjs.com/package/@vueuse/integrations",
    repositoryUrl: "https://github.com/vueuse/vueuse",
    install: "npm install @vueuse/integrations",
  },
  {
    ecosystem: "vue",
    name: "@vitejs/plugin-vue-jsx",
    slug: "vitejs-plugin-vue-jsx",
    description: "Provides Vue 3 JSX & TSX support with HMR.",
    downloads: 12576626,
    registryUrl: "https://www.npmjs.com/package/@vitejs/plugin-vue-jsx",
    repositoryUrl: "https://github.com/vitejs/vite-plugin-vue",
    install: "npm install @vitejs/plugin-vue-jsx",
  },
  {
    ecosystem: "vue",
    name: "vue-loader",
    slug: "vue-loader",
    description: "Webpack loader for Vue Single-File Components.",
    downloads: 10143658,
    registryUrl: "https://www.npmjs.com/package/vue-loader",
    repositoryUrl: "https://github.com/vuejs/vue-loader",
    install: "npm install vue-loader",
  },
  {
    ecosystem: "vue",
    name: "nuxt",
    slug: "nuxt",
    description:
      "Nuxt is a free and open-source framework with an intuitive and extendable way to create type-safe, performant and production-grade full-stack web applications and websites with Vue.js.",
    downloads: 9948549,
    registryUrl: "https://www.npmjs.com/package/nuxt",
    repositoryUrl: "https://github.com/nuxt/nuxt",
    install: "npm install nuxt",
  },
  {
    ecosystem: "vue",
    name: "reka-ui",
    slug: "reka-ui",
    description: "Vue port for Radix UI Primitives.",
    downloads: 9122102,
    registryUrl: "https://www.npmjs.com/package/reka-ui",
    repositoryUrl: "https://github.com/unovue/reka-ui",
    install: "npm install reka-ui",
  },
  {
    ecosystem: "vue",
    name: "@headlessui/vue",
    slug: "headlessui-vue",
    description:
      "A set of completely unstyled, fully accessible UI components for Vue 3, designed to integrate beautifully with Tailwind CSS.",
    downloads: 8921963,
    registryUrl: "https://www.npmjs.com/package/@headlessui/vue",
    repositoryUrl: "https://github.com/tailwindlabs/headlessui",
    install: "npm install @headlessui/vue",
  },
  {
    ecosystem: "vue",
    name: "vite-plugin-vue-tracer",
    slug: "vite-plugin-vue-tracer",
    description: "Tracer for the source code of elements and vdoms in Vue SFC",
    downloads: 8575674,
    registryUrl: "https://www.npmjs.com/package/vite-plugin-vue-tracer",
    repositoryUrl: "https://github.com/antfu/vite-plugin-vue-tracer",
    install: "npm install vite-plugin-vue-tracer",
  },
  {
    ecosystem: "vue",
    name: "@vue/eslint-config-typescript",
    slug: "vue-eslint-config-typescript",
    description: "ESLint config for TypeScript + Vue.js projects",
    downloads: 8131955,
    registryUrl: "https://www.npmjs.com/package/@vue/eslint-config-typescript",
    repositoryUrl: "https://github.com/vuejs/eslint-config-typescript",
    install: "npm install @vue/eslint-config-typescript",
  },
  {
    ecosystem: "vue",
    name: "@vue/tsconfig",
    slug: "vue-tsconfig",
    description: "A base TSConfig for working with Vue.js",
    downloads: 7705140,
    registryUrl: "https://www.npmjs.com/package/@vue/tsconfig",
    repositoryUrl: "https://github.com/vuejs/tsconfig",
    install: "npm install @vue/tsconfig",
  },
  {
    ecosystem: "vue",
    name: "unplugin-vue-components",
    slug: "unplugin-vue-components",
    description: "Components auto importing for Vue",
    downloads: 7502784,
    registryUrl: "https://www.npmjs.com/package/unplugin-vue-components",
    repositoryUrl: "https://github.com/unplugin/unplugin-vue-components",
    install: "npm install unplugin-vue-components",
  },
  {
    ecosystem: "vue",
    name: "vuex",
    slug: "vuex",
    description: "state management for Vue.js",
    downloads: 7400114,
    registryUrl: "https://www.npmjs.com/package/vuex",
    repositoryUrl: "https://github.com/vuejs/vuex",
    install: "npm install vuex",
  },
  {
    ecosystem: "vue",
    name: "radix-vue",
    slug: "radix-vue",
    description: "Vue port for Radix UI Primitives.",
    downloads: 7217263,
    registryUrl: "https://www.npmjs.com/package/radix-vue",
    repositoryUrl: "https://github.com/unovue/radix-vue",
    install: "npm install radix-vue",
  },
  {
    ecosystem: "vue",
    name: "vuedraggable",
    slug: "vuedraggable",
    description: "draggable component for vue",
    downloads: 6645182,
    registryUrl: "https://www.npmjs.com/package/vuedraggable",
    repositoryUrl: "https://github.com/SortableJS/Vue.Draggable",
    install: "npm install vuedraggable",
  },
  {
    ecosystem: "vue",
    name: "vite-plugin-vue-inspector",
    slug: "vite-plugin-vue-inspector",
    description:
      "Jump to local IDE source code when clicking Vue elements in the browser.",
    downloads: 6269572,
    registryUrl: "https://www.npmjs.com/package/vite-plugin-vue-inspector",
    repositoryUrl: "https://github.com/webfansplz/vite-plugin-vue-inspector",
    install: "npm install vite-plugin-vue-inspector",
  },
  {
    ecosystem: "vue",
    name: "vite-plugin-vue-devtools",
    slug: "vite-plugin-vue-devtools",
    description: "A vite plugin for Vue DevTools",
    downloads: 5720593,
    registryUrl: "https://www.npmjs.com/package/vite-plugin-vue-devtools",
    repositoryUrl: "https://github.com/vuejs/devtools",
    install: "npm install vite-plugin-vue-devtools",
  },
  {
    ecosystem: "vue",
    name: "vue-docgen-api",
    slug: "vue-docgen-api",
    description:
      "Toolbox to extract information from Vue component files for documentation generation purposes.",
    downloads: 5540075,
    registryUrl: "https://www.npmjs.com/package/vue-docgen-api",
    repositoryUrl: "https://github.com/vue-styleguidist/vue-styleguidist",
    install: "npm install vue-docgen-api",
  },
];

// null means the package is the framework or the app skeleton, so job filters do not promote it.
export const PACKAGE_ROLES: Record<string, PackageRole | null> = {
  "laravel/framework": null,
  "laravel/tinker": "tooling",
  "laravel/sail": "tooling",
  "intervention/image": "files",
  "laravel/sanctum": "auth",
  "spatie/laravel-ignition": "tooling",
  "maatwebsite/excel": "files",
  "laravel/ui": "ui",
  "sentry/sentry-laravel": "tooling",
  "barryvdh/laravel-ide-helper": "tooling",
  "barryvdh/laravel-debugbar": "tooling",
  "laravel/socialite": "auth",
  "spatie/laravel-permission": "auth",
  "barryvdh/laravel-dompdf": "files",
  "laravel/horizon": "queues",
  "facade/ignition": "tooling",
  "laravel/passport": "auth",
  "laravel/pail": "tooling",
  "laravel/telescope": "tooling",
  "laravel/slack-notification-channel": "tooling",
  "inertiajs/inertia-laravel": "ui",
  "larastan/larastan": "tooling",
  "jenssegers/agent": "tooling",
  "pestphp/pest-plugin-laravel": "testing",
  "laravel/helpers": "tooling",
  "laravel/fortify": "auth",
  "laravel/laravel": null,
  "spatie/laravel-activitylog": "tooling",
  "laravel/scout": "tooling",
  "tightenco/ziggy": "router",
  vue: null,
  "@vueuse/core": "tooling",
  "@vitejs/plugin-vue": "tooling",
  "vue-demi": "tooling",
  "vue-router": "router",
  "eslint-plugin-vue": "tooling",
  "highlightjs-vue": "tooling",
  "vue-tsc": "tooling",
  pinia: "state",
  "@vue/test-utils": "testing",
  "@floating-ui/vue": "ui",
  "@unhead/vue": "tooling",
  "@tanstack/vue-virtual": "ui",
  "vue-i18n": "tooling",
  "@vueuse/integrations": "tooling",
  "@vitejs/plugin-vue-jsx": "tooling",
  "vue-loader": "tooling",
  nuxt: null,
  "reka-ui": "ui",
  "@headlessui/vue": "ui",
  "vite-plugin-vue-tracer": "tooling",
  "@vue/eslint-config-typescript": "tooling",
  "@vue/tsconfig": "tooling",
  "unplugin-vue-components": "tooling",
  vuex: "state",
  "radix-vue": "ui",
  vuedraggable: "ui",
  "vite-plugin-vue-inspector": "tooling",
  "vite-plugin-vue-devtools": "tooling",
  "vue-docgen-api": "tooling",
};

export type InstallSet = {
  id: string;
  ecosystem: Ecosystem;
  title: string;
  names: readonly string[];
};

// Packages people install together. Membership is by name, not by download rank.
export const INSTALL_SETS: readonly InstallSet[] = [
  {
    id: "api",
    ecosystem: "laravel",
    title: "API auth",
    names: ["laravel/sanctum", "spatie/laravel-permission"],
  },
  {
    id: "app-auth",
    ecosystem: "laravel",
    title: "App login",
    names: ["laravel/fortify", "laravel/socialite"],
  },
  {
    id: "inertia",
    ecosystem: "laravel",
    title: "Inertia",
    names: ["inertiajs/inertia-laravel", "tightenco/ziggy"],
  },
  {
    id: "ops",
    ecosystem: "laravel",
    title: "Queues and insight",
    names: ["laravel/horizon", "laravel/telescope"],
  },
  {
    id: "local-dev",
    ecosystem: "laravel",
    title: "Local debugging",
    names: ["barryvdh/laravel-debugbar", "barryvdh/laravel-ide-helper"],
  },
  {
    id: "exports",
    ecosystem: "laravel",
    title: "Exports",
    names: ["maatwebsite/excel", "barryvdh/laravel-dompdf"],
  },
  {
    id: "quality",
    ecosystem: "laravel",
    title: "Tests and types",
    names: ["pestphp/pest-plugin-laravel", "larastan/larastan"],
  },
  {
    id: "spa",
    ecosystem: "vue",
    title: "Vue app",
    names: ["vue", "vue-router", "pinia"],
  },
  {
    id: "vite",
    ecosystem: "vue",
    title: "Vite and types",
    names: ["@vitejs/plugin-vue", "vue-tsc"],
  },
  {
    id: "headless",
    ecosystem: "vue",
    title: "Headless UI",
    names: ["@headlessui/vue", "@floating-ui/vue"],
  },
  {
    id: "components",
    ecosystem: "vue",
    title: "Single-file components",
    names: ["@vitejs/plugin-vue", "unplugin-vue-components"],
  },
];

export function roleOf(name: string): PackageRole | null {
  return PACKAGE_ROLES[name] ?? null;
}

export function rankEcosystem(
  packages: readonly PackageRecord[],
): RankedPackage[] {
  const ranked = [...packages].sort(
    (a, b) => b.downloads - a.downloads || a.name.localeCompare(b.name),
  );
  const leader = ranked[0]?.downloads ?? 0;
  return ranked.map((pkg, index) => ({
    ...pkg,
    role: roleOf(pkg.name),
    rank: index + 1,
    total: ranked.length,
    bar: leader > 0 ? pkg.downloads / leader : 0,
  }));
}

export function setCommand(set: InstallSet): string {
  const prefix =
    set.ecosystem === "laravel" ? "composer require" : "npm install";
  return `${prefix} ${set.names.join(" ")}`;
}

export function setsFor(
  pkg: RankedPackage,
  ranked: readonly RankedPackage[],
): { set: InstallSet; command: string; others: RankedPackage[] }[] {
  return INSTALL_SETS.filter(
    (set) => set.ecosystem === pkg.ecosystem && set.names.includes(pkg.name),
  ).map((set) => ({
    set,
    command: setCommand(set),
    others: set.names
      .filter((name) => name !== pkg.name)
      .map((name) => ranked.find((item) => item.name === name))
      .filter((item): item is RankedPackage => item !== undefined),
  }));
}

// Other packages with the same job, already in download order.
export function sameJob(
  pkg: RankedPackage,
  ranked: readonly RankedPackage[],
  count = 3,
): RankedPackage[] {
  if (!pkg.role) return [];
  return ranked
    .filter((item) => item.role === pkg.role && item.slug !== pkg.slug)
    .slice(0, count);
}

export function leagues(
  packages: readonly PackageRecord[] = PACKAGES,
): Record<Ecosystem, RankedPackage[]> {
  return {
    laravel: rankEcosystem(
      packages.filter((pkg) => pkg.ecosystem === "laravel"),
    ),
    vue: rankEcosystem(packages.filter((pkg) => pkg.ecosystem === "vue")),
  };
}

// Neighbors on the same chart: the packages ranked just above and below, then further out.
export function companions(
  pkg: RankedPackage,
  ranked: readonly RankedPackage[],
  count = 3,
): RankedPackage[] {
  const index = ranked.findIndex((item) => item.slug === pkg.slug);
  const picks: RankedPackage[] = [];
  for (let step = 1; picks.length < count && step < ranked.length; step++) {
    for (const next of [index + step, index - step]) {
      if (next >= 0 && next < ranked.length) picks.push(ranked[next]);
      if (picks.length >= count) break;
    }
  }
  return picks;
}

export function formatCount(downloads: number): string {
  return new Intl.NumberFormat("en-US").format(downloads);
}
