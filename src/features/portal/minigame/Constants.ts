import {
  BumpkinAura,
  Equipped,
  BumpkinShoe,
  BumpkinHat,
  BumpkinTool,
} from "features/game/types/bumpkin";
import { translate as t } from "lib/i18n/translate";
import { NPC_WEARABLES } from "lib/npcs";
import { PlayerFoodConfig, PlayerFoodType, Position, Side } from "./Types";
import { getWearableImage } from "features/game/lib/getWearableImage";
import hat_immunity from "public/world/portal/images/prevents_slowing_icon.webp";
import shoes_immunity from "public/world/portal/images/inverted_control_icon.webp";
import wings_immunity_icon from "public/world/portal/images/prevents_enlargement_icon.webp";
import aura_immunity_icon from "public/world/portal/images/antiRicebunIcon.webp";
import giantIcon from "public/world/portal/images/giant_icon.gif";
import sniperIcon from "public/world/portal/images/sniper_icon.gif";
import menaceIcon from "public/world/portal/images/menaceIcon.gif";
import blastIcon from "public/world/portal/images/blastIcon.gif";
import orangePuddle from "public/world/portal/images/puddle.png";
import referee from "public/world/portal/images/NPC_Judge_Card_Yellow.gif";
import riceBun from "public/world/portal/images/rice_bun.png";
import cannon from "public/world/portal/images/cannon_icon.png";
import chest from "public/world/portal/images/chest.png";
import food from "public/world/portal/images/tomato-splat.gif";
import auraIcon from "public/world/portal/images/Bumpkin_Glitch_Aura.webp";
import healthBar_icon from "public/world/portal/images/health_bar_low.webp";
import combination_assets from "public/world/portal/images/combination_items.gif";

export const PORTAL_NAME = "april-fools";
export const PORTAL_TOKEN = "April Fools Token 2025";

// Game config
export const GAME_SECONDS = 300;
export const GAME_LIVES = 6;

// Player
export const WALKING_SPEED = 70;
export const SLIDING_SPEED = 300;
export const DEPTH = 1000;

// Attempts
export const INITIAL_DATE = "2026-03-31"; // YYYY-MM-DD
export const INITIAL_DATE_LEADERBOARD = "2026-04-05"; // YYYY-MM-DD
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
export const BETA_TESTERS: number[] = [
  29, 9609, 49035, 155026, 1181, 151471, 49035, 86, 79871, 2299, 21303, 206876,
  9239, 36214, 55626, 3249, 128122,
];
// export const BETA_TESTERS: number[] = [];

export const ATTEMPTS_PURCHASED_BY_MISTAKE: { id: number; attempts: number | "unlimited" }[] = [
  { id: 170459, attempts: 1 },
  { id: 39, attempts: "unlimited" },
  { id: 43569, attempts: 1 },
  { id: 128281, attempts: 1 },
  { id: 7363530391431153, attempts: 1 },
  { id: 1164010181301338, attempts: 1 },
  { id: 6301933697173094, attempts: 1 },
  { id: 6339055894914183, attempts: 1 },
  { id: 6799684710405550, attempts: 1 },
  { id: 4989477240831826, attempts: 1 },
  { id: 4604110514183664, attempts: 1 },
  { id: 4471177087219028, attempts: 1 },
  { id: 161865, attempts: "unlimited" },
  { id: 90898, attempts: 1 },
  { id: 6674238736421706, attempts: 1 },
  { id: 766602799051301, attempts: 1 },
  { id: 1866422544171811, attempts: 1 },
  { id: 1423003006227343, attempts: 1 },
  { id: 7305414419203497, attempts: "unlimited" },
  { id: 188262, attempts: 3 },
  { id: 7132003891079063, attempts: 1 },
  { id: 5031, attempts: "unlimited" },
  { id: 5236692983496508, attempts: 7 },
  { id: 760685500011135, attempts: 1 },
  { id: 8406259486677961, attempts: "unlimited" },
  { id: 163654, attempts: 1 },
  { id: 3228704070507365, attempts: "unlimited" },
  { id: 155439, attempts: 1 },
  { id: 3279154164595495, attempts: 1 },
  { id: 1621, attempts: "unlimited" },
  { id: 405, attempts: "unlimited" },
  { id: 1862131619980240, attempts: 1 },
  { id: 8258779428596841, attempts: "unlimited" }
]

