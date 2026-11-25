import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import WantedPoster from "../components/WantedPoster.jsx";

export default function WantedBoard() {
  const [params, setParams] = useSearchParams();
  const [meta, setMeta] = useState({ categories: [], locations: [] });
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState(params.get("q") || "");

  useEffect(() => {
    api("/meta").then(setMeta).catch(() => {});
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(params);
    q.set("type", "lost");
    setItems(null);
    api(`/items?${q}`).then((d) => setItems(d.items)).catch(() => setItems([]));
  }, [params]);

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  return (
    <div className="wall">
      <header className="sign">
        <span className="sign-nail l" /><span className="sign-nail r" />
        <h1>Wanted Board</h1>
        <p>Things students are desperately looking for. Seen one? Collect the reward.</p>
      </header>

      <div className="toolbar toolbar-wood">
        <form onSubmit={(e) => { e.preventDefault(); setFilter("q", search.trim()); }} className="toolbar-search">
          <input placeholder="Search the posters…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-amber btn-sm">Search</button>
        </form>
        <select value={params.get("category") || ""} onChange={(e) => setFilter("category", e.target.value)}>
          <option value="">All kinds of things</option>
          {meta.categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select value={params.get("location") || ""} onChange={(e) => setFilter("location", e.target.value)}>
          <option value="">Last seen anywhere</option>
          {meta.locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select value={params.get("status") || "open"} onChange={(e) => setFilter("status", e.target.value === "open" ? "" : e.target.value)}>
          <option value="open">Still wanted</option>
          <option value="resolved">Recovered</option>
          <option value="all">All posters</option>
        </select>
        <Link to="/post?type=lost" className="btn btn-red btn-sm">+ Put up a poster</Link>
      </div>

      {!items ? null : items.length === 0 ? (
        <div className="empty empty-wood"><span>📜</span>No posters match. The board is suspiciously quiet.</div>
      ) : (
        <div className="poster-grid">{items.map((item) => <WantedPoster key={item.id} item={item} />)}</div>
      )}
    </div>
  );
}
