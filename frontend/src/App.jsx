import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import ItemDetail from "./pages/ItemDetail.jsx";
import PostItem from "./pages/PostItem.jsx";
import MyItems from "./pages/MyItems.jsx";
import Messages from "./pages/Messages.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function RequireLogin({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="muted center">Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/post" element={<RequireLogin><PostItem /></RequireLogin>} />
          <Route path="/my-items" element={<RequireLogin><MyItems /></RequireLogin>} />
          <Route path="/messages" element={<RequireLogin><Messages /></RequireLogin>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<p className="muted center">Page not found.</p>} />
        </Routes>
      </main>
      <footer className="footer">Lost-It · Campus Lost &amp; Found Portal</footer>
    </>
  );
}
