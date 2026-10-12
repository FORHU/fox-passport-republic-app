"use client";

import { useId } from "react";

const INK = { red: "var(--stamp-red)", blue: "var(--stamp-blue)" } as const;

/**
 * A circular passport stamp: double ring, text running round the edge, a word
 * in the middle. A turbulence filter roughens the edge so it reads as ink
 * pressed into the page, not a vector badge. Its ink follows the theme.
 */
export function Stamp({
  label,
  center,
  sub,
  ink = "red",
  className,
  style,
}: {
  label: string;
  center: string;
  sub?: string;
  ink?: keyof typeof INK;
  className?: string;
  style?: React.CSSProperties;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ color: INK[ink], ...style }}
      aria-hidden
    >
      <defs>
        <filter id={`r${uid}`}>
          <feTurbulence baseFrequency="0.85" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" />
        </filter>
        <path
          id={`p${uid}`}
          d="M 50,50 m -33,0 a 33,33 0 1,1 66,0 a 33,33 0 1,1 -66,0"
        />
      </defs>
      <g filter={`url(#r${uid})`} fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="47" strokeWidth="2.4" />
        <circle cx="50" cy="50" r="42" strokeWidth="0.9" />
        <circle cx="50" cy="50" r="23" strokeWidth="0.9" />
        <text
          fill="currentColor"
          stroke="none"
          fontSize="8.6"
          fontWeight="800"
          letterSpacing="2.2"
          fontFamily="Archivo, system-ui, sans-serif"
        >
          <textPath href={`#p${uid}`} startOffset="0">
            {label.toUpperCase()}
          </textPath>
        </text>
        <text
          x="50"
          y={sub ? 49 : 54}
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
          fontSize={center.length > 6 ? 8 : 10.5}
          fontWeight="900"
          fontFamily="Archivo, system-ui, sans-serif"
          letterSpacing="0.6"
        >
          {center.toUpperCase()}
        </text>
        {sub && (
          <text
            x="50"
            y="60"
            textAnchor="middle"
            fill="currentColor"
            stroke="none"
            fontSize="5.4"
            fontWeight="700"
            fontFamily="Space Mono, ui-monospace, monospace"
            letterSpacing="0.8"
          >
            {sub.toUpperCase()}
          </text>
        )}
      </g>
    </svg>
  );
}
