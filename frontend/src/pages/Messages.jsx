import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, timeAgo } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

// Group flat messages into chats: one chat per (item, other person).
function groupChats(messages, myId) {
  const chats = {};
  for (const m of messages) {
    const mine = m.sender_id === myId;
    const otherId = mine ? m.receiver_id : m.sender_id;
    const key = `${m.item_id}-${otherId}`;
    chats[key] ??= {
      key,
      itemId: m.item_id,
      itemTitle: m.item_title,
      itemType: m.item_type,
      otherId,
      otherName: mine ? m.receiver_name : m.sender_name,
      messages: [],
      unread: 0,
    };
    chats[key].messages.push(m);
    if (!mine && !m.is_read) chats[key].unread += 1;
  }
  return Object.values(chats).sort(
    (a, b) => new Date(b.messages.at(-1).created_at) - new Date(a.messages.at(-1).created_at)
  );
}

export default function Messages() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [messages, setMessages] = useState(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  const load = () => api("/messages").then((d) => setMessages(d.messages));
  useEffect(() => {
    load().catch(() => setMessages([]));
  }, []);

  const chats = useMemo(() => groupChats(messages || [], user.id), [messages, user.id]);
  const selectedKey = params.get("item") && params.get("with") ? `${params.get("item")}-${params.get("with")}` : chats[0]?.key;
  const chat = chats.find((c) => c.key === selectedKey);

  // Mark the open chat as read.
  useEffect(() => {
    if (chat && chat.unread > 0) {
      api("/messages/read", { method: "POST", body: { item_id: chat.itemId, other_id: chat.otherId } })
        .then(load)
        .catch(() => {});
    }
  }, [chat?.key, chat?.unread]);

  async function send(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/messages", {
        method: "POST",
        body: { item_id: chat.itemId, receiver_id: chat.otherId, body: reply },
      });
      setReply("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!messages) return <p className="muted center">Loading…</p>;
  if (chats.length === 0) {
    return (
      <>
        <h1>Messages</h1>
        <div className="empty"><span>📭</span>No messages yet. Open any item on the board to start a chat.</div>
      </>
    );
  }

  return (
    <>
      <h1>Messages</h1>
      <div className="chat-layout">
        <aside className="card chat-list">
          {chats.map((c) => (
            <button
              key={c.key}
              className={`chat-row ${c.key === selectedKey ? "active" : ""}`}
              onClick={() => setParams({ item: c.itemId, with: c.otherId })}
            >
              <div className="chat-row-top">
                <strong>{c.otherName}</strong>
                {c.unread > 0 && <span className="badge-count">{c.unread}</span>}
              </div>
              <span className="small muted">
                {c.itemType === "lost" ? "Lost" : "Found"}: {c.itemTitle}
              </span>
            </button>
          ))}
        </aside>

        {chat ? (
          <section className="card chat">
            <div className="chat-head">
              <strong>{chat.otherName}</strong>
              <Link to={`/items/${chat.itemId}`} className="small">about “{chat.itemTitle}” →</Link>
            </div>
            <div className="chat-body">
              {chat.messages.map((m) => (
                <div key={m.id} className={`bubble ${m.sender_id === user.id ? "me" : "them"}`}>
                  <p>{m.body}</p>
                  <span>{timeAgo(m.created_at)}</span>
                </div>
              ))}
            </div>
            <form className="chat-form" onSubmit={send}>
              <input required maxLength={1000} placeholder="Write a reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
              <button className="btn btn-primary">Send</button>
            </form>
            {error && <p className="error">{error}</p>}
          </section>
        ) : (
          <p className="muted">Select a conversation.</p>
        )}
      </div>
    </>
  );
}
