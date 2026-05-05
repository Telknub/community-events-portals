import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/Machine";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PORTAL_NAME } from "../../Constants";

const _score = (state: PortalMachineState) => state.context.score;

export const Score: React.FC = () => {
  const { t } = useAppTranslation();

  const { portalService } = useContext(PortalContext);

  const score = useSelector(portalService, _score);

  return (
    <>
      <div className="bg-blueGray-900 bg-opacity-80 text-white flex flex-col text-shadow rounded-md min-w-[90px] w-fit p-2">
        <span className="text-xs">{t(`${PORTAL_NAME}.scoreTitle`)}</span>
        <div className="flex gap-5 items-center">
          <span className="text-lg">{Math.round(score)}</span>
        </div>
      </div>
    </>
  );
};
