import { TranslationKeys } from "lib/i18n/dictionaries/types";
import { WeaponId, WeaponRuntimeStats } from "../Types";
import { PORTAL_NAME } from "./PortalConstants";
import { WEAPON_CONFIGS } from "./WeaponConstants";

import banana_icon from "public/world/portal/images/banana_icon.webp";
import scythe_icon from "public/world/portal/images/scythe_icon.png";
import tomato_icon from "public/world/portal/images/tomato_icon.png";
import sunflower_icon from "public/world/portal/images/sunflower_icon.png";
import oil_icon from "public/world/portal/images/oil_icon.png";
import beehive_icon from "public/world/portal/images/beehive_icon.webp";
import corn_bomb_icon from "public/world/portal/images/corn_bomb_icon.webp";
import pumpkin_icon from "public/world/portal/images/pumpkin_icon.webp";
import watering_can_icon from "public/world/portal/images/watering_can_icon.webp";

export const WEAPON_ICONS: Record<WeaponId, string> = {
  banana: banana_icon,
  broomScythe: scythe_icon,
  wateringCan: watering_can_icon,
  corn: corn_bomb_icon,
  tomato: tomato_icon,
  sunflower: sunflower_icon,
  oil: oil_icon,
  pumpkin: pumpkin_icon,
  beehive: beehive_icon,
};

export const WEAPON_IDS = Object.keys(WEAPON_CONFIGS) as WeaponId[];

export const WEAPON_NAMES: Record<WeaponId, TranslationKeys> = {
  banana: `${PORTAL_NAME}.weapon.banana`,
  broomScythe: `${PORTAL_NAME}.weapon.broomScythe`,
  wateringCan: `${PORTAL_NAME}.weapon.wateringCan`,
  corn: `${PORTAL_NAME}.weapon.corn`,
  tomato: `${PORTAL_NAME}.weapon.tomato`,
  sunflower: `${PORTAL_NAME}.weapon.sunflower`,
  oil: `${PORTAL_NAME}.weapon.oil`,
  pumpkin: `${PORTAL_NAME}.weapon.pumpkin`,
  beehive: `${PORTAL_NAME}.weapon.beehive`,
};

export const WEAPON_DESCRIPTIONS: Record<WeaponId, TranslationKeys> = {
  banana: `${PORTAL_NAME}.weapon.description.banana`,
  broomScythe: `${PORTAL_NAME}.weapon.description.broomScythe`,
  wateringCan: `${PORTAL_NAME}.weapon.description.wateringCan`,
  corn: `${PORTAL_NAME}.weapon.description.corn`,
  tomato: `${PORTAL_NAME}.weapon.description.tomato`,
  sunflower: `${PORTAL_NAME}.weapon.description.sunflower`,
  oil: `${PORTAL_NAME}.weapon.description.oil`,
  pumpkin: `${PORTAL_NAME}.weapon.description.pumpkin`,
  beehive: `${PORTAL_NAME}.weapon.description.beehive`,
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
