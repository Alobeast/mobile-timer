import { enterCountdown } from "./countdown.js";
import { enterInterval } from "./interval.js";

const countdownButton = document.getElementById("mode-countdown");
const intervalButton = document.getElementById("mode-interval");

countdownButton.addEventListener("click", enterCountdown);
intervalButton.addEventListener("click", enterInterval);
