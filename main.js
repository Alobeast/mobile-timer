import { enterCountdown } from "./countdown.js";
import { enterInterval, startNorwegian4x4 } from "./interval.js";
import { enterEmom } from "./emom.js";

const countdownButton = document.getElementById("mode-countdown");
const intervalButton = document.getElementById("mode-interval");
const emomButton = document.getElementById("mode-emom");
const norwegian4x4Button = document.getElementById("mode-4x4");

countdownButton.addEventListener("click", enterCountdown);
intervalButton.addEventListener("click", enterInterval);
emomButton.addEventListener("click", enterEmom);
norwegian4x4Button.addEventListener("click", startNorwegian4x4);
