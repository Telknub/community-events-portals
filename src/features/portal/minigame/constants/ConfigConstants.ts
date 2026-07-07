import type { BumpkinWings, Equipped } from "features/game/types/bumpkin";
import { translate as t } from "lib/i18n/translate";
import { NPC_WEARABLES } from "lib/npcs";
import {
  MOB_CONFIGS,
  BOSS_CONFIGS,
  DROP_ITEM_XP_VALUES,
  ENEMY_BALANCE_STATS,
} from "./EnemyConstants";
import { WEAPON_CONFIGS, WEAPON_UPGRADES } from "./WeaponConstants";
import { PORTAL_NAME } from "./PortalConstants";
import {
  getPlayerStatValue,
  PLAYER_STAT_BASE_LEVEL,
} from "./PlayerStatConstants";

import banana_icon from "public/world/portal/images/banana_icon.webp";
import scythe_icon from "public/world/portal/images/scythe_icon.png";
import tomato_icon from "public/world/portal/images/tomato_icon.png";
import sunflower_icon from "public/world/portal/images/sunflower_icon.png";
import oil_icon from "public/world/portal/images/oil_icon.png";
import beehive_icon from "public/world/portal/images/beehive_icon.webp";
import corn_bomb_icon from "public/world/portal/images/corn_bomb_icon.webp";
import pumpkin_icon from "public/world/portal/images/pumpkin_icon.webp";
import watering_can_icon from "public/world/portal/images/watering_can_icon.webp";

import blueOrb from "public/world/portal/images/dropItem1.webp";
import greenOrb from "public/world/portal/images/dropItem2.webp";
import grayOrb from "public/world/portal/images/dropItem3.webp";
import yellowOrb from "public/world/portal/images/dropItem4.webp";
import purpleOrb from "public/world/portal/images/dropItem5.webp";
import Orb from "public/world/portal/images/ExpOrb_combined.webp";

import icon_mob1 from "public/world/portal/images/icon_mob_1.webp";
import icon_mob2 from "public/world/portal/images/icon_mob_2.webp";
import icon_mob3 from "public/world/portal/images/icon_mob_3.webp";
import icon_mob4 from "public/world/portal/images/icon_mob_4.webp";
import icon_mob5 from "public/world/portal/images/icon_mob_5.webp";
import icon_boss1 from "public/world/portal/images/icon_boss_1.webp";
import icon_boss2 from "public/world/portal/images/icon_boss_2.webp";
import icon_boss3 from "public/world/portal/images/icon_boss_3.webp";
import tooltip_icon from "public/world/portal/images/ExpOrb_combined.webp";
import swordIcon from "public/world/portal/images/sword_icon.png";
import speedIcon from "public/world/portal/images/lightning.png";
import type {
  BossTypes,
  MobTypes,
  WeaponId,
  PassiveAbilityType,
} from "../Types";
import { SUNNYSIDE } from "assets/sunnyside";
import { getWearableImage } from "features/game/lib/getWearableImage";

export { PORTAL_NAME } from "./PortalConstants";

// Game config
export const GAME_SECONDS = 300;
export const GAME_LIVES = getPlayerStatValue("health", PLAYER_STAT_BASE_LEVEL);

// Player
export const WALKING_SPEED = getPlayerStatValue(
  "speed",
  PLAYER_STAT_BASE_LEVEL,
);

// Attempts
export const INITIAL_DATE = "2025-10-28"; // YYYY-MM-DD
export const INITIAL_DATE_LEADERBOARD = "2025-10-29"; // YYYY-MM-DD
export const ATTEMPTS_BETA_TESTERS = 100;
export const UNLIMITED_ATTEMPTS_SFL = 200; // If this value is less than 0, the option disappears
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

export const PASSIVE_ABILITY_ITEM: BumpkinWings = "Underworld Stimpack";

export const IMMUNITY_TOOLTIP: {
  id: PassiveAbilityType;
  image: string;
  description: string;
}[] = [
  {
    id: "wings",
    image: tooltip_icon,
    description: t(`${PORTAL_NAME}.AbilityDescription`),
  },
];

