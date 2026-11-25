import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import CrateBox from "../components/CrateBox.jsx";
import WantedPoster from "../components/WantedPoster.jsx";

// Shown in the hero illustration until real data loads (or if the board is empty).
const SAMPLE_BOX = {
  id: 0,
  name: "Electronics",
  icon: "📱",
  count: 3,
  previews: [
    { id: -1, title: "Earbuds", image_url: null },
    { id: -2, title: "Calculator", image_url: null },
    { id: -3, title: "Charger", image_url: null },
  ],
};
const SAMPLE_POSTER = {
  id: 0, type: "lost", status: "open", title: "ID card", location: "Canteen",
  item_date: new Date().toISOString().slice(0, 10), reward: "₹200", category_icon: "🪪", image_url: null,
};

const STEPS = [
  ["📸", "Report it", "Lost something? Put up a Wanted poster. Found something? Drop it in a box."],
  ["🤖", "We match it", "Category, place, date and description get scored to find likely matches."],
  ["💬", "Chat safely", "Message the other student in the app. No phone numbers needed."],
  ["🎉", "Case closed", "Hand it over, hit “Mark as returned”, and enjoy the confetti."],
];

export default function Home() {
  const [stats, setStats] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [posters, setPosters] = useState([]);

  useEffect(() => {
    api("/stats").then(setStats).catch(() => {});
    api("/found-room").then((d) => setBoxes(d.boxes.filter((b) => b.count > 0))).catch(() => {});
    api("/items?type=lost&limit=3").then((d) => setPosters(d.items)).catch(() => {});
  }, []);

  const heroBox = boxes[0] || SAMPLE_BOX;
  const heroPoster = posters[0] || SAMPLE_POSTER;

  return (
    <>
      <section className="hero">
        <div>
          <p className="label ph-kicker">For students who lose stuff (so… everyone)</p>
          <h1 className="hero-title">
            Lost it on campus?<br />
            We'll help you <span className="hand">find it.</span>
          </h1>
          <p className="hero-sub">
            ID card gone right before an exam? Earbuds vanished in the library? Post it on Lost-It and
            we'll match it with whatever your classmates have found.
          </p>
          <div className="hero-cta">
            <Link to="/post?type=lost" className="btn btn-lost btn-lg">😭 I lost something</Link>
            <Link to="/post?type=found" className="btn btn-found btn-lg">🙌 I found something</Link>
          </div>
          <ul className="hero-perks">
            <li>Free for every student</li>
            <li>Smart matching</li>
            <li>No phone numbers shared</li>
          </ul>
        </div>

        <div className="hero-scene" aria-hidden="true">
          <div className="bulb"><span /></div>
          <div className="hero-bubble">is this your ID card? 👀</div>
          <div className="hero-poster"><WantedPoster item={heroPoster} as="div" size="mini" /></div>
          <div className="hero-shelf" />
          <CrateBox box={heroBox} size="hero peeking" interactive={false} />
          <span className="sticker hero-match">💘 100% match!</span>
        </div>
      </section>

      {stats && (
        <section className="stats" aria-label="Lost-It in numbers">
          <div className="card stat"><span className="stat-icon">📜</span><div><b>{stats.lost}</b><span>still missing</span></div></div>
          <div className="card stat"><span className="stat-icon">📦</span><div><b>{stats.found}</b><span>waiting in boxes</span></div></div>
          <div className="card stat"><span className="stat-icon">🎉</span><div><b>{stats.resolved}</b><span>returned to owners</span></div></div>
          <div className="card stat"><span className="stat-icon">🧑‍🎓</span><div><b>{stats.users}</b><span>students helping</span></div></div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Two rooms, one mission</h2>
            <p>Everything on Lost-It lives in one of these.</p>
          </div>
        </div>
        <div className="doors">
          <Link to="/found" className="card door door-found">
            <div className="door-art">
              {boxes.slice(0, 3).map((b) => <CrateBox key={b.id} box={b} size="mini" interactive={false} />)}
            </div>
            <div className="door-body">
              <span className="label">Door A</span>
              <h3>The Found Room 📦</h3>
              <p>{stats ? `${stats.found} found items` : "Found items"} sorted into boxes by category, waiting for their owners.</p>
              <span className="door-go">Open the boxes →</span>
            </div>
          </Link>
          <Link to="/wanted" className="card door door-wanted">
            <div className="door-art">
              {posters.slice(0, 2).map((p) => <WantedPoster key={p.id} item={p} as="div" size="mini" />)}
            </div>
            <div className="door-body">
              <span className="label">Door B</span>
              <h3>The Wanted Board 📜</h3>
              <p>{stats ? `${stats.lost} items` : "Items"} missing, with rewards on their heads. Recognise one?</p>
              <span className="door-go">See the posters →</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>How it works</h2></div>
        <div className="steps">
          {STEPS.map(([emoji, title, text]) => (
            <div key={title} className="card step">
              <span className="step-emoji">{emoji}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section cta-band">
        <div>
          <h2>Found something today? <span className="hand">Be a legend.</span></h2>
          <p>It takes 30 seconds to drop it in the Found Room.</p>
        </div>
        <Link to="/post?type=found" className="btn btn-lg">📦 Hand it in</Link>
      </section>
    </>
  );
}
