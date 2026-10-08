import type { ReactNode } from "react";

/* ===========================================================================
   ROUTE TRANSITION
   ---------------------------------------------------------------------------
   Rendered from app/template.tsx, which Next.js re-mounts on every
   navigation. That re-mount is the whole mechanism: a freshly inserted
   element starts its CSS animation from the beginning, so there is no
   pathname listener and no exit animation waiting to be interrupted.

   One 1px teal band travelling the width of the screen, enough to
   acknowledge that something happened. It is deliberately NOT a progress
   bar: it tracks nothing, it is not tied to a request, and it never sits at
   90% waiting.

   A CSS animation, and a server component, since there is nothing here for
   JavaScript to do. It was a framer-motion element, and because the
   template wraps every page, that one decorative line was the reason the
   whole animation library loaded site-wide. The keyframes are
   `.route-sweep` in app/globals.css. With motion off the global rule there
   collapses the animation to its end state, which is off-screen, so the line
   simply never appears.

   A whole-page fade once lived here too and was removed: gating every page
   body behind an animation means a throttled frame loop leaves the site
   blank rather than degraded, and it hid the Largest Contentful Paint for
   half a second on every first load.
=========================================================================== */

export function RouteTransition({ children }: { children: ReactNode }) {
  return (
    <>
      {/* z-80 clears the navigation (z-50) and stays under the skip link. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-px overflow-hidden"
      >
        <div className="route-sweep h-full w-full" />
      </div>

      {children}
    </>
  );
}

export default RouteTransition;
