import { WEAPON_UPGRADES } from "features/portal/minigame/constants/WeaponConstants";
import type {
  PlayerStatLevel,
  WeaponId,
  WeaponRuntimeStats,
} from "features/portal/minigame/Types";
import { resolvePlayerDamage } from "features/portal/minigame/constants/PlayerStatConstants";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { getActiveWearableBuffs } from "features/portal/minigame/constants/WearableConstants";
import type {
  WearableBuff,
  WearableBuffTarget,
} from "features/portal/minigame/constants/WearableConstants";

const isWeaponStatBuff = (
  buff: WearableBuff,
): buff is WearableBuff & {
  target: Extract<WearableBuffTarget, { type: "weaponStat" }>;
} => buff.target.type === "weaponStat";

export const getUpgradeableWeaponStats = (id: WeaponId) =>
  Array.from(
    new Set<keyof WeaponRuntimeStats>(
      WEAPON_UPGRADES[id].flatMap((upgrade) =>
        upgrade.modifiers.map(({ stat }) => stat),
      ),
    ),
  );

export const getBuffedWeaponStats = (
  id: WeaponId,
  activeWearables?: BumpkinParts,
) =>
  Array.from(
    new Set<keyof WeaponRuntimeStats>(
      getActiveWearableBuffs(activeWearables)
        .filter(isWeaponStatBuff)
        .filter((buff) => buff.target.weapon === id)
        .map((buff) => buff.target.stat),
    ),
  );

export const getWeaponDetailStats = (
  id: WeaponId,
  activeWearables?: BumpkinParts,
) => {
  const upgradeStats = getUpgradeableWeaponStats(id);
  const buffStats = getBuffedWeaponStats(id, activeWearables);

  return Array.from(
    new Set<keyof WeaponRuntimeStats>([...upgradeStats, ...buffStats]),
  );
};

export const resolveDisplayedWeaponStatValue = ({
  stat,
  value,
  damageLevel,
  activeWearables,
}: {
  stat: keyof WeaponRuntimeStats;
  value?: number;
  damageLevel: PlayerStatLevel;
  activeWearables?: BumpkinParts;
}) => {
  const receivesBaseDamage = stat === "damage" || stat === "dotDamage";
  if (value === undefined || !receivesBaseDamage) return value;

  return resolvePlayerDamage(value, damageLevel, activeWearables);
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
