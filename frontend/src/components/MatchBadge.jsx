// The score + reasons shown under a suggested match.
export default function MatchBadge({ match }) {
  return (
    <div className="match">
      <span className={`match-score ${match.score >= 85 ? "hot" : ""}`}>
        <b>{match.score}%</b>
        <small>match</small>
      </span>
      <ul>{match.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
    </div>
  );
}
