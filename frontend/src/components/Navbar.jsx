import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Refresh the unread-message badge whenever the page changes.
  useEffect(() => {
    if (!user) return setUnread(0);
    api("/messages/unread-count").then((d) => setUnread(d.count)).catch(() => {});
  }, [user, location.pathname]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link to="/" className="logo">
          <span className="logo-tape">Lost-It</span>
          <span className="logo-sub">lost &amp; found office</span>
        </Link>
        <nav className="nav">
          <NavLink to="/found">📦 Found Room</NavLink>
          <NavLink to="/wanted">📜 Wanted</NavLink>
          {user && (
            <>
              <NavLink to="/messages">
                ✉️ Messages{unread > 0 && <span className="badge-count">{unread}</span>}
              </NavLink>
              <NavLink to="/my-items">My stuff</NavLink>
              {user.role === "admin" && <NavLink to="/admin" className="nav-admin">★ Admin</NavLink>}
            </>
          )}
          {user ? (
            <>
              <Link to="/post" className="btn btn-amber btn-sm">+ Report</Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} title={user.email}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/register" className="btn btn-amber btn-sm">Get a pass</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
