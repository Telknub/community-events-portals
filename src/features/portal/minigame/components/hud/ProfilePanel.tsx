import React from "react";

import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { BumpkinItem, BumpkinPart } from "features/game/types/bumpkin";
import { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { PORTAL_NAME } from "../../constants";
import { WeaponsTab } from "./Weapons";
import { WeaponsGuide } from "./WeaponsGuide";
import { WearablesTab } from "./Wearables";

import bananaIcon from "public/world/portal/images/banana_icon.webp";
import guideIcon from "public/world/page.png";

export type ProfilePanelTab = "weapons" | "wearables" | "guide";

export const ProfilePanel: React.FC<{
  currentTab: ProfilePanelTab;
  setCurrentTab: React.Dispatch<React.SetStateAction<ProfilePanelTab>>;
  selectedBumpkinPart: BumpkinPart;
  equipped?: BumpkinParts;
  availableWearableCounts: Partial<Record<BumpkinItem, number>>;
  onEquipWearable: (wearable: BumpkinItem) => void;
  tabs?: ProfilePanelTab[];
}> = ({
  currentTab,
  setCurrentTab,
  selectedBumpkinPart,
  equipped,
  availableWearableCounts,
  onEquipWearable,
  tabs = ["wearables", "weapons", "guide"],
}) => {
  const { t } = useAppTranslation();

  const panelTabs = [
    {
      id: "wearables" as const,
      icon: SUNNYSIDE.icons.player,
      name: t(`${PORTAL_NAME}.wearables`),
    },
    {
      id: "weapons" as const,
      icon: bananaIcon,
      name: t(`${PORTAL_NAME}.weapons`),
    },
    {
      id: "guide" as const,
      icon: guideIcon,
      name: t(`${PORTAL_NAME}.weaponGuide`),
    },
  ].filter((tab) => tabs.includes(tab.id));

  return (
    <CloseButtonPanel
      tabs={panelTabs}
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      className="h-full w-[min(94vw,620px)] relative -left-1"
    >
      {currentTab === "wearables" ? (
        <WearablesTab
          selectedBumpkinPart={selectedBumpkinPart}
          equipped={equipped}
          availableWearableCounts={availableWearableCounts}
          onEquipWearable={onEquipWearable}
        />
      ) : currentTab === "weapons" ? (
        <WeaponsTab />
      ) : (
        <WeaponsGuide />
      )}
    </CloseButtonPanel>
  );
};
