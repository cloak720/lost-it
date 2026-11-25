import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import CrateBox from "../components/CrateBox.jsx";
import PageHeader from "../components/PageHeader.jsx";

export default function FoundRoom() {
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api("/found-room").then((d) => setBoxes(d.boxes)).catch(() => setBoxes([]));
  }, []);

  function searchAll(e) {
    e.preventDefault();
    navigate(`/found/all${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""}`);
  }

  const total = boxes ? boxes.reduce((sum, b) => sum + b.count, 0) : 0;

  return (
    <div className="scene scene-room">
      <div className="bulb" aria-hidden="true"><span /></div>

      <PageHeader
        center
        kicker="Storage · Room 01"
        title={<>The Found <span className="hand">Room</span></>}
        subtitle={`Everything students handed in, sorted into boxes. ${total} item${total === 1 ? "" : "s"} waiting. Hover over a box to peek inside, click to open it.`}
      />

      <form className="toolbar" onSubmit={searchAll}>
        <div className="toolbar-search">
          <input placeholder="Or rummage through every box… (keys, earbuds, ID card)" value={search}
            onChange={(e) => setSearch(e.target.value)} aria-label="Search all found items" />
          <button className="btn btn-sm">Rummage</button>
        </div>
        <Link to="/post?type=found" className="btn btn-found btn-sm">+ Hand something in</Link>
      </form>

      {!boxes ? (
        <p className="center muted">Unlocking the storeroom…</p>
      ) : (
        <div className="shelves">
          {boxes.map((box) => (
            <CrateBox key={box.id} box={box} onOpen={(b) => navigate(`/found/${b.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
