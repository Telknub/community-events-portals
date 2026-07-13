import React, { useContext } from "react";
import { useSelector } from "@xstate/react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SUNNYSIDE } from "assets/sunnyside";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { DynamicNFT } from "features/bumpkins/components/DynamicNFT";
import { BumpkinPartGroup } from "features/bumpkins/components/BumpkinPartGroup";
import type { BumpkinItem, BumpkinPart } from "features/game/types/bumpkin";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
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
  WEARABLE_BUFFS,
} from "../../constants";
import type { PlayerStatId } from "../../Types";
import { LOADOUT_SLOTS, type WearableLoadoutSlot } from "./loadoutStorage";
export {
  getStorageKey,
  loadStoredLoadouts,
  LOADOUT_SLOTS,
  saveStoredLoadouts,
} from "./loadoutStorage";
export type {
  LoadedWearableLoadouts,
  StoredWearableLoadouts,
  WearableLoadouts,
  WearableLoadoutSlot,
} from "./loadoutStorage";

const isMinigameBuffWearable = (wearable: BumpkinItem) =>
  !!WEARABLE_BUFFS[wearable];

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
              isBuffWearable={isMinigameBuffWearable}
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
              isBuffWearable={isMinigameBuffWearable}
              gridStyling="grid grid-cols-2 gap-1 max-w-[110px] h-fit"
            />
          </div>
        </div>
      </CloseButtonPanel>
    </div>
  );
};
