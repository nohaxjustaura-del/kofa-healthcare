import { RouteTransition } from "@/components/motion/RouteTransition";

/**
 * Page transition, §24.
 *
 * The behaviour lives in components/motion/RouteTransition.tsx; this file
 * exists only because Next re-mounts template.tsx on every navigation, which
 * is what makes the entrance replay without a pathname listener.
 *
 * Deliberately NOT a client component. RouteTransition carries its own
 * directive, so leaving this one on the server keeps the client boundary as
 * late in the tree as it can be.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <RouteTransition>{children}</RouteTransition>;
}
