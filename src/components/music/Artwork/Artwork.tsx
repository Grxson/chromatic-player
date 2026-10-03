import { type CSSProperties, useMemo } from "react";
import { Music2 } from "lucide-react";
import { artworkFor, type MockArtworkSeed } from "@/mocks/artwork/artwork";

export interface ArtworkProps {
  /** Optional image URL. When provided the component renders an <img>. */
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
  /**
   * Seed used to derive the fallback SVG gradient. Defaults to the album
   * id-style key derived from `alt`. When `src` is provided the seed is
   * ignored.
   */
  seedKey?: string;
}

const roundedClasses: Record<NonNullable<ArtworkProps["rounded"]>, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

function deriveSeedKey(alt: string, seedKey?: string): string {
  if (seedKey !== undefined && seedKey.length > 0) {
    return seedKey;
  }
  // Cheap deterministic hash from the alt text so different items get
  // different artwork even without an explicit seed.
  let hash = 0;
  for (let i = 0; i < alt.length; i += 1) {
    hash = (hash * 31 + alt.charCodeAt(i)) >>> 0;
  }
  return `seed-${hash.toString(16)}`;
}

export function Artwork({
  src,
  alt,
  size = 48,
  className = "",
  rounded = "md",
  seedKey,
}: ArtworkProps) {
  const style = useMemo<CSSProperties>(() => ({ width: size, height: size }), [size]);

  const classes = [
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
    roundedClasses[rounded],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!src) {
    const seed = artworkFor(deriveSeedKey(alt, seedKey));
    return (
      <div role="img" aria-label={alt} className={classes} style={style} data-seed={seed.variant}>
        <MockArtworkSvg seed={seed} />
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={classes} style={style} loading="lazy" draggable={false} />
  );
}

/**
 * Inline SVG that renders a generated artwork from a colour seed. The
 * SVG is intentionally light-weight: one radial gradient, one angular
 * gradient and a single accent shape per variant. It never references
 * remote URLs and is fully self-contained.
 */
function MockArtworkSvg({ seed }: { seed: MockArtworkSeed }) {
  const { from, to, accent, variant } = seed;
  const id = `g-${variant}-${hash(seed)}`;
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={`${id}-radial`} cx="30%" cy="22%" r="78%">
          <stop offset="0%" stopColor={to} stopOpacity="0.95" />
          <stop offset="60%" stopColor={from} stopOpacity="1" />
          <stop offset="100%" stopColor="#080809" stopOpacity="1" />
        </radialGradient>
        <linearGradient id={`${id}-linear`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill={`url(#${id}-radial)`} />
      <rect x="0" y="0" width="100" height="100" fill={`url(#${id}-linear)`} />
      <VariantShape variant={variant} accent={accent} />
    </svg>
  );
}

function VariantShape({
  variant,
  accent,
}: {
  variant: MockArtworkSeed["variant"];
  accent: string;
}) {
  switch (variant) {
    case "aurora":
      return (
        <path
          d="M -10 70 Q 30 30 70 50 T 110 30"
          fill="none"
          stroke={accent}
          strokeOpacity="0.35"
          strokeWidth="1.4"
        />
      );
    case "halo":
      return (
        <circle
          cx="74"
          cy="30"
          r="18"
          fill="none"
          stroke={accent}
          strokeOpacity="0.35"
          strokeWidth="1.2"
        />
      );
    case "fold":
      return (
        <path
          d="M 0 50 L 100 30 M 0 70 L 100 55"
          stroke={accent}
          strokeOpacity="0.3"
          strokeWidth="1.2"
          fill="none"
        />
      );
    case "veins":
      return (
        <g stroke={accent} strokeOpacity="0.32" strokeWidth="0.9" fill="none">
          <path d="M 18 22 L 60 60" />
          <path d="M 24 36 L 70 70" />
          <path d="M 36 18 L 78 56" />
        </g>
      );
    case "ridge":
      return (
        <path
          d="M 0 80 L 25 50 L 40 64 L 60 30 L 78 46 L 100 18"
          fill="none"
          stroke={accent}
          strokeOpacity="0.35"
          strokeWidth="1.3"
        />
      );
    case "depth":
      return (
        <g fill={accent} opacity="0.28">
          <circle cx="30" cy="68" r="22" />
          <circle cx="58" cy="80" r="28" />
        </g>
      );
    default:
      return null;
  }
}

function hash(seed: MockArtworkSeed): string {
  return `${seed.from}-${seed.to}-${seed.accent}-${seed.variant}`
    .split("")
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 0)
    .toString(16);
}

/**
 * Convenience alias so other components (Player, Fullscreen) can render
 * a centered icon inside the artwork placeholder without importing
 * lucide themselves.
 */
export function ArtworkPlaceholderIcon({ size = 24 }: { size?: number }) {
  return <Music2 size={size} aria-hidden="true" />;
}
