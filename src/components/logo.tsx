type LogoProps = {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "lg";
};

const SIZE_CLASSES: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "h-9 w-10",
  lg: "h-16 w-[72px]",
};

/**
 * Monograma "LG" recriado a partir do print do site da Lig Gesso (laranja + swoosh
 * diagonal). Placeholder até o arquivo original da logo (PNG/SVG) ser enviado.
 */
export function Logo({ className = "", showWordmark = true, size = "sm" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 64 56"
        className={`${SIZE_CLASSES[size]} shrink-0`}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="lg-swoosh-cut">
            <polygon points="0,0 64,0 64,56 0,56 0,38 30,16 6,16" />
          </clipPath>
        </defs>
        <g clipPath="url(#lg-swoosh-cut)">
          <path
            d="M4 4 H16 V38 H40 L52 4 H64 V6 L44 56 H4 Z"
            fill="var(--brand-orange)"
          />
        </g>
        <polygon points="6,16 30,16 4,38" fill="var(--brand-orange)" opacity="0.55" />
      </svg>
      {showWordmark && (
        <span className="text-lg font-extrabold tracking-tight text-brand-text">
          Lig <span className="text-brand-orange">Gesso</span>
        </span>
      )}
    </div>
  );
}
