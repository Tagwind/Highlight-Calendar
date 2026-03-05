/*
    This file handles loading all the icons and makes them abvailable to all other components.
*/
const IconCache = {};
let iconsReady = false;
const readyCallbacks = [];

export async function preloadIcons(iconMap) {
  const entries = Object.entries(iconMap);
  await Promise.all(
    entries.map(async ([name, path]) => {
      const res = await fetch(path);
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "image/svg+xml");
      IconCache[name] = doc.querySelector("svg");
    }),
  );

  // Signal that icons are ready
  iconsReady = true;
  readyCallbacks.forEach((cb) => cb());
  readyCallbacks.length = 0;
}

export function getIcon(name, { width = 16, height = 16 } = {}) {
  const svg = IconCache[name]?.cloneNode(true);
  if (!svg) {
    console.warn(`Icon "${name}" not found. Was it preloaded?`);
    return document.createTextNode("");
  }
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("fill", "none");
  return svg;
}

// Components call this to wait for icons before rendering
export function onIconsReady(cb) {
  if (iconsReady) {
    cb(); // already done, run immediately
  } else {
    readyCallbacks.push(cb); // queue it
  }
}
