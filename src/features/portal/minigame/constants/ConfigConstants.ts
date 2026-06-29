import { BumpkinWings, Equipped } from "features/game/types/bumpkin";
import { translate as t } from "lib/i18n/translate";
import { NPC_WEARABLES } from "lib/npcs";
import { ITEM_DETAILS } from "features/game/types/images";
import {
  MOB_CONFIGS,
  BOSS_CONFIGS,
  DROP_ITEM_XP_VALUES,
  ENEMY_BALANCE_STATS,
} from "./EnemyConstants";
import { WEAPON_CONFIGS, WEAPON_UPGRADES } from "./WeaponConstants";
import { PORTAL_NAME } from "./PortalConstants";
import wateringCan from "public/world/portal/images/skill_water_pistol_icon.webp";
import {
  getPlayerStatValue,
  PLAYER_STAT_INITIAL_LEVEL,
} from "./PlayerStatConstants";
import wind_blade from "public/world/portal/images/skill_windBlade_skill_icon.webp";
import summon_bees from "public/world/portal/images/skill_summon_bees_icon.webp";
import corn_bomb from "public/world/portal/images/skill_corn_bomb_icon.webp";
import broomScythe from "public/world/portal/images/skill_boomnana_icon.webp";
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
import tooltip_icon from "public/world/portal/images/ExpOrb_combined.webp";
import { BossTypes, MobTypes, WeaponId, PassiveAbilityType } from "../Types";

export { PORTAL_NAME } from "./PortalConstants";
export const PORTAL_TOKEN = "Festival of Colors Token 2026";

// Game config
export const GAME_SECONDS = 300;
export const GAME_LIVES = getPlayerStatValue(
  "health",
  PLAYER_STAT_INITIAL_LEVEL,
);

// Player
export const WALKING_SPEED = getPlayerStatValue(
  "speed",
  PLAYER_STAT_INITIAL_LEVEL,
);

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
    image: wateringCan,
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
    image: wind_blade,
    skillName: t(`${PORTAL_NAME}.weapon.hoe`),
    description: t(`${PORTAL_NAME}.enemy2`),
    minDamage: skill_config.hoe.baseStats.damage,
    maxDamage: getWeaponMaxDamage("hoe"),
  },
  {
    image: broomScythe,
    skillName: t(`${PORTAL_NAME}.weapon.broomScythe`),
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.broomScythe.baseStats.damage,
    maxDamage: getWeaponMaxDamage("broomScythe"),
  },
  {
    image: wateringCan,
    skillName: t(`${PORTAL_NAME}.weapon.wateringCan`),
    description: t(`${PORTAL_NAME}.enemy1`),
    minDamage: skill_config.wateringCan.baseStats.damage,
    maxDamage: getWeaponMaxDamage("wateringCan"),
  },
  {
    image: corn_bomb,
    skillName: t(`${PORTAL_NAME}.weapon.corn`),
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.corn.baseStats.damage,
    maxDamage: getWeaponMaxDamage("corn"),
  },
  {
    image: wind_blade,
    skillName: t(`${PORTAL_NAME}.weapon.tomato`),
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.tomato.baseStats.damage,
    maxDamage: getWeaponMaxDamage("tomato"),
  },
  {
    image: wind_blade,
    skillName: t(`${PORTAL_NAME}.weapon.sunflower`),
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.sunflower.baseStats.damage,
    maxDamage: getWeaponMaxDamage("sunflower"),
  },
  {
    image: wind_blade,
    skillName: t(`${PORTAL_NAME}.weapon.wheat`),
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.wheat.baseStats.damage,
    maxDamage: getWeaponMaxDamage("wheat"),
  },
  {
    image: giant_pumpkin,
    skillName: t(`${PORTAL_NAME}.weapon.pumpkin`),
    description: t(`${PORTAL_NAME}.enemy3`),
    minDamage: skill_config.pumpkin.baseStats.damage,
    maxDamage: getWeaponMaxDamage("pumpkin"),
  },
  {
    image: summon_bees,
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
  hoe: { activate: "sfx_hoe_swing" },
  broomScythe: { activate: "sfx_slash_broom" },
  wateringCan: { activate: "sfx_water_shot" },
  corn: { activate: "sfx_explosion_pop" },
  tomato: { activate: "sfx_tomato_throw" },
  sunflower: { activate: "sfx_light_shot" },
  wheat: { activate: "sfx_root_cast" },
  pumpkin: { activate: "sfx_pumpkin_roll" },
  beehive: { activate: "sfx_bee_spawn" },
};
