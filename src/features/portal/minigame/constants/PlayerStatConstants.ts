import { PlayerStatId, PlayerStatLevel, PlayerStatLevels } from "../Types";

export const PLAYER_STAT_INITIAL_LEVEL: PlayerStatLevel = 1;
export const PLAYER_STAT_BASE_LEVEL: PlayerStatLevel = 0;
export const PLAYER_STAT_MAX_LEVEL: PlayerStatLevel = 10;
export const PLAYER_WATER_SPEED_MULTIPLIER = 0.6;

export const PLAYER_STAT_IDS: PlayerStatId[] = ["health", "speed", "damage"];

export const PLAYER_STAT_VALUES: Record<
  PlayerStatId,
  Record<PlayerStatLevel, number>
> = {
  health: {
    0: 100,
    1: 110,
    2: 120,
    3: 130,
    4: 140,
    5: 150,
    6: 160,
    7: 170,
    8: 180,
    9: 190,
    10: 200,
  },
  speed: {
    0: 50,
    1: 55,
    2: 60,
    3: 65,
    4: 70,
    5: 75,
    6: 80,
    7: 85,
    8: 90,
    9: 95,
    10: 100,
  },
  damage: {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
  },
};

export const PLAYER_STAT_UPGRADE_XP_COSTS: Record<
  PlayerStatLevel,
  number | null
> = {
  0: null,
  1: null,
  2: 20,
  3: 20,
  4: 50,
  5: 90,
  6: 140,
  7: 200,
  8: 270,
  9: 350,
  10: 450,
};

export const DEFAULT_PLAYER_STAT_LEVELS: PlayerStatLevels = {
  health: PLAYER_STAT_BASE_LEVEL,
  speed: PLAYER_STAT_BASE_LEVEL,
  damage: PLAYER_STAT_BASE_LEVEL,
};

export const getPlayerStatValue = (
  stat: PlayerStatId,
  level: PlayerStatLevel,
) => PLAYER_STAT_VALUES[stat][level];

export const getNextPlayerStatLevel = (
  level: PlayerStatLevel,
): PlayerStatLevel | undefined => {
  if (level >= PLAYER_STAT_MAX_LEVEL) return undefined;

  return (level + 1) as PlayerStatLevel;
};

export const getPlayerStatUpgradeCost = (
  level: PlayerStatLevel,
): number | undefined => {
  const nextLevel = getNextPlayerStatLevel(level);
  if (!nextLevel) return undefined;

  return PLAYER_STAT_UPGRADE_XP_COSTS[nextLevel] ?? undefined;
};

export const resolvePlayerStatUpgrade = ({
  level,
  xp,
}: {
  level: PlayerStatLevel;
  xp: number;
}) => {
  const nextLevel = getNextPlayerStatLevel(level);
  const cost = getPlayerStatUpgradeCost(level);
  const canUpgrade =
    nextLevel !== undefined && cost !== undefined && xp >= cost;

  return {
    level: canUpgrade ? nextLevel : level,
    xp: canUpgrade ? xp - cost : xp,
    upgraded: canUpgrade,
  };
};

export const getPlayerStatValueIncrease = (
  stat: PlayerStatId,
  level: PlayerStatLevel,
) => {
  const nextLevel = getNextPlayerStatLevel(level);
  if (!nextLevel) return 0;

  return getPlayerStatValue(stat, nextLevel) - getPlayerStatValue(stat, level);
};

export const resolvePlayerDamage = (
  baseDamage: number,
  damageLevel: PlayerStatLevel,
) => baseDamage + getPlayerStatValue("damage", damageLevel);
