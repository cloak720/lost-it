import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import FoundCard from "../components/FoundCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import WantedPoster from "../components/WantedPoster.jsx";

export default function MyItems() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);

  useEffect(() => {
    api("/items/mine").then((d) => setItems(d.items)).catch(() => setItems([]));
  }, []);

  const lost = (items || []).filter((i) => i.type === "lost");
  const found = (items || []).filter((i) => i.type === "found");
  const returned = (items || []).filter((i) => i.status === "resolved").length;

  return (
    <>
      <PageHeader
        kicker={`Hey ${user.name.split(" ")[0]} 👋`}
        title={<>My <span className="hand">stuff</span></>}
        subtitle={items ? `${items.length} reported · ${returned} returned` : "Fetching your files…"}
        actions={<Link to="/post" className="btn">+ Report something</Link>}
      />

      {items && items.length === 0 && <div className="empty"><span>🫙</span>Nothing reported yet. Lucky you!</div>}

      {lost.length > 0 && (
        <section className="scene scene-wall">
          <div className="section-head"><h2>My Wanted posters ({lost.length})</h2></div>
          <div className="poster-grid">{lost.map((i) => <WantedPoster key={i.id} item={i} />)}</div>
        </section>
      )}

      {found.length > 0 && (
        <section className="scene scene-room">
          <div className="section-head"><h2>Things I handed in ({found.length})</h2></div>
          <div className="found-grid">{found.map((i) => <FoundCard key={i.id} item={i} />)}</div>
        </section>
      )}
    </>
  );
}
