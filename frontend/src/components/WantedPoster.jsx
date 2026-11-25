import { Link } from "react-router-dom";
import { formatDate } from "../api.js";
import { caseNo } from "./FoundCard.jsx";

const TILTS = ["tilt-a", "tilt-b", "tilt-c", "tilt-d"];

/**
 * A lost item shown as an old bounty poster nailed to the wall.
 * as="div" renders it without a link (detail page, form preview, home page).
 */
export default function WantedPoster({ item, extra, as = "link", size = "" }) {
  const resolved = item.status === "resolved";
  const reward = item.reward || "Eternal gratitude";

  const body = (
    <>
      <span className="nail" aria-hidden="true" />
      <div className="wanted-paper">
        <div className="wanted-word">Wanted</div>
        <div className="wanted-sub">~ lost on campus ~</div>
        <div className="wanted-photo">
          {item.image_url ? <img src={item.image_url} alt={item.title} /> : <span>{item.category_icon}</span>}
        </div>
        <div className="wanted-name">{item.title}</div>
        <div className="wanted-seen">
          Last seen at <b>{item.location}</b>
          <br />on {formatDate(item.item_date)}
        </div>
        <div className="wanted-reward">
          <span>Reward</span>
          <strong className={reward.length > 10 ? "long" : ""}>{reward}</strong>
        </div>
        <div className="wanted-foot">Report sightings at the Lost-It office · No. {caseNo(item.id)}</div>
      </div>
      {resolved && <span className="stamp stamp-recovered">Recovered</span>}
      {extra}
    </>
  );

  const cls = `wanted ${TILTS[item.id % TILTS.length]} ${size} ${resolved ? "is-recovered" : ""}`;
  if (as === "div") return <div className={cls}>{body}</div>;
  return <Link to={`/items/${item.id}`} className={cls}>{body}</Link>;
}
