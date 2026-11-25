import { useState } from "react";

/**
 * A 3D cardboard box built from six CSS faces.
 * Hover: the flaps lift and the items inside peek out.
 * Click: the flaps fly open, items jump up, then onOpen() runs.
 * Pass interactive={false} for a decorative box (e.g. inside a link).
 */
export default function CrateBox({ box, onOpen, size = "", interactive = true }) {
  const [opening, setOpening] = useState(false);
  const empty = box.count === 0;

  function open() {
    if (opening || !onOpen) return;
    setOpening(true);
    setTimeout(() => onOpen(box), 650);
  }

  const Tag = interactive ? "button" : "div";
  const props = interactive
    ? { type: "button", onClick: open, "aria-label": `Open the ${box.name} box, ${box.count} item(s) inside` }
    : { "aria-hidden": true };

  return (
    <Tag className={`crate-slot ${size} ${opening ? "is-open" : ""} ${empty ? "is-empty" : ""}`} {...props}>
      <div className="crate">
        <div className="crate-face front">
          <span className="crate-label">{box.name}</span>
          <span className="crate-count">{empty ? "— empty —" : `${box.count} item${box.count === 1 ? "" : "s"}`}</span>
          <span className="crate-print">↑↑ this side up</span>
          {box.name === "Electronics" && <span className="crate-fragile">Fragile</span>}
        </div>
        <div className="crate-face back" />
        <div className="crate-face left" />
        <div className="crate-face right">
          <span className="crate-sticker">{box.icon}</span>
        </div>
        <div className="crate-face bottom" />

        <div className="crate-items">
          {box.previews.map((p, i) => (
            <span key={p.id} className={`peek peek-${i}`}>
              {p.image_url ? <img src={p.image_url} alt="" /> : <span className="peek-emoji">{box.icon}</span>}
              <span className="peek-title">{p.title.split(" ").slice(0, 2).join(" ")}</span>
            </span>
          ))}
        </div>

        <div className="crate-top">
          <div className="flap flap-back" />
          <div className="flap flap-front" />
        </div>
      </div>
      <span className="crate-shadow" />
    </Tag>
  );
}
