/** The OHS monogram. The same drawing is used for the browser icon (app/icon.svg). */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="OHS" className="shrink-0">
      <defs>
        <linearGradient id="ohs-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5ee6c8" />
          <stop offset="1" stopColor="#8b7cff" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#0d1220" stroke="url(#ohs-g)" strokeWidth="3" />
      <text x="32" y="41" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="23" letterSpacing="-0.5" fill="url(#ohs-g)">
        OHS
      </text>
    </svg>
  );
}
