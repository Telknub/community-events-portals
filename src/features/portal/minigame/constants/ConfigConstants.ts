import { Equipped } from "features/game/types/bumpkin";
import { translate as t } from "lib/i18n/translate";
import { NPC_WEARABLES } from "lib/npcs";
import { ITEM_DETAILS } from "features/game/types/images";
import {
  MOB_CONFIGS,
  BOSS_CONFIGS,
  DROP_ITEM_XP_VALUES,
} from "./EnemyConstants";
import { WEAPON_CONFIGS } from "./WeaponConstants";
import water_pistol from "public/world/portal/images/skill_water_pistol_icon.webp";
import wind_blade from "public/world/portal/images/skill_windBlade_skill_icon.webp";
import summon_bees from "public/world/portal/images/skill_summon_bees_icon.webp";
import corn_bomb from "public/world/portal/images/skill_corn_bomb_icon.webp";
import blueOrb from "public/world/portal/images/dropItem1.webp";
import greenOrb from "public/world/portal/images/dropItem2.webp";
import grayOrb from "public/world/portal/images/dropItem3.webp";
import yellowOrb from "public/world/portal/images/dropItem4.webp";
import purpleOrb from "public/world/portal/images/dropItem5.webp";
import icon_mob1 from "public/world/portal/images/icon_mob_1.webp";
import icon_mob2 from "public/world/portal/images/icon_mob_2.webp";
import icon_mob3 from "public/world/portal/images/icon_mob_3.webp";
import icon_mob4 from "public/world/portal/images/icon_mob_4.webp";
import icon_mob5 from "public/world/portal/images/icon_mob_5.webp";
import icon_boss1 from "public/world/portal/images/icon_boss_1.webp";
import icon_boss2 from "public/world/portal/images/icon_boss_2.webp";
import icon_boss3 from "public/world/portal/images/icon_boss_3.webp";

export const PORTAL_NAME = "festival-of-colors";
export const PORTAL_TOKEN = "Festival of Colors Token 2026";

// Game config
export const GAME_SECONDS = 300;
export const GAME_LIVES = 100;

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
    image: icon_boss3,
    description: t(`${PORTAL_NAME}.instructions1`),
  },
  {
    image: purpleOrb,
    description: t(`${PORTAL_NAME}.instructions2`),
  },
  {
    image: water_pistol,
    description: t(`${PORTAL_NAME}.instructions3`),
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

export const ENEMIES_TABLE: {
  image: string;
  type: string;
  hp: number;
  itemIcon: string;
}[] = [
  {
    image: icon_boss1,
    type: boss_config.boss1.key,
    hp: boss_config.boss1.hp,
    itemIcon: DROP_ITEM_ASSETS[boss_config.boss1.dropItem],
  },
  {
    image: icon_boss2,
    type: boss_config.boss2.key,
    hp: boss_config.boss2.hp,
    itemIcon: DROP_ITEM_ASSETS[boss_config.boss2.dropItem],
  },
  {
    image: icon_boss3,
    type: boss_config.boss3.key,
    hp: boss_config.boss3.hp,
    itemIcon: DROP_ITEM_ASSETS[boss_config.boss3.dropItem],
  },
  {
    image: icon_mob1,
    type: mob_config.mob1.key,
    hp: mob_config.mob1.hp,
    itemIcon: DROP_ITEM_ASSETS[mob_config.mob1.dropItem],
  },
  {
    image: icon_mob2,
    type: mob_config.mob2.key,
    hp: mob_config.mob2.hp,
    itemIcon: DROP_ITEM_ASSETS[mob_config.mob2.dropItem],
  },
  {
    image: icon_mob3,
    type: mob_config.mob3.key,
    hp: mob_config.mob3.hp,
    itemIcon: DROP_ITEM_ASSETS[mob_config.mob3.dropItem],
  },
  {
    image: icon_mob4,
    type: mob_config.mob4.key,
    hp: mob_config.mob4.hp,
    itemIcon: DROP_ITEM_ASSETS[mob_config.mob4.dropItem],
  },
  {
    image: icon_mob5,
    type: mob_config.mob5.key,
    hp: mob_config.mob5.hp,
    itemIcon: DROP_ITEM_ASSETS[mob_config.mob5.dropItem],
  },
];

export const SKILLS_TABLE: {
  image: string;
  skillName: string;
  description: string;
  damage: number;
}[] = [
  {
    image: water_pistol,
    skillName: t(`${PORTAL_NAME}.skill1`),
    description: t(`${PORTAL_NAME}.enemy1`),
    damage: skill_config.wateringCan.baseStats.damage,
  },
  {
    image: wind_blade,
    skillName: t(`${PORTAL_NAME}.skill2`),
    description: t(`${PORTAL_NAME}.enemy2`),
    damage: skill_config.hoe.baseStats.damage,
  },
  {
    image: summon_bees,
    skillName: t(`${PORTAL_NAME}.skill3`),
    description: t(`${PORTAL_NAME}.enemy3`),
    damage: skill_config.beehive.baseStats.damage,
  },
  {
    image: corn_bomb,
    skillName: t(`${PORTAL_NAME}.skill4`),
    description: t(`${PORTAL_NAME}.enemy3`),
    damage: skill_config.corn.baseStats.damage,
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
