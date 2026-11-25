import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import FoundCard from "../components/FoundCard.jsx";
import WantedPoster from "../components/WantedPoster.jsx";

export default function MyItems() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api("/items/mine").then((d) => setItems(d.items)).catch(() => setItems([]));
  }, []);

  if (!items) return <p className="center dim">Fetching your files…</p>;

  const lost = items.filter((i) => i.type === "lost");
  const found = items.filter((i) => i.type === "found");

  return (
    <>
      <div className="page-head">
        <h1 className="stencil">My stuff</h1>
        <Link to="/post" className="btn btn-amber">+ Report something</Link>
      </div>

      {items.length === 0 && <div className="empty"><span>🫙</span>Nothing reported yet. Lucky you!</div>}

      {lost.length > 0 && (
        <section className="wall wall-tight">
          <h2 className="section-title">My Wanted posters ({lost.length})</h2>
          <div className="poster-grid">{lost.map((i) => <WantedPoster key={i.id} item={i} />)}</div>
        </section>
      )}

      {found.length > 0 && (
        <section className="room room-tight">
          <h2 className="section-title">Things I handed in ({found.length})</h2>
          <div className="found-grid">{found.map((i) => <FoundCard key={i.id} item={i} />)}</div>
        </section>
      )}
    </>
  );
}
