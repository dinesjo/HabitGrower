// The launch screen is static markup in index.html so it paints before the app
// bundle downloads. The app removes it once the first route has rendered.

// Let the leaf unfurl before revealing the app. Reduced motion skips this hold.
const MIN_VISIBLE_MS = 1150;
// Hide the web-font swap behind the launch screen, but never hold it for long.
const FONT_WAIT_MS = 500;
// Matches the exit transition in index.html.
const EXIT_MS = 420;

let dismissing = false;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export function dismissLaunchScreen() {
  const screen = document.getElementById("hg-launch");
  if (!screen || dismissing) return;
  dismissing = true;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  // performance.now() counts from navigation start, so slow page loads are not held further.
  const remainingIntro = reducedMotion ? 0 : Math.max(0, MIN_VISIBLE_MS - performance.now());
  const fontsReady = document.fonts?.ready.then(() => undefined, () => undefined) ?? Promise.resolve();

  Promise.all([wait(remainingIntro), Promise.race([fontsReady, wait(FONT_WAIT_MS)])]).then(() => {
    screen.setAttribute("data-state", "leaving");
    window.setTimeout(() => {
      screen.remove();
      document.getElementById("hg-launch-style")?.remove();
      document.documentElement.removeAttribute("data-hg-launch");
    }, reducedMotion ? 0 : EXIT_MS);
  });
}
