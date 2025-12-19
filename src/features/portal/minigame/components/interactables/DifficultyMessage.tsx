import React from "react"
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PORTAL_NAME, PuzzleDifficulty } from "../../Constants";

interface Props {
  onClose: () => void;
  data?: any;
}

export const DifficultyMessage: React.FC<Props> = ({ onClose, data }) => {
  const { t } = useAppTranslation();
  const difficulty = data.difficulty as PuzzleDifficulty;

  return (
    <div className="flex flex-col gap-3 text-white mb-[3rem] text-center px-2">
      <span className="text-base">{t(`${PORTAL_NAME}.difficulty`)}</span>
      <span className="text-[70px]">{t(`${PORTAL_NAME}.difficulty.${difficulty}`)}</span>
    </div>
  );
};