export const CANNON_CONFIG: (Position & { side: Side })[] = [
  { x: 344, y: 327, side: "left" },
  { x: 650, y: 327, side: "right" },
];

export const PLAYER_CANNON_COOLDOWN = 500;
export const PLAYER_CANNON_CHARGE_DURATION = 1200;
export const PLAYER_CANNON_REAL_SHOT_APPLE_CHANCE = 0.1;
export const CANNON_COOLDOWN = 15000;

export const CHEST_LEFT_X = 30;
export const CHEST_RIGHT_X = 900;
export const CHEST_Y = 215;
export const CHEST_TRAVEL_DURATION = 10000;
export const CHEST_SPAWN_INTERVAL = 20000;

export const PLAYER_FOOD_CONFIG: Record<PlayerFoodType, PlayerFoodConfig> = {
  cabbage: {
    texture: "cabbage",
    scale: 1.1,
    hitRadiusScale: 0.5,
    splatTexture: "cabbage_splat",
    speed: 300,
  },
  potato: {
    texture: "potato",
    scale: 1.1,
    hitRadiusScale: 0.5,
    splatTexture: "sniper_skeleton_potato_splat",
    speed: 300,
  },
  banana: {
    texture: "banana",
    scale: 1.2,
    hitRadiusScale: 1,
    spins: true,
    noEnemyContact: true,
    boomerang: true,
    speed: 200,
  },
  apple: {
    texture: "apple",
    scale: 5,
    hitRadiusScale: 1,
    spins: true,
    noEnemyContact: true,
    speed: 300,
  },
};

export const PLAYER_FOOD_CYCLE: PlayerFoodType[] = [
  "cabbage",
  "potato",
  "banana",
];

export const LUMBER_CONFIG: Position[] = [
  { x: 410, y: 190 },
  { x: 490, y: 190 },
  { x: 570, y: 190 },
];

export const REFEREE_POSITION: Position = { x: 490, y: 190 };
export const REFEREE_EFFECT_SCALE_MODIFIER = 0.4;
export const REFEREE_EFFECT_SPEED_MODIFIER = 0.4;
export const REFEREE_EFFECT_DURATION = 5000;
export const REFEREE_EFFECT_MIN_SCALE = 0.25;
export const REFEREE_EFFECT_MAX_SCALE = 2.25;

export const RICE_BUN_POSITIONS: Position[] = [
  { x: 340, y: 285 },
  { x: 395, y: 285 },
  { x: 450, y: 285 },
  { x: 505, y: 285 },
  { x: 560, y: 285 },
  { x: 615, y: 285 },
  { x: 360, y: 320 },
  { x: 415, y: 320 },
  { x: 470, y: 320 },
  { x: 525, y: 320 },
  { x: 580, y: 320 },
  { x: 635, y: 320 },
  { x: 340, y: 360 },
  { x: 395, y: 360 },
  { x: 450, y: 360 },
  { x: 505, y: 360 },
  { x: 560, y: 360 },
  { x: 615, y: 360 },
  { x: 485, y: 300 },
  { x: 540, y: 345 },
];
export const RICE_BUN_SPAWN_INTERVAL = 5000;
export const RICE_BUN_DESPAWN_DURATION = 30000;
export const SIMULATED_LAG_DURATION = 5000;
export const GAME_OVER_EFFECT_DURATION = 3000;

export const POWER_UNLOCK_THRESHOLDS = {
  CANNON: 10,
  SHIELD: 20,
  HONEY: 30,
  EXPLOSIVE: 50,
};

export const HONEY_SPAWN_POSITION: Position = { x: 490, y: -50 };
export const HONEY_TARGET_Y = 80;

// Immunities
export const AURA_IMMUNITY: BumpkinAura = "Glitch Aura"; // Prevents from turning into a rice bun
export const TOOL_IMMUNITY: BumpkinTool = "Admin Fools Tools"; // Prevents from getting enlarged
export const SHOES_IMMUNITY: BumpkinShoe[] = [
  "Neon Noiz Shoes",
  "404 Chic Boots",
]; // Prevents inverted controls
export const HAT_IMMUNITY: BumpkinHat = "Aether Specs"; // Prevents from slowing down
// Guide
export const INSTRUCTIONS: {
  image: string;
  description: string;
  width?: number;
}[] = [
    {
      image: food,
      description: t(`${PORTAL_NAME}.instructions1`),
    },
    {
      image: giantIcon,
      description: t(`${PORTAL_NAME}.instructions2`),
    },
    {
      image: auraIcon,
      description: t(`${PORTAL_NAME}.instructions3`),
    },
    {
      image: healthBar_icon,
      description: t(`${PORTAL_NAME}.instructions4`),
    },
  ];

