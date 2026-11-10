import { allPosts, categories, tags, type Post } from "./content";
import { SITE_URL, AUTHOR } from "../config/site";
import { PACKAGES, SNAPSHOT } from "../data/packages";
import { CHEATSHEETS } from "../data/cheatsheets";

// Sitemap index (/sitemap.xml) with three child sitemaps. lastmod is only set where we know it:
// a post's updated/published date, the newest post in a listing, or the "last updated" date of a static page.
type Url = { loc: string; lastmod?: Date };
export const LEGAL_UPDATED = new Date("2026-10-10T00:00:00Z");
const PAGES: [string, Date?][] = [
  ["/page/about-us"],
  ["/page/contact-us"],
  ["/page/hire-us"],
  ["/page/newsletter"],
  ["/page/faq"],
  ["/page/courses"],
  ["/page/products"],
  ["/page/privacy-policy", new Date("2026-10-15T00:00:00Z")],
  ["/page/terms-and-conditions", LEGAL_UPDATED],
  ["/page/dmca-policy", LEGAL_UPDATED],
  ["/page/accessibility", LEGAL_UPDATED],
  ["/jobs/job-archive"],
  ["/jobs/create-job"],
  ["/jobs/pricing"],
  ["/jobs/companies"],
  ["/search"],
];
const PACKAGE_UPDATED = new Date(`${SNAPSHOT.asOf}T00:00:00Z`);
const newest = (posts: Post[]) =>
  posts.reduce<Date | undefined>((m, p) => {
    const d = p.updated ?? p.date;
    return !m || d > m ? d : m;
  }, undefined);
const day = (d?: Date) => d?.toISOString().slice(0, 10);

export async function sitemapUrls(): Promise<
  Record<"pages" | "posts" | "taxonomies", Url[]>
> {
  const posts = await allPosts();
  const latest = newest(posts);
  return {
    pages: [
      { loc: "/", lastmod: latest },
      { loc: "/posts", lastmod: latest },
      { loc: AUTHOR.url, lastmod: latest },
      { loc: "/packages", lastmod: PACKAGE_UPDATED },
      { loc: "/tools", lastmod: PACKAGE_UPDATED },
      { loc: "/starter", lastmod: latest },
      { loc: "/fix", lastmod: latest },
      { loc: "/trap", lastmod: latest },
      { loc: "/strike", lastmod: latest },
      { loc: "/which", lastmod: latest },
      { loc: "/spin", lastmod: latest },
      { loc: "/path", lastmod: latest },
      ...[
        "/tools/start",
        "/tools/samples",
        "/tools/recipe",
        "/tools/files",
        "/tools/shipped",
        "/tools/now",
        "/tools/compatibility",
        "/tools/agents",
      ].map((loc) => ({ loc, lastmod: PACKAGE_UPDATED })),
      { loc: "/cheatsheets", lastmod: new Date(`${CHEATSHEETS.map((s) => s.checked).sort().at(-1)}T00:00:00Z`) },
      ...CHEATSHEETS.map((s) => ({ loc: `/cheatsheets/${s.slug}`, lastmod: new Date(`${s.checked}T00:00:00Z`) })),
      ...PACKAGES.map((pkg) => ({
        loc: `/packages/${pkg.slug}`,
        lastmod: PACKAGE_UPDATED,
      })),
      ...PAGES.map(([loc, lastmod]) => ({ loc, lastmod })),
    ],
    posts: posts.map((p) => ({ loc: p.url, lastmod: p.updated ?? p.date })),
    taxonomies: [
      ...categories
        .map((c) => ({
          c,
          ps: posts.filter((p) => p.categories.some((x) => x.slug === c.slug)),
        }))
        .filter((x) => x.ps.length)
        .map(({ c, ps }) => ({ loc: `/category/${c.slug}`, lastmod: newest(ps) })),
      ...tags
        .map((t) => ({
          t,
          ps: posts.filter((p) => p.tags.some((x) => x.slug === t.slug)),
        }))
        .filter((x) => x.ps.length)
        .map(({ t, ps }) => ({ loc: `/tag/${t.slug}`, lastmod: newest(ps) })),
    ],
  };
}
export const urlset = (urls: Url[]) =>
  xml(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map(
        (u) =>
          `  <url><loc>${SITE_URL}${u.loc === "/" ? "/" : u.loc}</loc>${u.lastmod ? `<lastmod>${day(u.lastmod)}</lastmod>` : ""}</url>`,
      )
      .join("\n")}\n</urlset>`,
  );
export async function sitemapIndex() {
  const groups = await sitemapUrls();
  return xml(
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.entries(
      groups,
    )
      .map(([name, urls]) => {
        const last = urls.reduce<Date | undefined>(
          (m, u) => (!u.lastmod ? m : !m || u.lastmod > m ? u.lastmod : m),
          undefined,
        );
        return `  <sitemap><loc>${SITE_URL}/sitemap-${name}.xml</loc>${last ? `<lastmod>${day(last)}</lastmod>` : ""}</sitemap>`;
      })
      .join("\n")}\n</sitemapindex>`,
  );
}
const xml = (body: string) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
