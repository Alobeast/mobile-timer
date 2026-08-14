import { formatTime } from "./format.js";
import { beep } from "./audio.js";
import { acquireWakeLock, releaseWakeLock } from "./wakeLock.js";

const runningScreen = document.getElementById("running-screen");
const runningDisplay = document.getElementById("running-display");
const runningSubtitle = document.getElementById("running-subtitle");
const runBackButton = document.getElementById("back-button");
const doneButton = document.getElementById("done-button");

const PHASE_CLASSES = ["lead-in", "work", "rest"];

let phases = [];
let totalMs = 0;
let finishCue = null;
let onFinish = null;
let onExit = null;

let startTime = null;
let intervalId = null;
let isPaused = false;
let pauseStart = null;
let lastSecond = null;
let lastPhaseIndex = null;

function render(phase, remainingMs) {
  runningDisplay.textContent =
    phase.display === "seconds"
      ? String(Math.max(0, Math.ceil(remainingMs / 1000))).padStart(2, "0")
      : formatTime(remainingMs);
  PHASE_CLASSES.forEach((name) =>
    runningDisplay.classList.toggle(name, phase.className === name)
  );
  runningSubtitle.textContent = phase.subtitle || "";
}

function locate(elapsed) {
  let acc = 0;
  for (let i = 0; i < phases.length; i++) {
    const end = acc + phases[i].durationMs;
    if (elapsed < end) return { index: i, remainingMs: end - elapsed };
    acc = end;
  }
  return { index: phases.length - 1, remainingMs: 0 };
}

function handleSecond(phase, currentSecond) {
  if (phase.secondCues && phase.secondCues[currentSecond]) {
    phase.secondCues[currentSecond]();
  }
  if (currentSecond >= 1 && currentSecond <= 3) {
    beep({ frequency: 880, duration: 0.1 });
  }
}

function finish() {
  clearInterval(intervalId);
  intervalId = null;
  render(phases[phases.length - 1], 0);
  if (finishCue) finishCue();
  releaseWakeLock();
  if (onFinish) onFinish();
}

function tick() {
  const elapsed = performance.now() - startTime;

  if (elapsed >= totalMs) {
    finish();
    return;
  }

  const { index, remainingMs } = locate(elapsed);
  render(phases[index], remainingMs);

  if (index !== lastPhaseIndex) {
    if (phases[index].startCue) phases[index].startCue();
    lastPhaseIndex = index;
    lastSecond = null;
  }

  const currentSecond = Math.max(0, Math.ceil(remainingMs / 1000));
  if (currentSecond !== lastSecond) {
    lastSecond = currentSecond;
    handleSecond(phases[index], currentSecond);
  }
}

export function startSequence(config) {
  phases = config.phases;
  finishCue = config.finishCue || null;
  onFinish = config.onFinish || null;
  onExit = config.onExit || null;
  totalMs = phases.reduce((sum, phase) => sum + phase.durationMs, 0);

  startTime = performance.now();
  isPaused = false;
  lastSecond = null;
  lastPhaseIndex = null;

  runningDisplay.classList.remove("is-paused");
  render(phases[0], phases[0].durationMs);

  intervalId = setInterval(tick, 200);
  acquireWakeLock();
}

function togglePause() {
  if (intervalId === null && !isPaused) return;

  if (isPaused) {
    isPaused = false;
    startTime += performance.now() - pauseStart;
    runningDisplay.classList.remove("is-paused");
    intervalId = setInterval(tick, 200);
    acquireWakeLock();
  } else {
    isPaused = true;
    pauseStart = performance.now();
    clearInterval(intervalId);
    intervalId = null;
    runningDisplay.classList.add("is-paused");
    releaseWakeLock();
  }
}

function stopSequence() {
  clearInterval(intervalId);
  intervalId = null;
  isPaused = false;
  releaseWakeLock();
}

function exitRun() {
  stopSequence();
  if (onExit) onExit();
}

runningScreen.addEventListener("click", togglePause);

runBackButton.addEventListener("click", (event) => {
  event.stopPropagation();
  exitRun();
});

doneButton.addEventListener("click", exitRun);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && intervalId !== null) {
    acquireWakeLock();
  }
});
