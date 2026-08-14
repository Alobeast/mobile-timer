import { formatTime } from "./format.js";
import { unlockAudio } from "./audio.js";
import { goCue, restCue, finishCue } from "./cues.js";
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

const LEAD_IN_MS = 10 * 1000;
const MIN_ROUNDS = 1;
const MAX_ROUNDS = 20;

let workMs = 4 * 60 * 1000;
let restMs = 3 * 60 * 1000;
let rounds = 4;

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
      startCue: goCue,
    });
    if (round < rounds) {
      phases.push({
        durationMs: restMs,
        display: "clock",
        className: "rest",
        subtitle: `REST · ${round} / ${rounds}`,
        startCue: restCue,
      });
    }
  }
  return phases;
}

export function enterInterval() {
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

export function startNorwegian4x4() {
  applyConfig(240000, 180000, 4);
  start(showModePicker);
}

function showFinishedScreen() {
  const totalMs = rounds * workMs + (rounds - 1) * restMs;
  finishedDuration.textContent =
    `${formatTime(totalMs)} · ${rounds} × ${formatTime(workMs)}/${formatTime(restMs)}`;
  showScreen(finishedScreen);
}

function updateRounds(delta) {
  rounds = Math.min(MAX_ROUNDS, Math.max(MIN_ROUNDS, rounds + delta));
  roundsValue.textContent = rounds;
}

function applyConfig(work, rest, count) {
  workMs = work;
  restMs = rest;
  rounds = count;
  workDisplay.textContent = formatTime(workMs);
  restDisplay.textContent = formatTime(restMs);
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

startButton.addEventListener("click", () => start(enterInterval));

setupBackButton.addEventListener("click", showModePicker);
