import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import FoundCard from "../components/FoundCard.jsx";

// The catalogue you see after opening a box (or searching all boxes).
export default function FoundBox() {
  const { cat } = useParams();
  const [params, setParams] = useSearchParams();
  const [meta, setMeta] = useState({ categories: [], locations: [] });
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState(params.get("q") || "");

  useEffect(() => {
    api("/meta").then(setMeta).catch(() => {});
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(params);
    q.set("type", "found");
    if (cat !== "all") q.set("category", cat);
    setItems(null);
    api(`/items?${q}`).then((d) => setItems(d.items)).catch(() => setItems([]));
  }, [cat, params]);

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  const category = meta.categories.find((c) => String(c.id) === cat);
  const label = cat === "all" ? "Every box" : category ? category.name : "…";

  return (
    <div className="room room-open">
      <Link to="/found" className="back">← Back to the shelves</Link>

      <header className="box-head">
        <div className="box-rim" aria-hidden="true">
          <span className="rim-flap l" /><span className="rim-flap r" />
        </div>
        <div className="box-head-text">
          <span className="tape-label">{category?.icon} {label}</span>
          <p className="lead">
            {items ? `${items.length} item${items.length === 1 ? "" : "s"} in here.` : "Opening…"} Recognise something? Open it and claim it.
          </p>
        </div>
      </header>

      <div className="toolbar">
        <form onSubmit={(e) => { e.preventDefault(); setFilter("q", search.trim()); }} className="toolbar-search">
          <input placeholder="Search this box…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-amber btn-sm">Search</button>
        </form>
        <select value={params.get("location") || ""} onChange={(e) => setFilter("location", e.target.value)}>
          <option value="">Found anywhere</option>
          {meta.locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select value={params.get("status") || "open"} onChange={(e) => setFilter("status", e.target.value === "open" ? "" : e.target.value)}>
          <option value="open">Unclaimed</option>
          <option value="resolved">Already claimed</option>
          <option value="all">Everything</option>
        </select>
      </div>

      {!items ? null : items.length === 0 ? (
        <div className="empty"><span>🕸️</span>Just dust and cobwebs in here.</div>
      ) : (
        <div className="found-grid">{items.map((item) => <FoundCard key={item.id} item={item} />)}</div>
      )}
    </div>
  );
}
