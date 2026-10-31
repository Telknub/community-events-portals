import type {
  BumpkinItem,
  BumpkinWings,
  Equipped,
} from "features/game/types/bumpkin";
import { translate as t } from "lib/i18n/translate";
import { DROP_ITEM_XP_VALUES, ENEMY_BALANCE_STATS } from "./EnemyConstants";
import { WEAPON_CONFIGS, WEAPON_UPGRADES } from "./WeaponConstants";
import { PERK_CONFIGS } from "./PerkConstants";

import frozen_skull_icon from "public/world/portal/halloween/weapons/the_frost/frozen_skull_icon.png";
import blood_scythe_icon from "public/world/portal/halloween/weapons/the_bloody_harvest/blood_scythe_icon.png";
import blood_knife_icon from "public/world/portal/halloween/weapons/the_bloody_harvest/blood_knife_icon.png";
import frost_flower_icon from "public/world/portal/halloween/weapons/the_frost/frost_flower_icon.png";
import moss_ground_icon from "public/world/portal/halloween/weapons/the_plague/moss_ground_icon.png";
import fly_storm_icon from "public/world/portal/halloween/weapons/the_plague/fly_storm_icon.png";
import poison_vial_icon from "public/world/portal/halloween/weapons/the_plague/poison_vial_icon.png";
import banished_jack_o_lantern_icon from "public/world/portal/halloween/weapons/the_curse/banished_jack_o_lantern_icon.png";
import darkness_book_icon from "public/world/portal/halloween/weapons/the_curse/darkness_book_icon.png";
import cursed_coffin_icon from "public/world/portal/halloween/weapons/the_curse/cursed_coffin_icon.png";
import frost_chain_icon from "public/world/portal/halloween/weapons/the_frost/frost_chain_icon.png";
import crimson_vial_icon from "public/world/portal/halloween/weapons/the_bloody_harvest/crimson_vial_icon.png";

import bat from "public/world/portal/halloween/icons/bat_icon.png";
import scarecrow from "public/world/portal/halloween/icons/scarecrow_icon.png";
import rat from "public/world/portal/halloween/icons/rat_icon.png";
import zombie from "public/world/portal/halloween/icons/zombie_icon.png";
import golem from "public/world/portal/halloween/icons/golem_icon.png";
import ent from "public/world/portal/halloween/icons/ent_icon.png";
import minotaur from "public/world/portal/halloween/icons/minotaur_icon.png";
import crow from "public/world/portal/halloween/icons/crow_icon.png";
import ghost from "public/world/portal/halloween/icons/ghost_icon.png";
import imp from "public/world/portal/halloween/icons/demon_icon.png";
import skeleton from "public/world/portal/halloween/icons/skeleton_icon.png";
import slime from "public/world/portal/halloween/icons/slimes_icon.png";
import mummy from "public/world/portal/halloween/icons/mummy_icon.png";
import living_armor from "public/world/portal/halloween/icons/armor_icon.png";
import witch from "public/world/portal/halloween/icons/witch_icon.png";
import gargoyle from "public/world/portal/halloween/icons/gargoyle_icon.png";
import cultist from "public/world/portal/halloween/icons/cultist_icon.png";
import frankenstein from "public/world/portal/halloween/icons/frankenstein_icon.png";
import werewolf from "public/world/portal/halloween/icons/werewolf_icon.png";
import headless_horseman from "public/world/portal/halloween/icons/horseman_icon.png";
import medusa from "public/world/portal/halloween/icons/medusa_icon.png";
import cerberus from "public/world/portal/halloween/icons/cerberus_icon.png";
import shade from "public/world/portal/halloween/icons/shade_icon.png";
import red_stone from "public/world/portal/halloween/icons/demon4_icon.png";
import demon1 from "public/world/portal/halloween/icons/demon3_icon.png";
import demon2 from "public/world/portal/halloween/icons/demon2_icon.png";
import sorcerer from "public/world/portal/halloween/icons/sorcerer_icon.png";

