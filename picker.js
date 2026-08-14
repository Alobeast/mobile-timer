import { formatTime } from "./format.js";

const ITEM_HEIGHT = 48;

const picker = document.getElementById("duration-picker");
const pickerList = document.getElementById("picker-list");
const pickerOkButton = document.getElementById("picker-ok");

function buildDurationOptions() {
  const values = [];
  for (let s = 15; s <= 300; s += 15) values.push(s);
  for (let s = 330; s <= 3600; s += 30) values.push(s);
  return values;
}

const DURATION_OPTIONS = buildDurationOptions();

DURATION_OPTIONS.forEach((seconds) => {
  const li = document.createElement("li");
  li.textContent = formatTime(seconds * 1000);
  li.dataset.seconds = seconds;
  pickerList.appendChild(li);
});

let centeredIndex = -1;
let pendingDurationMs = 0;
let onSelectCallback = null;

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

pickerOkButton.addEventListener("click", () => {
  picker.classList.remove("is-open");
  if (onSelectCallback) onSelectCallback(pendingDurationMs);
});

export function openPicker(currentMs, onSelect) {
  onSelectCallback = onSelect;
  const targetIndex = DURATION_OPTIONS.indexOf(Math.round(currentMs / 1000));
  picker.classList.add("is-open");
  pickerList.scrollTop = Math.max(targetIndex, 0) * ITEM_HEIGHT;
  updateCenteredItem();
}
