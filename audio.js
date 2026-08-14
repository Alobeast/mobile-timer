let audioContext = null;

export function unlockAudio() {
  if ("audioSession" in navigator) {
    navigator.audioSession.type = "transient";
  }
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

export function beep({ frequency, duration, delay = 0 }) {
  const startTime = audioContext.currentTime + delay;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.frequency.value = frequency;
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  gainNode.gain.setValueAtTime(0.3, startTime);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}