import relicWrath from "public/world/portal/halloween/relics_wrath.webp";
import relicSloth from "public/world/portal/halloween/relics_sloth.webp";
import relicPride from "public/world/portal/halloween/relics_pride.webp";
import relicLust from "public/world/portal/halloween/relics_lust.webp";
import relicGreed from "public/world/portal/halloween/relics_greed.webp";
import relicGluttony from "public/world/portal/halloween/relics_gluttony.webp";
import relicEnvy from "public/world/portal/halloween/relics_envy.webp";
import speedIcon from "public/world/portal/images/cheer.png";

import tooltip_icon from "public/world/portal/images/ExpOrb_combined.webp";
import swordIcon from "public/world/portal/images/sword_icon.png";
import areaIcon from "public/world/portal/halloween/icons/areaIcon.webp";
import type {
  WeaponId,
  WeaponStatKey,
  PassiveAbilityType,
  PhasingEnemyTypes,
  StaticRangeEnemyTypes,
  MeleeEnemyTypes,
  MiniBossType,
  BossTypes,
} from "../Types";
import { SUNNYSIDE } from "assets/sunnyside";

export { PORTAL_NAME } from "./PortalConstants";

// Game config
export const GAME_SECONDS = 900;
export const GAME_LIVES = 100;
export const WALKING_SPEED = 55;
export const PLAYER_WATER_SPEED_MULTIPLIER = 0.6;
export const REVIVE_FLOWER_COST = 4;
export const REVIVE_SCORE_MULTIPLIER = 0.85;
export const REVIVE_MAX_PER_RUN = 5;
export const REVIVE_INVINCIBILITY_SECONDS = 3;
export const REVIVE_INVINCIBILITY_ALPHA = 0.5;
export const BLOCKADE_GUIDE_MIN_TILES = 12;
export const FINAL_BOSS_TIME_BONUS_PER_SECOND = 10;
export const HOLE_INTERACT_TILES = 3;

// Attempts
export const INITIAL_DATE = "2026-10-26"; // YYYY-MM-DD
export const INITIAL_DATE_LEADERBOARD = "2026-10-28"; // YYYY-MM-DD
export const FINAL_DATE_LEADERBOARD = "2026-11-01"; // YYYY-MM-DD
export const ATTEMPTS_BETA_TESTERS = 0;
export const UNLIMITED_ATTEMPTS_SFL = 125; // If this value is less than 0, the option disappears
export const UNLIMITED_ATTEMPTS_DISCOUNT_SFL = 100;
export const FREE_DAILY_ATTEMPTS = 1;
// Extra free attempts granted on top of FREE_DAILY_ATTEMPTS for a specific day
export const EXTRA_FREE_ATTEMPTS_BY_DAY: Record<string, number> = {
  // "2026-10-31": 2, // YYYY-MM-DD: extra attempts
  "2026-10-27": 1,
};
export const RESTOCK_ATTEMPTS = [
  { attempts: 1, sfl: 5 },
  { attempts: 3, sfl: 15 },
  { attempts: 7, sfl: 30 },
  { attempts: 20, sfl: 75 },
];

export const UNLIMITED_ATTEMPTS_DISCOUNT: BumpkinItem[] = [
  "Rainbow Wings",
  "Butterfly Aura",
];

// Beta testers
// export const BETA_TESTERS: number[] = [
//   29, 9609, 49035, 155026, 1181, 151471, 49035, 86, 79871, 2299, 21303, 206876,
//   9239, 36214, 55626, 3249, 128122,
// ];
export const BETA_TESTERS: number[] = [];

export const ATTEMPTS_PURCHASED_BY_MISTAKE: {
  id: number;
  attempts: number | "unlimited";
}[] = [
  // { id: {FarmId}, attempts: 1 },
  { id: 90898, attempts: "unlimited" },
  { id: 4889062358365928, attempts: 2 },
  { id: 2392686424225801, attempts: 2 },
  { id: 7693815612267337, attempts: 3 },
  { id: 167952, attempts: 2 },
  { id: 747158164920966, attempts: 2 },
  { id: 20349, attempts: 2 },
  { id: 4486232672043868, attempts: 10 },
  { id: 5273345171127385, attempts: 6 },
  { id: 1862131619980240, attempts: 3 },
  { id: 6893199825366161, attempts: 1 },
  { id: 62827921908129, attempts: 2 },
  { id: 4621, attempts: 2 },
  { id: 6945409844310756, attempts: 2 },
  { id: 2380436778641857, attempts: 2 },
  { id: 4110160515424496, attempts: 2 },
  { id: 181180, attempts: 2 },

  // { id: {FarmId}, attempts: "unlimited" },
];

