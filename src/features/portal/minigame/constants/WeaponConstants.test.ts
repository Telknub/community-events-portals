import { resolveWeaponStats } from "./WeaponConstants";

describe("WeaponConstants", () => {
  it("resolves weapon stats without wearables", () => {
    expect(resolveWeaponStats("corn", 1).projectileSpeed).toBe(95);
    expect(resolveWeaponStats("oil", 1).durationMs).toBe(2000);
  });

  it("applies active wearable buffs to weapon stats", () => {
    const activeWearables = {
      tool: "Carrot Pitchfork",
      background: "Slime Wall Background",
    } as never;

    expect(resolveWeaponStats("corn", 1, activeWearables).projectileSpeed).toBe(
      103,
    );
    expect(resolveWeaponStats("oil", 1, activeWearables).durationMs).toBe(2100);
  });
});
