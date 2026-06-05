import { Equipped } from "features/game/types/bumpkin";
import { translate as t } from "lib/i18n/translate";
import { NPC_WEARABLES } from "lib/npcs";
import { ITEM_DETAILS } from "features/game/types/images";
import { MOB_BALANCE_STATS, MOB_CONFIGS, BOSS_CONFIGS } from "./EnemyConstants";
import skill1 from "public/world/portal/images/skill_water_pistol_icon.webp";
import skill2 from "public/world/portal/images/skill_windBlade_skill_icon.webp";
import skill3 from "public/world/portal/images/skill_summon_bees_icon.webp";
import skill4 from "public/world/portal/images/skill_corn_bomb_icon.webp";
import swarmMob_dropItem1 from "public/world/portal/images/dropItem1.webp";
import swarmMob_dropItem2 from "public/world/portal/images/dropItem2.webp";
import swarmMob_dropItem3 from "public/world/portal/images/dropItem3.webp";
import swarmMob_dropItem4 from "public/world/portal/images/dropItem4.webp";
import swarmMob_dropItem5 from "public/world/portal/images/dropItem5.webp";
import icon_mob4 from "public/world/portal/images/icon_mob_4.webp";
import icon_mob5 from "public/world/portal/images/icon_mob_2.webp";
import icon_boss2 from "public/world/portal/images/icon_boss_2.webp";
import icon_boss3 from "public/world/portal/images/icon_boss_3.webp";

export const PORTAL_NAME = "festival-of-colors";
export const PORTAL_TOKEN = "Festival of Colors Token 2026";

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

const mob_stat = MOB_BALANCE_STATS;
const mob_config = MOB_CONFIGS;
const boss_config = BOSS_CONFIGS;

export const DROP_ITEM_ASSETS: Record<string, string> = {
  swarmMob_dropItem1,
  swarmMob_dropItem2,
  swarmMob_dropItem3,
  swarmMob_dropItem4,
  swarmMob_dropItem5,
};

export const ENEMIES_TABLE: {
  image: string;
  type: string;
  hp: number;
  itemIcon: string;
}[] = [
  {
    image: ITEM_DETAILS["Abandoned Bear"].image,
    type: mob_config.swarmMob1.key,
    hp: mob_config.swarmMob1.hp,
    itemIcon: DROP_ITEM_ASSETS[mob_config.swarmMob1.dropItem],
  },
  {
    image: ITEM_DETAILS["Abandoned Bear"].image,
    type: mob_config.swarmMob2.key,
    hp: mob_config.swarmMob2.hp,
    itemIcon: DROP_ITEM_ASSETS[mob_config.swarmMob2.dropItem],
  },
  {
    image: ITEM_DETAILS["Abandoned Bear"].image,
    type: mob_config.swarmMob3.key,
    hp: mob_config.swarmMob3.hp,
    itemIcon: DROP_ITEM_ASSETS[mob_config.swarmMob3.dropItem],
  },
  {
    image: icon_mob4,
    type: mob_config.swarmMob4.key,
    hp: mob_config.swarmMob4.hp,
    itemIcon: DROP_ITEM_ASSETS[mob_config.swarmMob4.dropItem],
  },
  {
    image: icon_mob5,
    type: mob_config.swarmMob5.key,
    hp: mob_config.swarmMob5.hp,
    itemIcon: DROP_ITEM_ASSETS[mob_config.swarmMob5.dropItem],
  },
  {
    image: ITEM_DETAILS["Abandoned Bear"].image,
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
];

export const SKILLS_TABLE: {
  image: string;
  skillName: string;
  description: string;
  damage: number;
}[] = [
  {
    image: skill1,
    skillName: t(`${PORTAL_NAME}.skill1`),
    description: t(`${PORTAL_NAME}.enemy1`),
    damage: 15,
  },
  {
    image: skill2,
    skillName: t(`${PORTAL_NAME}.skill2`),
    description: t(`${PORTAL_NAME}.enemy2`),
    damage: 20,
  },
  {
    image: skill3,
    skillName: t(`${PORTAL_NAME}.skill3`),
    description: t(`${PORTAL_NAME}.enemy3`),
    damage: 25,
  },
  {
    image: skill4,
    skillName: t(`${PORTAL_NAME}.skill4`),
    description: t(`${PORTAL_NAME}.enemy3`),
    damage: 30,
  },
];

export const DROP_ITEMS_XP_TABLE: {
  image: string;
  description: string;
  xp: number;
}[] = [
  {
    image: swarmMob_dropItem1,
    description: t(`${PORTAL_NAME}.enemy1`),
    xp: mob_stat.mob1.XP,
  },
  {
    image: swarmMob_dropItem2,
    description: t(`${PORTAL_NAME}.enemy2`),
    xp: mob_stat.mob2.XP,
  },
  {
    image: swarmMob_dropItem3,
    description: t(`${PORTAL_NAME}.enemy2`),
    xp: mob_stat.mob3.XP,
  },
  {
    image: swarmMob_dropItem4,
    description: t(`${PORTAL_NAME}.enemy2`),
    xp: mob_stat.mob4.XP,
  },
  {
    image: swarmMob_dropItem5,
    description: t(`${PORTAL_NAME}.enemy2`),
    xp: mob_stat.mob5.XP,
  },
];

// Panel
export const PANEL_NPC_WEARABLES: Equipped = NPC_WEARABLES["elf"];
