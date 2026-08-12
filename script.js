const setupScreen = document.getElementById("setup-screen");
const runningScreen = document.getElementById("running-screen");
const startButton = document.getElementById("start-button");
const runningDisplay = document.getElementById("running-display");
const durationDisplay = document.getElementById("duration-display");
const picker = document.getElementById("duration-picker");
const pickerList = document.getElementById("picker-list");
const pickerOkButton = document.getElementById("picker-ok");
const backButton = document.getElementById("back-button");
const finishedScreen = document.getElementById("finished-screen");
const finishedDuration = document.getElementById("finished-duration");
const doneButton = document.getElementById("done-button");

let DURATION_MS = 5 * 60 * 1000;
const LEAD_IN_MS = 5 * 1000;
const ITEM_HEIGHT = 48;

let startTime = null;
let intervalId = null;
let isPaused = false;
let pauseStart = null;
let lastSecond = null;
let audioContext = null;
let wakeLock = null;

function unlockAudio() {
  if ("audioSession" in navigator) {
    navigator.audioSession.type = "playback";
  }
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function beep({ frequency, duration }) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.frequency.value = frequency;
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

async function acquireWakeLock() {
  if (!("wakeLock" in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
  } catch (err) {
    wakeLock = null;
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function buildDurationOptions() {
  const values = [];
  for (let s = 15; s <= 300; s += 15) values.push(s);
  for (let s = 330; s <= 3600; s += 30) values.push(s);
  return values;
}

const DURATION_OPTIONS = buildDurationOptions();
let pendingDurationMs = DURATION_MS;

DURATION_OPTIONS.forEach((seconds) => {
  const li = document.createElement("li");
  li.textContent = formatTime(seconds * 1000);
  li.dataset.seconds = seconds;
  pickerList.appendChild(li);
});

let centeredIndex = -1;

function updateCenteredItem() {
  const rawIndex = Math.round(pickerList.scrollTop / ITEM_HEIGHT);
  const index = Math.min(Math.max(rawIndex, 0), DURATION_OPTIONS.length - 1);
  if (index === centeredIndex) return;

  if (centeredIndex !== -1) {
    pickerList.children[centeredIndex].classList.remove("is-centered");
  }
  pickerList.children[index].classList.add("is-centered");
  centeredIndex = index;
  pendingDurationMs = DURATION_OPTIONS[index] * 1000;
}

pickerList.addEventListener("scroll", updateCenteredItem);

function openPicker() {
  const targetIndex = DURATION_OPTIONS.indexOf(DURATION_MS / 1000);
  picker.classList.add("is-open");
  pickerList.scrollTop = targetIndex * ITEM_HEIGHT;
  updateCenteredItem();
}

function closePicker() {
  picker.classList.remove("is-open");
}

durationDisplay.addEventListener("click", openPicker);

pickerOkButton.addEventListener("click", () => {
  DURATION_MS = pendingDurationMs;
  durationDisplay.textContent = formatTime(DURATION_MS);
  closePicker();
});

function tick() {
  const elapsed = performance.now() - startTime;

  if (elapsed < LEAD_IN_MS) {
    const remaining = LEAD_IN_MS - elapsed;
    runningDisplay.textContent = String(Math.ceil(remaining / 1000)).padStart(2, "0");
    runningDisplay.classList.add("lead-in");
    return;
  }

  runningDisplay.classList.remove("lead-in");
  const remaining = DURATION_MS - (elapsed - LEAD_IN_MS);
  runningDisplay.textContent = formatTime(remaining);

  const currentSecond = Math.max(0, Math.ceil(remaining / 1000));
  if (currentSecond !== lastSecond) {
    lastSecond = currentSecond;
    if (currentSecond === 0) {
      beep({ frequency: 440, duration: 0.4 });
    } else if (currentSecond <= 3) {
      beep({ frequency: 880, duration: 0.1 });
    }
  }

  if (remaining <= 0) {
    clearInterval(intervalId);
    intervalId = null;
    releaseWakeLock();
    showFinishedScreen();
  }
}

function showFinishedScreen() {
  finishedDuration.textContent = `${formatTime(DURATION_MS)} completed`;
  runningScreen.classList.remove("is-active");
  finishedScreen.classList.add("is-active");
}

function returnToSetup() {
  clearInterval(intervalId);
  intervalId = null;
  releaseWakeLock();
  runningScreen.classList.remove("is-active");
  finishedScreen.classList.remove("is-active");
  setupScreen.classList.add("is-active");
}

function startCountdown() {
  startTime = performance.now();
  isPaused = false;
  lastSecond = null;
  runningDisplay.classList.remove("is-paused");
  runningDisplay.textContent = String(LEAD_IN_MS / 1000).padStart(2, "0");
  runningDisplay.classList.add("lead-in");
  intervalId = setInterval(tick, 200);
  acquireWakeLock();
}

function pause() {
  isPaused = true;
  pauseStart = performance.now();
  clearInterval(intervalId);
  intervalId = null;
  runningDisplay.classList.add("is-paused");
  releaseWakeLock();
}

function resume() {
  isPaused = false;
  startTime += performance.now() - pauseStart;
  runningDisplay.classList.remove("is-paused");
  intervalId = setInterval(tick, 200);
  acquireWakeLock();
}

startButton.addEventListener("click", () => {
  unlockAudio();
  setupScreen.classList.remove("is-active");
  runningScreen.classList.add("is-active");
  startCountdown();
});

runningScreen.addEventListener("click", () => {
  isPaused ? resume() : pause();
});

backButton.addEventListener("click", (event) => {
  event.stopPropagation();
  returnToSetup();
});

doneButton.addEventListener("click", returnToSetup);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && intervalId !== null) {
    acquireWakeLock();
  }
});