// Guide
export const INSTRUCTIONS: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: icon_boss3,
    description: t(`${PORTAL_NAME}.instructions1`),
  },
  {
    image: purpleOrb,
    description: t(`${PORTAL_NAME}.instructions2`),
  },
  {
    image: watering_can_icon,
    description: t(`${PORTAL_NAME}.instructions3`),
  },
  {
    image: getWearableImage(`${PASSIVE_ABILITY_ITEM}`),
    description: t(`${PORTAL_NAME}.instructions8`),
  },
  {
    image: Orb,
    description: t(`${PORTAL_NAME}.instructions7`),
  },
];

export const RESOURCES_TABLE: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: SUNNYSIDE.icons.heart,
    description: t(`${PORTAL_NAME}.resource1`),
  },
  {
    image: speedIcon,
    description: t(`${PORTAL_NAME}.resource2`),
  },
  {
    image: swordIcon,
    description: t(`${PORTAL_NAME}.resource3`),
  },
  {
    image: getWearableImage(`${PASSIVE_ABILITY_ITEM}`),
    description: t(`${PORTAL_NAME}.AbilityDescription`),
  },
];

const mob_config = MOB_CONFIGS;
const boss_config = BOSS_CONFIGS;
const skill_config = WEAPON_CONFIGS;

export const DROP_ITEM_ASSETS: Record<string, string> = {
  blueOrb,
  greenOrb,
  grayOrb,
  yellowOrb,
  purpleOrb,
};

const MOB_NAMES: Record<MobTypes, string> = {
  mob1: "Potted Slime",
  mob2: "Flappy",
  mob3: "Slime",
  mob4: "Blobert",
  mob5: "Balloon slime",
};

const BOSS_NAMES: Record<BossTypes, string> = {
  boss1: "Daisy",
  boss2: "Pierrot",
  boss3: "Sharky",
};

export const ENEMIES_TABLE: {
  image: string;
  type: string;
  hp: number;
  damage: number;
  itemIcon: string;
}[] = [
  {
    image: icon_boss1,
    type: BOSS_NAMES.boss1,
    hp: boss_config.boss1.hp,
    damage: ENEMY_BALANCE_STATS.boss1.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[boss_config.boss1.dropItem],
  },
  {
    image: icon_boss2,
    type: BOSS_NAMES.boss2,
    hp: boss_config.boss2.hp,
    damage: ENEMY_BALANCE_STATS.boss2.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[boss_config.boss2.dropItem],
  },
  {
    image: icon_boss3,
    type: BOSS_NAMES.boss3,
    hp: boss_config.boss3.hp,
    damage: ENEMY_BALANCE_STATS.boss3.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[boss_config.boss3.dropItem],
  },
  {
    image: icon_mob1,
    type: MOB_NAMES.mob1,
    hp: mob_config.mob1.hp,
    damage: ENEMY_BALANCE_STATS.mob1.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[mob_config.mob1.dropItem],
  },
  {
    image: icon_mob2,
    type: MOB_NAMES.mob2,
    hp: mob_config.mob2.hp,
    damage: ENEMY_BALANCE_STATS.mob2.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[mob_config.mob2.dropItem],
  },
  {
    image: icon_mob3,
    type: MOB_NAMES.mob3,
    hp: mob_config.mob3.hp,
    damage: ENEMY_BALANCE_STATS.mob3.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[mob_config.mob3.dropItem],
  },
  {
    image: icon_mob4,
    type: MOB_NAMES.mob4,
    hp: mob_config.mob4.hp,
    damage: ENEMY_BALANCE_STATS.mob4.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[mob_config.mob4.dropItem],
  },
  {
    image: icon_mob5,
    type: MOB_NAMES.mob5,
    hp: mob_config.mob5.hp,
    damage: ENEMY_BALANCE_STATS.mob5.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[mob_config.mob5.dropItem],
  },
];

function getWeaponMaxDamage(weaponId: WeaponId) {
  const baseDamage = WEAPON_CONFIGS[weaponId].baseStats.damage;

  const damageBonus = WEAPON_UPGRADES[weaponId]
    .flatMap((upgrade) => upgrade.modifiers)
    .filter(
      (modifier) => modifier.stat === "damage" && modifier.operation === "add",
    )
    .reduce((total, modifier) => total + modifier.value, 0);

  return baseDamage + damageBonus;
}

