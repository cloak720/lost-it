import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import FoundRoom from "./pages/FoundRoom.jsx";
import FoundBox from "./pages/FoundBox.jsx";
import WantedBoard from "./pages/WantedBoard.jsx";
import ItemDetail from "./pages/ItemDetail.jsx";
import PostItem from "./pages/PostItem.jsx";
import MyItems from "./pages/MyItems.jsx";
import Messages from "./pages/Messages.jsx";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function RequireLogin({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="center dim">Checking your pass…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (admin && user.role !== "admin") {
    return <div className="empty"><span>🚫</span>Staff only. This door is for admins.</div>;
  }
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/found" element={<FoundRoom />} />
          <Route path="/found/:cat" element={<FoundBox />} />
          <Route path="/wanted" element={<WantedBoard />} />
          <Route path="/browse" element={<Navigate to="/wanted" replace />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/post" element={<RequireLogin><PostItem /></RequireLogin>} />
          <Route path="/my-items" element={<RequireLogin><MyItems /></RequireLogin>} />
          <Route path="/messages" element={<RequireLogin><Messages /></RequireLogin>} />
          <Route path="/admin" element={<RequireLogin admin><Admin /></RequireLogin>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<div className="empty"><span>🗺️</span>This page got lost too. Try the Found Room?</div>} />
        </Routes>
      </main>
      <footer className="footer">
        <span>Lost-It · Campus Lost &amp; Found Office</span>
        <span>Please leave items exactly where you found them. Just kidding, bring them in.</span>
      </footer>
    </>
  );
}
