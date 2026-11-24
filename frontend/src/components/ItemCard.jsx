import { Link } from "react-router-dom";
import { formatDate } from "../api.js";

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

export function TypeBadge({ type }) {
  return <span className={`tag tag-${type}`}>{type === "lost" ? "Lost" : "Found"}</span>;
}

export default function ItemCard({ item, extra }) {
  return (
    <Link to={`/items/${item.id}`} className="card item-card">
      <ItemImage item={item} />
      <div className="item-body">
        <div className="item-tags">
          <TypeBadge type={item.type} />
          {item.status === "resolved" && <span className="tag tag-resolved">Returned</span>}
        </div>
        <h3>{item.title}</h3>
        <p className="muted small">📍 {item.location}</p>
        <p className="muted small">📅 {formatDate(item.item_date)} · {item.category}</p>
        {extra}
      </div>
    </Link>
  );
}
