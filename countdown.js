import { formatTime } from "./format.js";
import { unlockAudio, beep } from "./audio.js";
import { startSequence, togglePause, stopSequence } from "./engine.js";
import { openPicker } from "./picker.js";
import { showScreen, showModePicker } from "./screens.js";

const setupScreen = document.getElementById("setup-screen");
const runningScreen = document.getElementById("running-screen");
const startButton = document.getElementById("start-button");
const durationDisplay = document.getElementById("duration-display");
const setupBackButton = document.getElementById("countdown-back");
const backButton = document.getElementById("back-button");
const finishedScreen = document.getElementById("finished-screen");
const finishedDuration = document.getElementById("finished-duration");
const doneButton = document.getElementById("done-button");

const LEAD_IN_MS = 5 * 1000;
let DURATION_MS = 5 * 60 * 1000;

function tenSecondWarning() {
  beep({ frequency: 1400, duration: 0.08 });
  beep({ frequency: 1400, duration: 0.08, delay: 0.15 });
}

function buildPhases() {
  return [
    { durationMs: LEAD_IN_MS, display: "seconds", className: "lead-in" },
    {
      durationMs: DURATION_MS,
      display: "clock",
      className: "work",
      secondCues: { 10: tenSecondWarning },
    },
  ];
}

export function enterCountdown() {
  showScreen(setupScreen);
}

function showFinishedScreen() {
  finishedDuration.textContent = `${formatTime(DURATION_MS)} completed`;
  showScreen(finishedScreen);
}

function returnToSetup() {
  stopSequence();
  showScreen(setupScreen);
}

durationDisplay.addEventListener("click", () => {
  openPicker(DURATION_MS, (ms) => {
    DURATION_MS = ms;
    durationDisplay.textContent = formatTime(ms);
  });
});

startButton.addEventListener("click", () => {
  unlockAudio();
  showScreen(runningScreen);
  startSequence({
    phases: buildPhases(),
    finishCue: () => beep({ frequency: 440, duration: 0.4 }),
    onFinish: showFinishedScreen,
  });
});

runningScreen.addEventListener("click", togglePause);

setupBackButton.addEventListener("click", showModePicker);

backButton.addEventListener("click", (event) => {
  event.stopPropagation();
  returnToSetup();
});

doneButton.addEventListener("click", returnToSetup);
