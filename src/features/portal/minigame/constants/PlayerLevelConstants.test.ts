import type { WeaponId, WeaponLevel } from "../Types";
import {
  getAvailableWeaponChoices,
  getLevelUpChoice,
  getNextLevelXP,
  getUnlockedWeapons,
  isPlayerMaxLevel,
  LEVEL_UP_WEAPON_IDS,
  PLAYER_INITIAL_LEVEL,
  PLAYER_LEVEL_XP_REQUIREMENTS,
  PLAYER_MAX_LEVEL,
  shouldGrantXPPoint,
} from "./PlayerLevelConstants";

const getWeaponLevels = (
  unlocked: WeaponId[] = [],
): Record<WeaponId, WeaponLevel> =>
  LEVEL_UP_WEAPON_IDS.reduce(
    (levels, weapon) => ({
      ...levels,
      [weapon]: unlocked.includes(weapon) ? 1 : 0,
    }),
    {} as Record<WeaponId, WeaponLevel>,
  );

describe("PlayerLevelConstants", () => {
  it("starts the player at level one and uses editable XP requirements", () => {
    expect(PLAYER_INITIAL_LEVEL).toBe(1);
    expect(getNextLevelXP(1)).toBe(PLAYER_LEVEL_XP_REQUIREMENTS[1]);
    expect(getNextLevelXP(2)).toBe(PLAYER_LEVEL_XP_REQUIREMENTS[2]);
    expect(getNextLevelXP(5)).toBe(PLAYER_LEVEL_XP_REQUIREMENTS[5]);
  });

  it("uses the last configured XP requirement as the player max level", () => {
    const configuredMaxLevel = Math.max(
      ...Object.keys(PLAYER_LEVEL_XP_REQUIREMENTS).map(Number),
    );

    expect(PLAYER_MAX_LEVEL).toBe(configuredMaxLevel);
    expect(isPlayerMaxLevel(PLAYER_MAX_LEVEL - 1)).toBe(false);
    expect(isPlayerMaxLevel(PLAYER_MAX_LEVEL)).toBe(true);
    expect(isPlayerMaxLevel(PLAYER_MAX_LEVEL + 1)).toBe(true);
    expect(getNextLevelXP(PLAYER_MAX_LEVEL - 1)).toBe(
      PLAYER_LEVEL_XP_REQUIREMENTS[PLAYER_MAX_LEVEL - 1],
    );
    expect(getNextLevelXP(PLAYER_MAX_LEVEL)).toBeUndefined();
    expect(getNextLevelXP(PLAYER_MAX_LEVEL + 1)).toBeUndefined();
  });

  it("selects level-up choices for early levels", () => {
    const weaponLevels = getWeaponLevels(["banana"]);

    expect(getLevelUpChoice({ level: 1, weaponLevels })?.type).toBe("weapon");
    expect(getLevelUpChoice({ level: 2, weaponLevels })).toEqual({
      type: "stat",
      level: 2,
      options: ["health", "speed", "damage"],
    });
    expect(getLevelUpChoice({ level: 6, weaponLevels })).toBeUndefined();
  });

  it("excludes already unlocked weapons from future choices", () => {
    const weaponLevels = getWeaponLevels(["banana", "corn"]);
    const options = getAvailableWeaponChoices(weaponLevels);

    expect(options).not.toContain("banana");
    expect(options).not.toContain("corn");
    expect(getUnlockedWeapons(weaponLevels)).toEqual(["banana", "corn"]);
  });

  it("grants XP points from level six onward", () => {
    expect(shouldGrantXPPoint(5)).toBe(false);
    expect(shouldGrantXPPoint(6)).toBe(true);
    expect(shouldGrantXPPoint(12)).toBe(true);
  });
});
