// Checks the package catalog the pages render: same module, same ordering function.
// Does not hardcode which package should win. Order is checked from the data itself.
import {
  PACKAGES,
  SNAPSHOT,
  rankEcosystem,
  leagues,
  companions,
  PACKAGE_ROLES,
  ROLES,
  INSTALL_SETS,
  setCommand,
  setsFor,
  sameJob,
  roleOf,
} from "../src/data/packages.ts";
import {
  postMentionsPackage,
  postsForPackage,
} from "../src/lib/package-mentions.ts";

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (!/^\d{4}-\d{2}-\d{2}$/.test(SNAPSHOT.asOf))
  fail(`snapshot date is not a single YYYY-MM-DD: ${SNAPSHOT.asOf}`);
if (!SNAPSHOT.laravelMetric || !SNAPSHOT.vueMetric)
  fail("snapshot is missing a metric label");
if (SNAPSHOT.laravelMetric === SNAPSHOT.vueMetric)
  fail("the two ecosystems must not share one download unit");

const sample = [
  {
    ecosystem: "vue",
    name: "low",
    slug: "low",
    description: "Low.",
    downloads: 2,
    registryUrl: "https://www.npmjs.com/package/low",
    repositoryUrl: null,
    install: "npm install low",
  },
  {
    ecosystem: "vue",
    name: "b",
    slug: "b",
    description: "B.",
    downloads: 5,
    registryUrl: "https://www.npmjs.com/package/b",
    repositoryUrl: null,
    install: "npm install b",
  },
  {
    ecosystem: "vue",
    name: "a",
    slug: "a",
    description: "A.",
    downloads: 5,
    registryUrl: "https://www.npmjs.com/package/a",
    repositoryUrl: null,
    install: "npm install a",
  },
];
const synthetic = rankEcosystem(sample);
if (synthetic.map((pkg) => pkg.name).join(",") !== "a,b,low")
  fail(`tie-break order was ${synthetic.map((pkg) => pkg.name).join(",")}`);
if (synthetic[0].bar !== 1) fail("leader bar must be 1");
if (synthetic[2].bar !== 2 / 5) fail(`lower bar was ${synthetic[2].bar}`);

const ranked = leagues();
const hosts = { laravel: "packagist.org", vue: "www.npmjs.com" };
const installPrefix = { laravel: "composer require ", vue: "npm install " };
const slugs = new Set();

for (const ecosystem of ["laravel", "vue"]) {
  const rows = PACKAGES.filter((pkg) => pkg.ecosystem === ecosystem);
  if (rows.length < 24)
    fail(`${ecosystem} has ${rows.length} packages, need at least 24`);
  const chart = ranked[ecosystem];
  if (chart.length !== rows.length)
    fail(`${ecosystem} chart length ${chart.length} != catalog ${rows.length}`);
  if (chart[0].bar !== 1) fail(`${ecosystem} leader bar is ${chart[0].bar}`);
  for (let i = 0; i < chart.length; i++) {
    const pkg = chart[i];
    if (pkg.rank !== i + 1) fail(`${pkg.name} rank ${pkg.rank} != ${i + 1}`);
    if (!pkg.name || !pkg.description || !pkg.slug || !pkg.install)
      fail(`${ecosystem} entry ${i} is missing a required field`);
    if (!Number.isInteger(pkg.downloads) || pkg.downloads <= 0)
      fail(`${pkg.name} downloads are not a positive integer`);
    if (
      !pkg.install.startsWith(installPrefix[ecosystem]) ||
      !pkg.install.endsWith(pkg.name)
    )
      fail(`${pkg.name} install command is ${pkg.install}`);
    let registry;
    try {
      registry = new URL(pkg.registryUrl);
    } catch {
      fail(`${pkg.name} registry URL is not a URL`);
    }
    if (registry.host !== hosts[ecosystem])
      fail(`${pkg.name} registry host is ${registry.host}`);
    if (pkg.repositoryUrl !== null) {
      let repo;
      try {
        repo = new URL(pkg.repositoryUrl);
      } catch {
        fail(`${pkg.name} repository URL is not a URL`);
      }
      if (repo.protocol !== "https:")
        fail(`${pkg.name} repository is not https`);
    }
    if (slugs.has(pkg.slug)) fail(`duplicate slug ${pkg.slug}`);
    slugs.add(pkg.slug);
    const leader = chart[0].downloads;
    if (pkg.bar !== pkg.downloads / leader)
      fail(`${pkg.name} bar ${pkg.bar} != downloads / leader`);
    if (i > 0) {
      const prev = chart[i - 1];
      const outOfOrder =
        pkg.downloads > prev.downloads ||
        (pkg.downloads === prev.downloads &&
          pkg.name.localeCompare(prev.name) < 0);
      if (outOfOrder)
        fail(
          `${ecosystem} order breaks between ${prev.name} (${prev.downloads}) and ${pkg.name} (${pkg.downloads})`,
        );
    }
    const peers = companions(pkg, chart);
    if (peers.length < 2) fail(`${pkg.name} has ${peers.length} companions`);
    if (
      peers.some(
        (peer) => peer.ecosystem !== ecosystem || peer.slug === pkg.slug,
      )
    )
      fail(`${pkg.name} companions left the league`);
  }
  console.log(
    `${ecosystem} ${chart.length} leader=${chart[0].name} downloads=${chart[0].downloads}`,
  );
  console.log(
    chart.map((pkg) => `${pkg.rank}\t${pkg.downloads}\t${pkg.slug}`).join("\n"),
  );
}

