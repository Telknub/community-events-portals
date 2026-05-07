import { Equipped } from "features/game/types/bumpkin";
import { translate as t } from "lib/i18n/translate";
import { NPC_WEARABLES } from "lib/npcs";
import { ITEM_DETAILS } from "features/game/types/images";
import { Obstacle } from "./Types";

export const PORTAL_NAME = "festival-of-colors";
export const PORTAL_TOKEN = "Festival of Colors Token 2025";

// Game config
export const GAME_SECONDS = 300;
export const GAME_LIVES = 5;

// Player
export const WALKING_SPEED = 50;

// Attempts
export const INITIAL_DATE = "2025-10-28"; // YYYY-MM-DD
export const INITIAL_DATE_LEADERBOARD = "2025-10-29"; // YYYY-MM-DD
export const ATTEMPTS_BETA_TESTERS = 100;
export const UNLIMITED_ATTEMPTS_SFL = 150; // If this value is less than 0, the option disappears
export const FREE_DAILY_ATTEMPTS = 1;
export const RESTOCK_ATTEMPTS = [
  { attempts: 1, sfl: 3 },
  { attempts: 3, sfl: 7 },
  { attempts: 7, sfl: 14 },
  { attempts: 20, sfl: 30 },
];

// Beta testers
// export const BETA_TESTERS: number[] = [
//   29, 9609, 49035, 155026, 1181, 151471, 49035, 86, 79871, 2299, 21303, 206876,
//   9239, 36214, 55626, 3249, 128122,
// ];
export const BETA_TESTERS: number[] = [];

// Guide
export const INSTRUCTIONS: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: ITEM_DETAILS["Abandoned Bear"].image,
    description: t(`${PORTAL_NAME}.resource1`),
  },
  {
    image: ITEM_DETAILS["Abandoned Bear"].image,
    description: t(`${PORTAL_NAME}.resource2`),
  },
  {
    image: ITEM_DETAILS["Abandoned Bear"].image,
    description: t(`${PORTAL_NAME}.resource3`),
  },
];

export const RESOURCES_TABLE: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: ITEM_DETAILS["Abandoned Bear"].image,
    description: t(`${PORTAL_NAME}.resource1`),
  },
  {
    image: ITEM_DETAILS["Abandoned Bear"].image,
    description: t(`${PORTAL_NAME}.resource2`),
  },
  {
    image: ITEM_DETAILS["Abandoned Bear"].image,
    description: t(`${PORTAL_NAME}.resource3`),
  },
];

export const ENEMIES_TABLE: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: ITEM_DETAILS["Abandoned Bear"].image,
    description: t(`${PORTAL_NAME}.enemy1`),
  },
  {
    image: ITEM_DETAILS["Abandoned Bear"].image,
    description: t(`${PORTAL_NAME}.enemy2`),
  },
];

// Panel
export const PANEL_NPC_WEARABLES: Equipped = NPC_WEARABLES["elf"];

export const OBSTACLES_LAYOUT = {
  obstacle1: [
    // trees
    { name: "tree", x: 11, y: 10 },
    { name: "tree", x: 30, y: 30 },
    { name: "tree", x: 15, y: 35 },
    { name: "tree", x: 5, y: 28 },
    { name: "tree", x: 12, y: 15 },
    { name: "tree", x: 18, y: 43 },
    { name: "tree", x: 35, y: 30 },
    { name: "tree", x: 30, y: 42 },
    { name: "tree", x: 45, y: 12 },
    { name: "tree", x: 50, y: 25 },
    { name: "tree", x: 22, y: 50 },
    { name: "tree", x: 8, y: 45 },
    { name: "tree", x: 40, y: 48 },
    { name: "tree", x: 55, y: 10 },
    { name: "tree", x: 48, y: 35 },

    // tree stumps
    { name: "tree_stump", x: 13, y: 10 },
    { name: "tree_stump", x: 28, y: 30 },
    { name: "tree_stump", x: 16, y: 33 },
    { name: "tree_stump", x: 6, y: 26 },
    { name: "tree_stump", x: 20, y: 45 },
    { name: "tree_stump", x: 42, y: 12 },
    { name: "tree_stump", x: 48, y: 25 },
    { name: "tree_stump", x: 25, y: 48 },
    { name: "tree_stump", x: 10, y: 42 },
    { name: "tree_stump", x: 52, y: 12 },

    // rocks
    { name: "rock", x: 20, y: 5 },
    { name: "rock", x: 29, y: 13 },
    { name: "rock", x: 10, y: 9 },
    { name: "rock", x: 38, y: 4 },
    { name: "rock", x: 10, y: 2 },
    { name: "rock", x: 35, y: 22 },
    { name: "rock", x: 35, y: 10 },
    { name: "rock", x: 40, y: 2 },
    { name: "rock", x: 50, y: 5 },
    { name: "rock", x: 52, y: 18 },
    { name: "rock", x: 18, y: 20 },
    { name: "rock", x: 5, y: 5 },
    { name: "rock", x: 12, y: 40 },
    { name: "rock", x: 45, y: 45 },
    // water
    { name: "water", x: 1, y: 21 },
    { name: "water", x: 5, y: 21 },
    { name: "water", x: 9, y: 21 },
    { name: "water", x: 17, y: 21 },
    { name: "water", x: 13, y: 21 },
    { name: "water", x: 13, y: 25 },
    { name: "water", x: 17, y: 25 },
    // { name: "water", x: 21, y: 25 },
    // { name: "water", x: 25, y: 25 },
    // { name: "water", x: 29, y: 25 },
    // { name: "water", x: 29, y: 21 },
    // { name: "water", x: 29, y: 17 },
    // { name: "water", x: 33, y: 17 },
    { name: "water", x: 37, y: 17 },
    { name: "water", x: 41, y: 17 },
    { name: "water", x: 45, y: 17 },
    { name: "water", x: 49, y: 17 },
    // { name: "water", x: 53, y: 17 },
    // { name: "water", x: 57, y: 17 },
    // { name: "water", x: 61, y: 17 },
    { name: "water", x: 31, y: 50 },
    { name: "water", x: 35, y: 50 },
  ] as Obstacle[],
};
