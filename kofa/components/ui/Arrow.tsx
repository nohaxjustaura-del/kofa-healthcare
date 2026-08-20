/**
 * The site's one arrow.
 *
 * Drawn rather than imported so its stroke matches the 1px rule system
 * exactly at every size. Every arrow on KOFA is this component; consistency
 * of arrow design is an explicit requirement of the brief (§22).
 *
 * `dir` picks between the horizontal arrow used on links and buttons and the
 * 45° arrow used on cards that leave the page.
 */
export function Arrow({
  className = "",
  size = 16,
  dir = "right",
  strokeWidth = 1.25,
}: {
  className?: string;
  size?: number;
  dir?: "right" | "up-right" | "left";
  strokeWidth?: number;
}) {
  const rotate =
    dir === "up-right" ? "rotate(-45 12 12)" : dir === "left" ? "rotate(180 12 12)" : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g
        transform={rotate}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        <path d="M3 12h18" />
        <path d="M14.5 5.5 21 12l-6.5 6.5" />
      </g>
    </svg>
  );
}
