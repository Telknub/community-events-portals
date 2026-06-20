import { BumpkinWings, Equipped } from "features/game/types/bumpkin";
import { translate as t } from "lib/i18n/translate";
import { NPC_WEARABLES } from "lib/npcs";
import { ITEM_DETAILS } from "features/game/types/images";
import {
  MOB_CONFIGS,
  BOSS_CONFIGS,
  DROP_ITEM_XP_VALUES,
} from "./EnemyConstants";
import { WEAPON_CONFIGS, WEAPON_UPGRADES } from "./WeaponConstants";
import { WEAPON_NAMES } from "../components/hud/Weapons";
import water_pistol from "public/world/portal/images/skill_water_pistol_icon.webp";
import wind_blade from "public/world/portal/images/skill_windBlade_skill_icon.webp";
import summon_bees from "public/world/portal/images/skill_summon_bees_icon.webp";
import corn_bomb from "public/world/portal/images/skill_corn_bomb_icon.webp";
import boomNana from "public/world/portal/images/skill_boomnana_icon.webp";
import giant_pumpkin from "public/world/portal/images/skill_giantPumpkin_icon.webp";
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
import { BossTypes, MobTypes, WeaponId } from "../Types";

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

export const PASSIVE_ABILITY_ITEM: BumpkinWings = "Underworld Stimpack";

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
  itemIcon: string;
}[] = [
  {
    image: icon_boss1,
    type: BOSS_NAMES.boss1,
    hp: boss_config.boss1.hp,
    itemIcon: DROP_ITEM_ASSETS[boss_config.boss1.dropItem],
  },
  {
    image: icon_boss2,
    type: BOSS_NAMES.boss2,
    hp: boss_config.boss2.hp,
    itemIcon: DROP_ITEM_ASSETS[boss_config.boss2.dropItem],
  },
  {
    image: icon_boss3,
    type: BOSS_NAMES.boss3,
    hp: boss_config.boss3.hp,
    itemIcon: DROP_ITEM_ASSETS[boss_config.boss3.dropItem],
  },
  {
    image: icon_mob1,
    type: MOB_NAMES.mob1,
    hp: mob_config.mob1.hp,
    itemIcon: DROP_ITEM_ASSETS[mob_config.mob1.dropItem],
  },
  {
    image: icon_mob2,
    type: MOB_NAMES.mob2,
    hp: mob_config.mob2.hp,
    itemIcon: DROP_ITEM_ASSETS[mob_config.mob2.dropItem],
  },
  {
    image: icon_mob3,
    type: MOB_NAMES.mob3,
    hp: mob_config.mob3.hp,
    itemIcon: DROP_ITEM_ASSETS[mob_config.mob3.dropItem],
  },
  {
    image: icon_mob4,
    type: MOB_NAMES.mob4,
    hp: mob_config.mob4.hp,
    itemIcon: DROP_ITEM_ASSETS[mob_config.mob4.dropItem],
  },
  {
    image: icon_mob5,
    type: MOB_NAMES.mob5,
    hp: mob_config.mob5.hp,
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
    image: water_pistol,
    skillName: WEAPON_NAMES.wateringCan,
    description: t(`${PORTAL_NAME}.enemy1`),
    minDamage: skill_config.wateringCan.baseStats.damage,
    maxDamage: getWeaponMaxDamage("wateringCan"),
  },
  {
    image: wind_blade,
    skillName: WEAPON_NAMES.hoe,
    description: t(`${PORTAL_NAME}.enemy2`),
    minDamage: skill_config.hoe.baseStats.damage,
    maxDamage: getWeaponMaxDamage("hoe"),
  },
  {
    image: summon_bees,
    skillName: WEAPON_NAMES.beehive,
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.beehive.baseStats.damage,
    maxDamage: getWeaponMaxDamage("beehive"),
  },
  {
    image: corn_bomb,
    skillName: WEAPON_NAMES.corn,
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.corn.baseStats.damage,
    maxDamage: getWeaponMaxDamage("corn"),
  },
  {
    image: boomNana,
    skillName: WEAPON_NAMES.broomScythe,
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.broomScythe.baseStats.damage,
    maxDamage: getWeaponMaxDamage("broomScythe"),
  },
  {
    image: giant_pumpkin,
    skillName: WEAPON_NAMES.pumpkin,
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.pumpkin.baseStats.damage,
    maxDamage: getWeaponMaxDamage("pumpkin"),
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
