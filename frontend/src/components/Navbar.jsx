import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";
import ThemeToggle from "./ThemeToggle.jsx";

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

  const isAdmin = user?.role === "admin";
  const badge = unread > 0 && <span className="badge-count">{unread}</span>;

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="logo" aria-label="Lost-It home">
            <span className="logo-tape">Lost-It</span>
            <span className="logo-sub">campus lost<br />&amp; found</span>
          </Link>

          <nav className="nav-links" aria-label="Main">
            <NavLink to="/found">📦 Found Room</NavLink>
            <NavLink to="/wanted">📜 Wanted</NavLink>
            {user && <NavLink to="/messages">💬 Messages {badge}</NavLink>}
            {user && <NavLink to="/my-items">🎒 My stuff</NavLink>}
            {isAdmin && <NavLink to="/admin" className="nav-admin">★ Admin</NavLink>}
          </nav>

          <div className="nav-right">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/post" className="btn btn-sm nav-report">+ Report</Link>
                {isAdmin && <Link to="/admin" className="btn btn-sm nav-admin-mobile" aria-label="Admin desk">★</Link>}
                <Link
                  to="/my-items"
                  className={`avatar ${isAdmin ? "is-admin" : ""}`}
                  title={`${user.name}${isAdmin ? " (admin)" : ""}: my stuff`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Link>
                <button className="btn btn-outline btn-sm" onClick={handleLogout} aria-label="Log out">
                  <span aria-hidden="true">⏻</span>
                  <span className="nav-logout-text">Log out</span>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-outline btn-sm">Log in</NavLink>
                <Link to="/register" className="btn btn-sm">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* phone-sized screens get an app-style tab bar at the bottom */}
      <nav className="tabbar" aria-label="Main (mobile)">
        <NavLink to="/" end><span className="tab-icon">🏠</span>Home</NavLink>
        <NavLink to="/found"><span className="tab-icon">📦</span>Found</NavLink>
        <NavLink to="/post" className="tab-report"><span className="tab-icon">+</span>Report</NavLink>
        <NavLink to="/wanted"><span className="tab-icon">📜</span>Wanted</NavLink>
        <NavLink to={user ? "/messages" : "/login"}><span className="tab-icon">💬</span>Chats{badge}</NavLink>
      </nav>
    </>
  );
}
