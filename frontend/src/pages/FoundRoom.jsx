import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import CrateBox from "../components/CrateBox.jsx";

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
    <div className="room">
      <div className="bulb" aria-hidden="true"><span /></div>

      <header className="room-head">
        <p className="kicker">Storage · Room 01</p>
        <h1 className="stencil">The Found Room</h1>
        <p className="lead">
          Everything people handed in, sorted into boxes. <b>{total}</b> item{total === 1 ? "" : "s"} waiting.
          Hover a box to peek, click it to open.
        </p>
        <form className="room-search" onSubmit={searchAll}>
          <input placeholder="Or rummage through every box… (e.g. keys, earbuds)" value={search}
            onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-amber">Rummage</button>
          <Link to="/post?type=found" className="btn btn-blue">+ Hand something in</Link>
        </form>
      </header>

      {!boxes ? (
        <p className="center dim">Unlocking the storage room…</p>
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
