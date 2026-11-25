import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDate } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { caseNo } from "../components/FoundCard.jsx";

const TABS = [
  ["overview", "📊 Overview"],
  ["users", "👥 Users"],
  ["items", "🗂 Items"],
  ["lists", "🏷 Categories & places"],
];

/* ---------- Charts (plain HTML bars) ---------- */

function CategoryChart({ rows }) {
  const max = Math.max(1, ...rows.flatMap((r) => [r.lost, r.found]));
  return (
    <figure className="chart">
      <figcaption>Items reported, by category</figcaption>
      <div className="legend">
        <span><i className="swatch lost" /> Lost</span>
        <span><i className="swatch found" /> Found</span>
      </div>
      <div className="bars">
        {rows.map((r) => (
          <div className="bar-row" key={r.name} data-tip={`${r.name}: ${r.lost} lost · ${r.found} found`}>
            <span className="bar-label">{r.icon} {r.name}</span>
            <div className="bar-pair">
              <div className="bar-line">
                <span className="bar lost" style={{ width: `${(r.lost / max) * 100}%` }} />
                <span className="bar-value">{r.lost}</span>
              </div>
              <div className="bar-line">
                <span className="bar found" style={{ width: `${(r.found / max) * 100}%` }} />
                <span className="bar-value">{r.found}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <details className="table-view">
        <summary>View as table</summary>
        <table>
          <thead><tr><th>Category</th><th>Lost</th><th>Found</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.name}><td>{r.name}</td><td>{r.lost}</td><td>{r.found}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}

function HotspotChart({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  return (
    <figure className="chart">
      <figcaption>Hotspots: where things go missing or turn up</figcaption>
      <div className="bars">
        {rows.map((r) => (
          <div className="bar-row single" key={r.name} data-tip={`${r.name}: ${r.total} item(s)`}>
            <span className="bar-label">📍 {r.name}</span>
            <div className="bar-line">
              <span className="bar ink" style={{ width: `${(r.total / max) * 100}%` }} />
              <span className="bar-value">{r.total}</span>
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}

/* ---------- Tabs ---------- */

function Overview() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api("/admin/stats").then(setData).catch(() => {});
  }, []);
  if (!data) return <p className="dim">Loading the books…</p>;
  const t = data.totals;
  return (
    <>
      <div className="kpis">
        <div className="kpi"><b>{t.items}</b><span>items reported</span></div>
        <div className="kpi"><b>{t.return_rate}%</b><span>returned to owners</span></div>
        <div className="kpi"><b>{t.users}</b><span>accounts</span></div>
        <div className="kpi"><b>{t.blocked}</b><span>blocked</span></div>
        <div className="kpi"><b>{t.messages}</b><span>messages sent</span></div>
      </div>
      <div className="chart-grid">
        <CategoryChart rows={data.by_category} />
        <HotspotChart rows={data.hotspots} />
      </div>
    </>
  );
}

function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const load = () => api("/admin/users").then((d) => setUsers(d.users));
  useEffect(() => { load().catch(() => {}); }, []);

  async function change(u, body) {
    setError("");
    try {
      await api(`/admin/users/${u.id}`, { method: "PATCH", body });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table className="ledger-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Items</th><th>Joined</th><th>Status</th><th /></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={u.is_active ? "" : "row-blocked"}>
                <td><b>{u.name}</b></td>
                <td>{u.email}</td>
                <td><span className={`chip ${u.role}`}>{u.role}</span></td>
                <td>{u.items}</td>
                <td>{formatDate(u.created_at)}</td>
                <td>{u.is_active ? "Active" : "⛔ Blocked"}</td>
                <td className="actions">
                  {u.id === me.id ? <span className="dim">that's you</span> : (
                    <>
                      <button className="btn btn-xs btn-ghost-dark" onClick={() => change(u, { is_active: !u.is_active })}>
                        {u.is_active ? "Block" : "Unblock"}
                      </button>
                      <button className="btn btn-xs btn-ghost-dark" onClick={() => change(u, { role: u.role === "admin" ? "user" : "admin" })}>
                        {u.role === "admin" ? "Remove admin" : "Make admin"}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Items() {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("");
  const [q, setQ] = useState("");

  const load = () => {
    const params = new URLSearchParams({ status: "all", limit: "200" });
    if (type) params.set("type", type);
    if (q.trim()) params.set("q", q.trim());
    return api(`/items?${params}`).then((d) => setItems(d.items));
  };
  useEffect(() => { load().catch(() => {}); }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggle(item) {
    await api(`/items/${item.id}/status`, { method: "PATCH", body: { status: item.status === "open" ? "resolved" : "open" } });
    load();
  }
  async function remove(item) {
    if (!window.confirm(`Delete "${item.title}" for good? This can't be undone.`)) return;
    await api(`/items/${item.id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <form className="toolbar toolbar-paper" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input placeholder="Search titles & descriptions…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Lost & found</option>
          <option value="lost">Lost only</option>
          <option value="found">Found only</option>
        </select>
        <button className="btn btn-amber btn-sm">Search</button>
      </form>
      <div className="table-wrap">
        <table className="ledger-table">
          <thead><tr><th>No.</th><th>Item</th><th>Type</th><th>Reported by</th><th>Date</th><th>Status</th><th /></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td className="mono">{caseNo(i.id)}</td>
                <td><Link to={`/items/${i.id}`}>{i.category_icon} {i.title}</Link></td>
                <td><span className={`chip ${i.type}`}>{i.type}</span></td>
                <td>{i.owner_name}</td>
                <td>{formatDate(i.item_date)}</td>
                <td>{i.status === "open" ? "Open" : "✅ Closed"}</td>
                <td className="actions">
                  <button className="btn btn-xs btn-ghost-dark" onClick={() => toggle(i)}>{i.status === "open" ? "Close" : "Reopen"}</button>
                  <button className="btn btn-xs btn-danger" onClick={() => remove(i)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="dim center">No items match.</p>}
      </div>
    </>
  );
}

function LookupList({ title, table, rows, withIcon, reload }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState("");

  async function add(e) {
    e.preventDefault();
    setError("");
    try {
      await api(`/admin/${table}`, { method: "POST", body: withIcon ? { name, icon } : { name } });
      setName("");
      setIcon("");
      reload();
    } catch (err) {
      setError(err.message);
    }
  }
  async function remove(row) {
    setError("");
    try {
      await api(`/admin/${table}/${row.id}`, { method: "DELETE" });
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="lookup">
      <h3>{title}</h3>
      <ul>
        {rows.map((r) => (
          <li key={r.id}>
            <span>{r.icon} {r.name}</span>
            <button className="btn btn-xs btn-ghost-dark" onClick={() => remove(r)} aria-label={`Delete ${r.name}`}>✕</button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="lookup-add">
        {withIcon && <input required className="icon-input" maxLength={4} placeholder="🙂" value={icon} onChange={(e) => setIcon(e.target.value)} />}
        <input required placeholder={`New ${table === "categories" ? "category" : "place"}`} value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-amber btn-sm">Add</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

function Lists() {
  const [meta, setMeta] = useState({ categories: [], locations: [] });
  const load = () => api("/meta").then(setMeta).catch(() => {});
  useEffect(() => { load(); }, []);
  return (
    <div className="lookup-grid">
      <LookupList title="Categories (boxes)" table="categories" rows={meta.categories} withIcon reload={load} />
      <LookupList title="Campus places" table="locations" rows={meta.locations} reload={load} />
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("overview");
  return (
    <div className="desk">
      <div className="page-head">
        <div>
          <p className="kicker">Staff only</p>
          <h1 className="stencil">Office Manager's Desk</h1>
        </div>
      </div>
      <div className="desk-tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      <div className="desk-paper">
        {tab === "overview" && <Overview />}
        {tab === "users" && <Users />}
        {tab === "items" && <Items />}
        {tab === "lists" && <Lists />}
      </div>
    </div>
  );
}
