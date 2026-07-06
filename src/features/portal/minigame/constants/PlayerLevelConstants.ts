import { LevelUpChoice, PlayerStatId, WeaponId, WeaponLevel } from "../Types";
import { PLAYER_STAT_IDS } from "./PlayerStatConstants";
import { WEAPON_CONFIGS } from "./WeaponConstants";

export const LEVEL_UP_WEAPON_IDS = Object.keys(WEAPON_CONFIGS) as WeaponId[];

export const PLAYER_INITIAL_LEVEL = 1;
export const PLAYER_XP_POINTS_START_LEVEL = 6;
export const MAX_PLAYER_WEAPONS = 4;

export const PLAYER_LEVEL_XP_REQUIREMENTS: Record<number, number> = {
  1: 10,
  2: 25,
  3: 40,
  4: 55,
  5: 75,
  6: 100,
  7: 130,
  8: 165,
  9: 205,
  10: 250,
  11: 300,
  12: 350,
  13: 410,
  14: 470,
  15: 500,
  16: 540,
  17: 615,
  18: 695,
  19: 780,
  20: 850,
  21: 950,
  22: 1065,
  23: 1150,
  24: 1280,
  25: 1395,
  26: 1500,
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
