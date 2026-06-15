import React, { useContext } from "react";
import Decimal from "decimal.js-light";
import { useSelector } from "@xstate/react";

import { Box } from "components/ui/Box";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/Machine";
import { WeaponId } from "../../Types";

import hoeIcon from "public/world/portal/images/hoe.webp";
import cornIcon from "public/world/portal/images/skill_corn_bomb_icon.webp";
import beeIcon from "public/world/portal/images/skill_summon_bees_icon.webp";
import waterIcon from "public/world/portal/images/skill_water_pistol_icon.webp";
import bladeIcon from "public/world/portal/images/skill_windBlade_skill_icon.webp";

const WEAPON_ICONS: Record<WeaponId, string> = {
  hoe: hoeIcon,
  broomScythe: bladeIcon,
  wateringCan: waterIcon,
  corn: cornIcon,
  tomato: cornIcon,
  sunflower: waterIcon,
  wheat: hoeIcon,
  pumpkin: cornIcon,
  beehive: beeIcon,
};

const _weaponsState = (state: PortalMachineState) => ({
  hudWeapons: state.context.hudWeapons,
  selectedWeapon: state.context.selectedWeapon,
  weaponLevels: state.context.weaponLevels,
});

export const Weapons: React.FC = () => {
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
