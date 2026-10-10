// The only site-wide JavaScript: theme, copy buttons, TOC, forms, and the tools page.
import {
  agentsMarkdown,
  recipeFromJobs,
  type AgentsChoices,
} from "../data/dev-tools";

function renderRecipe(form: HTMLFormElement) {
  const ids = [...form.querySelectorAll<HTMLInputElement>("input[data-job]")]
    .filter((input) => input.checked)
    .map((input) => input.dataset.job)
    .filter((id): id is string => Boolean(id));
  const recipe = recipeFromJobs(ids);
  const paint = (wrapSel: string, emptySel: string, command: string | null) => {
    const wrap = form.querySelector<HTMLElement>(wrapSel);
    const empty = form.querySelector<HTMLElement>(emptySel);
    const code = wrap?.querySelector("pre code");
    if (code) code.textContent = command ?? "";
    wrap?.toggleAttribute("hidden", command === null);
    empty?.toggleAttribute("hidden", command !== null);
  };
  paint(
    "[data-recipe-composer-wrap]",
    "[data-recipe-composer-empty]",
    recipe.composer,
  );
  paint("[data-recipe-npm-wrap]", "[data-recipe-npm-empty]", recipe.npm);
  const list = form.querySelector<HTMLElement>("[data-recipe-warnings]");
  const emptyWarnings = form.querySelector<HTMLElement>(
    "[data-recipe-warnings-empty]",
  );
  if (list) {
    list.replaceChildren(
      ...recipe.warnings.map((text) => {
        const item = document.createElement("li");
        item.textContent = text;
        return item;
      }),
    );
    list.toggleAttribute("hidden", recipe.warnings.length === 0);
  }
  emptyWarnings?.toggleAttribute("hidden", recipe.warnings.length > 0);
  const markdown = form.querySelector<HTMLElement>("[data-recipe-md]");
  if (markdown) markdown.textContent = recipe.markdown;
}

function readAgents(form: HTMLFormElement): Partial<AgentsChoices> {
  const value = (key: keyof AgentsChoices) =>
    form.querySelector<HTMLSelectElement>(`select[data-choice="${key}"]`)
      ?.value;
  return {
    laravel: value("laravel") as AgentsChoices["laravel"],
    vue: value("vue") as AgentsChoices["vue"],
    bridge: value("bridge") as AgentsChoices["bridge"],
    tests: value("tests") as AgentsChoices["tests"],
    state: value("state") as AgentsChoices["state"],
  };
}

function renderAgents(form: HTMLFormElement) {
  const body = form.querySelector<HTMLElement>("[data-agents-body]");
  if (body) body.textContent = agentsMarkdown(readAgents(form));
}

function downloadAgents(form: HTMLFormElement) {
  const text = form.querySelector("[data-agents-body]")?.textContent ?? "";
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/markdown;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "AGENTS.md";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function initUi() {
  const root = document.documentElement;
  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")
    .forEach((b) =>
      b.addEventListener("click", () => {
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        const apply = () => {
          root.dataset.theme = next;
          try {
            localStorage.setItem("theme", next);
          } catch {}
        };
        const d = document as Document & {
          startViewTransition?: (cb: () => void) => unknown;
        };
        typeof d.startViewTransition === "function" &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
          ? d.startViewTransition(apply)
          : apply();
      }),
    );

  const header = document.querySelector(".site-header");
  const onScroll = () => header?.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  document.querySelectorAll<HTMLButtonElement>(".copy-btn").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const code = btn.closest(".code")?.querySelector("pre")?.innerText ?? "";
      try {
        await navigator.clipboard.writeText(code.replace(/\n$/, ""));
      } catch {
        return;
      }
      const label = btn.querySelector(".copy-label");
      btn.classList.add("done");
      if (label) label.textContent = "Copied";
      setTimeout(() => {
        btn.classList.remove("done");
        if (label) label.textContent = "Copy";
      }, 1600);
    }),
  );

  const links = [
    ...document.querySelectorAll<HTMLAnchorElement>('.toc a[href^="#"]'),
  ];
  if (links.length && "IntersectionObserver" in window) {
    const map = new Map(
      links.map((a) => [decodeURIComponent(a.hash.slice(1)), a]),
    );
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => a.classList.remove("active"));
          map.get(e.target.id)?.classList.add("active");
        }),
      { rootMargin: "-80px 0px -70% 0px" },
    );
    map.forEach((_, id) => {
      const el = document.getElementById(id);
      el && io.observe(el);
    });
  }

  // Forms posting to the Worker (/api/forms/*): send with fetch and show the result inline.
  // Without JS they still work as normal POSTs (the Worker redirects to /thanks or /form-error).
  document.querySelectorAll<HTMLFormElement>("form[data-api]").forEach((f) => {
    const ts = f.querySelector<HTMLInputElement>('input[name="ts"]');
    if (ts) ts.value = String(Date.now());
    const status = f.querySelector<HTMLElement>(".form-status");
    const btn = f.querySelector<HTMLButtonElement>('button[type="submit"]');
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (btn?.disabled) return;
      const say = (msg: string, kind: "ok" | "error" | "busy") => {
        if (status) {
          status.textContent = msg;
          status.dataset.kind = kind;
        }
      };
      btn && (btn.disabled = true);
      f.setAttribute("aria-busy", "true");
      say("Sending…", "busy");
      try {
        const res = await fetch(f.action, {
          method: "POST",
          body: new FormData(f),
          headers: { Accept: "application/json" },
        });
        const out = await res
          .json()
          .catch(() => ({
            ok: false,
            error: "Something went wrong. Please try again.",
          }));
        if (out.ok) {
          f.reset();
          f.classList.add("sent");
          say(out.message, "ok");
        } else
          say(out.error ?? "Something went wrong. Please try again.", "error");
      } catch {
        say("Network error. Check your connection and try again.", "error");
      } finally {
        btn && (btn.disabled = false);
        f.removeAttribute("aria-busy");
      }
    });
  });

  document
    .querySelector<HTMLDetailsElement>(".mobile-nav")
    ?.querySelectorAll("a")
    .forEach((a) =>
      a.addEventListener("click", () =>
        a.closest("details")?.removeAttribute("open"),
      ),
    );

  document
    .querySelectorAll<HTMLFormElement>("form[data-recipe]")
    .forEach((form) => {
      form.addEventListener("submit", (event) => event.preventDefault());
      form.addEventListener("change", () => renderRecipe(form));
    });
  document
    .querySelectorAll<HTMLFormElement>("form[data-agents]")
    .forEach((form) => {
      form.addEventListener("submit", (event) => event.preventDefault());
      form.addEventListener("change", () => renderAgents(form));
      form
        .querySelector<HTMLButtonElement>("[data-agents-download]")
        ?.addEventListener("click", () => downloadAgents(form));
    });
}
