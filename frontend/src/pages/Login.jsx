import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
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
          <span>Lost-It · Campus</span>
          <b>Student Pass</b>
        </div>
        <div className="pass-body">
          <div className="pass-photo" aria-hidden="true">🧑‍🎓</div>
          <label>College email
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>Password
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-block">Swipe in →</button>
          <button type="button" className="btn btn-outline btn-xs pass-demo"
            onClick={() => { setEmail("asha@campus.edu"); setPassword("demo1234"); }}>
            Fill in a demo student
          </button>
          <p className="pass-foot">
            No pass yet? <Link to="/register" state={location.state}>Get one here</Link>
          </p>
        </div>
        <div className="pass-barcode" aria-hidden="true" />
      </form>
    </div>
  );
}
