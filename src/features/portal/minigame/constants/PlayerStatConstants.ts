import { PlayerStatId, PlayerStatLevel, PlayerStatLevels } from "../Types";

export const PLAYER_STAT_INITIAL_LEVEL: PlayerStatLevel = 1;
export const PLAYER_STAT_MAX_LEVEL: PlayerStatLevel = 10;
export const PLAYER_WATER_SPEED_MULTIPLIER = 0.6;

export const PLAYER_STAT_IDS: PlayerStatId[] = ["health", "speed", "damage"];

export const PLAYER_STAT_VALUES: Record<
  PlayerStatId,
  Record<PlayerStatLevel, number>
> = {
  health: {
    1: 100,
    2: 110,
    3: 120,
    4: 130,
    5: 140,
    6: 150,
    7: 160,
    8: 170,
    9: 180,
    10: 190,
  },
  speed: {
    1: 50,
    2: 55,
    3: 60,
    4: 65,
    5: 70,
    6: 75,
    7: 80,
    8: 85,
    9: 90,
    10: 95,
  },
  damage: {
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
    7: 6,
    8: 7,
    9: 8,
    10: 9,
  },
};

export const PLAYER_STAT_UPGRADE_XP_COSTS: Record<
  PlayerStatLevel,
  number | null
> = {
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
  health: PLAYER_STAT_INITIAL_LEVEL,
  speed: PLAYER_STAT_INITIAL_LEVEL,
  damage: PLAYER_STAT_INITIAL_LEVEL,
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
