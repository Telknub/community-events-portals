import React, { useState } from "react";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { Mission } from "./Mission";
import { PANEL_NPC_WEARABLES, PORTAL_NAME } from "../../constants";
import { Guide } from "./Guide";

import misionIcon from "public/world/portal/images/banana_icon.webp";
import guideIcon from "public/world/page.png";
import leaderboardIcon from "assets/icons/trophy.png";
import { Leaderboard } from "./Leaderboard";

interface Props {
  mode: "introduction" | "success" | "failed";
  showScore?: boolean;
  showOnlyScore?: boolean;
  showExitButton: boolean;
  confirmButtonText: string;
  onConfirm: () => void;
  trainingButtonText?: string;
  onTraining?: () => void;
}
export const RulesPanel: React.FC<Props> = ({
  mode,
  showScore,
  showOnlyScore,
  showExitButton,
  confirmButtonText,
  onConfirm,
  trainingButtonText,
  onTraining,
}) => {
  const { t } = useAppTranslation();
  const [tab, setTab] = useState<"mission" | "guide" | "leaderboard">(
    "mission",
  );

  return (
    <CloseButtonPanel
      className="overflow-y-hidden"
      bumpkinParts={PANEL_NPC_WEARABLES}
      currentTab={tab}
      setCurrentTab={setTab}
      tabs={[
        {
          icon: misionIcon,
          name: t(`${PORTAL_NAME}.mission`),
          id: "mission",
        },
        {
          icon: guideIcon,
          name: t("guide"),
          id: "guide",
        },
        {
          icon: leaderboardIcon,
          name: t("competition.leaderboard"),
          id: "leaderboard",
        },
      ]}
    >
      <>
        {tab === "mission" && (
          <Mission
            mode={mode}
            showScore={showScore}
            showOnlyScore={showOnlyScore}
            showExitButton={showExitButton}
            confirmButtonText={confirmButtonText}
            onConfirm={onConfirm}
            trainingButtonText={trainingButtonText}
            onTraining={onTraining}
          />
        )}
        {tab === "guide" && <Guide />}
        {tab === "leaderboard" && <Leaderboard />}
      </>
    </CloseButtonPanel>
  );
};
