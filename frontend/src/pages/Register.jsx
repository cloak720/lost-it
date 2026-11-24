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
    <div className="narrow auth">
      <h1>Create your account</h1>
      <form className="card form" onSubmit={submit}>
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
        <button className="btn btn-primary">Sign up</button>
        <p className="muted small center">
          Already have an account? <Link to="/login" state={location.state}>Log in</Link>
        </p>
      </form>
    </div>
  );
}
