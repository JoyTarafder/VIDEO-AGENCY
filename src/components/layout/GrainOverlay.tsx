/**
 * Fixed film-grain overlay — a tiled SVG turbulence texture animated with
 * stepped keyframes. Sits above everything (below the cursor), costs almost
 * nothing to composite, and is what makes the whole page feel like footage.
 * Also carries the shared #va-chromatic displacement filter used by the
 * media-card hover glitch (see the `glitch` utility in globals.css).
 */
export function GrainOverlay() {
  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <filter id="va-chromatic">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="1" result="n" seed="7" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="9" />
          </filter>
        </defs>
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -inset-[100px] z-[80] grain-bg opacity-[0.05] [animation:grain-shift_1.1s_steps(6)_infinite]"
      />
    </>
  );
}
