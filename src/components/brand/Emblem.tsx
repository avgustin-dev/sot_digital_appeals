import Image from "next/image";
import { cn } from "@/lib/utils";

/** Официальный логотип Верховного суда Кыргызской Республики (public/brand) */
const LOGO_SRC = "/brand/supreme-court-logo.png";
const LOGO_ALT =
  "Эмблема Верховного суда Кыргызской Республики";

export function EmblemKR({
  size = 40,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt={LOGO_ALT}
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
