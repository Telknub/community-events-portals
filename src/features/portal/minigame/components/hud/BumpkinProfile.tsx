import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "@xstate/react";
import { SpringValue } from "@react-spring/web";

import { SUNNYSIDE } from "assets/sunnyside";
import { Modal } from "components/ui/Modal";
import Spritesheet, {
  SpriteSheetInstance,
} from "components/animation/SpriteAnimator";
import { DynamicNFT } from "features/bumpkins/components/DynamicNFT";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/Machine";
import { BumpkinParts } from "lib/utils/tokenUriBuilder";
import {
  loadStoredLoadouts,
  LOADOUT_SLOTS,
  Profile,
  saveStoredLoadouts,
  WearableLoadouts,
  WearableLoadoutSlot,
} from "./Profile";
import { ProfilePanel, ProfilePanelTab } from "./ProfilePanel";
import { WEARABLES_TAB_ITEMS } from "./Wearables";
import {
  BUMPKIN_ITEM_PART,
  BumpkinItem,
  BumpkinPart,
} from "features/game/types/bumpkin";
import { availableWardrobe } from "features/game/events/landExpansion/equip";
import { GameState } from "features/game/types/game";
import { INITIAL_EQUIPMENT } from "features/game/lib/constants";

const DIMENSIONS = {
  original: 80,
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

const SPRITE_STEPS = 51;

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
});

const BumpkinAvatar: React.FC<{
  bumpkinParts?: BumpkinParts;
  healthPercent: number;
  lives: number;
  maxLives: number;
  onClick: () => void;
}> = ({ bumpkinParts, healthPercent, lives, maxLives, onClick }) => {
  const progressBarEl = useRef<SpriteSheetInstance>(undefined);

  const goToProgress = () => {
    if (progressBarEl.current) {
      const percent = Math.max(0, Math.min(healthPercent, 100)) / 100;
      const scaledToProgress = percent * (SPRITE_STEPS - 1);
      progressBarEl.current.goToAndPause(Math.floor(scaledToProgress));
    }
  };

  useEffect(() => {
    goToProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [healthPercent]);

  if (!bumpkinParts) return null;

  return (
    <div
      className="grid absolute z-40 top-0 cursor-pointer hover:img-highlight"
      onClick={onClick}
    >
      <img
        src={SUNNYSIDE.ui.whiteBg}
        className="col-start-1 row-start-1 opacity-40"
        style={{
          width: `${DIMENSIONS.scaled}px`,
          height: `${DIMENSIONS.scaled}px`,
        }}
      />
      <div
        className="col-start-1 row-start-1 overflow-hidden z-0"
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
      <Spritesheet
        className="col-start-1 row-start-1 z-10"
        style={{
          width: `${DIMENSIONS.scaled}px`,
          imageRendering: "pixelated",
          filter: "hue-rotate(-20deg)",
        }}
        image={SUNNYSIDE.ui.progressBarSprite}
        widthFrame={DIMENSIONS.original}
        heightFrame={DIMENSIONS.original}
        zoomScale={new SpringValue(0.7)}
        fps={10}
        steps={SPRITE_STEPS}
        autoplay={false}
        getInstance={(spritesheet) => {
          progressBarEl.current = spritesheet;
          goToProgress();
        }}
      />
      <div
        id="progress-bar"
        className="col-start-1 row-start-1 flex justify-center z-20 text-xs"
        style={{
          width: `${DIMENSIONS.level.width}px`,
          height: `${DIMENSIONS.level.height}px`,
          marginLeft: `${DIMENSIONS.level.marginLeft}px`,
          marginTop: `${DIMENSIONS.level.marginTop}px`,
        }}
      >
        {`${lives}/${maxLives}`}
      </div>
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
  } = useSelector(portalService, _profileState);

  const bumpkinEquipment = gameState?.bumpkin?.equipped as
    | BumpkinParts
    | undefined;

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
    if (!isModalOpen) return;

    setProfilePanelTab(mode === "preGame" ? "wearables" : "weapons");
  }, [isModalOpen, mode]);

  return (
    <>
      {showAvatar && (
        <div
          className="relative"
          style={{
            width: "100px",
            height: "95px",
          }}
        >
          <div className="scale-[0.7] absolute left-0 top-0 width-100">
            <BumpkinAvatar
              bumpkinParts={bumpkinParts}
              healthPercent={healthPercent}
              lives={lives}
              maxLives={maxLives}
              onClick={openModal}
            />
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
          />
        </div>
      </Modal>
    </>
  );
};
