import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import ItemCard from "../components/ItemCard.jsx";

const NOTES = [
  { cls: "n1", emoji: "🔑", title: "Keys?!", where: "parking lot, tues", tag: "LOST" },
  { cls: "n2", emoji: "🎧", title: "Earbuds", where: "library, 2nd floor", tag: "FOUND" },
  { cls: "n3", emoji: "🪪", title: "ID card", where: "near canteen", tag: "FOUND" },
  { cls: "n4", emoji: "🎒", title: "Grey bag", where: "auditorium", tag: "LOST" },
];

function Ticker({ items }) {
  // The list is repeated twice so the scroll loops seamlessly.
  const loop = [...items, ...items];
  return (
    <div className="ticker" aria-label="Recently reported items">
      <div className="ticker-track">
        {loop.map((item, i) => (
          <Link key={i} to={`/items/${item.id}`} tabIndex={i >= items.length ? -1 : 0}>
            <b className={item.type}>{item.type === "lost" ? "● Lost" : "● Found"}</b> {item.title} @ {item.location}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api("/stats").then(setStats).catch(() => {});
    api("/items?limit=8").then((d) => setRecent(d.items)).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <div>
          <span className="kicker">📌 Campus lost &amp; found</span>
          <h1>
            Lost it?<br />
            Someone <mark>found</mark> it.
          </h1>
          <p className="hand">Pin it on the board, we play matchmaker, and your stuff finds its way home.</p>
          <div className="hero-actions">
            <Link to="/post?type=lost" className="btn btn-lost btn-big">😩 I lost something</Link>
            <Link to="/post?type=found" className="btn btn-found btn-big">🙌 I found something</Link>
          </div>
        </div>

        <div className="corkboard" aria-hidden="true">
          {NOTES.map((n) => (
            <div key={n.cls} className={`pin-note ${n.cls}`}>
              <span className="pin-tag">{n.tag}</span>
              <span className="emoji">{n.emoji}</span>
              <b>{n.title}</b>
              <small>{n.where}</small>
            </div>
          ))}
        </div>
      </section>

      {recent.length > 0 && <Ticker items={recent} />}

      {stats && (
        <section className="stats">
          <div className="stat s-lost tilt-a"><strong>{stats.lost}</strong><span>still missing</span></div>
          <div className="stat s-found tilt-b"><strong>{stats.found}</strong><span>waiting to be claimed</span></div>
          <div className="stat s-done tilt-c"><strong>{stats.resolved}</strong><span>happy reunions</span></div>
          <div className="stat s-users tilt-d"><strong>{stats.users}</strong><span>campus helpers</span></div>
        </section>
      )}

      <section>
        <h2><span className="highlight">How it works</span></h2>
        <div className="steps">
          <div className="sticky tilt-a">
            <span className="num">1.</span>
            <h3>Pin it up</h3>
            <p>Snap a photo, say where &amp; when. Takes 30 seconds.</p>
          </div>
          <div className="sticky tilt-b">
            <span className="num">2.</span>
            <h3>We match it</h3>
            <p>Category, place, date and keywords get scored automatically.</p>
          </div>
          <div className="sticky tilt-c">
            <span className="num">3.</span>
            <h3>Reunite</h3>
            <p>Chat in-app (no phone numbers!) and mark it returned.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2><span className="highlight">Fresh on the board</span></h2>
          <Link to="/browse" className="btn btn-ghost btn-sm">See everything →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="empty"><span>📭</span>The board is empty. Be the first to pin something!</div>
        ) : (
          <div className="grid">{recent.map((item) => <ItemCard key={item.id} item={item} />)}</div>
        )}
      </section>
    </>
  );
}