// Banned players are hidden from the leaderboard
export const BANNED_FARM_IDS: number[] = [
  // 12345, // FarmId
  7267084005403912,
  3789239050013145, //NQN
  3055473214040933, //AYBB
];

export const PASSIVE_ABILITY_ITEM: BumpkinWings = "Underworld Stimpack";

export const IMMUNITY_TOOLTIP: {
  id: PassiveAbilityType;
  image: string;
  description: string;
}[] = [
  {
    id: "wings",
    image: tooltip_icon,
    description: t("minigame.AbilityDescription"),
  },
];

// Guide
export const INSTRUCTIONS: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: areaIcon,
    description: t("minigame.instructions1"),
  },
  {
    image: relicEnvy,
    description: t("minigame.instructions2"),
  },
  {
    image: darkness_book_icon,
    description: t("minigame.instructions3"),
  },
  // {
  //   image: getWearableImage(`${PASSIVE_ABILITY_ITEM}`),
  //   description: t("minigame.instructions8"),
  // },
  {
    image: SUNNYSIDE.icons.xpIcon,
    description: t("minigame.instructions7"),
  },
  {
    image: sorcerer,
    description: t("minigame.instructions4"),
  },
];

export const PERKS_TABLE: {
  image: string;
  perkName: string;
  levelScaling: number;
  levelScaling1: number;
  levelScaling5: number;
  levelScaling10: number;
  maxLevel: number;
  description: string;
  width?: number;
  percent?: boolean;
  negative?: boolean;
}[] = [
  {
    image: speedIcon,
    perkName: t("minigame.perk.moveSpeed"),
    levelScaling1: PERK_CONFIGS.moveSpeed.valuesPerLevel[1],
    levelScaling5: PERK_CONFIGS.moveSpeed.valuesPerLevel[5],
    levelScaling10: PERK_CONFIGS.moveSpeed.valuesPerLevel[10],
    levelScaling: PERK_CONFIGS.moveSpeed.valuesPerLevel[15],
    maxLevel: PERK_CONFIGS.moveSpeed.maxLevel,
    description: t("minigame.perk.description.moveSpeed"),
    percent: true,
  },
  {
    image: SUNNYSIDE.icons.lightning,
    perkName: t("minigame.perk.attackSpeed"),
    levelScaling1: PERK_CONFIGS.attackSpeed.valuesPerLevel[1],
    levelScaling5: PERK_CONFIGS.attackSpeed.valuesPerLevel[5],
    levelScaling10: PERK_CONFIGS.attackSpeed.valuesPerLevel[10],
    levelScaling: PERK_CONFIGS.attackSpeed.valuesPerLevel[15],
    maxLevel: PERK_CONFIGS.attackSpeed.maxLevel,
    description: t("minigame.perk.description.attackSpeed"),
    percent: true,
  },
  {
    image: swordIcon,
    perkName: t("minigame.perk.criticalChance"),
    levelScaling1: PERK_CONFIGS.criticalChance.valuesPerLevel[1],
    levelScaling5: PERK_CONFIGS.criticalChance.valuesPerLevel[5],
    levelScaling10: PERK_CONFIGS.criticalChance.valuesPerLevel[10],
    levelScaling: PERK_CONFIGS.criticalChance.valuesPerLevel[15],
    maxLevel: PERK_CONFIGS.criticalChance.maxLevel,
    description: t("minigame.perk.description.criticalChance"),
    percent: true,
  },
  {
    image: SUNNYSIDE.icons.arrow_right,
    perkName: t("minigame.perk.projectileSpeed"),
    levelScaling1: PERK_CONFIGS.projectileSpeed.valuesPerLevel[1],
    levelScaling5: PERK_CONFIGS.projectileSpeed.valuesPerLevel[5],
    levelScaling10: PERK_CONFIGS.projectileSpeed.valuesPerLevel[10],
    levelScaling: PERK_CONFIGS.projectileSpeed.valuesPerLevel[15],
    maxLevel: PERK_CONFIGS.projectileSpeed.maxLevel,
    description: t("minigame.perk.description.projectileSpeed"),
    percent: true,
  },
  {
    image: SUNNYSIDE.icons.xpIcon,
    perkName: t("minigame.perk.xpGain"),
    levelScaling1: PERK_CONFIGS.xpGain.valuesPerLevel[1],
    levelScaling5: PERK_CONFIGS.xpGain.valuesPerLevel[5],
    levelScaling10: PERK_CONFIGS.xpGain.valuesPerLevel[10],
    levelScaling: PERK_CONFIGS.xpGain.valuesPerLevel[15],
    maxLevel: PERK_CONFIGS.xpGain.maxLevel,
    description: t("minigame.perk.description.xpGain"),
    percent: true,
  },
  {
    image: SUNNYSIDE.icons.happy,
    perkName: t("minigame.perk.luck"),
    levelScaling1: PERK_CONFIGS.luck.valuesPerLevel[1],
    levelScaling5: PERK_CONFIGS.luck.valuesPerLevel[5],
    levelScaling10: PERK_CONFIGS.luck.valuesPerLevel[10],
    levelScaling: PERK_CONFIGS.luck.valuesPerLevel[15],
    maxLevel: PERK_CONFIGS.luck.maxLevel,
    description: t("minigame.perk.description.luck"),
    percent: true,
  },
  {
    image: SUNNYSIDE.icons.search,
    perkName: t("minigame.perk.pickupRadius"),
    levelScaling1: PERK_CONFIGS.pickupRadius.valuesPerLevel[1],
    levelScaling5: PERK_CONFIGS.pickupRadius.valuesPerLevel[5],
    levelScaling10: PERK_CONFIGS.pickupRadius.valuesPerLevel[10],
    levelScaling: PERK_CONFIGS.pickupRadius.valuesPerLevel[15],
    maxLevel: PERK_CONFIGS.pickupRadius.maxLevel,
    description: t("minigame.perk.description.pickupRadius"),
    percent: true,
  },
  {
    image: SUNNYSIDE.icons.stopwatch,
    perkName: t("minigame.perk.cooldownReduction"),
    levelScaling1: PERK_CONFIGS.cooldownReduction.valuesPerLevel[1],
    levelScaling5: PERK_CONFIGS.cooldownReduction.valuesPerLevel[5],
    levelScaling10: PERK_CONFIGS.cooldownReduction.valuesPerLevel[10],
    levelScaling: PERK_CONFIGS.cooldownReduction.valuesPerLevel[15],
    maxLevel: PERK_CONFIGS.cooldownReduction.maxLevel,
    description: t("minigame.perk.description.cooldownReduction"),
    percent: true,
    negative: true,
  },
  {
    image: SUNNYSIDE.icons.upgrade_disc,
    perkName: t("minigame.perk.healing"),
    levelScaling1: PERK_CONFIGS.healing.valuesPerLevel[1],
    levelScaling5: PERK_CONFIGS.healing.valuesPerLevel[5],
    levelScaling10: PERK_CONFIGS.healing.valuesPerLevel[10],
    levelScaling: PERK_CONFIGS.healing.valuesPerLevel[15],
    maxLevel: PERK_CONFIGS.healing.maxLevel,
    description: t("minigame.perk.description.healing"),
  },
  {
    image: SUNNYSIDE.icons.heart,
    perkName: t("minigame.perk.maxHealth"),
    levelScaling1: PERK_CONFIGS.maxHealth.valuesPerLevel[1],
    levelScaling5: PERK_CONFIGS.maxHealth.valuesPerLevel[5],
    levelScaling10: PERK_CONFIGS.maxHealth.valuesPerLevel[10],
    levelScaling: PERK_CONFIGS.maxHealth.valuesPerLevel[15],
    maxLevel: PERK_CONFIGS.maxHealth.maxLevel,
    description: t("minigame.perk.description.maxHealth"),
  },
];

