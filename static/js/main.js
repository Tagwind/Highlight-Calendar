import { preloadIcons } from "./icons.js";

window.nav = function (view, btn) {
  const app = document.getElementById("view-content-id");

  // Clear active state
  document
    .querySelectorAll(".sidebar button")
    .forEach((b) => b.classList.remove("active"));

  btn.classList.add("active");

  // Swap views
  app.innerHTML = "";

  if (view === "calendar") {
    app.innerHTML = "<hl-calendar class='calendar-component'></hl-calendar>";
  }

  if (view === "rewards") {
    app.innerHTML = "<rewards-view></rewards-view>";
  }

  if (view === "settings") {
    app.innerHTML = "<hl-settings id='settings'></hl-settings>";
  }
};

await preloadIcons({
  "chevron-left": "/static/icons/chevron-left.svg",
  "chevron-right": "/static/icons/chevron-right.svg",
});
