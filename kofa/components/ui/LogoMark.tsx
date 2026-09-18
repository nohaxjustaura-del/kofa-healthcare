import Image from "next/image";
import Link from "next/link";

export function LogoGlyph({ className = "", size = 22 }: { className?: string; size?: number }) {
  return <Image src="/brand/kofa-symbol-supplied.png" alt="" width={size} height={size} className={className} />;
}

/** The supplied red mark stays intact; the adjacent wordmark creates a legible header lockup. */
export function LogoMark({ className = "", size = 260, href = "/", label = true }: { className?: string; size?: number; tone?: "ink" | "white"; href?: string | null; label?: boolean }) {
  const compact = size < 80 || !label;
  const symbolSize = compact ? size : Math.min(90, Math.round(size * 0.35));
  const inner = (
    <span className={`inline-flex items-center gap-3 ${className}`} style={compact ? undefined : { width: size }}>
      <Image src="/brand/kofa-symbol-supplied.png" alt="" width={symbolSize} height={symbolSize} className="shrink-0 object-contain" priority />
      {!compact && <span className="min-w-0 leading-none text-[var(--color-kofa-red)]"><span className="block text-[3.15rem] font-bold tracking-[-0.06em]">KOFA</span><span className="mt-1 block text-[1.15rem] font-medium tracking-[-0.015em]">Healthcare</span></span>}
    </span>
  );
  if (!href) return inner;
  return <Link href={href} aria-label="KOFA Healthcare home" className="inline-flex items-center">{inner}</Link>;
}
