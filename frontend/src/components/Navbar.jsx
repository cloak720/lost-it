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
    api("/messages/unread-count")
      .then((d) => setUnread(d.count))
      .catch(() => {});
  }, [user, location.pathname]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">🔍</span> Lost-It
        </Link>
        <nav className="nav-links">
          <NavLink to="/browse">Browse</NavLink>
          {user ? (
            <>
              <NavLink to="/my-items">My items</NavLink>
              <NavLink to="/messages">
                Messages {unread > 0 && <span className="badge-count">{unread}</span>}
              </NavLink>
              <Link to="/post" className="btn btn-primary btn-sm">+ Report item</Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} title={user.email}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
