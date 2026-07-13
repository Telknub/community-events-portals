import {
  BUMPKIN_ITEM_PART,
  type BumpkinItem,
  type BumpkinPart,
} from "features/game/types/bumpkin";
import { INITIAL_EQUIPMENT } from "features/game/lib/constants";
import type { Wardrobe } from "features/game/types/game";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { PORTAL_NAME } from "../../constants/PortalConstants";
import { reconcileLoadoutWithDefaultEquipment } from "./loadoutUtils";
import {
  loadCookieStoredLoadouts,
  saveCookieStoredLoadouts,
} from "./wearableLoadoutCookieStorage";

export type WearableLoadoutSlot = "I" | "II" | "III";
export type WearableLoadouts = Record<WearableLoadoutSlot, BumpkinParts>;
export type StoredWearableLoadouts = {
  version: 1;
  defaultEquipment: BumpkinParts;
  loadouts: WearableLoadouts;
};
export type LoadedWearableLoadouts = StoredWearableLoadouts & {
  hasStoredLoadouts: boolean;
  shouldPersist: boolean;
};

export const LOADOUT_SLOTS: WearableLoadoutSlot[] = ["I", "II", "III"];

export const REQUIRED: BumpkinPart[] = [
  "background",
  "body",
  "hair",
  "shoes",
  "tool",
];

export const getStorageKey = (farmId: number) =>
  `portal:${PORTAL_NAME}:wearableLoadouts:${farmId}`;

const getDefaultLoadouts = (equipment: BumpkinParts): WearableLoadouts => ({
  I: { ...equipment },
  II: { ...equipment },
  III: { ...equipment },
});

const isValidEquipment = (value: unknown): value is BumpkinParts => {
  if (!value || typeof value !== "object") return false;

  const equipment = value as BumpkinParts;
  return REQUIRED.every((part) => !!equipment[part]);
};

const getAllowedItems = ({
  available,
  defaultEquipment,
}: {
  available: Wardrobe;
  defaultEquipment: BumpkinParts;
}) => {
  return new Set([
    ...Object.values(defaultEquipment),
    ...Object.values(INITIAL_EQUIPMENT),
    ...Object.entries(available)
      .filter(([, amount]) => amount > 0)
      .map(([name]) => name as BumpkinItem),
  ]);
};

const getFallbackItem = ({
  part,
  fallback,
  allowedItems,
}: {
  part: BumpkinPart;
  fallback: BumpkinParts;
  allowedItems: Set<BumpkinItem | undefined>;
}) => {
  const defaultItem = fallback[part];
  if (defaultItem && allowedItems.has(defaultItem)) return defaultItem;

  const initialItem = INITIAL_EQUIPMENT[part];
  if (initialItem && allowedItems.has(initialItem)) return initialItem;

  return undefined;
};

const sanitizeEquipment = ({
  equipment,
  fallback,
  allowedItems,
}: {
  equipment: unknown;
  fallback: BumpkinParts;
  allowedItems: Set<BumpkinItem | undefined>;
}): BumpkinParts => {
  if (!isValidEquipment(equipment)) return { ...fallback };

  const sanitized = { ...equipment };

  Object.entries(sanitized).forEach(([part, item]) => {
    const bumpkinPart = part as BumpkinPart;
    const bumpkinItem = item as BumpkinItem | undefined;
    const itemMatchesPart =
      !!bumpkinItem && BUMPKIN_ITEM_PART[bumpkinItem] === bumpkinPart;

    if (bumpkinItem && allowedItems.has(bumpkinItem) && itemMatchesPart) {
      return;
    }

    const fallbackItem = getFallbackItem({
      part: bumpkinPart,
      fallback,
      allowedItems,
    });

    if (fallbackItem) {
      sanitized[bumpkinPart] = fallbackItem as never;
    } else {
      delete sanitized[bumpkinPart];
    }
  });

  REQUIRED.forEach((part) => {
    if (sanitized[part]) return;

    const fallbackItem = getFallbackItem({ part, fallback, allowedItems });
    if (fallbackItem) {
      sanitized[part] = fallbackItem as never;
    }
  });

  return isValidEquipment(sanitized) ? sanitized : { ...fallback };
};

const parseStoredValue = (value: unknown) => {
  if (typeof value !== "string") return value;

  return JSON.parse(value) as unknown;
};

