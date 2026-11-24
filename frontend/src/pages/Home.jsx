import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import ItemCard from "../components/ItemCard.jsx";

export default function Home() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api("/stats").then(setStats).catch(() => {});
    api("/items?limit=6").then((d) => setRecent(d.items)).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <h1>Lost something on campus?</h1>
        <p>
          Lost-It connects people who lost things with people who found them.
          Post an item, see smart matches instantly, and message the owner.
        </p>
        <div className="hero-actions">
          <Link to="/post?type=lost" className="btn btn-lost">I lost something</Link>
          <Link to="/post?type=found" className="btn btn-found">I found something</Link>
        </div>
      </section>

      {stats && (
        <section className="stats">
          <div className="stat"><strong>{stats.lost}</strong><span>Lost items open</span></div>
          <div className="stat"><strong>{stats.found}</strong><span>Found items waiting</span></div>
          <div className="stat"><strong>{stats.resolved}</strong><span>Returned to owners</span></div>
          <div className="stat"><strong>{stats.users}</strong><span>Students on Lost-It</span></div>
        </section>
      )}

      <section className="how">
        <h2>How it works</h2>
        <div className="steps">
          <div className="card step"><span>1</span><h3>Report</h3><p>Post what you lost or found, with a photo, place and date.</p></div>
          <div className="card step"><span>2</span><h3>Match</h3><p>Lost-It compares category, place, date and keywords to suggest matches.</p></div>
          <div className="card step"><span>3</span><h3>Reunite</h3><p>Message the other person safely and mark the item as returned.</p></div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Recently reported</h2>
          <Link to="/browse">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="muted">No items yet. Be the first to report one!</p>
        ) : (
          <div className="grid">{recent.map((item) => <ItemCard key={item.id} item={item} />)}</div>
        )}
      </section>
    </>
  );
}
