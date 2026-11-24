import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, formatDate } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import ItemCard, { ItemImage } from "../components/ItemCard.jsx";

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
  if (!item) return <p className="muted center">Loading…</p>;

  const isOwner = user && user.id === item.user_id;
  const lost = item.type === "lost";
  const resolved = item.status === "resolved";

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

  async function toggleStatus() {
    const status = resolved ? "open" : "resolved";
    const d = await api(`/items/${item.id}/status`, { method: "PATCH", body: { status } });
    setItem(d.item);
  }

  async function remove() {
    if (!window.confirm("Take this item off the board for good?")) return;
    await api(`/items/${item.id}`, { method: "DELETE" });
    navigate("/my-items");
  }

  return (
    <>
      <Link to="/browse" className="back">← Back to the board</Link>

      <div className="detail">
        <div className={`polaroid ${resolved ? "is-resolved" : ""}`}>
          <span className="tape" aria-hidden="true" />
          <div className="photo">
            <ItemImage item={item} className="detail-img" />
            {resolved && <span className="returned-stamp">Returned ✓</span>}
          </div>
          <p className="caption">{item.category_icon} {item.title}</p>
        </div>

        <div className={`poster poster-${item.type}`}>
          <div className="poster-head">{lost ? "Missing" : "Found"}</div>
          <div className="poster-body">
            <h1>{item.title}</h1>
            <dl className="facts">
              <dt>What</dt><dd>{item.category_icon} {item.category}</dd>
              <dt>Where</dt><dd>📍 {item.location}</dd>
              <dt>{lost ? "Lost on" : "Found on"}</dt><dd>{formatDate(item.item_date)}</dd>
              <dt>Pinned by</dt><dd>{isOwner ? "You" : item.owner_name}</dd>
              <dt>Status</dt><dd>{resolved ? "✅ Back with its owner" : "🔎 Still looking"}</dd>
            </dl>
            {item.description && <p className="description">{item.description}</p>}

            {isOwner ? (
              <div className="owner-actions">
                <button className="btn btn-found" onClick={toggleStatus}>
                  {resolved ? "↺ Reopen item" : "🎉 Mark as returned"}
                </button>
                <button className="btn btn-danger" onClick={remove}>Delete</button>
              </div>
            ) : !resolved && (
              user ? (
                <form onSubmit={sendMessage} className="contact">
                  <label>{lost ? "Found it? Tell them 👋" : "Is this yours? Message the finder 👋"}</label>
                  <textarea
                    required
                    maxLength={1000}
                    rows={3}
                    placeholder={lost ? "Where did you find it? Where can they pick it up?" : "Describe something only the owner would know…"}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button className="btn btn-primary" disabled={sending}>
                    {sending ? "Sending…" : "Send message →"}
                  </button>
                  {error && <p className="error">{error}</p>}
                </form>
              ) : (
                <p className="login-hint">
                  <Link to="/login" state={{ from: `/items/${item.id}` }}>Log in</Link> to message {item.owner_name} ✉️
                </p>
              )
            )}
          </div>
        </div>
      </div>

      {!resolved && (
        <section>
          <div className="section-head">
            <h2><span className="highlight">{lost ? "Could it be one of these?" : "Who might own this?"}</span></h2>
          </div>
          <p className="page-sub">matched on category, place, date &amp; description</p>
          {matches.length === 0 ? (
            <div className="empty"><span>🧐</span>No matches yet. We'll pin them here as soon as one turns up.</div>
          ) : (
            <div className="grid">
              {matches.map((m) => (
                <ItemCard
                  key={m.item.id}
                  item={m.item}
                  extra={
                    <div className="match">
                      <div className={`match-score ${m.score >= 85 ? "hot" : ""}`}>
                        <b>{m.score}%</b>
                        <span>match</span>
                      </div>
                      <ul>{m.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
