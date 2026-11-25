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
          <span>Lost-It Office</span>
          <b>Visitor Pass</b>
        </div>
        <div className="pass-body">
          <div className="pass-photo" aria-hidden="true">🙂</div>
          <label>Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>Password
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-amber btn-block">Swipe in →</button>
          <p className="pass-foot">
            No pass yet? <Link to="/register" state={location.state}>Get one here</Link>
          </p>
        </div>
        <div className="pass-barcode" aria-hidden="true" />
      </form>
    </div>
  );
}
