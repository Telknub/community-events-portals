import React, { useContext } from "react";
import { PortalLeaderboard } from "features/world/ui/portals/PortalLeaderboard";
import type { PortalMachineState } from "../../lib/Machine";
import { PortalContext } from "../../lib/PortalProvider";
import { decodeToken } from "features/auth/actions/login";
import { useSelector } from "@xstate/react";
import {
  FINAL_DATE_LEADERBOARD,
  INITIAL_DATE_LEADERBOARD,
  PORTAL_NAME,
} from "../../constants";
import { useAppTranslation } from "lib/i18n/useAppTranslations";

const _jwt = (state: PortalMachineState) => state.context.jwt;

const leaderboardDate = (date: string) => new Date(`${date}T00:00:00.000Z`);

export const Leaderboard: React.FC = () => {
  const { t } = useAppTranslation();
  const { portalService } = useContext(PortalContext);

  const jwt = useSelector(portalService, _jwt);

  const farmId = jwt ? decodeToken(jwt as string)?.farmId : 0;

  return (
    <div className="flex flex-col gap-2 overflow-y-auto scrollable max-h-[75vh]">
      <div className="flex flex-col gap-2 px-2 pt-2">
        <p>{t(`${PORTAL_NAME}.competition.description1`)}</p>
        <p>{t(`${PORTAL_NAME}.competition.description2`)}</p>
      </div>
      <PortalLeaderboard
        isAccumulator
        name={PORTAL_NAME}
        startDate={leaderboardDate(INITIAL_DATE_LEADERBOARD)}
        endDate={leaderboardDate(FINAL_DATE_LEADERBOARD)}
        farmId={Number(farmId)}
        // formatPoints={(points) => {}}
        jwt={jwt as string}
        onBack={() => null}
      />
    </div>
  );
};
