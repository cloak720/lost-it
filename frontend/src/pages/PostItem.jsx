import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import FoundCard from "../components/FoundCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import WantedPoster from "../components/WantedPoster.jsx";

function today() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export default function PostItem() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [meta, setMeta] = useState({ categories: [], locations: [] });
  const [form, setForm] = useState({
    type: params.get("type") === "found" ? "found" : "lost",
    title: "",
    category_id: "",
    location_id: "",
    item_date: today(),
    description: "",
    reward: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/meta").then(setMeta).catch(() => {});
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function pickImage(e) {
    const file = e.target.files[0];
    setImage(file || null);
    setPreview(file ? URL.createObjectURL(file) : "");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (image) data.append("image", image);
    try {
      const res = await api("/items", { method: "POST", form: data });
      navigate(`/items/${res.item.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const lost = form.type === "lost";
  const category = meta.categories.find((c) => String(c.id) === form.category_id);
  const location = meta.locations.find((l) => String(l.id) === form.location_id);

  // A live preview of the poster / claim tag, built from what's typed so far.
  const draft = {
    id: 0,
    type: form.type,
    status: "open",
    title: form.title || (lost ? "Your lost item" : "The thing you found"),
    location: location?.name || "somewhere on campus",
    item_date: form.item_date || today(),
    reward: form.reward,
    category_icon: category?.icon || (lost ? "❓" : "📦"),
    image_url: preview || null,
  };

  return (
    <>
      <PageHeader
        kicker="Form LF-1 · takes 30 seconds"
        title={lost ? <>Report a <span className="hand">lost</span> item</> : <>Hand in a <span className="hand">found</span> item</>}
        subtitle="The more detail you add, the better the matches. Watch your poster or tag build itself on the right."
      />

      <div className="post-grid">
        <form className="card form-card" onSubmit={submit}>
          <div className="type-switch" role="radiogroup" aria-label="What happened?">
            <button type="button" role="radio" aria-checked={lost} className={lost ? "active lost" : ""} onClick={() => setForm({ ...form, type: "lost" })}>
              <span className="emoji">😭</span> I lost something
              <small>Put up a Wanted poster</small>
            </button>
            <button type="button" role="radio" aria-checked={!lost} className={!lost ? "active found" : ""} onClick={() => setForm({ ...form, type: "found" })}>
              <span className="emoji">🙌</span> I found something
              <small>Drop it in a Found Room box</small>
            </button>
          </div>

          <label>What is it?
            <input required minLength={3} maxLength={120} value={form.title} onChange={update("title")}
              placeholder={lost ? "e.g. Black JBL earphones" : "e.g. Blue water bottle"} />
          </label>

          <div className="form-row">
            <label>Category
              <select required value={form.category_id} onChange={update("category_id")}>
                <option value="">Choose…</option>
                {meta.categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </label>
            <label>{lost ? "Last seen at" : "Found at"}
              <select required value={form.location_id} onChange={update("location_id")}>
                <option value="">Choose…</option>
                {meta.locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>{lost ? "Date lost" : "Date found"}
              <input type="date" required max={today()} value={form.item_date} onChange={update("item_date")} />
            </label>
            {lost && (
              <label>Reward (optional)
                <input maxLength={60} value={form.reward} onChange={update("reward")} placeholder="₹200, a coffee, notes…" />
              </label>
            )}
          </div>

          <label>Description
            <textarea rows={4} value={form.description} onChange={update("description")}
              placeholder="Colour, brand, stickers, what was inside… More detail means better matches." />
          </label>

          <label>Photo (optional)
            <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={pickImage} />
          </label>

          {error && <p className="error">{error}</p>}
          <button className={`btn btn-lg ${lost ? "btn-lost" : "btn-found"}`} disabled={saving}>
            {saving ? "Filing…" : lost ? "📌 Nail the poster up" : "📦 Put it in the box"}
          </button>
        </form>

        <aside className={`preview-stage ${form.type}`} aria-label="Live preview">
          <span className="label">Live preview</span>
          {lost ? <WantedPoster item={draft} as="div" /> : <FoundCard item={draft} as="div" />}
        </aside>
      </div>
    </>
  );
}
