import {
  BUMPKIN_ITEM_PART,
  type BumpkinItem,
  type BumpkinPart,
} from "features/game/types/bumpkin";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { PORTAL_NAME } from "../../constants/PortalConstants";
import { WEARABLES_TAB_ITEMS } from "../../constants/WearableConstants";
import type { StoredWearableLoadouts, WearableLoadouts } from "./loadoutStorage";

type CompactLoadoutOverrides = Partial<
  Record<"I" | "II" | "III", Partial<Record<BumpkinPart, BumpkinItem | null>>>
>;

type CompactStoredWearableLoadouts = {
  version: 1;
  loadouts: CompactLoadoutOverrides;
};

const SHARED_COOKIE_DOMAIN = ".sunflower-land.com";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const getWearableLoadoutCookieName = (farmId: number) =>
  `portal_${PORTAL_NAME.replaceAll("-", "_")}_wearable_loadouts_${farmId}`;

export const getSharedCookieDomain = (hostname = window.location.hostname) => {
  if (
    hostname === "sunflower-land.com" ||
    hostname.endsWith(".sunflower-land.com")
  ) {
    return SHARED_COOKIE_DOMAIN;
  }

  return undefined;
};

const isMinigameWearable = (item?: BumpkinItem) =>
  !!item && WEARABLES_TAB_ITEMS.includes(item);

const getCookie = (name: string) => {
  const encodedName = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(encodedName));

  if (!cookie) return undefined;

  return decodeURIComponent(cookie.slice(encodedName.length));
};

const setCookie = ({
  name,
  value,
}: {
  name: string;
  value: string;
}) => {
  const domain = getSharedCookieDomain();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
    domain ? `Domain=${domain}` : undefined,
    secure || undefined,
  ]
    .filter(Boolean)
    .join("; ");
};

const getCompactOverrides = ({
  defaultEquipment,
  loadouts,
}: {
  defaultEquipment: BumpkinParts;
  loadouts: WearableLoadouts;
}): CompactLoadoutOverrides => {
  return Object.entries(loadouts).reduce((compact, [slot, loadout]) => {
    const overrides = Object.entries(loadout).reduce(
      (slotOverrides, [part, item]) => {
        const bumpkinPart = part as BumpkinPart;
        const bumpkinItem = item as BumpkinItem | undefined;
        const defaultItem = defaultEquipment[bumpkinPart] as
          | BumpkinItem
          | undefined;
        const shouldTrackPart =
          isMinigameWearable(bumpkinItem) || isMinigameWearable(defaultItem);

        if (!shouldTrackPart || bumpkinItem === defaultItem) {
          return slotOverrides;
        }

        return {
          ...slotOverrides,
          [bumpkinPart]: bumpkinItem ?? null,
        };
      },
      {} as Partial<Record<BumpkinPart, BumpkinItem | null>>,
    );

    if (!Object.keys(overrides).length) return compact;

    return {
      ...compact,
      [slot]: overrides,
    };
  }, {} as CompactLoadoutOverrides);
};

const restoreCompactLoadouts = ({
  compact,
  fallback,
}: {
  compact: CompactStoredWearableLoadouts;
  fallback: BumpkinParts;
}): StoredWearableLoadouts => {
  const loadouts = {
    I: { ...fallback },
    II: { ...fallback },
    III: { ...fallback },
  };

  Object.entries(compact.loadouts).forEach(([slot, overrides]) => {
    if (slot !== "I" && slot !== "II" && slot !== "III") return;

    Object.entries(overrides ?? {}).forEach(([part, item]) => {
      const bumpkinPart = part as BumpkinPart;
      if (item === null) {
        delete loadouts[slot][bumpkinPart];
        return;
      }

      if (BUMPKIN_ITEM_PART[item] !== bumpkinPart) return;

      loadouts[slot][bumpkinPart] = item as never;
    });
  });

  return {
    version: 1,
    defaultEquipment: fallback,
    loadouts,
  };
};

export const loadCookieStoredLoadouts = ({
  farmId,
  fallback,
}: {
  farmId: number;
  fallback: BumpkinParts;
}): StoredWearableLoadouts | undefined => {
  try {
    const raw = getCookie(getWearableLoadoutCookieName(farmId));
    if (!raw) return undefined;

    const compact = JSON.parse(raw) as CompactStoredWearableLoadouts;
    if (compact.version !== 1 || !compact.loadouts) return undefined;

    return restoreCompactLoadouts({ compact, fallback });
  } catch {
    return undefined;
  }
};

export const saveCookieStoredLoadouts = ({
  farmId,
  defaultEquipment,
  loadouts,
}: {
  farmId: number;
  defaultEquipment: BumpkinParts;
  loadouts: WearableLoadouts;
}) => {
  setCookie({
    name: getWearableLoadoutCookieName(farmId),
    value: JSON.stringify({
      version: 1,
      loadouts: getCompactOverrides({ defaultEquipment, loadouts }),
    } satisfies CompactStoredWearableLoadouts),
  });
};
