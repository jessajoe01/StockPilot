// This is the left-side navy panel shared by both Login and Register pages.
// It contains the StockPilot branding and the signature "flight path" graphic,
// which doubles as a visual metaphor for stock moving through checkpoints.

export default function AuthBrandPanel() {
  return (
    <div className="auth-brand-panel">
      <div className="auth-brand-logo-row">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14.5" stroke="#E8A93D" strokeWidth="1.4" opacity="0.5" />
          <path d="M8 20 Q14 9 24 12" stroke="#E8A93D" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="24" cy="12" r="2.2" fill="#E8A93D" />
        </svg>
        <div className="auth-brand-wordmark">
          Stock<span>Pilot</span>
        </div>
      </div>

      <div className="auth-brand-content">
        <div className="auth-brand-eyebrow">Inventory &amp; Order Management</div>
        <h1 className="auth-brand-headline">
          Every item, every order, <span className="accent">on course</span>.
        </h1>
        <p className="auth-brand-subtext">
          Track stock, manage orders, and stay ahead of shortages —
          all from one place built for how your business actually runs.
        </p>

        <ul className="auth-brand-features">
          <li>Real-time stock levels</li>
          <li>End-to-end order tracking</li>
          <li>Automatic low-stock alerts</li>
        </ul>
      </div>

      <div className="auth-brand-footer">StockPilot © 2026</div>

      {/* Signature graphic: a dashed route line with checkpoint nodes and a moving dot */}
      <svg className="auth-flight-path" viewBox="0 0 640 340" preserveAspectRatio="xMidYMax slice">
        <path
          className="path-line"
          d="M -20,280 C 100,220 180,300 300,240 C 420,180 500,260 620,200"
        />
        <circle className="path-node dim" cx="-20" cy="280" r="4" />
        <circle className="path-node" cx="180" cy="270" r="4" />
        <circle className="path-node dim" cx="300" cy="240" r="4" />
        <circle className="path-node" cx="460" cy="215" r="4" />
        <circle className="path-node dim" cx="620" cy="200" r="4" />
        <circle className="path-dot" r="5" />
      </svg>
    </div>
  );
}