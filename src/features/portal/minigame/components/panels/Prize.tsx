import React, { useContext } from "react";

import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { OuterPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { PortalMachineState } from "../../lib/Machine";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { secondsToString } from "lib/utils/time";
import { PORTAL_NAME, PORTAL_TOKEN } from "../../Constants";

import tokenIcon from "assets/icons/coins.webp";

const _prize = (state: PortalMachineState) => {
  return state.context.state?.minigames.prizes[PORTAL_NAME];
};

export const Prize: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();

  const prize = useSelector(
    portalService,
    _prize,
    (prev, next) => JSON.stringify(prev) === JSON.stringify(next),
  );

  if (!prize) {
    return (
      <OuterPanel>
        <div className="px-1">
          <Label type="danger" icon={SUNNYSIDE.icons.sad}>
            {t(`${PORTAL_NAME}.noPrizesAvailable`)}
          </Label>
        </div>
      </OuterPanel>
    );
  }

  const secondsLeft = (prize.endAt - Date.now()) / 1000;

  return (
    <OuterPanel>
      <div className="px-1">
        <span className="text-xs mb-2">
          {t(`${PORTAL_NAME}.portal.missionObjectives`, {
            targetScore: prize.score,
          })}
        </span>
        <div className="flex justify-between mt-2 flex-wrap gap-1">
          <Label type="info" icon={SUNNYSIDE.icons.stopwatch}>
            {secondsToString(secondsLeft, { length: "medium" })}
          </Label>
          <div className="flex items-center space-x-2">
            {!!prize.items[PORTAL_TOKEN] && (
              <Label icon={tokenIcon} type="warning">
                {t(`${PORTAL_NAME}.eventToken`, {
                  token: prize.items[PORTAL_TOKEN],
                })}
              </Label>
            )}
          </div>
        </div>
      </div>
    </OuterPanel>
  );
};
