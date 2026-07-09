import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "@xstate/react";

import { SUNNYSIDE } from "assets/sunnyside";
import { Modal } from "components/ui/Modal";
import { DynamicNFT } from "features/bumpkins/components/DynamicNFT";
import { PortalContext } from "../../lib/PortalProvider";
import type { PortalMachineState } from "../../lib/Machine";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import {
  loadStoredLoadouts,
  LOADOUT_SLOTS,
  Profile,
  saveStoredLoadouts,
  type WearableLoadouts,
  type WearableLoadoutSlot,
} from "./Profile";
import { ProfilePanel, type ProfilePanelTab } from "./ProfilePanel";
import {
  BUMPKIN_ITEM_PART,
  type BumpkinItem,
  type BumpkinPart,
} from "features/game/types/bumpkin";
import { availableWardrobe } from "features/game/events/landExpansion/equip";
import type { GameState } from "features/game/types/game";
import { INITIAL_EQUIPMENT } from "features/game/lib/constants";
import { InnerPanel } from "components/ui/Panel";
import { ResizableBar } from "components/ui/ProgressBar";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import {
  isPlayerMaxLevel,
  PORTAL_NAME,
  WEARABLES_TAB_ITEMS,
} from "../../constants";
import { Label } from "components/ui/Label";
import { isTouchDevice } from "features/world/lib/device";

const DIMENSIONS = {
  scaled: 160,
  bumpkinContainer: {
    width: 130,
    height: 125,
    radiusBottomLeft: 85,
    radiusBottomRight: 45,
  },
  bumpkin: {
    width: 200,
    marginLeft: -10,
  },
  level: {
    width: 24,
    height: 12,
    marginLeft: 109,
    marginTop: 82.5,
  },
};

const getFallbackWearable = ({
  defaultEquipment,
  name,
  part,
}: {
  defaultEquipment?: BumpkinParts;
  name: BumpkinItem;
  part: BumpkinPart;
}) => {
  const defaultItem = defaultEquipment?.[part];
  const shouldUseInitialEquipment =
    defaultItem === name && WEARABLES_TAB_ITEMS.includes(name);

  return shouldUseInitialEquipment ? INITIAL_EQUIPMENT[part] : defaultItem;
};

const applyIncompatibleWearableRules = (outfit: BumpkinParts) => {
  if (outfit.dress) {
    delete outfit.shirt;
    delete outfit.pants;
  }

  if (outfit.shirt || outfit.pants) {
    delete outfit.dress;
  }
};

const enforceWearableInventory = ({
  defaultEquipment,
  loadouts,
  wardrobe,
}: {
  defaultEquipment: BumpkinParts;
  loadouts: WearableLoadouts;
  wardrobe: GameState["wardrobe"];
}) => {
  const usage: Partial<Record<BumpkinItem, number>> = {};
  const nextLoadouts = LOADOUT_SLOTS.reduce(
    (next, slot) => ({
      ...next,
      [slot]: { ...loadouts[slot] },
    }),
    {} as WearableLoadouts,
  );

  LOADOUT_SLOTS.forEach((slot) => {
    Object.entries(nextLoadouts[slot]).forEach(([part, item]) => {
      const wearable = item as BumpkinItem;
      if (!WEARABLES_TAB_ITEMS.includes(wearable)) return;

      const used = usage[wearable] ?? 0;
      const ownedTotal = wardrobe[wearable] ?? 0;
      if (used < ownedTotal) {
        usage[wearable] = used + 1;
        return;
      }

      const bumpkinPart = part as BumpkinPart;
      const fallbackItem = getFallbackWearable({
        defaultEquipment,
        name: wearable,
        part: bumpkinPart,
      });

      if (fallbackItem) {
        nextLoadouts[slot][bumpkinPart] = fallbackItem as never;
      } else {
        delete nextLoadouts[slot][bumpkinPart];
      }
    });

    applyIncompatibleWearableRules(nextLoadouts[slot]);
  });

  return nextLoadouts;
};

