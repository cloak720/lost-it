import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, formatDate } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import ItemCard, { ItemImage, TypeBadge } from "../components/ItemCard.jsx";

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

  if (error) return <p className="error center">{error}</p>;
  if (!item) return <p className="muted center">Loading…</p>;

  const isOwner = user && user.id === item.user_id;

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
    const status = item.status === "open" ? "resolved" : "open";
    const d = await api(`/items/${item.id}/status`, { method: "PATCH", body: { status } });
    setItem(d.item);
  }

  async function remove() {
    if (!window.confirm("Delete this item permanently?")) return;
    await api(`/items/${item.id}`, { method: "DELETE" });
    navigate("/my-items");
  }

  const opposite = item.type === "lost" ? "found" : "lost";

  return (
    <>
      <Link to="/browse" className="muted small">← Back to browse</Link>
      <div className="detail">
        <ItemImage item={item} className="detail-img" />
        <div className="card detail-info">
          <div className="item-tags">
            <TypeBadge type={item.type} />
            <span className={`tag ${item.status === "open" ? "tag-open" : "tag-resolved"}`}>
              {item.status === "open" ? "Open" : "Returned"}
            </span>
          </div>
          <h1>{item.title}</h1>
          <dl className="facts">
            <dt>Category</dt><dd>{item.category_icon} {item.category}</dd>
            <dt>Location</dt><dd>📍 {item.location}</dd>
            <dt>{item.type === "lost" ? "Lost on" : "Found on"}</dt><dd>{formatDate(item.item_date)}</dd>
            <dt>Posted by</dt><dd>{item.owner_name}</dd>
          </dl>
          {item.description && <p className="description">{item.description}</p>}

          {isOwner ? (
            <div className="owner-actions">
              <button className="btn btn-primary" onClick={toggleStatus}>
                {item.status === "open" ? "✓ Mark as returned" : "Reopen item"}
              </button>
              <button className="btn btn-danger" onClick={remove}>Delete</button>
            </div>
          ) : item.status === "open" && (
            user ? (
              <form onSubmit={sendMessage} className="contact">
                <label>
                  {item.type === "found" ? "Is this yours? Message the finder" : "Found it? Message the owner"}
                </label>
                <textarea
                  required
                  maxLength={1000}
                  rows={3}
                  placeholder="Describe a detail only the owner would know, or where to meet…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button className="btn btn-primary" disabled={sending}>
                  {sending ? "Sending…" : "Send message"}
                </button>
              </form>
            ) : (
              <p className="muted"><Link to="/login" state={{ from: `/items/${item.id}` }}>Log in</Link> to contact {item.owner_name}.</p>
            )
          )}
        </div>
      </div>

      {item.status === "open" && (
        <section>
          <h2>Possible matches</h2>
          <p className="muted small">
            {opposite === "found" ? "Found" : "Lost"} items that look similar, scored by category, place, date and description.
          </p>
          {matches.length === 0 ? (
            <p className="muted">No matches yet. We'll show them here as soon as someone posts a similar item.</p>
          ) : (
            <div className="grid">
              {matches.map((m) => (
                <ItemCard
                  key={m.item.id}
                  item={m.item}
                  extra={
                    <div className="match">
                      <div className="match-bar"><div style={{ width: `${m.score}%` }} /></div>
                      <strong>{m.score}% match</strong>
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
