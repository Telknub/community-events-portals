import { TranslationKeys } from "lib/i18n/dictionaries/types";
import { WeaponId, WeaponRuntimeStats } from "../Types";
import { PORTAL_NAME } from "./ConfigConstants";
import { WEAPON_CONFIGS } from "./WeaponConstants";

import hoeIcon from "public/world/portal/images/hoe.webp";
import cornIcon from "public/world/portal/images/skill_corn_bomb_icon.webp";
import beeIcon from "public/world/portal/images/skill_summon_bees_icon.webp";
import waterIcon from "public/world/portal/images/skill_water_pistol_icon.webp";
import bladeIcon from "public/world/portal/images/skill_windBlade_skill_icon.webp";

export const WEAPON_ICONS: Record<WeaponId, string> = {
  hoe: hoeIcon,
  broomScythe: bladeIcon,
  wateringCan: waterIcon,
  corn: cornIcon,
  tomato: cornIcon,
  sunflower: waterIcon,
  wheat: hoeIcon,
  pumpkin: cornIcon,
  beehive: beeIcon,
};

export const WEAPON_IDS = Object.keys(WEAPON_CONFIGS) as WeaponId[];

export const WEAPON_NAMES: Record<WeaponId, TranslationKeys> = {
  hoe: `${PORTAL_NAME}.weapon.hoe`,
  broomScythe: `${PORTAL_NAME}.weapon.broomScythe`,
  wateringCan: `${PORTAL_NAME}.weapon.wateringCan`,
  corn: `${PORTAL_NAME}.weapon.corn`,
  tomato: `${PORTAL_NAME}.weapon.tomato`,
  sunflower: `${PORTAL_NAME}.weapon.sunflower`,
  wheat: `${PORTAL_NAME}.weapon.wheat`,
  pumpkin: `${PORTAL_NAME}.weapon.pumpkin`,
  beehive: `${PORTAL_NAME}.weapon.beehive`,
};

export const WEAPON_STAT_LABELS: Record<
  keyof WeaponRuntimeStats,
  TranslationKeys
> = {
  damage: `${PORTAL_NAME}.weapon.stat.damage`,
  cooldownMs: `${PORTAL_NAME}.weapon.stat.cooldownMs`,
  projectileSpeed: `${PORTAL_NAME}.weapon.stat.projectileSpeed`,
  projectileCount: `${PORTAL_NAME}.weapon.stat.projectileCount`,
  spreadDegrees: `${PORTAL_NAME}.weapon.stat.spreadDegrees`,
  areaRadius: `${PORTAL_NAME}.weapon.stat.areaRadius`,
  orbitRadius: `${PORTAL_NAME}.weapon.stat.orbitRadius`,
  orbitalCount: `${PORTAL_NAME}.weapon.stat.orbitalCount`,
  durationMs: `${PORTAL_NAME}.weapon.stat.durationMs`,
  size: `${PORTAL_NAME}.weapon.stat.size`,
  pierce: `${PORTAL_NAME}.weapon.stat.pierce`,
  bounceCount: `${PORTAL_NAME}.weapon.stat.bounceCount`,
  chainRadius: `${PORTAL_NAME}.weapon.stat.chainRadius`,
  arcDegrees: `${PORTAL_NAME}.weapon.stat.arcDegrees`,
  range: `${PORTAL_NAME}.weapon.stat.range`,
  dotDamage: `${PORTAL_NAME}.weapon.stat.dotDamage`,
  dotTickMs: `${PORTAL_NAME}.weapon.stat.dotTickMs`,
  statusDurationMs: `${PORTAL_NAME}.weapon.stat.statusDurationMs`,
  homingSpeed: `${PORTAL_NAME}.weapon.stat.homingSpeed`,
  hitCooldownMs: `${PORTAL_NAME}.weapon.stat.hitCooldownMs`,
  angularSpeed: `${PORTAL_NAME}.weapon.stat.angularSpeed`,
};

export const WEAPON_STAT_DESCRIPTIONS: Record<
  keyof WeaponRuntimeStats,
  TranslationKeys
> = {
  damage: `${PORTAL_NAME}.weapon.statDescription.damage`,
  cooldownMs: `${PORTAL_NAME}.weapon.statDescription.cooldownMs`,
  projectileSpeed: `${PORTAL_NAME}.weapon.statDescription.projectileSpeed`,
  projectileCount: `${PORTAL_NAME}.weapon.statDescription.projectileCount`,
  spreadDegrees: `${PORTAL_NAME}.weapon.statDescription.spreadDegrees`,
  areaRadius: `${PORTAL_NAME}.weapon.statDescription.areaRadius`,
  orbitRadius: `${PORTAL_NAME}.weapon.statDescription.orbitRadius`,
  orbitalCount: `${PORTAL_NAME}.weapon.statDescription.orbitalCount`,
  durationMs: `${PORTAL_NAME}.weapon.statDescription.durationMs`,
  size: `${PORTAL_NAME}.weapon.statDescription.size`,
  pierce: `${PORTAL_NAME}.weapon.statDescription.pierce`,
  bounceCount: `${PORTAL_NAME}.weapon.statDescription.bounceCount`,
  chainRadius: `${PORTAL_NAME}.weapon.statDescription.chainRadius`,
  arcDegrees: `${PORTAL_NAME}.weapon.statDescription.arcDegrees`,
  range: `${PORTAL_NAME}.weapon.statDescription.range`,
  dotDamage: `${PORTAL_NAME}.weapon.statDescription.dotDamage`,
  dotTickMs: `${PORTAL_NAME}.weapon.statDescription.dotTickMs`,
  statusDurationMs: `${PORTAL_NAME}.weapon.statDescription.statusDurationMs`,
  homingSpeed: `${PORTAL_NAME}.weapon.statDescription.homingSpeed`,
  hitCooldownMs: `${PORTAL_NAME}.weapon.statDescription.hitCooldownMs`,
  angularSpeed: `${PORTAL_NAME}.weapon.statDescription.angularSpeed`,
};
