type LogoProps = {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "lg";
};

const SIZE_CLASSES: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "h-9 w-[71px]",
  lg: "h-16 w-[126px]",
};

/**
 * Logo oficial da Lig Gesso (recortada do arquivo enviado pelo cliente),
 * fundo transparente em public/logo.png.
 */
export function Logo({ className = "", showWordmark = true, size = "sm" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Lig Gesso"
        className={`${SIZE_CLASSES[size]} shrink-0 object-contain`}
      />
      {showWordmark && (
        <span className="text-lg font-extrabold tracking-tight text-brand-text">
          Lig <span className="text-brand-orange">Gesso</span>
        </span>
      )}
    </div>
  );
}
