import { useState } from "react";
import naviFallback from "@/assets/navi-logo.jpeg";

/** Prefer `public/navi-logo-transparent.png` when present; falls back to bundled JPEG. */
const TRANSPARENT_LOGO_PATH = "/navi-logo-transparent.png";

type NaviLogoProps = {
  height: number;
  className?: string;
  style?: React.CSSProperties;
};

export function NaviLogo({ height, className, style }: NaviLogoProps) {
  const [useFallback, setUseFallback] = useState(false);
  return (
    <img
      className={className}
      src={useFallback ? naviFallback : TRANSPARENT_LOGO_PATH}
      alt="Navi"
      height={height}
      width="auto"
      style={{
        height,
        width: "auto",
        display: "block",
        objectFit: "contain",
        ...style,
      }}
      onError={() => setUseFallback(true)}
    />
  );
}