const stats = ENEMY_BALANCE_STATS;
const skill_config = WEAPON_CONFIGS;

export const DROP_ITEM_ASSETS: Record<string, string> = {
  relicWrath,
  relicSloth,
  relicPride,
  relicLust,
  relicGreed,
  relicGluttony,
  relicEnvy,
};

const Phasing: Record<PhasingEnemyTypes, string> = {
  bat: "Bat",
  crow: "Crow",
  ghost: "Ghost",
  gargoyle: "Gargoyle",
  shade: "Shade",
};

export const StaticRange: Record<StaticRangeEnemyTypes, string> = {
  scarecrow: "Scarecrow",
  imp: "Imp",
  cultist: "Cultist",
  red_stone: "Red stone",
};

export const Melee: Record<MeleeEnemyTypes, string> = {
  carnivore_plant: "Carnivore_plant",
  rat: "Rat",
  zombie: "Zombie",
  skeleton: "Skeleton",
  slime_green: "Slime_green",
  slime_blue: "Slime_blue",
  slime_red: "Slimes",
  vampire: "Vampire",
  frankenstein: "Frankenstein",
  werewolf: "Werewolf",
  hellHound: "HellHound",
  demon1: "Worm Demon",
  demon2: "Demon",
};

export const MiniBoss: Record<MiniBossType, string> = {
  golem: "Golem",
  ent: "Ent",
  mummy: "Mummy",
  living_armor: "Living Armor",
  headless_horseman: "Headless Horseman",
  medusa: "Medusa",
  golem_area4: "Golem",
  ent_area4: "Ent",
  mummy_area4: "Mummy",
  living_armor_area4: "Living Armor",
  headless_horseman_area4: "Headless Horseman",
  medusa_area4: "Medusa",
};

