const allScreens = document.querySelectorAll(".screen");
const modeScreen = document.getElementById("mode-screen");

export function showScreen(target) {
  allScreens.forEach((screen) =>
    screen.classList.toggle("is-active", screen === target)
  );
}

export function showModePicker() {
  showScreen(modeScreen);
}
