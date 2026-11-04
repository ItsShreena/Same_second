import React from 'react';

interface SameSecondLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

/**
 * SameSecondIcon - Distinctive logo combining:
 * 1. A classic cricket ball (seam curvature & stitched thread detailing)
 * 2. A subtle synchronization/timing motif (outer orbital chronometer arc & 12 o'clock sync pulse)
 * Rendered using the core Indian sports-tech blue (#1769AA, #0B4F83) & crisp white palette.
 */
export const SameSecondIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Same Second Cricket Sync Logo"
    >
      <defs>
        {/* Cricket Ball Core Gradient */}
        <linearGradient id="ssCricketBall" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E78C2" />
          <stop offset="50%" stopColor="#1769AA" />
          <stop offset="100%" stopColor="#0B4F83" />
        </linearGradient>

        {/* Sync Ring Gradient */}
        <linearGradient id="ssSyncRing" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="60%" stopColor="#1769AA" />
          <stop offset="100%" stopColor="#0B4F83" />
        </linearGradient>

        {/* Gloss Highlight */}
        <linearGradient id="ssGloss" x1="12" y1="6" x2="28" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer Chronometer / Synchronization Orbital Ring (Timing Motif) */}
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="url(#ssSyncRing)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeDasharray="80 18"
        className="opacity-90"
      />

      {/* Precision 1-Second Sync Marker at 12 o'clock */}
      <circle cx="20" cy="2" r="1.75" fill="#1769AA" stroke="#FFFFFF" strokeWidth="1" />

      {/* Clockwise Timing Ticks (Synchronized second calibration) */}
      <line x1="20" y1="3.5" x2="20" y2="6.5" stroke="#FFFFFF" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="36.5" y1="20" x2="33.5" y2="20" stroke="#1769AA" strokeWidth="1.25" strokeLinecap="round" opacity="0.6" />
      <line x1="3.5" y1="20" x2="6.5" y2="20" stroke="#1769AA" strokeWidth="1.25" strokeLinecap="round" opacity="0.6" />

      {/* Cricket Ball Body */}
      <circle cx="20" cy="20" r="14.5" fill="url(#ssCricketBall)" />

      {/* Subtle Ball Highlight */}
      <ellipse cx="16" cy="12" rx="7" ry="3.5" fill="url(#ssGloss)" transform="rotate(-25 16 12)" />

      {/* Classic Curved Cricket Ball Seam */}
      {/* Dynamic S-curve traversing through the ball */}
      <path
        d="M 9.5 28.5 C 13.5 22 17 18 20 20 C 23 22 26.5 18 30.5 11.5"
        stroke="#FFFFFF"
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Precision Cricket Ball Stitches across the Seam */}
      <g stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" opacity="0.95">
        {/* Stitch 1 */}
        <line x1="10.8" y1="24.8" x2="13.2" y2="26.8" />
        {/* Stitch 2 */}
        <line x1="13.2" y1="21.5" x2="15.8" y2="23.2" />
        {/* Stitch 3 */}
        <line x1="16.2" y1="18.8" x2="18.5" y2="20.5" />
        {/* Center Key Stitch */}
        <line x1="19.5" y1="18.2" x2="20.5" y2="21.8" />
        {/* Stitch 4 */}
        <line x1="21.8" y1="19.2" x2="24.2" y2="21.0" />
        {/* Stitch 5 */}
        <line x1="24.5" y1="16.5" x2="27.0" y2="18.2" />
        {/* Stitch 6 */}
        <line x1="27.2" y1="13.2" x2="29.5" y2="15.2" />
      </g>

      {/* Central Sync Pulse Dot (The 'Same Second' exact lock) */}
      <circle cx="20" cy="20" r="1.5" fill="#FFFFFF" />
    </svg>
  );
};

export const SameSecondLogo: React.FC<SameSecondLogoProps> = ({
  size = 32,
  className = '',
  showWordmark = true,
  wordmarkClassName = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <SameSecondIcon size={size} />
      {showWordmark && (
        <span
          className={`font-black tracking-tight text-[#111111] leading-none ${
            wordmarkClassName || 'text-base sm:text-lg'
          }`}
        >
          Same <span className="text-[#1769AA]">Second</span>
        </span>
      )}
    </div>
  );
};