export const resolveStoredLoadouts = ({
  storedValue,
  fallback,
  available,
}: {
  storedValue: unknown;
  fallback: BumpkinParts;
  available: Wardrobe;
}): LoadedWearableLoadouts => {
  const defaults = getDefaultLoadouts(fallback);

  const getStoredLoadouts = (
    value: unknown,
  ): Partial<WearableLoadouts> | undefined => {
    if (!value || typeof value !== "object") return undefined;

    const parsed = value as
      Partial<WearableLoadouts> | Partial<StoredWearableLoadouts>;

    return "loadouts" in parsed
      ? (parsed.loadouts as Partial<WearableLoadouts> | undefined)
      : (parsed as Partial<WearableLoadouts>);
  };

  const getStoredDefaultEquipment = (value: unknown): BumpkinParts => {
    if (!value || typeof value !== "object") return { ...fallback };

    const parsed = value as Partial<StoredWearableLoadouts>;
    return isValidEquipment(parsed.defaultEquipment)
      ? { ...parsed.defaultEquipment }
      : { ...fallback };
  };

  const isStoredV1 = (value: unknown) => {
    if (!value || typeof value !== "object") return false;

    const parsed = value as Partial<StoredWearableLoadouts>;
    return (
      "version" in parsed &&
      "loadouts" in parsed &&
      isValidEquipment(parsed.defaultEquipment)
    );
  };

  try {
    if (!storedValue) {
      return {
        version: 1,
        defaultEquipment: { ...fallback },
        loadouts: defaults,
        hasStoredLoadouts: false,
        shouldPersist: false,
      };
    }

    const parsed = parseStoredValue(storedValue);
    const storedLoadouts = getStoredLoadouts(parsed);
    if (!storedLoadouts) {
      return {
        version: 1,
        defaultEquipment: { ...fallback },
        loadouts: defaults,
        hasStoredLoadouts: false,
        shouldPersist: false,
      };
    }

    const storedDefaultEquipment = getStoredDefaultEquipment(parsed);
    const allowedItems = getAllowedItems({
      available,
      defaultEquipment: fallback,
    });
    let shouldPersist = !isStoredV1(parsed);

    const loadouts = LOADOUT_SLOTS.reduce((loadouts, slot) => {
      const stored = storedLoadouts[slot];
      const sanitized = sanitizeEquipment({
        equipment: stored,
        fallback: storedDefaultEquipment,
        allowedItems,
      });
      const reconciled = reconcileLoadoutWithDefaultEquipment({
        loadout: sanitized,
        defaultEquipment: fallback,
      });

      shouldPersist =
        shouldPersist ||
        JSON.stringify(stored) !== JSON.stringify(sanitized) ||
        JSON.stringify(sanitized) !== JSON.stringify(reconciled);

      return {
        ...loadouts,
        [slot]: reconciled,
      };
    }, defaults);

    shouldPersist =
      shouldPersist ||
      JSON.stringify(storedDefaultEquipment) !== JSON.stringify(fallback);

    return {
      version: 1,
      defaultEquipment: { ...fallback },
      loadouts,
      hasStoredLoadouts: true,
      shouldPersist,
    };
  } catch {
    return {
      version: 1,
      defaultEquipment: { ...fallback },
      loadouts: defaults,
      hasStoredLoadouts: false,
      shouldPersist: false,
    };
  }
};

export const loadStoredLoadouts = ({
  farmId,
  fallback,
  available,
}: {
  farmId: number;
  fallback: BumpkinParts;
  available: Wardrobe;
}): LoadedWearableLoadouts => {
  const cookieStored = loadCookieStoredLoadouts({ farmId, fallback });
  if (cookieStored) {
    return resolveStoredLoadouts({
      storedValue: cookieStored,
      fallback,
      available,
    });
  }

  const raw = localStorage.getItem(getStorageKey(farmId));
  const localStored = resolveStoredLoadouts({
    storedValue: raw,
    fallback,
    available,
  });

  if (raw && localStored.hasStoredLoadouts) {
    saveCookieStoredLoadouts({
      farmId,
      defaultEquipment: localStored.defaultEquipment,
      loadouts: localStored.loadouts,
    });
  }

  return localStored;
};

export const saveStoredLoadouts = ({
  farmId,
  defaultEquipment,
  loadouts,
}: {
  farmId: number;
  defaultEquipment: BumpkinParts;
  loadouts: WearableLoadouts;
}) => {
  saveCookieStoredLoadouts({ farmId, defaultEquipment, loadouts });

  localStorage.setItem(
    getStorageKey(farmId),
    JSON.stringify({
      version: 1,
      defaultEquipment,
      loadouts,
    } satisfies StoredWearableLoadouts),
  );
};