export const Boss: Record<BossTypes, string> = {
  minotaur: "Minotaur",
  witch: "Witch",
  cerberus: "Cerberus",
  sorcerer: "Sorcerer",
  dungeonboss: "Boss",
};

export const ENEMY_WEAPONS: Record<string, string> = {
  CH: "Chasing",
  OR: "Orbiting",
  SU: "Summoning",
  SR: "Static Range",
  SL: "Slash",
  DO: "Domain",
  None: "None",
};

export const getWeaponInitial = (...weapons: string[]): string[] => {
  return weapons.map(
    (weapon) =>
      Object.entries(ENEMY_WEAPONS).find(
        ([, fullName]) => fullName === weapon,
      )?.[0] ?? "N/A",
  );
};

export const ENEMIES_TABLE: {
  image: string;
  type: string;
  hp: number;
  damage: number;
  itemIcon: string;
  powers?: string[];
}[] = [
  // Area 1
  {
    image: bat,
    type: Phasing.bat,
    hp: stats.bat.HP,
    damage: stats.bat.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.bat.DROP_ITEM],
    powers: getWeaponInitial("None"),
  },
  {
    image: scarecrow,
    type: StaticRange.scarecrow,
    hp: stats.scarecrow.HP,
    damage: stats.scarecrow.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.scarecrow.DROP_ITEM],
    powers: getWeaponInitial("Static Range"),
  },
  {
    image: rat,
    type: Melee.rat,
    hp: stats.rat.HP,
    damage: stats.rat.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.rat.DROP_ITEM],
    powers: getWeaponInitial("None"),
  },
  {
    image: zombie,
    type: Melee.zombie,
    hp: stats.zombie.HP,
    damage: stats.zombie.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.zombie.DROP_ITEM],
    powers: getWeaponInitial("None"),
  },
  {
    image: golem,
    type: MiniBoss.golem,
    hp: stats.golem.HP,
    damage: stats.golem.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.golem.DROP_ITEM],
    powers: getWeaponInitial("Orbiting"),
  },
  {
    image: ent,
    type: MiniBoss.ent,
    hp: stats.ent.HP,
    damage: stats.ent.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.ent.DROP_ITEM],
    powers: getWeaponInitial("Summoning"),
  },
  {
    image: minotaur,
    type: Boss.minotaur,
    hp: stats.minotaur.HP,
    damage: stats.minotaur.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.minotaur.DROP_ITEM],
    powers: getWeaponInitial("Slash"),
  },

  // Area 2
  {
    image: crow,
    type: Phasing.crow,
    hp: stats.crow.HP,
    damage: stats.crow.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.crow.DROP_ITEM],
    powers: getWeaponInitial("None"),
  },
  {
    image: ghost,
    type: Phasing.ghost,
    hp: stats.ghost.HP,
    damage: stats.ghost.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.ghost.DROP_ITEM],
    powers: getWeaponInitial("None"),
  },
  {
    image: imp,
    type: StaticRange.imp,
    hp: stats.imp.HP,
    damage: stats.imp.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.imp.DROP_ITEM],
    powers: getWeaponInitial("Static Range"),
  },
  {
    image: skeleton,
    type: Melee.skeleton,
    hp: stats.skeleton.HP,
    damage: stats.skeleton.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.skeleton.DROP_ITEM],
    powers: getWeaponInitial("None"),
  },
  {
    image: slime,
    type: Melee.slime_red,
    hp: stats.slime_red.HP,
    damage: stats.slime_red.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.slime_red.DROP_ITEM],
    powers: getWeaponInitial("None"),
  },
  {
    image: mummy,
    type: MiniBoss.mummy,
    hp: stats.mummy.HP,
    damage: stats.mummy.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.mummy.DROP_ITEM],
    powers: getWeaponInitial("Orbiting"),
  },
  {
    image: living_armor,
    type: MiniBoss.living_armor,
    hp: stats.living_armor.HP,
    damage: stats.living_armor.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.living_armor.DROP_ITEM],
    powers: getWeaponInitial("Orbiting"),
  },
  {
    image: witch,
    type: Boss.witch,
    hp: stats.witch.HP,
    damage: stats.witch.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.witch.DROP_ITEM],
    powers: getWeaponInitial("Orbiting", "Chasing"),
  },

  // Area 3
  {
    image: gargoyle,
    type: Phasing.gargoyle,
    hp: stats.gargoyle.HP,
    damage: stats.gargoyle.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.gargoyle.DROP_ITEM],
    powers: getWeaponInitial("None"),
  },
  {
    image: cultist,
    type: StaticRange.cultist,
    hp: stats.cultist.HP,
    damage: stats.cultist.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.cultist.DROP_ITEM],
    powers: getWeaponInitial("Static Range"),
  },
  {
    image: frankenstein,
    type: Melee.frankenstein,
    hp: stats.frankenstein.HP,
    damage: stats.frankenstein.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.frankenstein.DROP_ITEM],
    powers: getWeaponInitial("None"),
  },
  {
    image: werewolf,
    type: Melee.werewolf,
    hp: stats.werewolf.HP,
    damage: stats.werewolf.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.werewolf.DROP_ITEM],
    powers: getWeaponInitial("None"),
  },
  {
    image: headless_horseman,
    type: MiniBoss.headless_horseman,
    hp: stats.headless_horseman.HP,
    damage: stats.headless_horseman.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.headless_horseman.DROP_ITEM],
    powers: getWeaponInitial("Summoning"),
  },
  {
    image: medusa,
    type: MiniBoss.medusa,
    hp: stats.medusa.HP,
    damage: stats.medusa.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.medusa.DROP_ITEM],
    powers: getWeaponInitial("Chasing"),
  },
  {
    image: cerberus,
    type: Boss.cerberus,
    hp: stats.cerberus.HP,
    damage: stats.cerberus.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.cerberus.DROP_ITEM],
    powers: getWeaponInitial("Chasing", "Summoning"),
  },

  // Area 4
  {
    image: shade,
    type: Phasing.shade,
    hp: stats.shade.HP,
    damage: stats.shade.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.shade.DROP_ITEM],
    powers: getWeaponInitial("None"),
  },
  {
    image: red_stone,
    type: StaticRange.red_stone,
    hp: stats.red_stone.HP,
    damage: stats.red_stone.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.red_stone.DROP_ITEM],
    powers: getWeaponInitial("Static Range"),
  },
  {
    image: demon1,
    type: Melee.demon1,
    hp: stats.demon1.HP,
    damage: stats.demon1.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.demon1.DROP_ITEM],
    powers: getWeaponInitial("None"),
  },
  {
    image: demon2,
    type: Melee.demon2,
    hp: stats.demon2.HP,
    damage: stats.demon2.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.demon2.DROP_ITEM],
    powers: getWeaponInitial("None"),
  },
  {
    image: golem,
    type: MiniBoss.golem_area4,
    hp: stats.golem_area4.HP,
    damage: stats.golem_area4.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.golem_area4.DROP_ITEM],
    powers: getWeaponInitial("Orbiting"),
  },
  {
    image: ent,
    type: MiniBoss.ent_area4,
    hp: stats.ent_area4.HP,
    damage: stats.ent_area4.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.ent_area4.DROP_ITEM],
    powers: getWeaponInitial("Summoning"),
  },
  {
    image: mummy,
    type: MiniBoss.mummy_area4,
    hp: stats.mummy_area4.HP,
    damage: stats.mummy_area4.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.mummy_area4.DROP_ITEM],
    powers: getWeaponInitial("Orbiting"),
  },
  {
    image: living_armor,
    type: MiniBoss.living_armor_area4,
    hp: stats.living_armor_area4.HP,
    damage: stats.living_armor_area4.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.living_armor_area4.DROP_ITEM],
    powers: getWeaponInitial("Orbiting"),
  },
  {
    image: headless_horseman,
    type: MiniBoss.headless_horseman_area4,
    hp: stats.headless_horseman_area4.HP,
    damage: stats.headless_horseman_area4.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.headless_horseman_area4.DROP_ITEM],
    powers: getWeaponInitial("Summoning"),
  },
  {
    image: medusa,
    type: MiniBoss.medusa_area4,
    hp: stats.medusa_area4.HP,
    damage: stats.medusa_area4.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.medusa_area4.DROP_ITEM],
    powers: getWeaponInitial("Chasing"),
  },
  {
    image: sorcerer,
    type: Boss.sorcerer,
    hp: stats.sorcerer.HP,
    damage: stats.sorcerer.DAMAGE,
    itemIcon: DROP_ITEM_ASSETS[stats.sorcerer.DROP_ITEM],
    powers: getWeaponInitial("Domain", "Summoning", "Chasing", "Orbiting"),
  },
];

