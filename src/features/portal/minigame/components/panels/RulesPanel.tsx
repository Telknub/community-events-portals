import React, { useState } from "react";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { Mission } from "./Mission";
import { PANEL_NPC_WEARABLES, PORTAL_NAME } from "../../Constants";
import { Guide } from "./Guide";
import { Leaderboard } from "./Leaderboard";

import misionIcon from "public/world/page.png";
import guideIcon from "public/world/page.png";
import leaderboardIcon from "assets/icons/trophy.png";

interface Props {
  mode: "introduction" | "success" | "failed";
  showScore?: boolean;
  showExitButton: boolean;
  confirmButtonText: string;
  onConfirm: () => void;
  trainingButtonText?: string;
  onTraining?: () => void;
}
export const RulesPanel: React.FC<Props> = ({
  mode,
  showScore,
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
