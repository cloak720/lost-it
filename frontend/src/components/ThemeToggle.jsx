import { useState } from "react";

const KEY = "lostit_theme";

// Day ☀️ / Night 🌙 switch. The choice is saved in this browser only.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") || "light");
  const dark = theme === "dark";

  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage blocked: the theme still switches for this visit */
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      className={`theme-toggle ${dark ? "dark" : "light"}`}
      onClick={toggle}
      aria-label={dark ? "Switch to day mode" : "Switch to night mode"}
      title={dark ? "Night shift. Click for day" : "Day shift. Click for night"}
    >
      <span className="tt-icon tt-sun" aria-hidden="true">☀️</span>
      <span className="tt-icon tt-moon" aria-hidden="true">🌙</span>
      <span className="tt-knob" aria-hidden="true" />
    </button>
  );
}
