import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/christmasDeliveryMayhemMachine";
import { useAppTranslation } from "lib/i18n/useAppTranslations";

const _score = (state: PortalMachineState) => state.context.score;
const _streak = (state: PortalMachineState) => state.context.streak;

export const ChristmasDeliveryMayhemScore: React.FC = () => {
  const { t } = useAppTranslation();

  const { portalService } = useContext(PortalContext);

  const score = useSelector(portalService, _score);
  const streak = useSelector(portalService, _streak);

  const [isStreakVisible, setIsStreakVisible] = useState(false);

  useEffect(() => {
    if (streak !== 0) {
      setIsStreakVisible(true);
      setTimeout(() => {
        setIsStreakVisible(false);
      }, 2000);
    }
  }, [streak]);

  return (
    <>
      <div className="bg-blue-800 bg-opacity-80 text-white flex flex-col text-shadow border-t-4 rounded-md min-w-[90px] w-fit p-2">
        <span className="text-xs">{t("christmas-delivery.scoreTitle")}</span>
        <div className="flex gap-5 items-center">
          <span className="text-lg">{Math.round(score)}</span>
          {isStreakVisible && (
            <span className="text-xs">{`${streak > 0 ? "+" : "-"}${Math.abs(streak)}`}</span>
          )}
        </div>
      </div>

      {(streak < -1 || streak > 1) && (
        <div className="bg-blue-800 bg-opacity-80 text-white flex flex-col text-shadow border-t-4 rounded-md w-[90px] p-2">
          <span className="text-xs">
            {t("christmas-delivery.deliveryStreak")}
          </span>
          <span
            className={`text-lg ${streak >= 0 ? "text-[#FFFF00]" : "text-[#FF8C00]"}`}
          >
            {t("christmas-delivery.streak", {
              streak: Math.abs(streak),
            })}
          </span>
        </div>
      )}
    </>
  );
};
