/** Subtle landscape illustration for dashboard welcome — professional, not playful. */
export default function DashboardScene() {
  return (
    <svg
      className="dashboard-scene"
      viewBox="0 0 320 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d6efe2" />
          <stop offset="100%" stopColor="#f0faf4" />
        </linearGradient>
      </defs>
      <rect width="320" height="120" fill="url(#sky)" rx="16" />
      <ellipse cx="260" cy="28" rx="24" ry="24" fill="#fff8e1" opacity=".9" />
      <path
        d="M0 85 Q80 55 160 75 T320 70 L320 120 L0 120 Z"
        fill="#74c99a"
        opacity=".5"
      />
      <path
        d="M0 95 Q100 72 200 88 T320 82 L320 120 L0 120 Z"
        fill="#2e8b57"
        opacity=".35"
      />
      <path d="M40 70 L55 40 L70 70 Z" fill="#1a5c38" opacity=".7" />
      <path d="M90 78 L108 48 L126 78 Z" fill="#237048" opacity=".8" />
      <path d="M200 75 L218 42 L236 75 Z" fill="#1a5c38" opacity=".65" />
      <path d="M250 80 L262 58 L274 80 Z" fill="#4caf7d" opacity=".7" />
      <ellipse cx="55" cy="108" rx="18" ry="6" fill="#0d3320" opacity=".08" />
      <ellipse cx="215" cy="108" rx="22" ry="6" fill="#0d3320" opacity=".08" />
      <circle cx="48" cy="62" r="3" fill="#a8e0bf" />
      <circle cx="230" cy="55" r="2.5" fill="#a8e0bf" />
    </svg>
  );
}
