import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import ItemCard from "../components/ItemCard.jsx";

export default function MyItems() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api("/items/mine").then((d) => setItems(d.items)).catch(() => setItems([]));
  }, []);

  if (!items) return <p className="muted center">Loading…</p>;

  const open = items.filter((i) => i.status === "open");
  const done = items.filter((i) => i.status === "resolved");

  return (
    <>
      <div className="section-head">
        <h1>My items</h1>
        <Link to="/post" className="btn btn-primary">📌 Pin an item</Link>
      </div>
      {items.length === 0 && <div className="empty"><span>🫙</span>Nothing pinned yet. Lucky you!</div>}

      {open.length > 0 && (
        <section>
          <h2><span className="highlight">Still looking ({open.length})</span></h2>
          <div className="grid">{open.map((i) => <ItemCard key={i.id} item={i} />)}</div>
        </section>
      )}
      {done.length > 0 && (
        <section>
          <h2><span className="highlight">Happy endings ({done.length})</span></h2>
          <div className="grid">{done.map((i) => <ItemCard key={i.id} item={i} />)}</div>
        </section>
      )}
    </>
  );
}
