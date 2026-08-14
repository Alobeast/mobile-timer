import { beep } from "./audio.js";

// Ascending = go hard, descending = ease off, triple = done. Distinct by
// contour so they're recognisable without looking at the screen.
export function goCue() {
  beep({ frequency: 660, duration: 0.12 });
  beep({ frequency: 990, duration: 0.2, delay: 0.13 });
}

export function restCue() {
  beep({ frequency: 660, duration: 0.12 });
  beep({ frequency: 440, duration: 0.2, delay: 0.13 });
}

export function finishCue() {
  beep({ frequency: 660, duration: 0.12 });
  beep({ frequency: 880, duration: 0.12, delay: 0.13 });
  beep({ frequency: 1320, duration: 0.3, delay: 0.26 });
}