const _profileState = (state: PortalMachineState) => ({
  farmId: state.context.id,
  gameState: state.context.state,
  username: state.context.state?.username,
  bumpkin: state.context.state?.bumpkin,
  activeWearables: state.context.activeWearables,
  lives: state.context.lives,
  maxLives: state.context.maxLives,
  playerLevel: state.context.playerLevel,
  currentXP: state.context.currentXP,
  nextLevelXP: state.context.nextLevelXP,
  xpPoints: state.context.xpPoints,
});

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();

  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
};

const BumpkinAvatar: React.FC<{
  bumpkinParts?: BumpkinParts;
  level: number;
  onClick: () => void;
}> = ({ bumpkinParts, level, onClick }) => {
  if (!bumpkinParts) return null;

  return (
    <div
      className="relative z-40 -left-2 cursor-pointer hover:img-highlight"
      onClick={onClick}
      style={{
        width: `${DIMENSIONS.scaled}px`,
        height: `${DIMENSIONS.scaled}px`,
      }}
    >
      <img
        src={SUNNYSIDE.ui.whiteBg}
        className="opacity-40"
        style={{
          width: `${DIMENSIONS.scaled}px`,
          height: `${DIMENSIONS.scaled}px`,
        }}
      />
      <div
        className="absolute top-2 overflow-hidden z-0"
        style={{
          width: `${DIMENSIONS.bumpkinContainer.width}px`,
          height: `${DIMENSIONS.bumpkinContainer.height}px`,
          borderBottomLeftRadius: `${DIMENSIONS.bumpkinContainer.radiusBottomLeft}px`,
          borderBottomRightRadius: `${DIMENSIONS.bumpkinContainer.radiusBottomRight}px`,
        }}
      >
        <div
          style={{
            width: `${DIMENSIONS.bumpkin.width}px`,
            marginLeft: `${DIMENSIONS.bumpkin.marginLeft}px`,
          }}
        >
          <DynamicNFT
            key={JSON.stringify(bumpkinParts)}
            bumpkinParts={bumpkinParts}
            showTools={false}
          />
        </div>
      </div>
      <div
        id="level"
        className="absolute top-2 z-30"
        style={{
          width: `${DIMENSIONS.level.width}px`,
          height: `${DIMENSIONS.level.height}px`,
          marginLeft: `${DIMENSIONS.level.marginLeft}px`,
          marginTop: `${DIMENSIONS.level.marginTop}px`,
        }}
      >
        <Label className="absolute z-30 justify-center text-xs min-w-6">
          {level}
        </Label>
      </div>
    </div>
  );
};

const StatusBar: React.FC<{
  icon: string;
  value: string;
  percentage: number;
  type: "error" | "progress" | "health";
}> = ({ icon, value, percentage, type }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-center gap-1 text-xxs">
        <img src={icon} className="h-3 object-contain pixelated" />
        <span>{value}</span>
      </div>
      <ResizableBar
        percentage={percentage}
        type={type}
        outerDimensions={{ width: 42, height: 7.5 }}
      />
    </div>
  );
};

type BumpkinProfileMode = "preGame" | "hud";

interface BumpkinProfileProps {
  mode?: BumpkinProfileMode;
  showAvatar?: boolean;
  showModal?: boolean;
  onModalHide?: () => void;
  onStart?: () => void;
  onStartTraining?: () => void;
  onBack?: () => void;
}

