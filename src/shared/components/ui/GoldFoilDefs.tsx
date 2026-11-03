// The gradient that `gold-foil-svg` / `gold-foil-fill` (globals.css) point at
// with url(#gold-foil). Rendered once in the root layout; the stops read the
// --gold-* tokens, so the foil follows the light/dark theme.
export function GoldFoilDefs() {
  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      focusable="false"
      style={{ position: "absolute" }}
    >
      <defs>
        <linearGradient id="gold-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--gold-shadow)" }} />
          <stop offset="25%" style={{ stopColor: "var(--gold-deep)" }} />
          <stop offset="47%" style={{ stopColor: "var(--gold-highlight)" }} />
          <stop offset="60%" style={{ stopColor: "var(--gold-base)" }} />
          <stop offset="100%" style={{ stopColor: "var(--gold-shadow)" }} />
        </linearGradient>
      </defs>
    </svg>
  );
}
