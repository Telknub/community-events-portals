import React, { useContext } from "react";
import { useSelector } from "@xstate/react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SUNNYSIDE } from "assets/sunnyside";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { DynamicNFT } from "features/bumpkins/components/DynamicNFT";
import { BumpkinPartGroup } from "features/bumpkins/components/BumpkinPartGroup";
import {
  BUMPKIN_ITEM_PART,
  type BumpkinItem,
  type BumpkinPart,
} from "features/game/types/bumpkin";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import type { Wardrobe } from "features/game/types/game";
import { INITIAL_EQUIPMENT } from "features/game/lib/constants";
import { BETA_TESTERS, INITIAL_DATE, PORTAL_NAME } from "../../constants";
import { NPCIcon } from "features/island/bumpkin/components/NPC";
import { InnerPanel } from "components/ui/Panel";
import { StatCard } from "./StatCard";
import { Button } from "components/ui/Button";

import swordIcon from "public/world/portal/images/sword_icon.png";
import speedIcon from "public/world/portal/images/lightning.png";
import powerupIcon from "assets/icons/level_up.png";
import { Label } from "components/ui/Label";
import { PortalContext } from "../../lib/PortalProvider";
import type { PortalMachineState } from "../../lib/Machine";
import {
  getNextPlayerStatLevel,
  getPlayerStatValue,
  getPlayerStatValueIncrease,
  PLAYER_STAT_IDS,
} from "../../constants";
import type { PlayerStatId } from "../../Types";

export type WearableLoadoutSlot = "I" | "II" | "III";
export type WearableLoadouts = Record<WearableLoadoutSlot, BumpkinParts>;
export type StoredWearableLoadouts = {
  version: 1;
  defaultEquipment: BumpkinParts;
  loadouts: WearableLoadouts;
};

export const LOADOUT_SLOTS: WearableLoadoutSlot[] = ["I", "II", "III"];

export const REQUIRED: BumpkinPart[] = [
  "background",
  "body",
  "hair",
  "shoes",
  "tool",
];

// const REQUIRED_BUT_INCOMPATIBLE: BumpkinPart[][] = [
//   ["shirt", "pants"],
//   ["dress"],
// ];

const LEFT_EQUIPMENT: BumpkinPart[] = [
  "background",
  "body",
  "hair",
  "shoes",
  "tool",
  "hat",
  "secondaryTool",
  "aura",
];

const RIGHT_EQUIPMENT: BumpkinPart[] = [
  // "beard",
  "necklace",
  "coat",
  "wings",
  "suit",
  "onesie",
  "shirt",
  "pants",
];

// const BOTTOM_EQUIPMENT: BumpkinPart[] = ["secondaryTool", "aura"];

const getStorageKey = (farmId: number) =>
  `portal:${PORTAL_NAME}:wearableLoadouts:${farmId}`;

const _playerStatsState = (state: PortalMachineState) => ({
  xpPoints: state.context.xpPoints,
  selectedStat: state.context.selectedStat,
  playerStatLevels: state.context.playerStatLevels,
  activeWearables: state.context.activeWearables,
});

const isStartDateReached = () =>
  new Date().toISOString().slice(0, 10) >= INITIAL_DATE;

const canFarmStart = (farmId: number) =>
  isStartDateReached() || BETA_TESTERS.includes(farmId);

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

export const loadStoredLoadouts = ({
  farmId,
  fallback,
  available,
}: {
  farmId: number;
  fallback: BumpkinParts;
  available: Wardrobe;
}): StoredWearableLoadouts => {
  const defaults = getDefaultLoadouts(fallback);
  const allowedItems = getAllowedItems({
    available,
    defaultEquipment: fallback,
  });

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

  try {
    const raw = localStorage.getItem(getStorageKey(farmId));
    if (!raw) {
      return {
        version: 1,
        defaultEquipment: { ...fallback },
        loadouts: defaults,
      };
    }

    const parsed = JSON.parse(raw) as unknown;
    const storedLoadouts = getStoredLoadouts(parsed);
    if (!storedLoadouts) {
      return {
        version: 1,
        defaultEquipment: { ...fallback },
        loadouts: defaults,
      };
    }

    const loadouts = LOADOUT_SLOTS.reduce((loadouts, slot) => {
      const stored = storedLoadouts[slot];

      return {
        ...loadouts,
        [slot]: sanitizeEquipment({
          equipment: stored,
          fallback,
          allowedItems,
        }),
      };
    }, defaults);

    return {
      version: 1,
      defaultEquipment: { ...fallback },
      loadouts,
    };
  } catch {
    return {
      version: 1,
      defaultEquipment: { ...fallback },
      loadouts: defaults,
    };
  }
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
  localStorage.setItem(
    getStorageKey(farmId),
    JSON.stringify({
      version: 1,
      defaultEquipment,
      loadouts,
    } satisfies StoredWearableLoadouts),
  );
};

