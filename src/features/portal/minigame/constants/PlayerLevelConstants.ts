import { LevelUpChoice, PlayerStatId, WeaponId, WeaponLevel } from "../Types";
import { PLAYER_STAT_IDS } from "./PlayerStatConstants";
import { WEAPON_CONFIGS } from "./WeaponConstants";

export const LEVEL_UP_WEAPON_IDS = Object.keys(WEAPON_CONFIGS) as WeaponId[];

export const PLAYER_INITIAL_LEVEL = 1;
export const PLAYER_XP_POINTS_START_LEVEL = 6;
export const MAX_PLAYER_WEAPONS = 4;

export const PLAYER_LEVEL_XP_REQUIREMENTS: Record<number, number> = {
  1: 20,
  2: 20,
  3: 50,
  4: 90,
  5: 140,
  6: 200,
  7: 270,
  8: 350,
  9: 450,
  10: 560,
  11: 680,
  12: 810,
  13: 950,
  14: 1100,
  15: 1260,
  16: 1430,
  17: 1610,
  18: 1800,
  19: 2000,
  20: 2210,
};

export const PLAYER_MAX_LEVEL = Math.max(
  ...Object.keys(PLAYER_LEVEL_XP_REQUIREMENTS).map(Number),
);

export const isPlayerMaxLevel = (level: number) => level >= PLAYER_MAX_LEVEL;

export const getNextLevelXP = (level: number) => {
  if (isPlayerMaxLevel(level)) return undefined;

  return PLAYER_LEVEL_XP_REQUIREMENTS[level];
};

export const shuffleOptions = <T>(options: T[]) => {
  const shuffled = [...options];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};

export const getUnlockedWeapons = (
  weaponLevels: Record<WeaponId, WeaponLevel>,
) => LEVEL_UP_WEAPON_IDS.filter((weapon) => weaponLevels[weapon] > 0);

export const getAvailableWeaponChoices = (
  weaponLevels: Record<WeaponId, WeaponLevel>,
) => LEVEL_UP_WEAPON_IDS.filter((weapon) => weaponLevels[weapon] === 0);

export const getLevelUpChoice = ({
  level,
  weaponLevels,
}: {
  level: number;
  weaponLevels: Record<WeaponId, WeaponLevel>;
}): LevelUpChoice | undefined => {
  if (level === 2) {
    return {
      type: "stat",
      level,
      options: [...PLAYER_STAT_IDS] as PlayerStatId[],
    };
  }

  if (level >= 1 && level <= 5) {
    return {
      type: "weapon",
      level,
      options: shuffleOptions(getAvailableWeaponChoices(weaponLevels)).slice(
        0,
        3,
      ),
    };
  }

  return undefined;
};

export const shouldGrantXPPoint = (level: number) =>
  level >= PLAYER_XP_POINTS_START_LEVEL;
