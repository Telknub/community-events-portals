import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { INITIAL_EQUIPMENT } from "features/game/lib/constants";
import { reconcileLoadoutWithDefaultEquipment } from "./loadoutUtils";
import {
  getStorageKey,
  loadStoredLoadouts,
  LOADOUT_SLOTS,
  resolveStoredLoadouts,
  saveStoredLoadouts,
  type StoredWearableLoadouts,
  type WearableLoadouts,
} from "./loadoutStorage";
import type { Wardrobe } from "features/game/types/game";
import {
  getSharedCookieDomain,
  getWearableLoadoutCookieName,
  saveCookieStoredLoadouts,
} from "./wearableLoadoutCookieStorage";

const FARM_ID = 123;

const wardrobe = {
  "Handheld Bunny": 3,
} as Wardrobe;

const makeLoadouts = (equipment: BumpkinParts): WearableLoadouts => ({
  I: { ...equipment },
  II: { ...equipment },
  III: { ...equipment },
});

describe("wearable loadout default equipment synchronization", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0]?.trim();
      if (!name) return;

      document.cookie = `${name}=; Max-Age=0; Path=/`;
    });
  });

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

  it("loads default loadouts in memory without marking empty storage for persistence", () => {
    const fallback = { ...INITIAL_EQUIPMENT } as BumpkinParts;

    const stored = loadStoredLoadouts({
      farmId: FARM_ID,
      fallback,
      available: wardrobe,
    });

    expect(stored.hasStoredLoadouts).toBe(false);
    expect(stored.shouldPersist).toBe(false);
    expect(stored.defaultEquipment).toEqual(fallback);
    LOADOUT_SLOTS.forEach((slot) => {
      expect(stored.loadouts[slot]).toEqual(fallback);
    });
  });

  it("keeps existing stored minigame wearable loadouts instead of replacing them with defaults", () => {
    const fallback = { ...INITIAL_EQUIPMENT } as BumpkinParts;
    const loadouts = makeLoadouts(fallback);
    loadouts.II = {
      ...fallback,
      tool: "Handheld Bunny",
    } as BumpkinParts;
    const storedLoadouts: StoredWearableLoadouts = {
      version: 1,
      defaultEquipment: fallback,
      loadouts,
    };

    localStorage.setItem(getStorageKey(FARM_ID), JSON.stringify(storedLoadouts));

    const stored = loadStoredLoadouts({
      farmId: FARM_ID,
      fallback,
      available: wardrobe,
    });

    expect(stored.hasStoredLoadouts).toBe(true);
    expect(stored.shouldPersist).toBe(false);
    expect(stored.loadouts.II.tool).toBe("Handheld Bunny");
    expect(stored.loadouts.I).toEqual(fallback);
  });

  it("refreshes base equipment changes while preserving minigame buff wearables", () => {
    const previousDefault = { ...INITIAL_EQUIPMENT } as BumpkinParts;
    const currentDefault = {
      ...INITIAL_EQUIPMENT,
      hair: "Buzz Cut",
    } as BumpkinParts;
    const loadouts = makeLoadouts(previousDefault);
    loadouts.I = {
      ...previousDefault,
      tool: "Handheld Bunny",
    } as BumpkinParts;

    localStorage.setItem(
      getStorageKey(FARM_ID),
      JSON.stringify({
        version: 1,
        defaultEquipment: previousDefault,
        loadouts,
      } satisfies StoredWearableLoadouts),
    );

    const stored = loadStoredLoadouts({
      farmId: FARM_ID,
      fallback: currentDefault,
      available: wardrobe,
    });

    expect(stored.hasStoredLoadouts).toBe(true);
    expect(stored.shouldPersist).toBe(true);
    expect(stored.defaultEquipment).toEqual(currentDefault);
    expect(stored.loadouts.I.tool).toBe("Handheld Bunny");
    expect(stored.loadouts.I.hair).toBe("Buzz Cut");
    expect(stored.loadouts.II.hair).toBe("Buzz Cut");
  });

  it("loads legacy slot-only storage and marks it for v1 persistence", () => {
    const fallback = { ...INITIAL_EQUIPMENT } as BumpkinParts;
    const legacyLoadouts = makeLoadouts(fallback);
    legacyLoadouts.III = {
      ...fallback,
      tool: "Handheld Bunny",
    } as BumpkinParts;

    localStorage.setItem(getStorageKey(FARM_ID), JSON.stringify(legacyLoadouts));

    const stored = loadStoredLoadouts({
      farmId: FARM_ID,
      fallback,
      available: wardrobe,
    });

    expect(stored.hasStoredLoadouts).toBe(true);
    expect(stored.shouldPersist).toBe(true);
    expect(stored.loadouts.III.tool).toBe("Handheld Bunny");
    expect(stored.defaultEquipment).toEqual(fallback);
  });

  it("resolves parent-provided storage values without requiring subdomain localStorage", () => {
    const fallback = { ...INITIAL_EQUIPMENT } as BumpkinParts;
    const loadouts = makeLoadouts(fallback);
    loadouts.II = {
      ...fallback,
      tool: "Handheld Bunny",
    } as BumpkinParts;

    const stored = resolveStoredLoadouts({
      storedValue: JSON.stringify({
        version: 1,
        defaultEquipment: fallback,
        loadouts,
      } satisfies StoredWearableLoadouts),
      fallback,
      available: wardrobe,
    });

    expect(localStorage.getItem(getStorageKey(FARM_ID))).toBeNull();
    expect(stored.hasStoredLoadouts).toBe(true);
    expect(stored.shouldPersist).toBe(false);
    expect(stored.loadouts.II.tool).toBe("Handheld Bunny");
  });

  it("loads shared cookie loadouts before subdomain localStorage", () => {
    const fallback = { ...INITIAL_EQUIPMENT } as BumpkinParts;
    const cookieLoadouts = makeLoadouts(fallback);
    cookieLoadouts.II = {
      ...fallback,
      tool: "Handheld Bunny",
    } as BumpkinParts;
    const localLoadouts = makeLoadouts(fallback);
    localLoadouts.III = {
      ...fallback,
      tool: "Handheld Bunny",
    } as BumpkinParts;

    saveCookieStoredLoadouts({
      farmId: FARM_ID,
      defaultEquipment: fallback,
      loadouts: cookieLoadouts,
    });
    localStorage.setItem(
      getStorageKey(FARM_ID),
      JSON.stringify({
        version: 1,
        defaultEquipment: fallback,
        loadouts: localLoadouts,
      } satisfies StoredWearableLoadouts),
    );

    const stored = loadStoredLoadouts({
      farmId: FARM_ID,
      fallback,
      available: wardrobe,
    });

    expect(stored.loadouts.II.tool).toBe("Handheld Bunny");
    expect(stored.loadouts.III.tool).toBe(fallback.tool);
  });

  it("migrates existing subdomain localStorage loadouts into the shared cookie", () => {
    const fallback = { ...INITIAL_EQUIPMENT } as BumpkinParts;
    const loadouts = makeLoadouts(fallback);
    loadouts.II = {
      ...fallback,
      tool: "Handheld Bunny",
    } as BumpkinParts;

    localStorage.setItem(
      getStorageKey(FARM_ID),
      JSON.stringify({
        version: 1,
        defaultEquipment: fallback,
        loadouts,
      } satisfies StoredWearableLoadouts),
    );

    const stored = loadStoredLoadouts({
      farmId: FARM_ID,
      fallback,
      available: wardrobe,
    });

    expect(stored.loadouts.II.tool).toBe("Handheld Bunny");
    expect(document.cookie).toContain(getWearableLoadoutCookieName(FARM_ID));
  });

  it("saves loadouts to localStorage and the shared cookie", () => {
    const fallback = { ...INITIAL_EQUIPMENT } as BumpkinParts;
    const loadouts = makeLoadouts(fallback);
    loadouts.I = {
      ...fallback,
      tool: "Handheld Bunny",
    } as BumpkinParts;

    saveStoredLoadouts({
      farmId: FARM_ID,
      defaultEquipment: fallback,
      loadouts,
    });

    expect(localStorage.getItem(getStorageKey(FARM_ID))).toBeTruthy();
    expect(document.cookie).toContain(getWearableLoadoutCookieName(FARM_ID));
  });

  it("uses a host-only cookie outside sunflower-land.com hosts", () => {
    expect(getSharedCookieDomain("localhost")).toBeUndefined();
    expect(getSharedCookieDomain("halloween.sunflower-land.com")).toBe(
      ".sunflower-land.com",
    );
  });
});
