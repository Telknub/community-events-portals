import React, { useContext } from "react";

import { useSelector } from "@xstate/react";
import { Button } from "components/ui/Button";

import { PortalContext } from "../../lib/PortalProvider";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import type { PortalMachineState } from "../../lib/Machine";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import {
  PANEL_NPC_WEARABLES,
  PORTAL_NAME,
  RESTOCK_ATTEMPTS,
  UNLIMITED_ATTEMPTS_AURA_DISCOUNT_SFL,
  UNLIMITED_ATTEMPTS_DISCOUNT_AURAS,
  UNLIMITED_ATTEMPTS_SFL,
} from "../../constants";
import {
  getUnlimitedAttemptsSfl,
  hasUnlimitedAttemptsDiscountAura,
} from "../../lib/Utils";
import { purchase } from "features/portal/lib/portalUtil";
import { SUNNYSIDE } from "assets/sunnyside";
import { setPrecision } from "lib/utils/formatNumber";
import flowerIcon from "assets/icons/flower_token.webp";
import Decimal from "decimal.js-light";
import { PIXEL_SCALE } from "features/game/lib/constants";

const _purchaseState = (state: PortalMachineState) => ({
  sflBalance: state.context.state?.balance ?? new Decimal(0),
  wardrobe: state.context.state?.wardrobe,
});

export const NoAttemptsPanel: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();

  const { sflBalance, wardrobe } = useSelector(portalService, _purchaseState);
  const hasAuraDiscount = hasUnlimitedAttemptsDiscountAura(wardrobe);
  const unlimitedAttemptsSfl = getUnlimitedAttemptsSfl(wardrobe);

  return (
    <CloseButtonPanel bumpkinParts={PANEL_NPC_WEARABLES}>
      <div className="p-2">
        <div className="flex gap-1 justify-between items-center mb-2">
          <Label icon={SUNNYSIDE.icons.lock} type="danger">
            {t(`${PORTAL_NAME}.noAttemptsRemaining`)}
          </Label>
          <Label
            icon={flowerIcon}
            type={sflBalance.lt(RESTOCK_ATTEMPTS[0].sfl) ? "danger" : "default"}
          >
            {t(`${PORTAL_NAME}.flowerRequired`)}
          </Label>
        </div>

        <p className="text-sm mb-2">
          {t(`${PORTAL_NAME}.youHaveRunOutOfAttempts`)}
        </p>
        <p className="text-sm mb-2">
          {t(`${PORTAL_NAME}.wouldYouLikeToUnlock`)}
        </p>
        <Label type="info" className="mb-2">
          {`Hold one of these Auras in your inventory to unlock unlimited attempts for ${UNLIMITED_ATTEMPTS_AURA_DISCOUNT_SFL} FLOWER: ${UNLIMITED_ATTEMPTS_DISCOUNT_AURAS.join(", ")}.`}
        </Label>

        <div className="flex items-center space-x-1 relative">
          <p className="balance-text">{setPrecision(sflBalance).toString()}</p>
          <img
            src={flowerIcon}
            alt="FLOWER"
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
            {t(`${PORTAL_NAME}.buyAttempts`, {
              attempts: option.attempts,
              sfl: option.sfl,
            })}
          </Button>
        ))}
        {UNLIMITED_ATTEMPTS_SFL > 0 ? (
          <Button
            disabled={sflBalance.lt(unlimitedAttemptsSfl)}
            onClick={() =>
              purchase({
                sfl: unlimitedAttemptsSfl,
                items: {},
              })
            }
          >
            <span className="flex items-center justify-center gap-1">
              <span>{"Unlock unlimited attempts ("}</span>
              {hasAuraDiscount && (
                <>
                  <span className="line-through opacity-70">
                    {UNLIMITED_ATTEMPTS_SFL}
                  </span>
                  <span>{unlimitedAttemptsSfl}</span>
                </>
              )}
              {!hasAuraDiscount && <span>{unlimitedAttemptsSfl}</span>}
              <span>{" FLOWER)"}</span>
            </span>
          </Button>
        ) : (
          ""
        )}
      </div>
    </CloseButtonPanel>
  );
};
