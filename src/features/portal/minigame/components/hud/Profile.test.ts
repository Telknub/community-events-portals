import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { INITIAL_EQUIPMENT } from "features/game/lib/constants";
import { reconcileLoadoutWithDefaultEquipment } from "./loadoutUtils";

describe("wearable loadout default equipment synchronization", () => {
  it("keeps minigame wearables and refreshes or removes other parts", () => {
    const loadout = {
      ...INITIAL_EQUIPMENT,
      tool: "Handheld Bunny",
      hair: "Basic Hair",
      hat: "Farmer Hat",
    } as BumpkinParts;
    const defaultEquipment = {
      ...INITIAL_EQUIPMENT,
      hair: "Buzz Cut",
    } as BumpkinParts;

    const reconciled = reconcileLoadoutWithDefaultEquipment({
      loadout,
      defaultEquipment,
    });

    expect(reconciled.tool).toBe("Handheld Bunny");
    expect(reconciled.hair).toBe("Buzz Cut");
    expect(reconciled.hat).toBeUndefined();
  });

  it("reconciles all loadout slots with the latest default equipment", () => {
    const previousDefault = { ...INITIAL_EQUIPMENT } as BumpkinParts;
    const loadouts = {
      I: { ...previousDefault, tool: "Handheld Bunny" } as BumpkinParts,
      II: { ...previousDefault } as BumpkinParts,
      III: { ...previousDefault } as BumpkinParts,
    };
    const currentDefault = {
      ...INITIAL_EQUIPMENT,
      hair: "Buzz Cut",
    } as BumpkinParts;
    const reconciled = Object.fromEntries(
      Object.entries(loadouts).map(([slot, loadout]) => [
        slot,
        reconcileLoadoutWithDefaultEquipment({
          loadout,
          defaultEquipment: currentDefault,
        }),
      ]),
    );

    expect(reconciled.I.tool).toBe("Handheld Bunny");
    expect(reconciled.I.hair).toBe("Buzz Cut");
    expect(reconciled.II.hair).toBe("Buzz Cut");
    expect(reconciled.III.hair).toBe("Buzz Cut");
  });
});