export const RESOURCES_TABLE: {
  image: string;
  description: string;
  width?: number;
}[] = [
    {
      image: riceBun,
      description: t(`${PORTAL_NAME}.resource1`),
    },
    {
      image: cannon,
      description: t(`${PORTAL_NAME}.resource2`),
    },
    {
      image: chest,
      description: t(`${PORTAL_NAME}.resource3`),
    },
    {
      image: combination_assets,
      description: t(`${PORTAL_NAME}.resource4`),
    },
  ];

export const REFEREE: {
  image: string;
  description: string;
  width?: number;
} = {
  image: referee,
  description: t(`${PORTAL_NAME}.refereeDescription`),
};

export const IMMUNITY_GUIDE: {
  image: string;
  immunityName: string;
  description: string;
  width?: number;
}[] = [
    {
      image: getWearableImage(`${AURA_IMMUNITY}`),
      immunityName: AURA_IMMUNITY,
      description: t(`${PORTAL_NAME}.aura_immunityDescription`),
    },
    {
      image: getWearableImage(`${TOOL_IMMUNITY}`),
      immunityName: TOOL_IMMUNITY,
      description: t(`${PORTAL_NAME}.tool_immunityDescription`),
    },
    {
      image: getWearableImage(`${SHOES_IMMUNITY[0]}`),
      immunityName: SHOES_IMMUNITY[0],
      description: t(`${PORTAL_NAME}.shoes_immunityDescription`),
    },
    {
      image: getWearableImage(`${SHOES_IMMUNITY[1]}`),
      immunityName: SHOES_IMMUNITY[1],
      description: t(`${PORTAL_NAME}.shoes_immunityDescription`),
    },
    {
      image: getWearableImage(`${HAT_IMMUNITY}`),
      immunityName: HAT_IMMUNITY,
      description: t(`${PORTAL_NAME}.hat_immunityDescription`),
    },
  ];

export const ENEMIES_TABLE: {
  image: string;
  description: string;
  width?: number;
}[] = [
    {
      image: giantIcon,
      description: t(`${PORTAL_NAME}.enemy1`),
    },
    {
      image: blastIcon,
      description: t(`${PORTAL_NAME}.enemy2`),
    },
    {
      image: menaceIcon,
      description: t(`${PORTAL_NAME}.enemy3`),
    },
    {
      image: sniperIcon,
      description: t(`${PORTAL_NAME}.enemy4`),
    },
    {
      image: orangePuddle,
      description: t(`${PORTAL_NAME}.enemy5`),
    },
  ];

export type Immunity_Wearables = "aura" | "tool" | "shoe" | "hat";

export const IMMUNITY_TOOLTIP: {
  id: Immunity_Wearables;
  image: string;
  description: string;
}[] = [
    {
      id: "aura",
      image: aura_immunity_icon,
      description: t(`${PORTAL_NAME}.aura_immunityDescription`),
    },
    {
      id: "tool",
      image: wings_immunity_icon,
      description: t(`${PORTAL_NAME}.tool_immunityDescription`),
    },
    {
      id: "shoe",
      image: shoes_immunity,
      description: t(`${PORTAL_NAME}.shoes_immunityDescription`),
    },
    {
      id: "hat",
      image: hat_immunity,
      description: t(`${PORTAL_NAME}.hat_immunityDescription`),
    },
  ];

// Panel
export const PANEL_NPC_WEARABLES: Equipped = NPC_WEARABLES["goldtooth"];

export const MENACE_SKELETON_POSITIONS: Position[] = [
  { x: 320, y: 60 },
  { x: 150, y: 70 },
  // { x: 450, y: 72 },
  // { x: 230, y: 90 },
];

export const BLAST_SKELETON_POSITIONS: { x: number; y: number }[] = [
  { x: 450, y: 250 },
];

export const DRIP_WALKER_CYCLE_DURATION = 35000;
export const DRIP_WALKER_POSITIONS: (Position & { side: Side })[] = [
  { x: 410, y: 100, side: "right" },
  { x: 570, y: 100, side: "left" },
];
