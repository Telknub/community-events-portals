import React, { useContext } from "react";

import { useSelector } from "@xstate/react";
import { Button } from "components/ui/Button";

import { PortalContext } from "../../lib/PortalProvider";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/christmasDeliveryMayhemMachine";
import sfl from "assets/icons/sfl.webp";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import {
  CHRITSMAS_NPC_WEARABLES,
  RESTOCK_ATTEMPTS,
} from "../../ChristmasDeliveryMayhemConstants";
import { purchase } from "features/portal/lib/portalUtil";
import { SUNNYSIDE } from "assets/sunnyside";
import { setPrecision } from "lib/utils/formatNumber";
import sflIcon from "assets/icons/sfl.webp";
import Decimal from "decimal.js-light";
import { PIXEL_SCALE } from "features/game/lib/constants";

const _sflBalance = (state: PortalMachineState) =>
  state.context.state?.balance ?? new Decimal(0);

export const ChristmasDeliveryMayhemNoAttemptsPanel: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();

  const sflBalance = useSelector(portalService, _sflBalance);

  return (
    <CloseButtonPanel bumpkinParts={CHRITSMAS_NPC_WEARABLES}>
      <div className="p-2">
        <div className="flex gap-1 justify-between items-center mb-2">
          <Label icon={SUNNYSIDE.icons.lock} type="danger">
            {t("christmas-delivery.noAttemptsRemaining")}
          </Label>
          <Label
            icon={sfl}
            type={sflBalance.lt(RESTOCK_ATTEMPTS[0].sfl) ? "danger" : "default"}
          >
            {t("christmas-delivery.sflRequired")}
          </Label>
        </div>

        <p className="text-sm mb-2">
          {t("christmas-delivery.youHaveRunOutOfAttempts")}
        </p>
        <p className="text-sm mb-2">
          {t("christmas-delivery.wouldYouLikeToUnlock")}
        </p>

        <div className="flex items-center space-x-1 relative">
          <p className="balance-text">{setPrecision(sflBalance).toString()}</p>
          <img
            src={sflIcon}
            alt="SFL"
            style={{
              width: `${PIXEL_SCALE * 11}px`,
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Button onClick={() => portalService.send("CANCEL_PURCHASE")}>
          {t("back")}
        </Button>
        {RESTOCK_ATTEMPTS.map((option, index) => (
          <Button
            key={index}
            disabled={sflBalance.lt(option.sfl)}
            onClick={() =>
              purchase({
                sfl: option.sfl,
                items: {},
              })
            }
          >
            {t("christmas-delivery.buyAttempts", {
              attempts: option.attempts,
              sfl: option.sfl,
            })}
          </Button>
        ))}
        {/* <Button
          disabled={sflBalance.lt(UNLIMITED_ATTEMPTS_SFL)}
          onClick={() =>
            purchase({
              sfl: UNLIMITED_ATTEMPTS_SFL,
              items: {},
            })
          }
        >
          {t("christmas-delivery.unlockAttempts", {
            sfl: UNLIMITED_ATTEMPTS_SFL,
          })}
        </Button> */}
      </div>
    </CloseButtonPanel>
  );
};
