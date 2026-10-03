import { type CSSProperties, useMemo } from "react";
import { Music2 } from "lucide-react";

export interface ArtworkProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedClasses: Record<NonNullable<ArtworkProps["rounded"]>, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

const fallbackStyles: CSSProperties = {
  background: "linear-gradient(135deg, var(--color-surface-2), var(--color-elevated))",
};

export function Artwork({ src, alt, size = 48, className = "", rounded = "md" }: ArtworkProps) {
  const style = useMemo<CSSProperties>(() => ({ width: size, height: size }), [size]);

  const classes = [
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
    roundedClasses[rounded],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${classes} text-[var(--color-text-muted)]`}
        style={{ ...style, ...fallbackStyles }}
      >
        <Music2 size={Math.round(size * 0.45)} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={classes} style={style} loading="lazy" draggable={false} />
  );
}
