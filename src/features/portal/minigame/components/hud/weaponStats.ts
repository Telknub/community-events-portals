import {
  WEAPON_CONFIGS,
  WEAPON_UPGRADES,
} from "features/portal/minigame/constants";
import {
  PlayerStatLevel,
  WeaponId,
  WeaponRuntimeStats,
} from "features/portal/minigame/Types";
import { resolvePlayerDamage } from "features/portal/minigame/constants/PlayerStatConstants";

export const resolveWeaponStats = (
  id: WeaponId,
  level: number,
): WeaponRuntimeStats => {
  const stats = { ...WEAPON_CONFIGS[id].baseStats };

  WEAPON_UPGRADES[id]
    .filter((upgrade) => upgrade.level <= level)
    .forEach((upgrade) => {
      upgrade.modifiers.forEach(({ stat, operation, value }) => {
        if (operation === "add") {
          stats[stat] += value;
        } else if (operation === "multiply") {
          stats[stat] *= value;
        } else {
          stats[stat] = value;
        }
      });
    });

  stats.cooldownMs = Math.max(80, Math.round(stats.cooldownMs));
  stats.projectileCount = Math.max(1, Math.round(stats.projectileCount));
  stats.orbitalCount = Math.max(1, Math.round(stats.orbitalCount));
  stats.pierce = Math.round(stats.pierce);
  stats.bounceCount = Math.round(stats.bounceCount);

  return stats;
};

export const getWeaponDetailStats = (id: WeaponId) => {
  const upgradeStats = WEAPON_UPGRADES[id].flatMap((upgrade) =>
    upgrade.modifiers.map(({ stat }) => stat),
  );

  return Array.from(new Set<keyof WeaponRuntimeStats>(upgradeStats));
};

export const resolveDisplayedWeaponStatValue = ({
  stat,
  value,
  damageLevel,
}: {
  stat: keyof WeaponRuntimeStats;
  value?: number;
  damageLevel: PlayerStatLevel;
}) => {
  const receivesBaseDamage = stat === "damage" || stat === "dotDamage";
  if (value === undefined || !receivesBaseDamage) return value;

  return resolvePlayerDamage(value, damageLevel);
};

const formatNumber = (value: number) => {
  if (Number.isInteger(value)) return value;

  if (Math.abs(value) < 1) return Number(value.toFixed(3));

  return Number(value.toFixed(1));
};

export const formatStatValue = (
  stat: keyof WeaponRuntimeStats,
  value: number,
) => {
  if (stat.endsWith("Ms")) {
    const seconds = value / 1000;

    return Number.isInteger(seconds) ? seconds : Number(seconds.toFixed(2));
  }

  return formatNumber(value);
};

export const hasStatImproved = (
  stat: keyof WeaponRuntimeStats,
  currentValue?: number,
  nextValue?: number,
) => {
  if (currentValue === undefined || nextValue === undefined) return false;

  if (stat === "cooldownMs" || stat === "hitCooldownMs") {
    return nextValue < currentValue;
  }

  return nextValue > currentValue;
};
