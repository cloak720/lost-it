import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api.js";

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
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/meta").then(setMeta).catch(() => {});
  }, []);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

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

  return (
    <div className="narrow">
      <h1>Report an item</h1>
      <form className="card form" onSubmit={submit}>
        <div className="type-toggle">
          <button type="button" className={lost ? "active lost" : ""} onClick={() => setForm({ ...form, type: "lost" })}>
            😟 I lost something
          </button>
          <button type="button" className={!lost ? "active found" : ""} onClick={() => setForm({ ...form, type: "found" })}>
            🙌 I found something
          </button>
        </div>

        <label>What is it?
          <input required minLength={3} maxLength={120} value={form.title} onChange={update("title")}
            placeholder={lost ? "e.g. Black JBL earphones" : "e.g. Blue water bottle"} />
        </label>

        <div className="row">
          <label>Category
            <select required value={form.category_id} onChange={update("category_id")}>
              <option value="">Choose…</option>
              {meta.categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </label>
          <label>{lost ? "Where did you lose it?" : "Where did you find it?"}
            <select required value={form.location_id} onChange={update("location_id")}>
              <option value="">Choose…</option>
              {meta.locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </label>
        </div>

        <label>{lost ? "Date lost" : "Date found"}
          <input type="date" required max={today()} value={form.item_date} onChange={update("item_date")} />
        </label>

        <label>Description
          <textarea rows={4} value={form.description} onChange={update("description")}
            placeholder="Colour, brand, marks, what was inside… (the more detail, the better the matches)" />
        </label>

        <label>Photo (optional)
          <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={pickImage} />
        </label>
        {preview && <img src={preview} alt="Preview" className="preview" />}

        {error && <p className="error">{error}</p>}
        <button className={`btn ${lost ? "btn-lost" : "btn-found"}`} disabled={saving}>
          {saving ? "Posting…" : "Post item & find matches"}
        </button>
      </form>
    </div>
  );
}
