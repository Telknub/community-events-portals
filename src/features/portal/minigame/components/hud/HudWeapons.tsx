import React, { useContext } from "react";
import Decimal from "decimal.js-light";
import { useSelector } from "@xstate/react";

import { Box } from "components/ui/Box";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/Machine";
import { WEAPON_ICONS } from "../../constants";

const _weaponsState = (state: PortalMachineState) => ({
  hudWeapons: state.context.hudWeapons,
  weaponLevels: state.context.weaponLevels,
});

export const HudWeapons: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { hudWeapons, weaponLevels } = useSelector(
    portalService,
    _weaponsState,
  );

  return (
    <div className="flex flex-col items-end">
      {hudWeapons.map((weapon) => {
        const level = weaponLevels[weapon];
        const isLocked = level === 0;

        return (
          <Box
            key={weapon}
            image={WEAPON_ICONS[weapon]}
            count={new Decimal(level)}
            countLabelType="info"
            locked={isLocked}
          />
        );
      })}
    </div>
  );
};
