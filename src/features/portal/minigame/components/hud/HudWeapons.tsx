import React, { useContext } from "react";
import Decimal from "decimal.js-light";
import { useSelector } from "@xstate/react";

import { Box } from "components/ui/Box";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/Machine";
import { WEAPON_ICONS } from "../../constants";

const _weaponsState = (state: PortalMachineState) => ({
  hudWeapons: state.context.hudWeapons,
  selectedWeapon: state.context.selectedWeapon,
  weaponLevels: state.context.weaponLevels,
});

export const HudWeapons: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { hudWeapons, selectedWeapon, weaponLevels } = useSelector(
    portalService,
    _weaponsState,
  );

  return (
    <div className="flex flex-col items-end gap-1">
      {hudWeapons.map((weapon) => {
        const level = weaponLevels[weapon];
        const isLocked = level === 0;

        return (
          <Box
            key={weapon}
            image={WEAPON_ICONS[weapon]}
            isSelected={weapon === selectedWeapon}
            count={new Decimal(level)}
            countLabelType="info"
            locked={isLocked}
            onClick={() =>
              portalService.send("SET_SELECTED_WEAPON", { weapon })
            }
          />
        );
      })}
    </div>
  );
};
