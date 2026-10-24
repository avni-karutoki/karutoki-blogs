/* Theme init — runs before hydration (injected by next/script beforeInteractive)
   to set the saved theme & reading size on <html> without a flash. Kept as an
   external file because React 19 warns on any <script> rendered inside a
   React component (inline next/script content included). */
(function () {
  document.documentElement.classList.add("js");
  try {
    var saved = localStorage.getItem("karutoki-theme");
    var valid = ["cream", "moonlit", "blush", "lavender", "matcha", "honey", "ocean", "sakura"];
    var theme = valid.indexOf(saved) !== -1 ? saved : null;
    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "moonlit" : "cream";
    }
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "cream");
  }
  try {
    var size = localStorage.getItem("karutoki-reading-size");
    if (size === "large" || size === "compact") {
      document.documentElement.setAttribute("data-reading-size", size);
    }
  } catch (e) {}
  /* Belt-and-braces for WebKit: never auto-shrink the page to fit wide
     content — horizontal overflow is clipped instead. */
  try {
    var m = document.querySelector('meta[name="viewport"]');
    if (m && m.getAttribute("content").indexOf("shrink-to-fit") === -1) {
      m.setAttribute("content", m.getAttribute("content") + ", shrink-to-fit=no");
    }
  } catch (e) {}
})();