export const Profile: React.FC<{
  onClose?: () => void;
  currentTab: WearableLoadoutSlot;
  setCurrentTab: React.Dispatch<React.SetStateAction<WearableLoadoutSlot>>;
  username?: string;
  equipped: BumpkinParts;
  selectedBumpkinPart: BumpkinPart;
  onSelectBumpkinPart: (part: BumpkinPart) => void;
  lives: number;
  maxLives: number;
  farmId: number;
  onStart?: () => void;
  onStartTraining?: () => void;
  onBack?: () => void;
}> = ({
  onClose,
  currentTab,
  setCurrentTab,
  username,
  equipped,
  selectedBumpkinPart,
  onSelectBumpkinPart,
  lives,
  maxLives,
  farmId,
  onStart,
  onStartTraining,
  onBack,
}) => {
  const { t } = useAppTranslation();
  const { portalService } = useContext(PortalContext);
  const { xpPoints, selectedStat, playerStatLevels, activeWearables } =
    useSelector(portalService, _playerStatsState);
  const canStart = canFarmStart(farmId);

  const statIcons: Record<PlayerStatId, { src: string; width?: number }> = {
    health: { src: SUNNYSIDE.icons.heart },
    speed: { src: speedIcon, width: 14 },
    damage: { src: swordIcon },
  };

  const statLabelTypes = {
    health: "danger",
    speed: "warning",
    damage: "info",
  } as const;

  const statTitles = {
    health: t(`${PORTAL_NAME}.health`),
    speed: t(`${PORTAL_NAME}.speed`),
    damage: t(`${PORTAL_NAME}.damage`),
  };

  const playerStats = (
    <>
      <InnerPanel className="flex mt-2 gap-2 w-full">
        {PLAYER_STAT_IDS.map((stat) => {
          const level = playerStatLevels[stat];
          const nextLevel = getNextPlayerStatLevel(level);
          const canUpgrade =
            selectedStat === stat && nextLevel !== undefined && xpPoints > 0;
          const isDisabled = selectedStat !== stat || nextLevel === undefined;
          const value =
            stat === "health"
              ? `${lives}/${maxLives}`
              : getPlayerStatValue(stat, level, activeWearables);
          const statIncrease = getPlayerStatValueIncrease(stat, level);

          return (
            <StatCard
              key={stat}
              title={statTitles[stat]}
              label={{ value, type: statLabelTypes[stat] }}
              img={statIcons[stat]}
              warningLabel={
                nextLevel === undefined ? (
                  t(`${PORTAL_NAME}.maxShort`)
                ) : selectedStat === stat && xpPoints > 0 ? (
                  <span className="flex items-center justify-center gap-1">
                    <img
                      src={powerupIcon}
                      className="h-3 object-contain pixelated"
                    />
                    {`+${statIncrease}`}
                  </span>
                ) : undefined
              }
              disabled={isDisabled}
              onClick={() => {
                if (!canUpgrade) return;
                portalService.send("UPGRADE_PLAYER_STAT", { stat });
              }}
              showLabelAboveDisabled
              className="w-full"
            />
          );
        })}
      </InnerPanel>
      {onStart && onStartTraining && onBack && (
        <InnerPanel className="flex flex-col mt-2 gap-1 w-full">
          <div className="flex gap-1">
            <Button
              className="whitespace-nowrap capitalize"
              onClick={onStartTraining}
            >
              {t(`${PORTAL_NAME}.start.training`)}
            </Button>
            <Button
              className="whitespace-nowrap capitalize"
              disabled={!canStart}
              onClick={onStart}
            >
              {t("start")}
            </Button>
          </div>
          <Button className="whitespace-nowrap capitalize" onClick={onBack}>
            <div className="flex items-center justify-center gap-1">
              <img src={SUNNYSIDE.icons.arrow_left} className="h-5" />
              {t("back")}
            </div>
          </Button>
        </InnerPanel>
      )}
    </>
  );

  return (
    <div className="sm:min-w-[429px]">
      <CloseButtonPanel
        tabs={LOADOUT_SLOTS.map((slot) => ({
          id: slot,
          icon: SUNNYSIDE.icons.player,
          name: slot,
        }))}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        innerPanelFooter={playerStats}
      >
        <div className="p-1">
          <div className="flex items-center gap-2">
            <BumpkinPartGroup
              bumpkinParts={LEFT_EQUIPMENT}
              equipped={equipped}
              selected={selectedBumpkinPart}
              onSelect={onSelectBumpkinPart}
              gridStyling="grid grid-cols-2 gap-1 sm:gap-1 max-w-[110px] h-fit"
            />
            <div className="flex flex-col items-center gap-1">
              <div className="relative h-[125px] w-[125px] overflow-hidden sm:h-[165px] sm:w-[165px]">
                <InnerPanel style={{ padding: "0px" }}>
                  <DynamicNFT
                    showBackground
                    bumpkinParts={equipped}
                    key={JSON.stringify(equipped)}
                  />
                </InnerPanel>
                <div className="absolute bottom-4 right-4 h-8 w-8">
                  <NPCIcon parts={equipped} key={JSON.stringify(equipped)} />
                </div>
                {username && (
                  <div className="absolute left-2 top-2">
                    <Label>
                      <span
                        className="block max-w-[96px] overflow-hidden text-ellipsis whitespace-nowrap sm:max-w-[136px]"
                        title={username}
                      >
                        {username}
                      </span>
                    </Label>
                  </div>
                )}
              </div>
              <Label type={xpPoints > 0 ? "warning" : "default"}>
                {t(`${PORTAL_NAME}.xpPoints`, { points: xpPoints })}
              </Label>
            </div>
            <BumpkinPartGroup
              bumpkinParts={RIGHT_EQUIPMENT}
              equipped={equipped}
              selected={selectedBumpkinPart}
              onSelect={onSelectBumpkinPart}
              gridStyling="grid grid-cols-2 gap-1 max-w-[110px] h-fit"
            />
          </div>
        </div>
      </CloseButtonPanel>
    </div>
  );
};
