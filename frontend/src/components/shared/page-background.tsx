/**
 * Fixed backdrop behind the glass panels: soft colour washes at the top,
 * middle and bottom of the screen, so every panel has colour to frost.
 * Plain CSS gradients with no blur filter or animation.
 */
const PageBackground = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 -z-10 bg-background"
    style={{
      backgroundImage: [
        'radial-gradient(60% 50% at 10% -10%, var(--wash-1), transparent 70%)',
        'radial-gradient(55% 45% at 90% -5%, var(--wash-2), transparent 70%)',
        'radial-gradient(45% 40% at 0% 65%, var(--wash-3), transparent 70%)',
        'radial-gradient(50% 45% at 100% 100%, var(--wash-4), transparent 70%)',
      ].join(', '),
    }}
  />
);

export default PageBackground;
