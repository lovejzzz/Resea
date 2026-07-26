(() => {
  const clone = document.body.cloneNode(true);
  clone
    .querySelectorAll("script, style, noscript, iframe, form, input, button, nav, [hidden]")
    .forEach((node) => node.remove());

  const candidates = [...clone.querySelectorAll("main, article, [role='main']")];
  const root =
    candidates.sort((a, b) => (b.textContent?.length || 0) - (a.textContent?.length || 0))[0] ||
    clone;

  const headings = [...root.querySelectorAll("h1, h2, h3")]
    .map((node) => node.textContent?.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 80);
  const text = root.textContent?.replace(/\s+/g, " ").trim().slice(0, 2_000_000) || "";

  return {
    url: location.href,
    title: document.title,
    authors: [
      document.querySelector("meta[name='author']")?.getAttribute("content"),
    ].filter(Boolean),
    publishedAt:
      document.querySelector("meta[property='article:published_time']")?.getAttribute("content") ||
      document.querySelector("time")?.getAttribute("datetime") ||
      null,
    language: document.documentElement.lang || null,
    headings,
    text,
    extraction: {
      id: "resea.active-tab",
      version: "0.9.0",
      omitted: ["scripts", "styles", "forms", "frames", "navigation"],
    },
  };
})();
