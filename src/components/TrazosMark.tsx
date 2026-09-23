import logo from "@/assets/trazos-logo-alpha.png.asset.json";
import { BRAND, BRAND_TAGLINE } from "@/lib/trazos";

type Props = {
  className?: string;
  /** "light" invierte el logo para leerse sobre fotos oscuras. */
  tone?: "default" | "light";
};

export function TrazosMark({ className = "h-10", tone = "default" }: Props) {
  return (
    <img
      src={logo.url}
      alt={`${BRAND} · ${BRAND_TAGLINE}`}
      className={`w-auto select-none ${className}`}
      style={
        tone === "light"
          ? {
              filter:
                "brightness(0) invert(1) drop-shadow(0 2px 18px rgba(0,0,0,0.55)) drop-shadow(0 0 40px rgba(0,0,0,0.35))",
            }
          : undefined
      }
      draggable={false}
    />
  );
}
