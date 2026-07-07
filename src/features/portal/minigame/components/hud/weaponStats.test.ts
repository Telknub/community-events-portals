import {
  getBuffedWeaponStats,
  getUpgradeableWeaponStats,
  getWeaponDetailStats,
} from "./weaponStats";

describe("weaponStats", () => {
  it("returns only upgradeable stats for a weapon", () => {
    expect(getUpgradeableWeaponStats("corn")).toEqual([
      "areaRadius",
      "damage",
      "durationMs",
      "cooldownMs",
      "projectileSpeed",
      "projectileCount",
    ]);
  });

  it("does not include base-only stats without active wearable buffs", () => {
    expect(getWeaponDetailStats("corn")).not.toContain("chainRadius");
    expect(getWeaponDetailStats("corn")).not.toContain("bounceCount");
  });

  it("includes active wearable buff stats for the matching weapon", () => {
    const activeWearables = {
      tool: "Carrot Pitchfork",
    } as never;

    expect(getBuffedWeaponStats("corn", activeWearables)).toEqual([
      "projectileSpeed",
    ]);
    expect(getWeaponDetailStats("corn", activeWearables)).toContain(
      "projectileSpeed",
    );
  });

  it("keeps upgradeable stats independent from active wearable buffs", () => {
    const activeWearables = {
      background: "Slime Wall Background",
    } as never;
    const upgradeableStats = getUpgradeableWeaponStats("oil");

    expect(upgradeableStats).toEqual([
      "areaRadius",
      "dotDamage",
      "durationMs",
      "dotTickMs",
      "cooldownMs",
      "statusDurationMs",
      "damage",
    ]);
    expect(getBuffedWeaponStats("oil", activeWearables)).toEqual([
      "durationMs",
    ]);
    expect(getWeaponDetailStats("oil", activeWearables)).toEqual(
      upgradeableStats,
    );
  });
});
