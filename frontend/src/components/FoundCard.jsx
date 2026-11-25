import { useRef } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../api.js";

export function caseNo(id) {
  return String(id).padStart(4, "0");
}

/**
 * A found item: photo + a manila claim tag. It tilts in 3D following the mouse.
 * as="div" renders it without a link (used on the detail page and form preview).
 */
export default function FoundCard({ item, extra, as = "link", size = "" }) {
  const ref = useRef(null);
  const resolved = item.status === "resolved";

  function tilt(e) {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${x * 18}deg`);
    el.style.setProperty("--rx", `${-y * 14}deg`);
  }
  function reset() {
    ref.current.style.setProperty("--ry", "0deg");
    ref.current.style.setProperty("--rx", "0deg");
  }

  const body = (
    <>
      <div className="found-inner">
        <div className="found-photo">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} />
          ) : (
            <span className="found-emoji">{item.category_icon}</span>
          )}
          {resolved && <span className="stamp stamp-claimed">Claimed</span>}
        </div>
        <div className="claim-tag">
          <span className="claim-hole" aria-hidden="true" />
          <span className="claim-no">Found item · No. {caseNo(item.id)}</span>
          <strong>{item.title}</strong>
          <span className="claim-meta">📍 {item.location}</span>
          <span className="claim-meta">🗓 {formatDate(item.item_date)}</span>
        </div>
      </div>
      {extra}
    </>
  );

  const cls = `found-card ${size} ${resolved ? "is-resolved" : ""}`;
  if (as === "div") {
    return <div ref={ref} className={cls} onMouseMove={tilt} onMouseLeave={reset}>{body}</div>;
  }
  return (
    <Link ref={ref} to={`/items/${item.id}`} className={cls} onMouseMove={tilt} onMouseLeave={reset}>
      {body}
    </Link>
  );
}
