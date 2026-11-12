import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/Machine";
import { PORTAL_NAME } from "../../Constants";

const _score = (state: PortalMachineState) => state.context.score;

/** Compact one-line score (the real, machine score - the same one that gets submitted). */
export const ScoreLabel: React.FC = () => {
  const { t } = useAppTranslation();
  const { portalService } = useContext(PortalContext);
  const score = useSelector(portalService, _score);

  return <Label type="default">{`${t(`${PORTAL_NAME}.scoreTitle`)}: ${Math.round(score)}`}</Label>;
};
