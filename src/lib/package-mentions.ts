// Match a catalog package name in post text. Short bare names only count inside
// an install command or backticks, so "vue" does not hit every Vue article.

export type MentionSource = {
  title: string;
  url: string;
  text: string;
};

const SHORT_BARE = new Set(["vue", "vuex", "nuxt"]);

function escaped(name: string): string {
  return name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A package token ends at a character that is not part of a name.
const EDGE = "[A-Za-z0-9@/_.-]";

export function postMentionsPackage(name: string, text: string): boolean {
  const token = escaped(name);
  if (SHORT_BARE.has(name)) {
    const install = new RegExp(
      `(?:npm install|composer require) ${token}(?!${EDGE})`,
      "i",
    );
    const quoted = new RegExp(`\`${token}\``);
    return install.test(text) || quoted.test(text);
  }
  return new RegExp(`(?<!${EDGE})${token}(?!${EDGE})`, "i").test(text);
}

export function postsForPackage<T extends MentionSource>(
  name: string,
  posts: readonly T[],
  limit = 3,
): T[] {
  return posts
    .filter((post) => postMentionsPackage(name, `${post.title}\n${post.text}`))
    .slice(0, limit);
}
