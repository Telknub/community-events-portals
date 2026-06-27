import {
  DEFAULT_PLAYER_STAT_LEVELS,
  getNextPlayerStatLevel,
  getPlayerStatUpgradeCost,
  getPlayerStatValue,
  getPlayerStatValueIncrease,
  PLAYER_STAT_MAX_LEVEL,
  PLAYER_STAT_UPGRADE_XP_COSTS,
  resolvePlayerDamage,
  resolvePlayerStatUpgrade,
} from "./PlayerStatConstants";

describe("PlayerStatConstants", () => {
  it("defines ten balanced levels for each player stat", () => {
    expect(getPlayerStatValue("health", 1)).toBe(100);
    expect(getPlayerStatValue("health", 10)).toBe(190);
    expect(getPlayerStatValue("speed", 1)).toBe(50);
    expect(getPlayerStatValue("speed", 10)).toBe(95);
    expect(getPlayerStatValue("damage", 1)).toBe(0);
    expect(getPlayerStatValue("damage", 10)).toBe(9);
  });

  it("resolves upgrade levels and costs", () => {
    expect(getNextPlayerStatLevel(1)).toBe(2);
    expect(getNextPlayerStatLevel(PLAYER_STAT_MAX_LEVEL)).toBeUndefined();
    expect(getPlayerStatUpgradeCost(1)).toBe(20);
    expect(getPlayerStatUpgradeCost(9)).toBe(450);
    expect(getPlayerStatUpgradeCost(10)).toBeUndefined();
    expect(PLAYER_STAT_UPGRADE_XP_COSTS).toEqual({
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
    });
  });

  it("starts every stat at level one", () => {
    expect(DEFAULT_PLAYER_STAT_LEVELS).toEqual({
      health: 1,
      speed: 1,
      damage: 1,
    });
  });

  it("spends XP, preserves the excess and blocks invalid upgrades", () => {
    expect(resolvePlayerStatUpgrade({ level: 1, xp: 35 })).toEqual({
      level: 2,
      xp: 15,
      upgraded: true,
    });
    expect(resolvePlayerStatUpgrade({ level: 1, xp: 19 })).toEqual({
      level: 1,
      xp: 19,
      upgraded: false,
    });
    expect(resolvePlayerStatUpgrade({ level: 10, xp: 1000 })).toEqual({
      level: 10,
      xp: 1000,
      upgraded: false,
    });
  });

  it("resolves health increases and global damage bonuses", () => {
    expect(getPlayerStatValueIncrease("health", 1)).toBe(10);
    expect(getPlayerStatValueIncrease("health", 10)).toBe(0);
    expect(resolvePlayerDamage(2, 4)).toBe(5);
  });
});
