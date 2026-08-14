import { enterCountdown } from "./countdown.js";
import { enterInterval, startNorwegian4x4 } from "./interval.js";

const countdownButton = document.getElementById("mode-countdown");
const intervalButton = document.getElementById("mode-interval");
const norwegian4x4Button = document.getElementById("mode-4x4");

countdownButton.addEventListener("click", enterCountdown);
intervalButton.addEventListener("click", enterInterval);
norwegian4x4Button.addEventListener("click", startNorwegian4x4);
