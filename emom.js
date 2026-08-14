import { formatTime } from "./format.js";
import { unlockAudio } from "./audio.js";
import { goCue, finishCue } from "./cues.js";
import { startSequence } from "./engine.js";
import { openPicker } from "./picker.js";
import { showScreen, showModePicker } from "./screens.js";

const setupScreen = document.getElementById("emom-setup-screen");
const runningScreen = document.getElementById("running-screen");
const startButton = document.getElementById("emom-start");
const setupBackButton = document.getElementById("emom-back");
const roundDisplay = document.getElementById("emom-round");
const roundsValue = document.getElementById("emom-rounds-value");
const roundsMinus = document.getElementById("emom-rounds-minus");
const roundsPlus = document.getElementById("emom-rounds-plus");
const totalDisplay = document.getElementById("emom-total");
const finishedScreen = document.getElementById("finished-screen");
const finishedDuration = document.getElementById("finished-duration");

const LEAD_IN_MS = 10 * 1000;
const MIN_ROUNDS = 1;
const MAX_ROUNDS = 30;

let roundMs = 60 * 1000;
let rounds = 10;

function updateTotal() {
  totalDisplay.textContent = formatTime(roundMs * rounds);
}

function buildPhases() {
  const phases = [
    { durationMs: LEAD_IN_MS, display: "seconds", className: "lead-in" },
  ];
  for (let round = 1; round <= rounds; round++) {
    phases.push({
      durationMs: roundMs,
      display: "clock",
      className: "work",
      subtitle: `${round} / ${rounds}`,
      startCue: goCue,
    });
  }
  return phases;
}

export function enterEmom() {
  showScreen(setupScreen);
}

function start(onExit) {
  unlockAudio();
  showScreen(runningScreen);
  startSequence({
    phases: buildPhases(),
    finishCue,
    onFinish: showFinishedScreen,
    onExit,
  });
}

function showFinishedScreen() {
  finishedDuration.textContent =
    `${formatTime(roundMs * rounds)} · ${rounds} × ${formatTime(roundMs)}`;
  showScreen(finishedScreen);
}

function updateRounds(delta) {
  rounds = Math.min(MAX_ROUNDS, Math.max(MIN_ROUNDS, rounds + delta));
  roundsValue.textContent = rounds;
  updateTotal();
}

roundDisplay.addEventListener("click", () => {
  openPicker(roundMs, (ms) => {
    roundMs = ms;
    roundDisplay.textContent = formatTime(ms);
    updateTotal();
  });
});

roundsMinus.addEventListener("click", () => updateRounds(-1));
roundsPlus.addEventListener("click", () => updateRounds(1));

startButton.addEventListener("click", () => start(enterEmom));

setupBackButton.addEventListener("click", showModePicker);

updateTotal();
