import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import ItemCard from "../components/ItemCard.jsx";

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [meta, setMeta] = useState({ categories: [], locations: [] });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get("q") || "");

  useEffect(() => {
    api("/meta").then(setMeta).catch(() => {});
  }, []);

  // Re-fetch whenever a filter in the URL changes.
  useEffect(() => {
    setLoading(true);
    api(`/items?${params.toString()}`)
      .then((d) => setItems(d.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [params]);

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  function handleSearch(e) {
    e.preventDefault();
    setFilter("q", search.trim());
  }

  const type = params.get("type") || "";

  return (
    <>
      <h1>The board</h1>
      <p className="page-sub">everything people have lost &amp; found around campus</p>
      <div className="card filters">
        <form onSubmit={handleSearch} className="search-row">
          <input
            placeholder="🔍 Search: earphones, ID card, keys…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary">Search</button>
        </form>
        <div className="filter-row">
          <div className="tabs">
            {[["", "All"], ["lost", "Lost"], ["found", "Found"]].map(([value, label]) => (
              <button
                key={label}
                className={`tab t-${value || "all"} ${type === value ? "active" : ""}`}
                onClick={() => setFilter("type", value)}
              >
                {label}
              </button>
            ))}
          </div>
          <select value={params.get("category") || ""} onChange={(e) => setFilter("category", e.target.value)}>
            <option value="">All categories</option>
            {meta.categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <select value={params.get("location") || ""} onChange={(e) => setFilter("location", e.target.value)}>
            <option value="">All locations</option>
            {meta.locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <select value={params.get("status") || "open"} onChange={(e) => setFilter("status", e.target.value === "open" ? "" : e.target.value)}>
            <option value="open">Still open</option>
            <option value="resolved">Returned</option>
            <option value="all">Everything</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <div className="empty"><span>🤷</span>Nothing pinned that matches. Try different filters?</div>
      ) : (
        <>
          <p className="count">{items.length} item{items.length === 1 ? "" : "s"} pinned</p>
          <div className="grid">{items.map((item) => <ItemCard key={item.id} item={item} />)}</div>
        </>
      )}
    </>
  );
}
