import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import CrateBox from "../components/CrateBox.jsx";
import WantedPoster from "../components/WantedPoster.jsx";

export default function Home() {
  const [stats, setStats] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [posters, setPosters] = useState([]);

  useEffect(() => {
    api("/stats").then(setStats).catch(() => {});
    api("/found-room").then((d) => setBoxes(d.boxes.filter((b) => b.count > 0).slice(0, 3))).catch(() => {});
    api("/items?type=lost&limit=2").then((d) => setPosters(d.items)).catch(() => {});
  }, []);

  return (
    <>
      <section className="office-hero">
        <p className="kicker">Campus Lost &amp; Found Office · open 24/7</p>
        <h1>
          Everything lost<br />ends up <em>somewhere.</em>
        </h1>
        <p className="lead">
          Found something? Drop it in a box. Lost something? Put up a poster.
          Lost-It matches the two and gets your stuff home.
        </p>
        <div className="cta">
          <Link to="/post?type=found" className="btn btn-blue btn-big">📦 I found something</Link>
          <Link to="/post?type=lost" className="btn btn-red btn-big">📜 I lost something</Link>
        </div>
      </section>

      <section className="portals">
        <Link to="/found" className="portal portal-found">
          <div className="portal-art">
            {boxes.map((b, i) => <CrateBox key={b.id} box={b} size={`mini mini-${i}`} interactive={false} />)}
          </div>
          <div className="portal-text">
            <span className="portal-door">Door A</span>
            <h2>The Found Room</h2>
            <p>{stats ? `${stats.found} found items` : "Found items"} sorted into boxes, waiting for their owners.</p>
            <span className="portal-go">Open the room →</span>
          </div>
        </Link>

        <Link to="/wanted" className="portal portal-wanted">
          <div className="portal-art">
            {posters.map((p) => <WantedPoster key={p.id} item={p} as="div" size="mini" />)}
          </div>
          <div className="portal-text">
            <span className="portal-door">Door B</span>
            <h2>The Wanted Board</h2>
            <p>{stats ? `${stats.lost} items` : "Items"} missing, with bounties on their heads. Recognise one?</p>
            <span className="portal-go">See the posters →</span>
          </div>
        </Link>
      </section>

      {stats && (
        <section className="ledger">
          <h2 className="ledger-title">Today's ledger</h2>
          <div className="ledger-rows">
            <div><span>Posters on the wall</span><b>{stats.lost}</b></div>
            <div><span>Items in boxes</span><b>{stats.found}</b></div>
            <div><span>Returned to owners</span><b className="good">{stats.resolved}</b></div>
            <div><span>Students helping</span><b>{stats.users}</b></div>
          </div>
        </section>
      )}

      <section className="procedure">
        <h2>Office procedure</h2>
        <ol>
          <li><b>Report it.</b> Lost things get a Wanted poster, found things go in a box.</li>
          <li><b>We cross-check.</b> Category, place, date and description are scored to find matches.</li>
          <li><b>Talk it out.</b> Message the other person in the app. No phone numbers shared.</li>
          <li><b>Case closed.</b> Mark it returned and it gets the stamp.</li>
        </ol>
      </section>
    </>
  );
}
