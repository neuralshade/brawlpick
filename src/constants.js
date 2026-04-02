// src/constants.js

export const TEAM_RED = "red";
export const TEAM_BLUE = "blue";

export const slotLabels = [
  "Red 1",
  "Red 2",
  "Red 3",
  "Blue 1",
  "Blue 2",
  "Blue 3",
];

export const MAP_MODE_OPTIONS = [
  { map: "Hard Rock Mine", mode: "Gem Grab" },
  { map: "Minecart Madness", mode: "Gem Grab" },
  { map: "Double Swoosh", mode: "Gem Grab" },
  { map: "Stonewall Brawl", mode: "Gem Grab" },
  { map: "Deathcap Trap", mode: "Gem Grab" },
  { map: "Undermine", mode: "Gem Grab" },
  { map: "Rustic Arcade", mode: "Gem Grab" },
  { map: "Acute Angle", mode: "Gem Grab" },
  { map: "Backyard Bowl", mode: "Brawl Ball" },
  { map: "Pinhole Punt", mode: "Brawl Ball" },
  { map: "Sneaky Fields", mode: "Brawl Ball" },
  { map: "Super Beach", mode: "Brawl Ball" },
  { map: "Center Stage", mode: "Brawl Ball" },
  { map: "Galaxy Arena", mode: "Brawl Ball" },
  { map: "Retropolis", mode: "Brawl Ball" },
  { map: "Triple Dribble", mode: "Brawl Ball" },
  { map: "Goldarm Gulch", mode: "Knockout" },
  { map: "Belle's Rock", mode: "Knockout" },
  { map: "New Horizons", mode: "Knockout" },
  { map: "Out in the Open", mode: "Knockout" },
  { map: "Flaring Phoenix", mode: "Knockout" },
  { map: "Healthy Middle Ground", mode: "Knockout" },
  { map: "Flowing River", mode: "Knockout" },
  { map: "Between the Rivers", mode: "Knockout" },
  { map: "Hot Potato", mode: "Heist" },
  { map: "Safe Zone", mode: "Heist" },
  { map: "Kaboom Canyon", mode: "Heist" },
  { map: "Bridge Too Far", mode: "Heist" },
  { map: "G.G. Mortuary", mode: "Heist" },
  { map: "Pit Stop", mode: "Heist" },
  { map: "Ring of Fire", mode: "Hot Zone" },
  { map: "Dueling Beetles", mode: "Hot Zone" },
  { map: "Open Zone", mode: "Hot Zone" },
  { map: "Parallel Plays", mode: "Hot Zone" },
  { map: "Split", mode: "Hot Zone" },
  { map: "Rush", mode: "Hot Zone" },
  { map: "Canal Grande", mode: "Bounty" },
  { map: "Shooting Star", mode: "Bounty" },
  { map: "Excel", mode: "Bounty" },
  { map: "Dry Season", mode: "Bounty" },
];

// Importação de Mapas
const mapFiles = import.meta.glob("./assets/maps/*", {
  eager: true,
  import: "default",
});
const MAP_ICONS = Object.fromEntries(
  Object.entries(mapFiles).map(([path, url]) => {
    const fileName = path
      .replace(/\\/g, "/")
      .split("/")
      .pop()
      .replace(/\.[^/.]+$/, "");
    return [fileName, url];
  }),
);
export const getModeIcon = (modeName) => MAP_ICONS[modeName.replace(/ /g, "_")];

// Importação de Brawlers
const brawlerFiles = import.meta.glob("./assets/brawlers/*", {
  eager: true,
  import: "default",
});
const BRAWLER_IMAGES = Object.fromEntries(
  Object.entries(brawlerFiles).map(([path, url]) => {
    const fileName = path
      .replace(/\\/g, "/")
      .split("/")
      .pop()
      .replace(/\.[^/.]+$/, "");
    return [fileName, url];
  }),
);

const normalizeBrawlerName = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
const prettyBrawlerName = (fileName) =>
  fileName
    .replace(/_/g, " ")
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase());

export const BRAWLERS = Object.keys(BRAWLER_IMAGES)
  .sort()
  .map(prettyBrawlerName);
export const getBrawlerImage = (name) =>
  BRAWLER_IMAGES[normalizeBrawlerName(name)];
