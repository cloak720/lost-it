// The same header arrangement on every page: kicker, title, subtitle, actions.
export default function PageHeader({ kicker, title, subtitle, actions, center = false }) {
  return (
    <header className={`page-header ${center ? "center" : ""}`}>
      <div className="ph-text">
        {kicker && <p className="label ph-kicker">{kicker}</p>}
        <h1 className="ph-title">{title}</h1>
        {subtitle && <p className="ph-sub">{subtitle}</p>}
      </div>
      {actions && <div className="ph-actions">{actions}</div>}
    </header>
  );
}
