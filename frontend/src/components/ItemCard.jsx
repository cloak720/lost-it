import { Link } from "react-router-dom";
import { formatDate } from "../api.js";

const TILTS = ["tilt-a", "tilt-b", "tilt-c", "tilt-d"];

// Each card gets a slightly different tilt so the board looks hand-pinned.
export function tiltFor(id) {
  return TILTS[id % TILTS.length];
}

export function ItemImage({ item, className = "" }) {
  if (item.image_url) {
    return <img src={item.image_url} alt={item.title} className={`item-img ${className}`} />;
  }
  return (
    <div className={`item-img placeholder ${item.type} ${className}`}>
      <span>{item.category_icon}</span>
    </div>
  );
}

export function Stamp({ type }) {
  return <span className={`stamp stamp-${type}`}>{type === "lost" ? "Lost" : "Found"}</span>;
}

export default function ItemCard({ item, extra }) {
  const resolved = item.status === "resolved";
  return (
    <Link to={`/items/${item.id}`} className={`item-card ${tiltFor(item.id)} ${resolved ? "is-resolved" : ""}`}>
      <span className="tape" aria-hidden="true" />
      <div className="photo">
        <ItemImage item={item} />
        <Stamp type={item.type} />
        {resolved && <span className="returned-stamp">Returned ✓</span>}
      </div>
      <div className="item-body">
        <h3>{item.title}</h3>
        <p className="meta">📍 {item.location}</p>
        <p className="meta">{formatDate(item.item_date)} · {item.category}</p>
        {extra}
      </div>
    </Link>
  );
}