for (const pkg of PACKAGES) {
  if (!Object.prototype.hasOwnProperty.call(PACKAGE_ROLES, pkg.name))
    fail(`${pkg.name} is missing a role`);
  const role = PACKAGE_ROLES[pkg.name];
  if (role !== null && !ROLES.includes(role))
    fail(`${pkg.name} role ${role} is not a job`);
  if (roleOf(pkg.name) !== role) fail(`${pkg.name} roleOf drifted`);
  if (
    ranked[pkg.ecosystem].find((item) => item.name === pkg.name).role !== role
  )
    fail(`${pkg.name} chart role drifted`);
}
if (PACKAGE_ROLES["laravel/framework"] !== null || PACKAGE_ROLES.vue !== null)
  fail("laravel/framework and vue stay untagged");

for (const set of INSTALL_SETS) {
  if (set.names.length < 2) fail(`${set.id} needs two packages`);
  if (new Set(set.names).size !== set.names.length)
    fail(`${set.id} repeats a package`);
  const prefix =
    set.ecosystem === "laravel" ? "composer require" : "npm install";
  if (setCommand(set) !== `${prefix} ${set.names.join(" ")}`)
    fail(`${set.id} command drifted`);
  for (const name of set.names) {
    const pkg = PACKAGES.find((item) => item.name === name);
    if (!pkg || pkg.ecosystem !== set.ecosystem)
      fail(`${set.id} names ${name}, which is not in that league`);
  }
  const sample = ranked[set.ecosystem].find(
    (item) => item.name === set.names[0],
  );
  const rendered = setsFor(sample, ranked[set.ecosystem]).find(
    (item) => item.set.id === set.id,
  );
  if (!rendered || rendered.command !== setCommand(set))
    fail(`${set.id} did not render its command`);
  if (rendered.others.length !== set.names.length - 1)
    fail(`${set.id} dropped a partner`);
  if (rendered.others.some((item) => item.name === sample.name))
    fail(`${set.id} links the current package`);
}

const sanctum = ranked.laravel.find((item) => item.name === "laravel/sanctum");
const authPeers = sameJob(sanctum, ranked.laravel);
if (
  authPeers.length < 1 ||
  authPeers.some((item) => item.role !== "auth" || item.name === sanctum.name)
)
  fail("sanctum same-job list left Auth");
for (let i = 1; i < authPeers.length; i++) {
  if (authPeers[i].downloads > authPeers[i - 1].downloads)
    fail("same-job list left download order");
}
const framework = ranked.laravel.find(
  (item) => item.name === "laravel/framework",
);
if (
  sameJob(framework, ranked.laravel).length !== 0 ||
  setsFor(framework, ranked.laravel).length !== 0
)
  fail("framework picked up a job or a set");

if (postMentionsPackage("vue", "use vue-router and pinia"))
  fail("vue matched vue-router");
if (postMentionsPackage("vue", "npm install vue-router"))
  fail("vue matched npm install vue-router");
if (!postMentionsPackage("vue", "npm install vue"))
  fail("vue missed its install command");
if (!postMentionsPackage("vue", "install `vue` first"))
  fail("vue missed a backtick mention");
if (!postMentionsPackage("pinia", "app.use(pinia)"))
  fail("pinia missed a word mention");
if (
  !postMentionsPackage(
    "inertiajs/inertia-laravel",
    "require `inertiajs/inertia-laravel` 3.5",
  )
)
  fail("inertia package name missed");
const mentionPosts = [
  { title: "old", url: "/old", text: "pinia store" },
  { title: "new", url: "/new", text: "pinia store" },
  { title: "mid", url: "/mid", text: "pinia store" },
  { title: "extra", url: "/extra", text: "pinia store" },
  { title: "nope", url: "/nope", text: "vue-router only" },
];
if (
  postsForPackage("pinia", mentionPosts)
    .map((post) => post.url)
    .join() !== "/old,/new,/mid"
)
  fail("article list did not keep source order and a cap of 3");

console.log(`snapshot=${SNAPSHOT.asOf}`);
console.log(`laravelMetric=${SNAPSHOT.laravelMetric}`);
console.log(`vueMetric=${SNAPSHOT.vueMetric}`);
console.log(`packages=${PACKAGES.length}`);