function getWeaponMaxStat(weaponId: WeaponId, stat: WeaponStatKey) {
  return WEAPON_UPGRADES[weaponId]
    .flatMap((upgrade) => upgrade.modifiers)
    .filter((modifier) => modifier.stat === stat)
    .reduce((total, modifier) => {
      if (modifier.operation === "add") return total + modifier.value;
      if (modifier.operation === "set") return modifier.value;

      return total;
    }, WEAPON_CONFIGS[weaponId].baseStats[stat]);
}

function getWeaponMaxDamage(weaponId: WeaponId) {
  return getWeaponMaxStat(weaponId, "damage");
}

export const SKILLS_TABLE: {
  image: string;
  skillName: string;
  description: string;
  minDamage: number;
  maxDamage: number;
}[] = [
  {
    image: frozen_skull_icon,
    skillName: t("minigame.weapon.frozenSkull"),
    description: t("minigame.enemy2"),
    minDamage: skill_config.frozenSkull.baseStats.damage,
    maxDamage: getWeaponMaxDamage("frozenSkull"),
  },
  {
    image: blood_scythe_icon,
    skillName: t("minigame.weapon.bloodScythe"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.bloodScythe.baseStats.damage,
    maxDamage: getWeaponMaxDamage("bloodScythe"),
  },
  {
    image: darkness_book_icon,
    skillName: t("minigame.weapon.darknessBook"),
    description: t("minigame.enemy1"),
    minDamage: skill_config.darknessBook.baseStats.damage,
    maxDamage: getWeaponMaxDamage("darknessBook"),
  },
  {
    image: poison_vial_icon,
    skillName: t("minigame.weapon.poisonVial"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.poisonVial.baseStats.damage,
    maxDamage: getWeaponMaxDamage("poisonVial"),
  },
  {
    image: blood_knife_icon,
    skillName: t("minigame.weapon.bloodKnife"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.bloodKnife.baseStats.damage,
    maxDamage: getWeaponMaxDamage("bloodKnife"),
  },
  {
    image: frost_flower_icon,
    skillName: t("minigame.weapon.frostFlower"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.frostFlower.baseStats.damage,
    maxDamage: getWeaponMaxDamage("frostFlower"),
  },
  {
    image: moss_ground_icon,
    skillName: t("minigame.weapon.mossGround"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.mossGround.baseStats.damage,
    maxDamage: getWeaponMaxDamage("mossGround"),
  },
  {
    image: banished_jack_o_lantern_icon,
    skillName: t("minigame.weapon.banishedJackOLantern"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.banishedJackOLantern.baseStats.damage,
    maxDamage: getWeaponMaxDamage("banishedJackOLantern"),
  },
  {
    image: fly_storm_icon,
    skillName: t("minigame.weapon.flyStorm"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.flyStorm.baseStats.damage,
    maxDamage: getWeaponMaxDamage("flyStorm"),
  },
  {
    image: frost_chain_icon,
    skillName: t("minigame.weapon.frostChain"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.frostChain.baseStats.damage,
    maxDamage: getWeaponMaxDamage("frostChain"),
  },
  {
    image: crimson_vial_icon,
    skillName: t("minigame.weapon.crimsonVial"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.crimsonVial.baseStats.dotDamage,
    maxDamage: getWeaponMaxStat("crimsonVial", "dotDamage"),
  },
  {
    image: cursed_coffin_icon,
    skillName: t("minigame.weapon.cursedCoffin"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.cursedCoffin.baseStats.damage,
    maxDamage: getWeaponMaxDamage("cursedCoffin"),
  },
];

export const DROP_ITEMS_XP_TABLE: {
  image: string;
  description: string;
  xp: number;
}[] = [
  {
    image: relicWrath,
    description: t("minigame.enemy1"),
    xp: DROP_ITEM_XP_VALUES.relicWrath,
  },
  {
    image: relicSloth,
    description: t("minigame.enemy2"),
    xp: DROP_ITEM_XP_VALUES.relicSloth,
  },
  {
    image: relicPride,
    description: t("minigame.enemy2"),
    xp: DROP_ITEM_XP_VALUES.relicPride,
  },
  {
    image: relicLust,
    description: t("minigame.enemy2"),
    xp: DROP_ITEM_XP_VALUES.relicLust,
  },
  {
    image: relicGluttony,
    description: t("minigame.enemy2"),
    xp: DROP_ITEM_XP_VALUES.relicGluttony,
  },
  {
    image: relicGreed,
    description: t("minigame.enemy2"),
    xp: DROP_ITEM_XP_VALUES.relicGreed,
  },
  {
    image: relicEnvy,
    description: t("minigame.enemy2"),
    xp: DROP_ITEM_XP_VALUES.relicEnvy,
  },
];

// Panel
export const PANEL_NPC_WEARABLES: Equipped = {
  body: "Beige Farmer Potion",
  background: "Scary Nights Background",
  suit: "Skeleton Costume",
  tool: "Hook and Chain",
  wings: "Sky Tearer Wings",
  hat: "Skeleton Mask",
};

// SFX
export const WEAPON_SFX_VOL = 0.1;
export const WEAPON_SFX: Record<WeaponId, { activate: string }> = {
  frozenSkull: { activate: "sfx_banana_swing" },
  bloodScythe: { activate: "sfx_slash_broom" },
  darknessBook: { activate: "sfx_water_shot" },
  poisonVial: { activate: "sfx_explosion_pop" },
  bloodKnife: { activate: "sfx_tomato_throw" },
  frostFlower: { activate: "sfx_light_shot" },
  mossGround: { activate: "sfx_oil_cast" },
  banishedJackOLantern: { activate: "sfx_pumpkin_roll" },
  flyStorm: { activate: "sfx_bee_spawn" },
  cursedCoffin: { activate: "sfx_explosion_pop" },
  frostChain: { activate: "sfx_slash_broom" },
  crimsonVial: { activate: "sfx_oil_cast" },
};