export const BumpkinProfile: React.FC<BumpkinProfileProps> = ({
  mode = "hud",
  showAvatar = true,
  showModal,
  onModalHide,
  onStart,
  onStartTraining,
  onBack,
}) => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  const [internalShowModal, setInternalShowModal] = useState(false);
  const [currentTab, setCurrentTab] = useState<WearableLoadoutSlot>("I");
  const [profilePanelTab, setProfilePanelTab] = useState<ProfilePanelTab>(
    mode === "preGame" ? "wearables" : "weapons",
  );
  const [loadouts, setLoadouts] = useState<WearableLoadouts>();
  const [defaultEquipment, setDefaultEquipment] = useState<BumpkinParts>();
  const [equipped, setEquipped] = useState<BumpkinParts>();
  const [selectedBumpkinPart, setSelectedBumpkinPart] =
    useState<BumpkinPart>("background");

  const {
    farmId,
    gameState,
    username,
    bumpkin,
    activeWearables,
    lives,
    maxLives,
    playerLevel,
    currentXP,
    nextLevelXP,
    xpPoints,
  } = useSelector(portalService, _profileState);

  const bumpkinEquipment = gameState?.bumpkin?.equipped as
    BumpkinParts | undefined;

  useEffect(() => {
    if (!bumpkinEquipment || !gameState) return;

    const stored = loadStoredLoadouts({
      farmId,
      fallback: bumpkinEquipment,
      available: availableWardrobe(gameState as GameState),
    });
    const loadouts = enforceWearableInventory({
      defaultEquipment: stored.defaultEquipment,
      loadouts: stored.loadouts,
      wardrobe: gameState.wardrobe,
    });

    saveStoredLoadouts({
      farmId,
      defaultEquipment: stored.defaultEquipment,
      loadouts,
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDefaultEquipment(stored.defaultEquipment);
    setLoadouts(loadouts);
    setEquipped(loadouts[currentTab]);
    portalService.send("SET_ACTIVE_WEARABLES", {
      wearables: loadouts[currentTab],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId, !!bumpkinEquipment, !!gameState]);

  useEffect(() => {
    if (!loadouts) return;

    const nextEquipment = loadouts[currentTab];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEquipped(nextEquipment);
    portalService.send("SET_ACTIVE_WEARABLES", { wearables: nextEquipment });
  }, [currentTab, loadouts, portalService]);

  const availableWearableCounts = useMemo<
    Partial<Record<BumpkinItem, number>>
  >(() => {
    if (!gameState || !loadouts) return {};

    return WEARABLES_TAB_ITEMS.reduce(
      (counts, name) => {
        const usedInLoadouts = Object.values(loadouts).reduce(
          (total, loadout) => {
            return Object.values(loadout).includes(name) ? total + 1 : total;
          },
          0,
        );
        const ownedTotal = gameState.wardrobe[name] ?? 0;

        return {
          ...counts,
          [name]: Math.max(0, ownedTotal - usedInLoadouts),
        };
      },
      {} as Partial<Record<BumpkinItem, number>>,
    );
  }, [gameState, loadouts]);

  const saveEquipment = (nextEquipment: BumpkinParts) => {
    if (!loadouts || !defaultEquipment) return;

    const nextLoadouts = {
      ...loadouts,
      [currentTab]: nextEquipment,
    };

    setEquipped(nextEquipment);
    setLoadouts(nextLoadouts);
    saveStoredLoadouts({
      farmId,
      defaultEquipment,
      loadouts: nextLoadouts,
    });
    portalService.send("SET_ACTIVE_WEARABLES", { wearables: nextEquipment });
  };

  const equipWearable = (name: BumpkinItem) => {
    if (!equipped) return;

    const part = BUMPKIN_ITEM_PART[name];
    const isEquipped = equipped[part] === name;
    if (!isEquipped && (availableWearableCounts[name] ?? 0) <= 0) return;

    const outfit = {
      ...equipped,
    };

    if (isEquipped) {
      const fallbackItem = getFallbackWearable({
        defaultEquipment,
        name,
        part,
      });

      if (fallbackItem) {
        outfit[part] = fallbackItem as never;
      } else {
        delete outfit[part];
      }
    } else {
      outfit[part] = name as never;
    }

    applyIncompatibleWearableRules(outfit);
    saveEquipment(outfit);
  };

  const healthPercent = maxLives > 0 ? (lives / maxLives) * 100 : 0;
  const isMaxLevel = isPlayerMaxLevel(playerLevel);
  const xpPercent =
    isMaxLevel || nextLevelXP === undefined
      ? 100
      : nextLevelXP > 0
        ? (currentXP / nextLevelXP) * 100
        : 0;
  const xpValue = isMaxLevel
    ? t(`${PORTAL_NAME}.maxLevel`)
    : `${currentXP} / ${nextLevelXP}`;
  const bumpkinParts = activeWearables ?? bumpkin?.equipped;
  const isControlled = showModal !== undefined;
  const isModalOpen = showModal ?? internalShowModal;
  const profilePanelTabs: ProfilePanelTab[] =
    mode === "preGame" ? ["wearables", "guide"] : ["weapons", "guide"];

  const closeModal = () => {
    if (isControlled) {
      onModalHide?.();
      return;
    }

    setInternalShowModal(false);
  };

  const openModal = () => {
    setProfilePanelTab(mode === "preGame" ? "wearables" : "weapons");
    setInternalShowModal(true);
  };

  useEffect(() => {
    if (mode !== "hud" || isControlled || isTouchDevice()) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isProfileShortcut = event.code === "KeyV" || event.code === "Space";

      if (
        !isProfileShortcut ||
        event.repeat ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
      }

      setProfilePanelTab("weapons");
      setInternalShowModal((show) => !show);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isControlled, mode]);

  useEffect(() => {
    portalService.send("SET_GAMEPLAY_PAUSED", { isPaused: isModalOpen });
  }, [isModalOpen, portalService]);

  return (
    <>
      {showAvatar && (
        <div className="relative -left-5">
          <BumpkinAvatar
            bumpkinParts={bumpkinParts}
            level={playerLevel}
            onClick={openModal}
          />
          <div className="absolute top-6 left-[70px] z-0 overflow-hidden">
            <InnerPanel className="flex w-[188px] h-[110px] justify-end">
              <div className="flex flex-col items-center justify-between h-full">
                <StatusBar
                  icon={SUNNYSIDE.icons.heart}
                  value={`${lives} / ${maxLives}`}
                  percentage={healthPercent}
                  type="error"
                />
                <StatusBar
                  icon={SUNNYSIDE.icons.xpIcon}
                  value={xpValue}
                  percentage={xpPercent}
                  type="health"
                />
                <div className="flex w-full items-center justify-center gap-1 text-xxs">
                  <Label
                    style={{
                      fontSize: "20px",
                      lineHeight: "12px",
                    }}
                    type={xpPoints > 0 ? "warning" : "default"}
                  >
                    {t(`${PORTAL_NAME}.xpPoints`, {
                      points: xpPoints,
                    })}
                  </Label>
                  {xpPoints > 0 ? (
                    <img
                      src={SUNNYSIDE.icons.expression_alerted}
                      className="h-4 object-contain pixelated"
                    />
                  ) : null}
                </div>
              </div>
            </InnerPanel>
          </div>
        </div>
      )}

      <Modal show={isModalOpen} onHide={closeModal} size="lg">
        <div className="flex max-h-[90vh]">
          {equipped && loadouts && (
            <Profile
              onClose={closeModal}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              username={username}
              equipped={equipped}
              selectedBumpkinPart={selectedBumpkinPart}
              onSelectBumpkinPart={(part) => {
                setSelectedBumpkinPart(part);
                if (mode === "preGame") {
                  setProfilePanelTab("wearables");
                }
              }}
              lives={lives}
              maxLives={maxLives}
              farmId={farmId}
              onStart={mode === "preGame" ? onStart : undefined}
              onStartTraining={mode === "preGame" ? onStartTraining : undefined}
              onBack={mode === "preGame" ? (onBack ?? closeModal) : undefined}
            />
          )}
          <ProfilePanel
            currentTab={profilePanelTab}
            setCurrentTab={setProfilePanelTab}
            tabs={profilePanelTabs}
            selectedBumpkinPart={selectedBumpkinPart}
            equipped={equipped}
            availableWearableCounts={availableWearableCounts}
            onEquipWearable={equipWearable}
            onClose={closeModal}
          />
        </div>
      </Modal>
    </>
  );
};
