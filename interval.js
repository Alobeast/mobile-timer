import { formatTime } from "./format.js";
import { unlockAudio, beep } from "./audio.js";
import { startSequence } from "./engine.js";
import { openPicker } from "./picker.js";
import { showScreen, showModePicker } from "./screens.js";

const setupScreen = document.getElementById("interval-setup-screen");
const runningScreen = document.getElementById("running-screen");
const startButton = document.getElementById("interval-start");
const setupBackButton = document.getElementById("interval-back");
const workDisplay = document.getElementById("interval-work");
const restDisplay = document.getElementById("interval-rest");
const roundsValue = document.getElementById("rounds-value");
const roundsMinus = document.getElementById("rounds-minus");
const roundsPlus = document.getElementById("rounds-plus");
const finishedScreen = document.getElementById("finished-screen");
const finishedDuration = document.getElementById("finished-duration");

const LEAD_IN_MS = 5 * 1000;
const MIN_ROUNDS = 1;
const MAX_ROUNDS = 20;

let workMs = 4 * 60 * 1000;
let restMs = 3 * 60 * 1000;
let rounds = 4;

// Ascending = go hard, descending = ease off, triple = done. Distinct by
// contour so they're recognisable without looking at the screen.
function workStartCue() {
  beep({ frequency: 660, duration: 0.12 });
  beep({ frequency: 990, duration: 0.2, delay: 0.13 });
}

function restStartCue() {
  beep({ frequency: 660, duration: 0.12 });
  beep({ frequency: 440, duration: 0.2, delay: 0.13 });
}

function finishCue() {
  beep({ frequency: 660, duration: 0.12 });
  beep({ frequency: 880, duration: 0.12, delay: 0.13 });
  beep({ frequency: 1320, duration: 0.3, delay: 0.26 });
}

function buildPhases() {
  const phases = [
    { durationMs: LEAD_IN_MS, display: "seconds", className: "lead-in" },
  ];
  for (let round = 1; round <= rounds; round++) {
    phases.push({
      durationMs: workMs,
      display: "clock",
      className: "work",
      subtitle: `${round} / ${rounds}`,
      startCue: workStartCue,
    });
    if (round < rounds) {
      phases.push({
        durationMs: restMs,
        display: "clock",
        className: "rest",
        subtitle: `${round} / ${rounds}`,
        startCue: restStartCue,
      });
    }
  }
  return phases;
}

export function enterInterval() {
  showScreen(setupScreen);
}

function showFinishedScreen() {
  finishedDuration.textContent = `${rounds} rounds completed`;
  showScreen(finishedScreen);
}

function updateRounds(delta) {
  rounds = Math.min(MAX_ROUNDS, Math.max(MIN_ROUNDS, rounds + delta));
  roundsValue.textContent = rounds;
}

workDisplay.addEventListener("click", () => {
  openPicker(workMs, (ms) => {
    workMs = ms;
    workDisplay.textContent = formatTime(ms);
  });
});

restDisplay.addEventListener("click", () => {
  openPicker(restMs, (ms) => {
    restMs = ms;
    restDisplay.textContent = formatTime(ms);
  });
});

roundsMinus.addEventListener("click", () => updateRounds(-1));
roundsPlus.addEventListener("click", () => updateRounds(1));

startButton.addEventListener("click", () => {
  unlockAudio();
  showScreen(runningScreen);
  startSequence({
    phases: buildPhases(),
    finishCue,
    onFinish: showFinishedScreen,
    onExit: enterInterval,
  });
});

setupBackButton.addEventListener("click", showModePicker);
