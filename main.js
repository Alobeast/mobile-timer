import { enterCountdown } from "./countdown.js";

const countdownButton = document.getElementById("mode-countdown");

countdownButton.addEventListener("click", enterCountdown);

// INTERVAL is wired up in the next step.