export const SKILLS_TABLE: {
  image: string;
  skillName: string;
  description: string;
  minDamage: number;
  maxDamage: number;
}[] = [
  {
    image: banana_icon,
    skillName: t(`${PORTAL_NAME}.weapon.banana`),
    description: t(`${PORTAL_NAME}.enemy2`),
    minDamage: skill_config.banana.baseStats.damage,
    maxDamage: getWeaponMaxDamage("banana"),
  },
  {
    image: scythe_icon,
    skillName: t(`${PORTAL_NAME}.weapon.broomScythe`),
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.broomScythe.baseStats.damage,
    maxDamage: getWeaponMaxDamage("broomScythe"),
  },
  {
    image: watering_can_icon,
    skillName: t(`${PORTAL_NAME}.weapon.wateringCan`),
    description: t(`${PORTAL_NAME}.enemy1`),
    minDamage: skill_config.wateringCan.baseStats.damage,
    maxDamage: getWeaponMaxDamage("wateringCan"),
  },
  {
    image: corn_bomb_icon,
    skillName: t(`${PORTAL_NAME}.weapon.corn`),
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.corn.baseStats.damage,
    maxDamage: getWeaponMaxDamage("corn"),
  },
  {
    image: tomato_icon,
    skillName: t(`${PORTAL_NAME}.weapon.tomato`),
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.tomato.baseStats.damage,
    maxDamage: getWeaponMaxDamage("tomato"),
  },
  {
    image: sunflower_icon,
    skillName: t(`${PORTAL_NAME}.weapon.sunflower`),
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.sunflower.baseStats.damage,
    maxDamage: getWeaponMaxDamage("sunflower"),
  },
  {
    image: oil_icon,
    skillName: t(`${PORTAL_NAME}.weapon.oil`),
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.oil.baseStats.damage,
    maxDamage: getWeaponMaxDamage("oil"),
  },
  {
    image: pumpkin_icon,
    skillName: t(`${PORTAL_NAME}.weapon.pumpkin`),
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.pumpkin.baseStats.damage,
    maxDamage: getWeaponMaxDamage("pumpkin"),
  },
  {
    image: beehive_icon,
    skillName: t(`${PORTAL_NAME}.weapon.beehive`),
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.beehive.baseStats.damage,
    maxDamage: getWeaponMaxDamage("beehive"),
  },
];

export const DROP_ITEMS_XP_TABLE: {
  image: string;
  description: string;
  xp: number;
}[] = [
  {
    image: blueOrb,
    description: t(`${PORTAL_NAME}.enemy1`),
    xp: DROP_ITEM_XP_VALUES.blueOrb,
  },
  {
    image: greenOrb,
    description: t(`${PORTAL_NAME}.enemy2`),
    xp: DROP_ITEM_XP_VALUES.greenOrb,
  },
  {
    image: grayOrb,
    description: t(`${PORTAL_NAME}.enemy2`),
    xp: DROP_ITEM_XP_VALUES.grayOrb,
  },
  {
    image: yellowOrb,
    description: t(`${PORTAL_NAME}.enemy2`),
    xp: DROP_ITEM_XP_VALUES.yellowOrb,
  },
  {
    image: purpleOrb,
    description: t(`${PORTAL_NAME}.enemy2`),
    xp: DROP_ITEM_XP_VALUES.purpleOrb,
  },
];

// Panel
export const PANEL_NPC_WEARABLES: Equipped = NPC_WEARABLES["elf"];

// SFX
export const WEAPON_SFX_VOL = 0.3;
export const WEAPON_SFX: Record<WeaponId, { activate: string }> = {
  banana: { activate: "sfx_banana_swing" },
  broomScythe: { activate: "sfx_slash_broom" },
  wateringCan: { activate: "sfx_water_shot" },
  corn: { activate: "sfx_explosion_pop" },
  tomato: { activate: "sfx_tomato_throw" },
  sunflower: { activate: "sfx_light_shot" },
  oil: { activate: "sfx_oil_cast" },
  pumpkin: { activate: "sfx_pumpkin_roll" },
  beehive: { activate: "sfx_bee_spawn" },
};
