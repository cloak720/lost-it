import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, formatDate } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { confetti } from "../confetti.js";
import FoundCard, { caseNo } from "../components/FoundCard.jsx";
import WantedPoster from "../components/WantedPoster.jsx";
import MatchBadge from "../components/MatchBadge.jsx";

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setItem(null);
    setError("");
    api(`/items/${id}`).then((d) => setItem(d.item)).catch((e) => setError(e.message));
    api(`/items/${id}/matches`).then((d) => setMatches(d.matches)).catch(() => setMatches([]));
  }, [id]);

  if (error && !item) return <div className="empty"><span>🕵️</span>{error}</div>;
  if (!item) return <p className="center muted">Pulling the case file…</p>;

  const lost = item.type === "lost";
  const resolved = item.status === "resolved";
  const isOwner = user && user.id === item.user_id;
  const isAdmin = user && user.role === "admin";

  async function sendMessage(e) {
    e.preventDefault();
    setSending(true);
    try {
      await api("/messages", { method: "POST", body: { item_id: item.id, body: message } });
      navigate(`/messages?item=${item.id}&with=${item.user_id}`);
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  async function toggleStatus(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const d = await api(`/items/${item.id}/status`, { method: "PATCH", body: { status: resolved ? "open" : "resolved" } });
    setItem(d.item);
    if (d.item.status === "resolved") confetti(rect.left + rect.width / 2, rect.top);
  }

  async function remove() {
    if (!window.confirm("Take this item down for good? This can't be undone.")) return;
    await api(`/items/${item.id}`, { method: "DELETE" });
    navigate(isOwner ? "/my-items" : lost ? "/wanted" : "/found");
  }

  return (
    <>
      <div className={`scene ${lost ? "scene-wall" : "scene-room"}`}>
        <Link to={lost ? "/wanted" : `/found/${item.category_id}`} className="back">
          ← {lost ? "Back to the Wanted Board" : `Back to the ${item.category} box`}
        </Link>

        <div className="detail">
          <div className="detail-art">
            {lost ? <WantedPoster item={item} as="div" size="big" /> : <FoundCard item={item} as="div" size="big" />}
          </div>

          <article className={`card case ${item.type}`}>
            <div className="case-head">
              <span>{lost ? "📜 Missing item" : "📦 Found item"}</span>
              <span>Case No. {caseNo(item.id)}</span>
            </div>
            <div className="case-body">
              <h1>{item.title}</h1>
              <dl className="facts">
                <dt>Category</dt><dd>{item.category_icon} {item.category}</dd>
                <dt>{lost ? "Last seen" : "Found at"}</dt><dd>📍 {item.location}</dd>
                <dt>Date</dt><dd>{formatDate(item.item_date)}</dd>
                {lost && <><dt>Reward</dt><dd>💰 {item.reward || "Eternal gratitude"}</dd></>}
                <dt>Reported by</dt><dd>{isOwner ? "You" : item.owner_name}</dd>
                <dt>Status</dt><dd>{resolved ? <span className="chip good">✓ Returned</span> : <span className="chip">🔎 Open</span>}</dd>
              </dl>
              {item.description && <p className="note">{item.description}</p>}

              {(isOwner || isAdmin) && (
                <div className="case-actions">
                  {!isOwner && <span className="chip admin">★ Admin</span>}
                  <button className="btn btn-found" onClick={toggleStatus}>
                    {resolved ? "↺ Reopen" : "🎉 Mark as returned"}
                  </button>
                  <button className="btn btn-danger" onClick={remove}>Delete</button>
                </div>
              )}

              {!isOwner && !resolved && (
                user ? (
                  <form onSubmit={sendMessage} className="contact">
                    <h3>{lost ? "Seen it? Tell the owner 👋" : "Is this yours? Message the finder 👋"}</h3>
                    <textarea required maxLength={1000} rows={3} value={message} onChange={(e) => setMessage(e.target.value)}
                      aria-label="Your message"
                      placeholder={lost ? "Where did you see or find it?" : "Describe something only the owner would know…"} />
                    <button className="btn" disabled={sending}>{sending ? "Sending…" : "Send message →"}</button>
                    {error && <p className="error">{error}</p>}
                  </form>
                ) : (
                  <p className="login-hint">
                    <Link to="/login" state={{ from: `/items/${item.id}` }}>Log in</Link> to message {item.owner_name}.
                  </p>
                )
              )}
            </div>
          </article>
        </div>
      </div>

      {!resolved && (
        <section className="section">
          <div className="section-head">
            <div>
              <h2>{lost ? "Possible sightings in the Found Room" : "Wanted posters that might match"}</h2>
              <p>Scored on category, place, date and description.</p>
            </div>
          </div>
          {matches.length === 0 ? (
            <div className="empty"><span>🧐</span>No matches yet. They'll show up here as soon as one does.</div>
          ) : lost ? (
            <div className="found-grid">
              {matches.map((m) => <FoundCard key={m.item.id} item={m.item} extra={<MatchBadge match={m} />} />)}
            </div>
          ) : (
            <div className="poster-grid">
              {matches.map((m) => <WantedPoster key={m.item.id} item={m.item} extra={<MatchBadge match={m} />} />)}
            </div>
          )}
        </section>
      )}
    </>
  );
}
