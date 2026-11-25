import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate(location.state?.from || "/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="pass-wrap">
      <form className="pass" onSubmit={submit}>
        <span className="pass-clip" aria-hidden="true" />
        <div className="pass-head">
          <span>Lost-It Office</span>
          <b>New Pass</b>
        </div>
        <div className="pass-body">
          <label>Full name
            <input required value={form.name} onChange={update("name")} />
          </label>
          <label>College email
            <input type="email" required value={form.email} onChange={update("email")} />
          </label>
          <label>Phone (optional)
            <input value={form.phone} onChange={update("phone")} />
          </label>
          <label>Password
            <input type="password" required minLength={6} value={form.password} onChange={update("password")} />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-amber btn-block">Print my pass →</button>
          <p className="pass-foot">
            Already have one? <Link to="/login" state={location.state}>Swipe in</Link>
          </p>
        </div>
        <div className="pass-barcode" aria-hidden="true" />
      </form>
    </div>
  );
}
